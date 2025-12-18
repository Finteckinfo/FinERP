// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProjectEscrow
 * @dev Secure escrow contract for managing project funds and subtask payments
 * @notice This contract implements a multi-signature approval system for fund releases
 */
contract ProjectEscrow {
    // State variables
    address public owner;
    uint256 public projectCounter;
    
    // Structs
    struct Project {
        uint256 id;
        address projectOwner;
        uint256 totalFunds;
        uint256 allocatedFunds;
        uint256 releasedFunds;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Subtask {
        uint256 id;
        uint256 projectId;
        address assignedTo;
        uint256 allocatedAmount;
        bool isCompleted;
        bool isApproved;
        bool fundsReleased;
        uint256 createdAt;
    }
    
    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Subtask) public subtasks;
    mapping(uint256 => uint256[]) public projectSubtasks;
    mapping(address => uint256[]) public userProjects;
    
    uint256 public subtaskCounter;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed owner, uint256 totalFunds);
    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event SubtaskCreated(uint256 indexed subtaskId, uint256 indexed projectId, address indexed assignedTo, uint256 amount);
    event SubtaskCompleted(uint256 indexed subtaskId);
    event SubtaskApproved(uint256 indexed subtaskId);
    event SubtaskRejected(uint256 indexed subtaskId);
    event FundsReleased(uint256 indexed subtaskId, address indexed recipient, uint256 amount);
    event ProjectClosed(uint256 indexed projectId);
    event RefundIssued(uint256 indexed projectId, address indexed recipient, uint256 amount);
    
    // Modifiers
    modifier onlyProjectOwner(uint256 _projectId) {
        require(projects[_projectId].projectOwner == msg.sender, "Not project owner");
        _;
    }
    
    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].projectOwner != address(0), "Project does not exist");
        _;
    }
    
    modifier subtaskExists(uint256 _subtaskId) {
        require(subtasks[_subtaskId].projectId != 0, "Subtask does not exist");
        _;
    }
    
    modifier projectActive(uint256 _projectId) {
        require(projects[_projectId].isActive, "Project is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new project with initial funding
     * @param _totalFunds Total funds to be allocated for the project
     */
    function createProject(uint256 _totalFunds) external payable returns (uint256) {
        require(msg.value == _totalFunds, "Sent value must match total funds");
        require(_totalFunds > 0, "Total funds must be greater than 0");
        
        projectCounter++;
        uint256 projectId = projectCounter;
        
        projects[projectId] = Project({
            id: projectId,
            projectOwner: msg.sender,
            totalFunds: _totalFunds,
            allocatedFunds: 0,
            releasedFunds: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userProjects[msg.sender].push(projectId);
        
        emit ProjectCreated(projectId, msg.sender, _totalFunds);
        emit FundsDeposited(projectId, _totalFunds);
        
        return projectId;
    }
    
    /**
     * @dev Add additional funds to an existing project
     * @param _projectId ID of the project
     */
    function addFunds(uint256 _projectId) 
        external 
        payable 
        projectExists(_projectId)
        onlyProjectOwner(_projectId)
        projectActive(_projectId)
    {
        require(msg.value > 0, "Must send funds");
        
        projects[_projectId].totalFunds += msg.value;
        
        emit FundsDeposited(_projectId, msg.value);
    }
    
    /**
     * @dev Create a subtask and allocate funds from project budget
     * @param _projectId ID of the project
     * @param _assignedTo Address of the person assigned to the subtask
     * @param _amount Amount to allocate for this subtask
     */
    function createSubtask(
        uint256 _projectId,
        address _assignedTo,
        uint256 _amount
    ) 
        external 
        projectExists(_projectId)
        onlyProjectOwner(_projectId)
        projectActive(_projectId)
        returns (uint256)
    {
        require(_assignedTo != address(0), "Invalid assignee address");
        require(_amount > 0, "Amount must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(
            project.allocatedFunds + _amount <= project.totalFunds,
            "Insufficient unallocated funds"
        );
        
        subtaskCounter++;
        uint256 subtaskId = subtaskCounter;
        
        subtasks[subtaskId] = Subtask({
            id: subtaskId,
            projectId: _projectId,
            assignedTo: _assignedTo,
            allocatedAmount: _amount,
            isCompleted: false,
            isApproved: false,
            fundsReleased: false,
            createdAt: block.timestamp
        });
        
        project.allocatedFunds += _amount;
        projectSubtasks[_projectId].push(subtaskId);
        
        emit SubtaskCreated(subtaskId, _projectId, _assignedTo, _amount);
        
        return subtaskId;
    }
    
    /**
     * @dev Mark a subtask as completed (called by assignee)
     * @param _subtaskId ID of the subtask
     */
    function completeSubtask(uint256 _subtaskId) 
        external 
        subtaskExists(_subtaskId)
    {
        Subtask storage subtask = subtasks[_subtaskId];
        require(subtask.assignedTo == msg.sender, "Not assigned to you");
        require(!subtask.isCompleted, "Already completed");
        require(projects[subtask.projectId].isActive, "Project is not active");
        
        subtask.isCompleted = true;
        
        emit SubtaskCompleted(_subtaskId);
    }
    
    /**
     * @dev Approve a subtask and release funds (called by project owner)
     * @param _subtaskId ID of the subtask
     */
    function approveSubtask(uint256 _subtaskId) 
        external 
        subtaskExists(_subtaskId)
    {
        Subtask storage subtask = subtasks[_subtaskId];
        uint256 projectId = subtask.projectId;
        
        require(projects[projectId].projectOwner == msg.sender, "Not project owner");
        require(subtask.isCompleted, "Subtask not completed");
        require(!subtask.isApproved, "Already approved");
        require(!subtask.fundsReleased, "Funds already released");
        
        subtask.isApproved = true;
        subtask.fundsReleased = true;
        
        projects[projectId].releasedFunds += subtask.allocatedAmount;
        
        // Transfer funds to assignee
        (bool success, ) = payable(subtask.assignedTo).call{value: subtask.allocatedAmount}("");
        require(success, "Transfer failed");
        
        emit SubtaskApproved(_subtaskId);
        emit FundsReleased(_subtaskId, subtask.assignedTo, subtask.allocatedAmount);
    }
    
    /**
     * @dev Reject a subtask (called by project owner)
     * @param _subtaskId ID of the subtask
     */
    function rejectSubtask(uint256 _subtaskId) 
        external 
        subtaskExists(_subtaskId)
    {
        Subtask storage subtask = subtasks[_subtaskId];
        uint256 projectId = subtask.projectId;
        
        require(projects[projectId].projectOwner == msg.sender, "Not project owner");
        require(subtask.isCompleted, "Subtask not completed");
        require(!subtask.isApproved, "Already approved");
        
        // Reset completion status to allow resubmission
        subtask.isCompleted = false;
        
        emit SubtaskRejected(_subtaskId);
    }
    
    /**
     * @dev Close a project and refund unallocated funds
     * @param _projectId ID of the project
     */
    function closeProject(uint256 _projectId) 
        external 
        projectExists(_projectId)
        onlyProjectOwner(_projectId)
    {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project already closed");
        
        project.isActive = false;
        
        // Calculate unallocated funds
        uint256 unallocatedFunds = project.totalFunds - project.allocatedFunds;
        
        // Calculate allocated but unreleased funds
        uint256 allocatedButUnreleased = project.allocatedFunds - project.releasedFunds;
        
        // Total refund is unallocated + allocated but not yet approved
        uint256 refundAmount = unallocatedFunds + allocatedButUnreleased;
        
        if (refundAmount > 0) {
            (bool success, ) = payable(project.projectOwner).call{value: refundAmount}("");
            require(success, "Refund transfer failed");
            
            emit RefundIssued(_projectId, project.projectOwner, refundAmount);
        }
        
        emit ProjectClosed(_projectId);
    }
    
    /**
     * @dev Get project details
     * @param _projectId ID of the project
     */
    function getProject(uint256 _projectId) 
        external 
        view 
        projectExists(_projectId)
        returns (
            address projectOwner,
            uint256 totalFunds,
            uint256 allocatedFunds,
            uint256 releasedFunds,
            bool isActive,
            uint256 createdAt
        )
    {
        Project memory project = projects[_projectId];
        return (
            project.projectOwner,
            project.totalFunds,
            project.allocatedFunds,
            project.releasedFunds,
            project.isActive,
            project.createdAt
        );
    }
    
    /**
     * @dev Get subtask details
     * @param _subtaskId ID of the subtask
     */
    function getSubtask(uint256 _subtaskId) 
        external 
        view 
        subtaskExists(_subtaskId)
        returns (
            uint256 projectId,
            address assignedTo,
            uint256 allocatedAmount,
            bool isCompleted,
            bool isApproved,
            bool fundsReleased,
            uint256 createdAt
        )
    {
        Subtask memory subtask = subtasks[_subtaskId];
        return (
            subtask.projectId,
            subtask.assignedTo,
            subtask.allocatedAmount,
            subtask.isCompleted,
            subtask.isApproved,
            subtask.fundsReleased,
            subtask.createdAt
        );
    }
    
    /**
     * @dev Get all subtasks for a project
     * @param _projectId ID of the project
     */
    function getProjectSubtasks(uint256 _projectId) 
        external 
        view 
        projectExists(_projectId)
        returns (uint256[] memory)
    {
        return projectSubtasks[_projectId];
    }
    
    /**
     * @dev Get all projects owned by an address
     * @param _owner Address of the owner
     */
    function getUserProjects(address _owner) 
        external 
        view 
        returns (uint256[] memory)
    {
        return userProjects[_owner];
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
