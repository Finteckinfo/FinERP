# Escrow and Payment Workflow Guide

**Author:** Llakterian  
**Last Updated:** November 15, 2025  
**Version:** 1.0  
**Purpose:** Complete guide for escrow allocation and payment approval workflow in SIZLAND ERP

---

## Table of Contents

1. [Overview](#overview)
2. [Key Principles](#key-principles)
3. [Escrow Allocation Workflow](#escrow-allocation-workflow)
4. [Task Approval and Payment Release](#task-approval-and-payment-release)
5. [Kanban Board Integration](#kanban-board-integration)
6. [API Integration](#api-integration)
7. [Best Practices](#best-practices)

---

## Overview

The SIZLAND ERP system implements a secure, blockchain-based escrow and payment system that ensures:

- **Trust**: Funds are held securely on the Algorand blockchain
- **Transparency**: All transactions are verifiable on-chain
- **Automation**: Payments are released automatically upon task approval
- **Control**: Only project owners can approve tasks and release escrow funds

### Payment Flow States

```
PENDING → ALLOCATED → PROCESSING → PAID
                    ↓
                 FAILED/REFUNDED
```

---

## Key Principles

### IMPORTANT: Escrow Allocation Timing

**Escrow should be allocated during TASK ALLOCATION, not at project creation stage.**

#### Why This Matters:

1. **Accurate Budget Planning**: Task allocation happens after project planning is complete, allowing for accurate payment estimation
2. **Team Composition**: You know exactly who is on the team and their payment terms
3. **Payment Obligations**: Escrow is funded based on actual task assignments with defined payment amounts
4. **Flexibility**: Project scope can be refined before committing funds

#### The Workflow:

```
1. CREATE PROJECT
   ↓
2. DEFINE DEPARTMENTS/SECTIONS
   ↓
3. INVITE TEAM MEMBERS (with payment configuration)
   ↓
4. ALLOCATE TASKS (assign with payment amounts)
   ↓
5. FUND ESCROW ← This is when escrow funding happens
   ↓
6. TEAM WORKS ON TASKS
   ↓
7. PROJECT OWNER APPROVES COMPLETED TASKS
   ↓
8. ESCROW RELEASES PAYMENT AUTOMATICALLY
```

---

## Escrow Allocation Workflow

### Step 1: Project Creation

**Location**: `/projects/create`

At this stage:
- Define project name, description, dates
- Set project type (PROGRESSIVE or PARALLEL)
- Define project priority
- **DO NOT fund escrow yet**

### Step 2: Define Project Structure

**Location**: `/projects/:id/workspace`

- Create departments (MAJOR/MINOR types)
- Define department hierarchy and order
- Set up organizational structure

### Step 3: Invite Team Members

**Location**: `/projects/:id/workspace` → "Invite Member"

Configure payment terms for each team member:

#### Payment Types:

1. **PER_TASK**: Paid for each completed task (default)
   - No upfront escrow allocation needed
   - Escrow funded per task as they are allocated

2. **SALARY**: Regular recurring payments
   - **Requires escrow funding**
   - Configure: amount + frequency (WEEKLY, BIWEEKLY, MONTHLY)
   - System calculates total obligation based on project duration

3. **OVERSIGHT**: Percentage of task payments
   - **Requires escrow allocation**
   - Configure: percentage rate (e.g., 5% of all task payments)
   - Automatically calculated when tasks are approved

4. **MILESTONE**: Fixed payment per milestone
   - **Requires escrow funding**
   - Configure: amount per milestone
   - Paid when project milestones are reached

5. **HYBRID**: Combination of multiple payment types
   - **Requires escrow funding**
   - Mix of the above payment methods

#### Example: Inviting with Payment Configuration

```javascript
// Inviting a project manager with oversight payment
{
  email: "manager@example.com",
  role: "PROJECT_MANAGER",
  paymentType: "OVERSIGHT",
  oversightRate: 5 // 5% of all task payments
}

// Inviting a developer with per-task payment
{
  email: "dev@example.com",
  role: "EMPLOYEE",
  paymentType: "PER_TASK"
  // No additional fields needed
}

// Inviting an admin with salary
{
  email: "admin@example.com",
  role: "EMPLOYEE",
  paymentType: "SALARY",
  salaryAmount: 1000, // SIZ
  salaryFrequency: "MONTHLY"
}
```

### Step 4: Allocate Tasks with Payment Amounts

**Location**: `/projects/:id/workspace` → "Add Task"

When creating a task:
```javascript
{
  title: "Implement user authentication",
  description: "Build secure login system",
  departmentId: "dept_123",
  assignedRoleId: "role_456",
  priority: "HIGH",
  dueDate: "2025-12-31",
  paymentAmount: 500 // ← Payment amount in SIZ
}
```

**Key Points:**
- Each task can have an optional `paymentAmount`
- Tasks without payment amounts won't trigger escrow transactions
- Payment amounts are visible to all project members for transparency

### Step 5: Fund Escrow

**Location**: `/projects/:id/fund-escrow`

**Timing**: After tasks are allocated and payment obligations are known

#### What Gets Calculated:

```javascript
Total Escrow Needed = 
  Sum of all task payment amounts +
  Salary obligations (based on project duration) +
  Estimated oversight costs +
  Milestone payments +
  Buffer (recommended 10-20%)
```

#### Funding Process:

1. **View Escrow Requirements**
   - System shows total obligations
   - Breakdown by payment type
   - Current escrow balance
   - Funding needed

2. **Fund via Algorand Wallet**
   - Connect Pera Wallet or Defly Wallet
   - Send SIZCOIN to project escrow address
   - Confirm transaction

3. **Verify Deposit**
   - Enter transaction hash
   - System verifies on Algorand blockchain
   - Escrow balance updated

#### Escrow Address Structure:

Each project gets a unique escrow address:
```
Project Escrow Address: XYZABC123...789 (Algorand address)
Asset: SIZCOIN (ASA ID: configured in system)
```

---

## Task Approval and Payment Release

### Task Status Progression

```
PENDING → IN_PROGRESS → COMPLETED → APPROVED
```

### Kanban Board Workflow

**Location**: `/kanban`

#### Status Columns:

1. **To Do (PENDING)**
   - Tasks ready to be started
   - Anyone can move tasks here
   - No payment action

2. **In Progress (IN_PROGRESS)**
   - Tasks currently being worked on
   - Assignees can update status
   - No payment action

3. **Completed (COMPLETED)**
   - Tasks finished by team members
   - Assignees mark tasks as complete
   - Awaiting approval
   - **Escrow is NOT released yet**

4. **Approved (APPROVED)**
   - **ONLY PROJECT OWNER can move tasks here**
   - Drag & drop from COMPLETED to APPROVED is restricted
   - **This triggers automatic escrow payment release**
   - Payment sent to assignee's wallet
   - Transaction recorded on blockchain

### Approval Permissions

#### Permission Checks:

```typescript
// Only project owner can approve tasks
if (targetColumn === 'APPROVED') {
  if (!task.canApprove && !userPermissions.canEditAllTasks) {
    // Show error: "Only the project owner can approve tasks"
    return;
  }
}
```

#### Visual Feedback:

When a non-owner tries to approve a task:
```
WARNING: Only the project owner can approve tasks
```

This appears as a toast notification in the top-right corner.

### What Happens Upon Approval

1. **Task Status Updated**: COMPLETED → APPROVED
2. **Escrow Check**: Verify sufficient funds in escrow
3. **Payment Transaction**: 
   - Send SIZCOIN from escrow to assignee's wallet
   - Amount: task.paymentAmount
4. **Blockchain Recording**: Transaction hash recorded
5. **Payment Status**: ALLOCATED → PROCESSING → PAID
6. **Notification**: Assignee notified of payment
7. **Escrow Balance**: Updated to reflect released funds

---

## Kanban Board Integration

### API Connection

The Kanban board is already connected to the backend API for project progress updates.

#### Key API Endpoints:

```typescript
// Get tasks across all projects
GET /api/tasks/kanban/all-projects
Response: KanbanBoard

// Update task position/status
PATCH /api/tasks/:taskId/position
Body: {
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED',
  order: number,
  departmentId?: string
}

// Get task activity history
GET /api/tasks/:taskId/activity
Response: TaskActivity[]
```

### Backend Requirements

The backend API must implement:

1. **Permission Validation**
   ```javascript
   // Check if user is project owner before allowing approval
   if (newStatus === 'APPROVED') {
     const userRole = await getUserRoleInProject(userId, projectId);
     if (userRole !== 'PROJECT_OWNER') {
       throw new Error('Only project owner can approve tasks');
     }
   }
   ```

2. **Escrow Transaction**
   ```javascript
   // When task is approved
   if (newStatus === 'APPROVED' && task.paymentAmount > 0) {
     await releaseEscrowPayment({
       projectId: task.projectId,
       taskId: task.id,
       recipientAddress: task.assignedUser.walletAddress,
       amount: task.paymentAmount,
       assetId: SIZCOIN_ASSET_ID
     });
   }
   ```

3. **Return Task Permissions**
   ```javascript
   // Include canApprove flag in task response
   const task = {
     ...taskData,
     canApprove: userRole === 'PROJECT_OWNER'
   };
   ```

---

## API Integration

### Frontend Implementation

The frontend has been updated to include approval permissions:

#### Type Definition:
```typescript
export interface KanbanTask {
  // ... other fields
  canApprove?: boolean; // Only project owner can approve
}
```

#### Column Configuration:
```typescript
{
  id: 'approved',
  title: 'Approved',
  status: 'APPROVED',
  color: '#3b82f6',
  icon: 'mdi-check-all',
  description: 'Tasks reviewed and approved by project owner (triggers escrow payment release)'
}
```

### Backend Integration Checklist

To complete the integration, the backend must:

- [ ] Implement permission check for task approval
- [ ] Add `canApprove` field to task response based on user role
- [ ] Implement escrow payment release on approval
- [ ] Record payment transaction on blockchain
- [ ] Update task payment status
- [ ] Send notification to assignee
- [ ] Update escrow balance
- [ ] Add audit trail for approval action

---

## Best Practices

### For Project Owners

1. **Plan Before Funding**
   - Define all tasks with payment amounts
   - Invite all team members with payment configurations
   - Calculate total escrow needed
   - Add 10-20% buffer for contingencies

2. **Regular Escrow Monitoring**
   - Check escrow balance regularly
   - Fund additional amounts as new tasks are added
   - Monitor payment obligations vs. available funds

3. **Timely Approvals**
   - Review completed tasks promptly
   - Approve quality work to release payments
   - Provide feedback for work that needs revision

4. **Clear Communication**
   - Set expectations for approval timeline
   - Communicate payment schedules
   - Notify team of escrow funding status

### For Team Members

1. **Wallet Setup**
   - Connect Algorand wallet (Pera or Defly)
   - Ensure wallet can receive SIZCOIN
   - Keep wallet backed up and secure

2. **Task Completion**
   - Mark tasks as COMPLETED when finished
   - Provide clear documentation
   - Wait for project owner approval

3. **Payment Tracking**
   - Monitor task status in Kanban board
   - Check wallet for received payments
   - Verify transaction hashes on Algorand explorer

### For Project Managers

1. **Department Organization**
   - Structure tasks by department
   - Assign tasks to appropriate roles
   - Monitor team progress

2. **Payment Awareness**
   - Understand team payment configurations
   - Help estimate task payment amounts
   - Coordinate with project owner on funding needs

---

## Security Considerations

### Escrow Security

- **Funds are secure** - Held on Algorand blockchain, not controlled by any single party  
- **Transparent** - All transactions verifiable on-chain  
- **Automated** - Reduces human error and delays  
- **Permission-based** - Only authorized roles can trigger payments  

### Approval Security

- **Role-based access** - Only project owner can approve  
- **Visual feedback** - Clear error messages for unauthorized actions  
- **Audit trail** - All approvals logged with timestamps  
- **Reversibility** - Tasks can be moved back to COMPLETED if needed

---

## Troubleshooting

### Common Issues

**Issue**: "Only the project owner can approve tasks" error  
**Solution**: Only the project owner (creator) can drag tasks to Approved column

**Issue**: Payment not released after approval  
**Solution**: Check escrow balance, verify backend integration is complete

**Issue**: Escrow balance insufficient  
**Solution**: Project owner needs to fund additional SIZCOIN to escrow

**Issue**: Task doesn't have payment amount  
**Solution**: Edit task to add payment amount, or task can be approved without payment

---

## Summary

### Key Takeaways

1. **Escrow allocation happens during task allocation** (not at project creation)
2. **Only project owners can approve tasks** (move from COMPLETED to APPROVED)
3. **Approval triggers automatic payment release** from escrow
4. **Kanban board is connected to API** for real-time updates
5. **Backend must implement approval permissions** and escrow release logic

### Implementation Status

- [x] Frontend Kanban board with approval restrictions
- [x] Type definitions with `canApprove` permission
- [x] Visual feedback for unauthorized approval attempts
- [x] Documentation for escrow workflow
- [ ] Backend API approval permission checks (to be implemented)
- [ ] Backend escrow payment release integration (to be implemented)
- [ ] Notification system for payment events (to be implemented)

---

**For Questions or Issues:**  
Contact the SIZLAND development team or refer to the main system documentation.

---

**End of Escrow and Payment Workflow Guide**
