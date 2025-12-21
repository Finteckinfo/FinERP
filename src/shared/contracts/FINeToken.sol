// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FINe Token (FINe)
 * @dev ERC-20 token for FinPro platform with 1:1 USDT peg functionality
 * 
 * This token is designed to be used within the FinPro ecosystem for:
 * - Project funding and escrow payments
 * - Swap functionality with USDT at 1:1 rate
 * - Governance and platform utilities
 * 
 * Features:
 * - Mintable by authorized addresses
 * - Burnable for redemption
 * - Pausable for emergency situations
 * - 18 decimal places (matching USDT)
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FINeToken is ERC20, ERC20Burnable, Pausable, Ownable {
    // Maximum supply cap (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Authorized minters
    mapping(address => bool) public minters;
    
    // Treasury address for swap reserves
    address public treasury;
    
    // Events
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensRedeemed(address indexed from, uint256 amount);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(address _treasury) ERC20("FINe Token", "FINe") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
        
        // Add deployer as initial minter
        minters[msg.sender] = true;
        emit MinterAdded(msg.sender);
        
        // Mint initial supply to treasury (10 million tokens for liquidity)
        _mint(treasury, 10_000_000 * 10**18);
        emit TokensMinted(treasury, 10_000_000 * 10**18);
    }
    
    /**
     * @dev Mint new tokens
     * Can only be called by authorized minters
     * Cannot exceed MAX_SUPPLY
     */
    function mint(address to, uint256 amount) external onlyMinter whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens for USDT redemption
     * Burns from sender's balance
     */
    function redeemForUSDT(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        burn(amount);
        emit TokensRedeemed(msg.sender, amount);
        
        // Note: Actual USDT transfer should be handled by backend/treasury
        // This event signals the redemption request
    }
    
    /**
     * @dev Add authorized minter
     */
    function addMinter(address account) external onlyOwner {
        require(account != address(0), "Cannot add zero address as minter");
        require(!minters[account], "Already a minter");
        
        minters[account] = true;
        emit MinterAdded(account);
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address account) external onlyOwner {
        require(minters[account], "Not a minter");
        
        minters[account] = false;
        emit MinterRemoved(account);
    }
    
    /**
     * @dev Update treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury cannot be zero address");
        
        address oldTreasury = treasury;
        treasury = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @dev Pause token transfers
     * Emergency function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Internal function used for token transfers (overridden for Pausable)
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }

    
    /**
     * @dev Returns the number of decimals used (18, same as USDT)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
