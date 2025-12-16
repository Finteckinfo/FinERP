import { ethers } from 'ethers';
import { getEscrowAddress } from '@/lib/finTokenConfig';
import { getRPCUrl } from './finTokenService';

// ProjectEscrow Contract ABI (simplified)
const PROJECT_ESCROW_ABI = [
  "function fundProject(uint256 amount) returns (uint256 projectId)",
  "function allocateTask(uint256 projectId, address worker, uint256 amount) returns (uint256 taskId)",
  "function completeTask(uint256 taskId)",
  "function approvePayment(uint256 taskId)",
  "function requestRefund(uint256 projectId)",
  "function processRefund(uint256 projectId)",
  "function cancelProject(uint256 projectId)",
  "function getProject(uint256 projectId) returns (address employer, uint256 totalFunded, uint256 totalAllocated, uint256 totalReleased, uint8 status, uint256 createdAt, uint256 refundRequestedAt)",
  "function getTask(uint256 taskId) returns (uint256 projectId, address worker, uint256 amount, uint8 status, uint256 createdAt, uint256 completedAt, uint256 approvalCount)"
];

export interface ProjectData {
  id: string;
  employer: string;
  totalFunded: string;
  totalAllocated: string;
  totalReleased: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  refundRequestedAt: number;
}

export interface TaskData {
  id: string;
  projectId: string;
  worker: string;
  amount: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  createdAt: number;
  completedAt: number;
  approvalCount: number;
}

// Get contract instance
function getEscrowContract(chainId: number, signerOrProvider: any): ethers.Contract {
  const contractAddress = getEscrowAddress(chainId);
  if (!contractAddress) {
    throw new Error('ProjectEscrow contract address not configured for this network');
  }
  return new ethers.Contract(contractAddress, PROJECT_ESCROW_ABI, signerOrProvider);
}

// Fund a new project
export async function fundProject(
  chainId: number,
  signer: any,
  amount: string
): Promise<string> {
  try {
    const contract = getEscrowContract(chainId, signer);
    const amountWei = ethers.parseEther(amount);

    const tx = await contract.fundProject(amountWei);
    const receipt = await tx.wait();

    // Extract project ID from event logs (simplified)
    // In a real implementation, you'd parse the event logs
    const projectId = '1'; // Placeholder - should parse from events

    return projectId;
  } catch (error) {
    console.error('Error funding project:', error);
    throw error;
  }
}

// Allocate a task to a worker
export async function allocateTask(
  chainId: number,
  signer: any,
  projectId: string,
  workerAddress: string,
  amount: string
): Promise<string> {
  try {
    const contract = getEscrowContract(chainId, signer);
    const amountWei = ethers.parseEther(amount);

    const tx = await contract.allocateTask(projectId, workerAddress, amountWei);
    const receipt = await tx.wait();

    // Extract task ID from event logs
    const taskId = '1'; // Placeholder

    return taskId;
  } catch (error) {
    console.error('Error allocating task:', error);
    throw error;
  }
}

// Complete a task
export async function completeTask(
  chainId: number,
  signer: any,
  taskId: string
): Promise<void> {
  try {
    const contract = getEscrowContract(chainId, signer);
    const tx = await contract.completeTask(taskId);
    await tx.wait();
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
}

// Approve payment for large amounts
export async function approvePayment(
  chainId: number,
  signer: any,
  taskId: string
): Promise<void> {
  try {
    const contract = getEscrowContract(chainId, signer);
    const tx = await contract.approvePayment(taskId);
    await tx.wait();
  } catch (error) {
    console.error('Error approving payment:', error);
    throw error;
  }
}

// Request refund for unused funds
export async function requestRefund(
  signer: any,
  projectId: string
): Promise<void> {
  try {
    const contract = getEscrowContract(signer);
    const tx = await contract.requestRefund(projectId);
    await tx.wait();
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
}

// Process refund after timelock
export async function processRefund(
  signer: any,
  projectId: string
): Promise<void> {
  try {
    const contract = getEscrowContract(signer);
    const tx = await contract.processRefund(projectId);
    await tx.wait();
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

// Get project details
export async function getProject(
  provider: any,
  projectId: string
): Promise<ProjectData> {
  try {
    const contract = getEscrowContract(provider);
    const project = await contract.getProject(projectId);

    return {
      id: projectId,
      employer: project[0],
      totalFunded: ethers.formatEther(project[1]),
      totalAllocated: ethers.formatEther(project[2]),
      totalReleased: ethers.formatEther(project[3]),
      status: ['ACTIVE', 'COMPLETED', 'CANCELLED'][project[4]] as any,
      createdAt: Number(project[5]),
      refundRequestedAt: Number(project[6])
    };
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
}

// Get task details
export async function getTask(
  chainId: number,
  provider: any,
  taskId: string
): Promise<TaskData> {
  try {
    const contract = getEscrowContract(chainId, provider);
    const task = await contract.getTask(taskId);

    return {
      id: taskId,
      projectId: task[0].toString(),
      worker: task[1],
      amount: ethers.formatEther(task[2]),
      status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED'][task[3]] as any,
      createdAt: Number(task[4]),
      completedAt: Number(task[5]),
      approvalCount: Number(task[6])
    };
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
}

// Get all tasks for a project
export async function getTasksForProject(
  chainId: number,
  provider: any,
  projectId: string
): Promise<TaskData[]> {
  try {
    // Since blockchain doesn't have a direct way to get all tasks for a project,
    // we would need to query events or maintain an off-chain index
    // For demo, return mock data
    return [
      {
        id: '1',
        projectId,
        worker: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000',
        status: 'PENDING',
        createdAt: Date.now() - 86400000,
        completedAt: 0,
        approvalCount: 0
      },
      {
        id: '2',
        projectId,
        worker: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '500',
        status: 'COMPLETED',
        createdAt: Date.now() - 172800000,
        completedAt: Date.now() - 3600000,
        approvalCount: 0
      }
    ];
  } catch (error) {
    console.error('Error getting tasks for project:', error);
    return [];
  }
}
