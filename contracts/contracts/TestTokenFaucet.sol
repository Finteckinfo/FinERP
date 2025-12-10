// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TestTokenFaucet
 * @dev A faucet contract for distributing test FIN tokens
 * Similar to pool game tokens - users can request tokens daily
 * 
 * Features:
 * - Daily request limits (like pool game token limits)
 * - Cooldown period between requests
 * - Role-based access control
 * - Gasless transaction support (via Gelato Relay)
 */
contract TestTokenFaucet is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE"); // For gasless transactions

    IERC20 public immutable finToken;
    
    // Faucet configuration
    uint256 public dailyLimit; // Maximum tokens per day per address
    uint256 public cooldownPeriod; // Time between requests (in seconds)
    
    // Tracking
    mapping(address => uint256) public lastRequest;
    mapping(address => uint256) public dailyRequested; // Resets daily
    mapping(uint256 => uint256) public dailyReset; // Track when daily limit resets
    
    // Events
    event TokensRequested(address indexed recipient, uint256 amount, uint256 timestamp);
    event DailyLimitUpdated(uint256 newLimit);
    event CooldownPeriodUpdated(uint256 newPeriod);
    event TokensWithdrawn(address indexed admin, uint256 amount);

    constructor(
        address _finToken,
        uint256 _dailyLimit,
        uint256 _cooldownPeriod
    ) {
        require(_finToken != address(0), "Invalid token address");
        require(_dailyLimit > 0, "Daily limit must be greater than 0");
        
        finToken = IERC20(_finToken);
        dailyLimit = _dailyLimit;
        cooldownPeriod = _cooldownPeriod;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Request test tokens (like getting pool game tokens)
     * @param amount Amount of tokens to request (in wei)
     */
    function requestTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= dailyLimit, "Amount exceeds daily limit");
        require(canRequest(msg.sender), "Cannot request tokens yet");
        
        // Check daily limit
        uint256 today = block.timestamp / 86400; // Days since epoch
        if (dailyReset[today] == 0) {
            // Reset daily counter for new day
            dailyRequested[msg.sender] = 0;
            dailyReset[today] = 1;
        }
        
        require(
            dailyRequested[msg.sender] + amount <= dailyLimit,
            "Daily limit exceeded"
        );
        
        // Update tracking
        lastRequest[msg.sender] = block.timestamp;
        dailyRequested[msg.sender] += amount;
        
        // Transfer tokens
        finToken.safeTransfer(msg.sender, amount);
        
        emit TokensRequested(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Check if an address can request tokens
     */
    function canRequest(address user) public view returns (bool) {
        if (lastRequest[user] == 0) {
            return true; // First request
        }
        
        // Check cooldown
        if (block.timestamp < lastRequest[user] + cooldownPeriod) {
            return false;
        }
        
        // Check daily limit
        uint256 today = block.timestamp / 86400;
        uint256 yesterday = today - 1;
        
        // If it's a new day, reset is allowed
        if (dailyReset[today] == 0 && dailyReset[yesterday] > 0) {
            return true;
        }
        
        return dailyRequested[user] < dailyLimit;
    }

    /**
     * @dev Get remaining daily limit for an address
     */
    function getRemainingDailyLimit(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 86400;
        if (dailyReset[today] == 0) {
            return dailyLimit; // New day, full limit available
        }
        
        uint256 requested = dailyRequested[user];
        return requested >= dailyLimit ? 0 : dailyLimit - requested;
    }

    /**
     * @dev Admin: Update daily limit
     */
    function setDailyLimit(uint256 _dailyLimit) external onlyRole(ADMIN_ROLE) {
        require(_dailyLimit > 0, "Daily limit must be greater than 0");
        dailyLimit = _dailyLimit;
        emit DailyLimitUpdated(_dailyLimit);
    }

    /**
     * @dev Admin: Update cooldown period
     */
    function setCooldownPeriod(uint256 _cooldownPeriod) external onlyRole(ADMIN_ROLE) {
        cooldownPeriod = _cooldownPeriod;
        emit CooldownPeriodUpdated(_cooldownPeriod);
    }

    /**
     * @dev Admin: Withdraw tokens (for emergency or rebalancing)
     */
    function withdrawTokens(uint256 amount) external onlyRole(ADMIN_ROLE) {
        finToken.safeTransfer(msg.sender, amount);
        emit TokensWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Relayer: Execute gasless request (for Gelato Relay)
     * @param user The user requesting tokens
     * @param amount Amount of tokens to request
     */
    function requestTokensFor(address user, uint256 amount) external onlyRole(RELAYER_ROLE) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= dailyLimit, "Amount exceeds daily limit");
        require(canRequest(user), "Cannot request tokens yet");
        
        uint256 today = block.timestamp / 86400;
        if (dailyReset[today] == 0) {
            dailyRequested[user] = 0;
            dailyReset[today] = 1;
        }
        
        require(
            dailyRequested[user] + amount <= dailyLimit,
            "Daily limit exceeded"
        );
        
        lastRequest[user] = block.timestamp;
        dailyRequested[user] += amount;
        
        finToken.safeTransfer(user, amount);
        
        emit TokensRequested(user, amount, block.timestamp);
    }

    /**
     * @dev Get faucet info
     */
    function getFaucetInfo() external view returns (
        uint256 _dailyLimit,
        uint256 _cooldownPeriod,
        uint256 _contractBalance
    ) {
        return (
            dailyLimit,
            cooldownPeriod,
            finToken.balanceOf(address(this))
        );
    }
}

