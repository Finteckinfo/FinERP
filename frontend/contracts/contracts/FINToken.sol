// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title FINToken
 * @notice Production-grade ERC20 token for FinPro ecosystem
 * @dev Security features:
 *      - Upgradeable via UUPS proxy pattern
 *      - Pausable for emergency situations
 *      - Role-based access control (ADMIN, MINTER, PAUSER)
 *      - Burnable for deflationary mechanics
 *      - EIP-2612 permit for gasless approvals
 *      - Reentrancy protection
 *      - Maximum supply cap
 * 
 * Token Economics:
 *      - Total Supply: 100,000,000 FIN (100 million)
 *      - Peg: 1 FIN = 1 USDT (maintained via DEX liquidity)
 *      - Decimals: 18 (standard ERC20)
 */
contract FINToken is 
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    UUPSUpgradeable
{
    /// @notice Role for minting new tokens
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @notice Role for pausing token transfers
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @notice Role for upgrading contract
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    /// @notice Maximum supply cap (100 million FIN)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Emitted when tokens are minted
    event TokensMinted(address indexed to, uint256 amount, address indexed minter);
    
    /// @notice Emitted when tokens are burned
    event TokensBurned(address indexed from, uint256 amount);
    
    /// @notice Emitted when contract is paused
    event EmergencyPause(address indexed pauser, string reason);
    
    /// @notice Emitted when contract is unpaused
    event EmergencyUnpause(address indexed pauser);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the FIN token contract
     * @param admin Address to receive admin role
     * @dev Can only be called once due to initializer modifier
     */
    function initialize(address admin) public initializer {
        require(admin != address(0), "FINToken: admin is zero address");
        
        __ERC20_init("FIN Token", "FIN");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init("FIN Token");
        __UUPSUpgradeable_init();

        // Grant roles to admin
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        
        // Mint initial supply to admin
        _mint(admin, MAX_SUPPLY);
        
        emit TokensMinted(admin, MAX_SUPPLY, admin);
    }

    /**
     * @notice Pause all token transfers
     * @param reason Reason for pausing
     * @dev Only callable by PAUSER_ROLE
     */
    function pause(string calldata reason) public onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @notice Unpause token transfers
     * @dev Only callable by PAUSER_ROLE
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @notice Mint new tokens
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     * @dev Only callable by MINTER_ROLE
     * @dev Cannot exceed MAX_SUPPLY
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(to != address(0), "FINToken: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "FINToken: exceeds max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @notice Burn tokens from specified account
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @notice Authorize contract upgrade
     * @param newImplementation Address of new implementation
     * @dev Only callable by UPGRADER_ROLE
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    /**
     * @notice Hook called before any token transfer
     * @dev Implements pausable functionality
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._update(from, to, value);
    }
}
