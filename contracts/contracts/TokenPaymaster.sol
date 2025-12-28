// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract TokenPaymaster is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IERC20 public immutable acceptedToken;
    address public immutable entryPoint;
    
    uint256 public exchangeRate = 1e18;
    
    mapping(address => bool) public verifiedSigners;
    mapping(bytes32 => bool) public usedNonces;

    event TokenDeposited(address indexed user, uint256 amount);
    event PaymasterCharged(address indexed user, uint256 tokenAmount, uint256 gasUsed);
    event ExchangeRateUpdated(uint256 newRate);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only EntryPoint");
        _;
    }

    constructor(address _token, address _entryPoint, address _initialVerifier) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        require(_entryPoint != address(0), "Invalid EntryPoint");
        require(_initialVerifier != address(0), "Invalid verifier");

        acceptedToken = IERC20(_token);
        entryPoint = _entryPoint;
        verifiedSigners[_initialVerifier] = true;
    }

    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier");
        verifiedSigners[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeVerifier(address _verifier) external onlyOwner {
        verifiedSigners[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    function setExchangeRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be positive");
        exchangeRate = _newRate;
        emit ExchangeRateUpdated(_newRate);
    }

    function validatePaymasterUserOp(
        address account,
        bytes32 userOpHash,
        uint256 maxCost,
        bytes calldata signature
    ) external view returns (bytes memory context) {
        bytes32 messageHash = userOpHash.toEthSignedMessageHash();
        address signer = ECDSA.recover(messageHash, signature);

        require(verifiedSigners[signer], "Invalid signature");
        require(!usedNonces[userOpHash], "Nonce already used");

        return abi.encode(account, maxCost);
    }

    function postOp(
        bytes calldata context,
        uint256 actualGasCost
    ) external onlyEntryPoint {
        (address account, uint256 maxCost) = abi.decode(context, (address, uint256));

        uint256 chargedAmount = (actualGasCost * exchangeRate) / 1e18;
        require(chargedAmount <= maxCost, "Gas cost exceeded");

        bool success = acceptedToken.transferFrom(account, address(this), chargedAmount);
        require(success, "Token transfer failed");

        emit PaymasterCharged(account, chargedAmount, actualGasCost);
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount <= acceptedToken.balanceOf(address(this)), "Insufficient balance");
        require(acceptedToken.transfer(owner(), amount), "Withdrawal failed");
    }

    function getBalance() external view returns (uint256) {
        return acceptedToken.balanceOf(address(this));
    }
}
