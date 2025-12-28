// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IEntryPoint {
    function validateUserOp(
        address sender,
        uint256 nonce,
        bytes calldata initCode,
        bytes calldata callData,
        uint256 callGasLimit,
        uint256 verificationGasLimit,
        uint256 preVerificationGas,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas,
        bytes calldata paymasterAndData,
        bytes calldata signature
    ) external;
}

contract SimpleAccount is Initializable {
    using ECDSA for bytes32;

    address public owner;
    address public entryPoint;
    uint256 public nonce;

    event ExecutionSuccess(bytes32 indexed txHash);
    event ExecutionFailure(bytes32 indexed txHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only EntryPoint");
        _;
    }

    function initialize(address _owner, address _entryPoint) public initializer {
        owner = _owner;
        entryPoint = _entryPoint;
        nonce = 0;
    }

    function validateUserOp(bytes calldata signature) external view onlyEntryPoint {
        bytes32 userOpHash = keccak256(abi.encodePacked(msg.data));
        bytes32 messageHash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        address recoveredOwner = ECDSA.recover(messageHash, signature);
        require(recoveredOwner == owner, "Invalid signature");
    }

    function executeCall(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bool success, bytes memory result) {
        (success, result) = target.call{value: value}(data);
        require(success, "Execution failed");
    }

    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyOwner {
        require(
            targets.length == values.length && targets.length == datas.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(datas[i]);
            require(success, "Batch execution failed");
        }
    }

    function increaseNonce() external onlyEntryPoint {
        nonce++;
    }

    receive() external payable {}
}
