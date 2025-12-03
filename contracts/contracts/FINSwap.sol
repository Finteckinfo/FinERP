// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FINSwap
 * @notice Custom DEX for swapping FIN tokens with USDT/USDC
 * @dev Security features:
 *      - Reentrancy protection
 *      - Slippage protection
 *      - Pausable
 *      - Role-based access control
 *      - Constant product AMM (x * y = k)
 */
contract FINSwap is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Fee: 0.3% (30 basis points)
    uint256 public constant FEE_BPS = 30;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Pool {
        IERC20 tokenA; // Usually FIN
        IERC20 tokenB; // Usually USDT/USDC
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
    }

    // Mapping from pair hash to Pool
    mapping(bytes32 => Pool) public pools;

    event LiquidityAdded(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        return tokenA < tokenB 
            ? keccak256(abi.encodePacked(tokenA, tokenB)) 
            : keccak256(abi.encodePacked(tokenB, tokenA));
    }

    /**
     * @notice Create a new pool or add liquidity to existing one
     * @dev Tokens must be approved before calling
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant whenNotPaused returns (uint256 liquidity) {
        require(tokenA != tokenB, "FINSwap: identical tokens");
        require(amountA > 0 && amountB > 0, "FINSwap: zero amounts");

        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];

        if (address(pool.tokenA) == address(0)) {
            pool.tokenA = IERC20(tokenA < tokenB ? tokenA : tokenB);
            pool.tokenB = IERC20(tokenA < tokenB ? tokenB : tokenA);
        }

        // Transfer tokens to contract
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        // Calculate liquidity to mint
        if (pool.totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            uint256 liquidityA = (amountA * pool.totalLiquidity) / pool.reserveA;
            uint256 liquidityB = (amountB * pool.totalLiquidity) / pool.reserveB;
            liquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        }

        require(liquidity > 0, "FINSwap: insufficient liquidity minted");

        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        pool.liquidity[msg.sender] += liquidity;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);
    }

    /**
     * @notice Swap tokens
     * @param tokenIn Address of token to sell
     * @param tokenOut Address of token to buy
     * @param amountIn Amount of tokenIn to sell
     * @param minAmountOut Minimum amount of tokenOut to receive (slippage protection)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(amountIn > 0, "FINSwap: zero amount in");
        require(tokenIn != tokenOut, "FINSwap: identical tokens");

        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(address(pool.tokenA) != address(0), "FINSwap: pool does not exist");

        bool isTokenA = tokenIn == address(pool.tokenA);
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;

        require(reserveIn > 0 && reserveOut > 0, "FINSwap: insufficient liquidity");

        // Calculate amount out with 0.3% fee
        // amountOut = (amountIn * 9970 * reserveOut) / (reserveIn * 10000 + amountIn * 9970)
        uint256 amountInWithFee = amountIn * (BPS_DENOMINATOR - FEE_BPS);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BPS_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut >= minAmountOut, "FINSwap: insufficient output amount");

        // Transfer tokenIn from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Update reserves
        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        // Transfer tokenOut to user
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @notice Get expected output amount
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        
        if (address(pool.tokenA) == address(0)) return 0;

        bool isTokenA = tokenIn == address(pool.tokenA);
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;

        if (reserveIn == 0 || reserveOut == 0) return 0;

        uint256 amountInWithFee = amountIn * (BPS_DENOMINATOR - FEE_BPS);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BPS_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(UPGRADER_ROLE) override {}

    // Helper for sqrt
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
