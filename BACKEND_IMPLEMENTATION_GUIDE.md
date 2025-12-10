# Backend Implementation Guide: Task Approval & Escrow Release

**Author:** Llakterian  
**Created:** November 15, 2025  
**Purpose:** Complete backend implementation guide for task approval permissions and escrow payment release

---

## Overview

This guide provides the complete backend implementation for:
1. Permission validation for task approval
2. Adding `canApprove` field in API responses
3. Escrow payment release on task approval
4. Recording payment transactions on Algorand blockchain

---

## Prerequisites

Your backend should have:
- Node.js/TypeScript environment
- Database (PostgreSQL/MySQL) with Prisma ORM or similar
- Algorand SDK (`algosdk`) installed
- Authentication middleware (JWT/Session based)
- Project and task models in your database

### Required NPM Packages

```bash
npm install algosdk
npm install @prisma/client  # if using Prisma
```

---

## Database Schema Requirements

Ensure your database has these fields:

### Tasks Table
```sql
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'
  project_id VARCHAR(255) NOT NULL,
  department_id VARCHAR(255) NOT NULL,
  assigned_role_id VARCHAR(255),
  payment_amount DECIMAL(10, 2),
  payment_status VARCHAR(50), -- 'PENDING', 'ALLOCATED', 'PROCESSING', 'PAID'
  payment_tx_hash VARCHAR(255),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id VARCHAR(255) NOT NULL, -- User ID of project owner
  escrow_address VARCHAR(255), -- Algorand address
  escrow_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### User Roles Table
```sql
CREATE TABLE user_roles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'PROJECT_OWNER', 'PROJECT_MANAGER', 'EMPLOYEE'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

## Implementation

### 1. Permission Validation Middleware

Create a middleware to check if user is project owner:

```typescript
// middleware/checkProjectOwner.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma'; // or your DB client

interface AuthRequest extends Request {
  userId?: string; // Set by your auth middleware
}

export async function checkProjectOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user role in project
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        projectId,
      },
    });

    if (!userRole) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    if (userRole.role !== 'PROJECT_OWNER') {
      return res.status(403).json({ 
        error: 'Only project owner can perform this action' 
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Get User Role Helper Function

```typescript
// utils/userRole.ts
import { prisma } from '../lib/prisma';

export async function getUserRoleInProject(
  userId: string,
  projectId: string
): Promise<'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE' | null> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      projectId,
    },
  });

  return userRole?.role as any || null;
}
```

### 3. Add canApprove Field in Task Responses

Update your task response formatter:

```typescript
// utils/taskFormatter.ts
interface TaskWithPermissions {
  id: string;
  title: string;
  status: string;
  // ... other task fields
  canView?: boolean;
  canEdit?: boolean;
  canAssign?: boolean;
  canDelete?: boolean;
  canApprove?: boolean; // NEW
}

export async function formatTaskWithPermissions(
  task: any,
  userId: string
): Promise<TaskWithPermissions> {
  // Get user role in the task's project
  const userRole = await getUserRoleInProject(userId, task.projectId);
  
  const isOwner = userRole === 'PROJECT_OWNER';
  const isManager = userRole === 'PROJECT_MANAGER';
  const isAssignee = task.assignedUser?.id === userId;

  return {
    ...task,
    canView: true, // All members can view
    canEdit: isOwner || isManager || isAssignee,
    canAssign: isOwner || isManager,
    canDelete: isOwner,
    canApprove: isOwner, // ONLY project owner can approve
  };
}
```

### 4. Update Task Status Endpoint with Approval Check

```typescript
// routes/tasks.ts
import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { getUserRoleInProject } from '../utils/userRole';
import { releaseEscrowPayment } from '../services/escrowService';

const router = express.Router();

// PATCH /api/tasks/:taskId/position
router.patch(
  '/tasks/:taskId/position',
  authMiddleware, // Your existing auth middleware
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, order, departmentId } = req.body;
      const userId = req.userId; // From auth middleware

      // Get task with project info
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: true,
          assignedUser: true,
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check permission for APPROVED status
      if (status === 'APPROVED') {
        const userRole = await getUserRoleInProject(userId, task.projectId);
        
        if (userRole !== 'PROJECT_OWNER') {
          return res.status(403).json({
            error: 'Only project owner can approve tasks',
          });
        }

        // Additional validation: task must be COMPLETED before approval
        if (task.status !== 'COMPLETED') {
          return res.status(400).json({
            error: 'Task must be in COMPLETED status before approval',
          });
        }
      }

      // Update task status
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
          order,
          departmentId: departmentId || task.departmentId,
          updatedAt: new Date(),
        },
        include: {
          project: true,
          assignedUser: true,
          department: true,
        },
      });

      // If approved and has payment amount, release escrow
      if (status === 'APPROVED' && task.paymentAmount && task.paymentAmount > 0) {
        try {
          await releaseEscrowPayment({
            taskId: task.id,
            projectId: task.projectId,
            recipientAddress: task.assignedUser?.walletAddress,
            amount: task.paymentAmount,
          });
        } catch (paymentError) {
          console.error('Escrow payment release failed:', paymentError);
          // Don't fail the approval, but log the error
          // You might want to set a flag for manual retry
        }
      }

      // Update order of affected tasks (tasks in same column)
      // ... your existing order update logic

      res.json({
        task: updatedTask,
        affectedTasks: [], // Your affected tasks logic
      });
    } catch (error) {
      console.error('Task update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
```

### 5. Escrow Payment Release Service

```typescript
// services/escrowService.ts
import algosdk from 'algosdk';
import { prisma } from '../lib/prisma';

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';
const SIZCOIN_ASSET_ID = parseInt(process.env.SIZCOIN_ASSET_ID || '0');

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

interface EscrowPaymentParams {
  taskId: string;
  projectId: string;
  recipientAddress?: string;
  amount: number;
}

export async function releaseEscrowPayment(
  params: EscrowPaymentParams
): Promise<string> {
  const { taskId, projectId, recipientAddress, amount } = params;

  if (!recipientAddress) {
    throw new Error('Recipient wallet address not set');
  }

  // Get project escrow details
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || !project.escrowAddress) {
    throw new Error('Project escrow not configured');
  }

  if (!project.escrowMnemonic) {
    throw new Error('Escrow mnemonic not found (security issue)');
  }

  // Check escrow balance
  if (project.escrowBalance < amount) {
    throw new Error('Insufficient escrow balance');
  }

  try {
    // Recover escrow account from mnemonic
    const escrowAccount = algosdk.mnemonicToSecretKey(project.escrowMnemonic);

    // Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Create asset transfer transaction (SIZCOIN)
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: escrowAccount.addr,
      to: recipientAddress,
      amount: Math.floor(amount * 1_000_000), // Convert to microunits
      assetIndex: SIZCOIN_ASSET_ID,
      suggestedParams,
    });

    // Sign transaction
    const signedTxn = txn.signTxn(escrowAccount.sk);

    // Submit transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    );

    console.log('Payment transaction confirmed:', txId);

    // Update task payment status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        paymentStatus: 'PAID',
        paymentTxHash: txId,
        paidAt: new Date(),
      },
    });

    // Update project escrow balance
    await prisma.project.update({
      where: { id: projectId },
      data: {
        escrowBalance: {
          decrement: amount,
        },
      },
    });

    // Create payment record
    await prisma.paymentTransaction.create({
      data: {
        taskId,
        projectId,
        recipientAddress,
        amount,
        txHash: txId,
        status: 'PAID',
        createdAt: new Date(),
      },
    });

    return txId;
  } catch (error) {
    console.error('Algorand transaction error:', error);
    
    // Update task payment status to FAILED
    await prisma.task.update({
      where: { id: taskId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    throw new Error(`Payment failed: ${error.message}`);
  }
}
```

### 6. Get Kanban Board with Permissions

```typescript
// routes/kanban.ts
import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { formatTaskWithPermissions } from '../utils/taskFormatter';

const router = express.Router();

// GET /api/tasks/kanban/all-projects
router.get('/tasks/kanban/all-projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get all projects where user is a member
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { project: true },
    });

    const projectIds = userRoles.map((ur) => ur.projectId);

    // Get all tasks from these projects
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
      },
      include: {
        project: true,
        department: true,
        assignedUser: true,
      },
      orderBy: { order: 'asc' },
    });

    // Format tasks with permissions
    const tasksWithPermissions = await Promise.all(
      tasks.map((task) => formatTaskWithPermissions(task, userId))
    );

    // Organize by status
    const columns = {
      PENDING: tasksWithPermissions.filter((t) => t.status === 'PENDING'),
      IN_PROGRESS: tasksWithPermissions.filter((t) => t.status === 'IN_PROGRESS'),
      COMPLETED: tasksWithPermissions.filter((t) => t.status === 'COMPLETED'),
      APPROVED: tasksWithPermissions.filter((t) => t.status === 'APPROVED'),
    };

    // Calculate user permissions (can they create tasks, etc.)
    const canCreateTasks = userRoles.some(
      (ur) => ur.role === 'PROJECT_OWNER' || ur.role === 'PROJECT_MANAGER'
    );

    res.json({
      columns,
      totalTasks: tasks.length,
      userPermissions: {
        canCreateTasks,
        canEditAllTasks: userRoles.some((ur) => ur.role === 'PROJECT_OWNER'),
        canDeleteTasks: userRoles.some((ur) => ur.role === 'PROJECT_OWNER'),
        canAssignTasks: userRoles.some(
          (ur) => ur.role === 'PROJECT_OWNER' || ur.role === 'PROJECT_MANAGER'
        ),
      },
    });
  } catch (error) {
    console.error('Kanban board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## Security Considerations

### 1. Never Expose Mnemonics in API Responses

```typescript
// BAD - Don't do this
const project = await prisma.project.findUnique({
  where: { id },
  select: { escrowMnemonic: true }, // NEVER do this
});

// GOOD - Keep mnemonics server-side only
const project = await prisma.project.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    escrowAddress: true, // Public address is OK
    escrowBalance: true,
    // escrowMnemonic: false - Never include
  },
});
```

### 2. Encrypt Mnemonics in Database

```typescript
// utils/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const approvalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many approval requests, please try again later',
});

router.patch('/tasks/:taskId/position', approvalLimiter, authMiddleware, ...);
```

---

## Environment Variables

Add these to your `.env` file:

```bash
# Algorand Configuration
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_TOKEN=
SIZCOIN_ASSET_ID=your_asset_id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sizland

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key-here
JWT_SECRET=your-jwt-secret

# Application
NODE_ENV=production
PORT=4000
```

---

## Testing

### Test Permission Validation

```typescript
// tests/taskApproval.test.ts
import request from 'supertest';
import app from '../app';

describe('Task Approval', () => {
  it('should reject approval from non-owner', async () => {
    const employeeToken = 'employee-jwt-token';
    
    const response = await request(app)
      .patch('/api/tasks/task-123/position')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'APPROVED' });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Only project owner');
  });

  it('should allow approval from owner', async () => {
    const ownerToken = 'owner-jwt-token';
    
    const response = await request(app)
      .patch('/api/tasks/task-123/position')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'APPROVED' });

    expect(response.status).toBe(200);
  });
});
```

---

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Algorand node connection tested
- [ ] SIZCOIN asset ID verified
- [ ] Encryption keys generated and secured
- [ ] Rate limiting configured
- [ ] Error logging setup (Sentry, etc.)
- [ ] Webhook notifications configured
- [ ] Backup system for mnemonics
- [ ] SSL/TLS enabled
- [ ] CORS properly configured

---

## API Endpoints Summary

```
PATCH /api/tasks/:taskId/position
- Updates task status and position
- Validates approval permissions
- Releases escrow payment on approval

GET /api/tasks/kanban/all-projects
- Returns all tasks organized by status
- Includes canApprove permission for each task
- Only shows tasks from user's projects
```

---

## Next Steps

1. Locate your backend repository
2. Install required dependencies
3. Apply database migrations
4. Implement the code from this guide
5. Test approval workflow thoroughly
6. Deploy to staging environment
7. Test with real Algorand transactions (testnet first)
8. Deploy to production

---

**For Questions:**  
Refer to the `ESCROW_AND_PAYMENT_WORKFLOW.md` for the complete workflow overview.

---

**End of Backend Implementation Guide**
