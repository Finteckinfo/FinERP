export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: string;
  total_funds: number;
  allocated_funds: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  assigned_to: string | null;
  allocated_amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SubtaskReview {
  id: number;
  subtask_id: number;
  reviewer_id: string;
  status: 'approved' | 'rejected';
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  total_funds: number;
}

export interface CreateSubtaskRequest {
  project_id: number;
  title: string;
  description?: string;
  assigned_to?: string;
  allocated_amount: number;
}

export interface ReviewSubtaskRequest {
  status: 'approved' | 'rejected';
  comments?: string;
}

export type TokenType = 'FINe' | 'USDT';

export interface TokenBalance {
  id: number;
  user_id: string;
  token_type: TokenType;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface SwapTransaction {
  id: number;
  user_id: string;
  from_token: TokenType;
  to_token: TokenType;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: number;
  user_id: string;
  token_type: TokenType;
  amount: number;
  transaction_type: 'mint' | 'burn' | 'transfer' | 'swap' | 'escrow_lock' | 'escrow_release';
  reference_id: number | null;
  reference_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  from_token: TokenType;
  to_token: TokenType;
  amount: number;
}
