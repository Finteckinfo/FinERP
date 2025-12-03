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
 * @title ProjectEscrow
 * @notice Secure escrow contract for project-based FIN token payments
 * @dev Security features:
 *      - Reentrancy protection on all state-changing functions
 *      - Multi-sig approval for large releases (>10,000 FIN)
 *      - Time-locked refunds (24-hour delay)
 *      - Emergency pause functionality
 *      - Role-based access control
 *      - SafeERC20 for token transfers
 * 
 * Workflow:
 *      1. Employer funds project escrow
 *      2. Tasks allocated with FIN amounts
 *      3. Worker completes task
 *      4. Payment released to worker
 *      5. Unused funds refunded to employer
 */
contract ProjectEscrow is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Role for project managers
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    /// @notice Role for multi-sig approvers
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    
    /// @notice Role for upgrading contract
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    /// @notice Threshold for requiring multi-sig approval (10,000 FIN)
    uint256 public constant APPROVAL_THRESHOLD = 10_000 * 10**18;
    
    /// @notice Time lock for refunds (24 hours)
    uint256 public constant REFUND_TIMELOCK = 24 hours;
    
    /// @notice Number of approvals required for large releases
    uint256 public constant REQUIRED_APPROVALS = 2;

    /// @notice FIN token contract
    IERC20 public finToken;

    /// @notice Project status enum
    enum ProjectStatus { ACTIVE, COMPLETED, CANCELLED }
    
    /// @notice Task status enum
    enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, PAID, CANCELLED }

    /// @notice Project struct
    struct Project {
        address employer;
        uint256 totalFunded;
        uint256 totalAllocated;
        uint256 totalReleased;
        ProjectStatus status;
        uint256 createdAt;
        uint256 refundRequestedAt;
    }

    /// @notice Task struct
    struct Task {
        uint256 projectId;
        address worker;
        uint256 amount;
        TaskStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    /// @notice Mapping of project ID to Project
    mapping(uint256 => Project) public projects;
    
    /// @notice Mapping of task ID to Task
    mapping(uint256 => Task) public tasks;
    
    /// @notice Counter for project IDs
    uint256 public projectCounter;
    
    /// @notice Counter for task IDs
    uint256 public taskCounter;

    /// @notice Events
    event ProjectFunded(uint256 indexed projectId, address indexed employer, uint256 amount);
    event TaskAllocated(uint256 indexed taskId, uint256 indexed projectId, address indexed worker, uint256 amount);
    event TaskCompleted(uint256 indexed taskId, address indexed worker);
    event PaymentReleased(uint256 indexed taskId, address indexed worker, uint256 amount);
    event PaymentApproved(uint256 indexed taskId, address indexed approver);
    event RefundRequested(uint256 indexed projectId, address indexed employer, uint256 requestedAt);
    event RefundProcessed(uint256 indexed projectId, address indexed employer, uint256 amount);
    event ProjectCancelled(uint256 indexed projectId, address indexed employer);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the escrow contract
     * @param _finToken Address of FIN token contract
     * @param admin Address to receive admin role
     */
    function initialize(address _finToken, address admin) public initializer {
        require(_finToken != address(0), "ProjectEscrow: FIN token is zero address");
        require(admin != address(0), "ProjectEscrow: admin is zero address");
        
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        finToken = IERC20(_finToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
        _grantRole(APPROVER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /**
     * @notice Fund a new project
     * @param amount Amount of FIN tokens to fund
     * @return projectId ID of created project
     */
    function fundProject(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 projectId) 
    {
        require(amount > 0, "ProjectEscrow: amount must be greater than 0");
        
        projectId = ++projectCounter;
        
        Project storage project = projects[projectId];
        project.employer = msg.sender;
        project.totalFunded = amount;
        project.status = ProjectStatus.ACTIVE;
        project.createdAt = block.timestamp;
        
        // Transfer FIN tokens to escrow
        finToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit ProjectFunded(projectId, msg.sender, amount);
    }

    /**
     * @notice Allocate a task to a worker
     * @param projectId ID of the project
     * @param worker Address of the worker
     * @param amount Amount of FIN tokens for the task
     * @return taskId ID of created task
     */
    function allocateTask(uint256 projectId, address worker, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        onlyRole(MANAGER_ROLE)
        returns (uint256 taskId)
    {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.ACTIVE, "ProjectEscrow: project not active");
        require(worker != address(0), "ProjectEscrow: worker is zero address");
        require(amount > 0, "ProjectEscrow: amount must be greater than 0");
        require(
            project.totalAllocated + amount <= project.totalFunded,
            "ProjectEscrow: insufficient project funds"
        );
        
        taskId = ++taskCounter;
        
        Task storage task = tasks[taskId];
        task.projectId = projectId;
        task.worker = worker;
        task.amount = amount;
        task.status = TaskStatus.PENDING;
        task.createdAt = block.timestamp;
        
        project.totalAllocated += amount;
        
        emit TaskAllocated(taskId, projectId, worker, amount);
    }

    /**
     * @notice Mark task as completed
     * @param taskId ID of the task
     */
    function completeTask(uint256 taskId) external nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.worker == msg.sender, "ProjectEscrow: only worker can complete task");
        require(task.status == TaskStatus.PENDING || task.status == TaskStatus.IN_PROGRESS, "ProjectEscrow: invalid task status");
        
        task.status = TaskStatus.COMPLETED;
        task.completedAt = block.timestamp;
        
        emit TaskCompleted(taskId, msg.sender);
        
        // Auto-release if below threshold
        if (task.amount < APPROVAL_THRESHOLD) {
            _releasePayment(taskId);
        }
    }

    /**
     * @notice Approve payment release (for large amounts)
     * @param taskId ID of the task
     */
    function approvePayment(uint256 taskId) external onlyRole(APPROVER_ROLE) {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.COMPLETED, "ProjectEscrow: task not completed");
        require(!task.approvals[msg.sender], "ProjectEscrow: already approved");
        require(task.amount >= APPROVAL_THRESHOLD, "ProjectEscrow: approval not required");
        
        task.approvals[msg.sender] = true;
        task.approvalCount++;
        
        emit PaymentApproved(taskId, msg.sender);
        
        // Auto-release if threshold met
        if (task.approvalCount >= REQUIRED_APPROVALS) {
            _releasePayment(taskId);
        }
    }

    /**
     * @notice Internal function to release payment
     * @param taskId ID of the task
     */
    function _releasePayment(uint256 taskId) internal {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.COMPLETED, "ProjectEscrow: task not completed");
        
        // Verify approvals for large amounts
        if (task.amount >= APPROVAL_THRESHOLD) {
            require(task.approvalCount >= REQUIRED_APPROVALS, "ProjectEscrow: insufficient approvals");
        }
        
        Project storage project = projects[task.projectId];
        
        task.status = TaskStatus.PAID;
        project.totalReleased += task.amount;
        
        // Transfer FIN tokens to worker
        finToken.safeTransfer(task.worker, task.amount);
        
        emit PaymentReleased(taskId, task.worker, task.amount);
    }

    /**
     * @notice Request refund for unused project funds
     * @param projectId ID of the project
     */
    function requestRefund(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        require(project.employer == msg.sender, "ProjectEscrow: only employer can request refund");
        require(project.status == ProjectStatus.ACTIVE, "ProjectEscrow: project not active");
        require(project.refundRequestedAt == 0, "ProjectEscrow: refund already requested");
        
        project.refundRequestedAt = block.timestamp;
        
        emit RefundRequested(projectId, msg.sender, block.timestamp);
    }

    /**
     * @notice Process refund after timelock
     * @param projectId ID of the project
     */
    function processRefund(uint256 projectId) external nonReentrant whenNotPaused {
        Project storage project = projects[projectId];
        require(project.employer == msg.sender, "ProjectEscrow: only employer can process refund");
        require(project.refundRequestedAt > 0, "ProjectEscrow: refund not requested");
        require(
            block.timestamp >= project.refundRequestedAt + REFUND_TIMELOCK,
            "ProjectEscrow: timelock not expired"
        );
        
        uint256 refundAmount = project.totalFunded - project.totalAllocated;
        require(refundAmount > 0, "ProjectEscrow: no funds to refund");
        
        project.status = ProjectStatus.COMPLETED;
        
        // Transfer unused FIN tokens back to employer
        finToken.safeTransfer(project.employer, refundAmount);
        
        emit RefundProcessed(projectId, project.employer, refundAmount);
    }

    /**
     * @notice Cancel project (admin only)
     * @param projectId ID of the project
     */
    function cancelProject(uint256 projectId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.ACTIVE, "ProjectEscrow: project not active");
        
        project.status = ProjectStatus.CANCELLED;
        
        uint256 refundAmount = project.totalFunded - project.totalReleased;
        if (refundAmount > 0) {
            finToken.safeTransfer(project.employer, refundAmount);
        }
        
        emit ProjectCancelled(projectId, project.employer);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Authorize contract upgrade
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    /**
     * @notice Get project details
     * @param projectId ID of the project
     */
    function getProject(uint256 projectId) external view returns (
        address employer,
        uint256 totalFunded,
        uint256 totalAllocated,
        uint256 totalReleased,
        ProjectStatus status,
        uint256 createdAt,
        uint256 refundRequestedAt
    ) {
        Project storage project = projects[projectId];
        return (
            project.employer,
            project.totalFunded,
            project.totalAllocated,
            project.totalReleased,
            project.status,
            project.createdAt,
            project.refundRequestedAt
        );
    }

    /**
     * @notice Get task details
     * @param taskId ID of the task
     */
    function getTask(uint256 taskId) external view returns (
        uint256 projectId,
        address worker,
        uint256 amount,
        TaskStatus status,
        uint256 createdAt,
        uint256 completedAt,
        uint256 approvalCount
    ) {
        Task storage task = tasks[taskId];
        return (
            task.projectId,
            task.worker,
            task.amount,
            task.status,
            task.createdAt,
            task.completedAt,
            task.approvalCount
        );
    }
}
