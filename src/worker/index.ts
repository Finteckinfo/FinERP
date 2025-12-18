import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type {
  Project,
  Subtask,
  SubtaskReview,
  CreateProjectRequest,
  CreateSubtaskRequest,
  ReviewSubtaskRequest,
  TokenBalance,
  SwapTransaction,
  TokenTransaction,
  SwapRequest,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  total_funds: z.number().min(0),
});

const createSubtaskSchema = z.object({
  project_id: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  assigned_to: z.string().optional(),
  allocated_amount: z.number().min(0),
});

const reviewSubtaskSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  comments: z.string().optional(),
});

const swapSchema = z.object({
  from_token: z.enum(["FINe", "USDT"]),
  to_token: z.enum(["FINe", "USDT"]),
  amount: z.number().min(0),
});

// Projects endpoints
app.get("/api/projects", async (c) => {
  const db = c.env.DB;
  const result = await db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
  return c.json(result.results as unknown as Project[]);
});

app.get("/api/projects/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const result = await db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
  
  if (!result) {
    return c.json({ error: "Project not found" }, 404);
  }
  
  return c.json(result as unknown as Project);
});

app.post("/api/projects", zValidator("json", createProjectSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json") as CreateProjectRequest;
  
  const result = await db
    .prepare(
      "INSERT INTO projects (name, description, owner_id, total_funds, status) VALUES (?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(data.name, data.description || null, "demo-user", data.total_funds, "active")
    .first();
  
  return c.json(result as unknown as Project, 201);
});

// Subtasks endpoints
app.get("/api/projects/:projectId/subtasks", async (c) => {
  const db = c.env.DB;
  const projectId = c.req.param("projectId");
  const result = await db
    .prepare("SELECT * FROM subtasks WHERE project_id = ? ORDER BY created_at DESC")
    .bind(projectId)
    .all();
  
  return c.json(result.results as unknown as Subtask[]);
});

app.post("/api/subtasks", zValidator("json", createSubtaskSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json") as CreateSubtaskRequest;
  
  // Check if project has enough unallocated funds
  const project = await db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .bind(data.project_id)
    .first() as unknown as Project | null;
  
  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }
  
  const availableFunds = project.total_funds - project.allocated_funds;
  if (data.allocated_amount > availableFunds) {
    return c.json({ error: "Insufficient funds available in project" }, 400);
  }
  
  // Create subtask
  const subtask = await db
    .prepare(
      "INSERT INTO subtasks (project_id, title, description, assigned_to, allocated_amount, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(
      data.project_id,
      data.title,
      data.description || null,
      data.assigned_to || null,
      data.allocated_amount,
      "pending"
    )
    .first();
  
  // Update project allocated funds
  await db
    .prepare("UPDATE projects SET allocated_funds = allocated_funds + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(data.allocated_amount, data.project_id)
    .run();
  
  return c.json(subtask as unknown as Subtask, 201);
});

app.patch("/api/subtasks/:id/status", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { status } = await c.req.json();
  
  const result = await db
    .prepare("UPDATE subtasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
    .bind(status, id)
    .first();
  
  if (!result) {
    return c.json({ error: "Subtask not found" }, 404);
  }
  
  return c.json(result as unknown as Subtask);
});

app.post("/api/subtasks/:id/review", zValidator("json", reviewSubtaskSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json") as ReviewSubtaskRequest;
  
  // Get subtask
  const subtask = await db
    .prepare("SELECT * FROM subtasks WHERE id = ?")
    .bind(id)
    .first() as unknown as Subtask | null;
  
  if (!subtask) {
    return c.json({ error: "Subtask not found" }, 404);
  }
  
  // Create review
  const review = await db
    .prepare(
      "INSERT INTO subtask_reviews (subtask_id, reviewer_id, status, comments) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .bind(id, "demo-user", data.status, data.comments || null)
    .first();
  
  // Update subtask status
  await db
    .prepare("UPDATE subtasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(data.status, id)
    .run();
  
  return c.json(review as unknown as SubtaskReview, 201);
});

// Token endpoints
app.get("/api/tokens/balances/:userId", async (c) => {
  const db = c.env.DB;
  const userId = c.req.param("userId");
  
  const result = await db
    .prepare("SELECT * FROM token_balances WHERE user_id = ?")
    .bind(userId)
    .all();
  
  return c.json(result.results as unknown as TokenBalance[]);
});

app.post("/api/tokens/swap", zValidator("json", swapSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json") as SwapRequest;
  const userId = "demo-user"; // Replace with actual user authentication
  
  // Validate swap direction
  if (data.from_token === data.to_token) {
    return c.json({ error: "Cannot swap same token" }, 400);
  }
  
  // FINe <-> USDT only
  if (!((data.from_token === "FINe" && data.to_token === "USDT") || 
        (data.from_token === "USDT" && data.to_token === "FINe"))) {
    return c.json({ error: "Only FINe <-> USDT swaps are supported" }, 400);
  }
  
  // Get user balance for from_token
  const balance = await db
    .prepare("SELECT * FROM token_balances WHERE user_id = ? AND token_type = ?")
    .bind(userId, data.from_token)
    .first() as unknown as TokenBalance | null;
  
  if (!balance || balance.balance < data.amount) {
    return c.json({ error: "Insufficient balance" }, 400);
  }
  
  // 1:1 exchange rate
  const exchangeRate = 1.0;
  const toAmount = data.amount * exchangeRate;
  
  try {
    // Create swap transaction
    const swap = await db
      .prepare(
        "INSERT INTO swap_transactions (user_id, from_token, to_token, from_amount, to_amount, exchange_rate, status) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
      )
      .bind(userId, data.from_token, data.to_token, data.amount, toAmount, exchangeRate, "completed")
      .first();
    
    // Update from_token balance (decrease)
    await db
      .prepare("UPDATE token_balances SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND token_type = ?")
      .bind(data.amount, userId, data.from_token)
      .run();
    
    // Update or create to_token balance (increase)
    const toBalance = await db
      .prepare("SELECT * FROM token_balances WHERE user_id = ? AND token_type = ?")
      .bind(userId, data.to_token)
      .first();
    
    if (toBalance) {
      await db
        .prepare("UPDATE token_balances SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND token_type = ?")
        .bind(toAmount, userId, data.to_token)
        .run();
    } else {
      await db
        .prepare("INSERT INTO token_balances (user_id, token_type, balance) VALUES (?, ?, ?)")
        .bind(userId, data.to_token, toAmount)
        .run();
    }
    
    // Record token transactions
    await db
      .prepare("INSERT INTO token_transactions (user_id, token_type, amount, transaction_type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(userId, data.from_token, -data.amount, "swap", (swap as any).id, "swap_transaction")
      .run();
    
    await db
      .prepare("INSERT INTO token_transactions (user_id, token_type, amount, transaction_type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(userId, data.to_token, toAmount, "swap", (swap as any).id, "swap_transaction")
      .run();
    
    return c.json(swap as unknown as SwapTransaction, 201);
  } catch (error) {
    return c.json({ error: "Swap failed" }, 500);
  }
});

app.get("/api/tokens/transactions/:userId", async (c) => {
  const db = c.env.DB;
  const userId = c.req.param("userId");
  
  const result = await db
    .prepare("SELECT * FROM token_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .bind(userId)
    .all();
  
  return c.json(result.results as unknown as TokenTransaction[]);
});

app.get("/api/tokens/swaps/:userId", async (c) => {
  const db = c.env.DB;
  const userId = c.req.param("userId");
  
  const result = await db
    .prepare("SELECT * FROM swap_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .bind(userId)
    .all();
  
  return c.json(result.results as unknown as SwapTransaction[]);
});

// Mint tokens for demo purposes
app.post("/api/tokens/mint", async (c) => {
  const db = c.env.DB;
  const { user_id, token_type, amount } = await c.req.json();
  
  if (!user_id || !token_type || !amount || amount <= 0) {
    return c.json({ error: "Invalid request" }, 400);
  }
  
  // Check if balance exists
  const balance = await db
    .prepare("SELECT * FROM token_balances WHERE user_id = ? AND token_type = ?")
    .bind(user_id, token_type)
    .first();
  
  if (balance) {
    await db
      .prepare("UPDATE token_balances SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND token_type = ?")
      .bind(amount, user_id, token_type)
      .run();
  } else {
    await db
      .prepare("INSERT INTO token_balances (user_id, token_type, balance) VALUES (?, ?, ?)")
      .bind(user_id, token_type, amount)
      .run();
  }
  
  // Record transaction
  await db
    .prepare("INSERT INTO token_transactions (user_id, token_type, amount, transaction_type) VALUES (?, ?, ?, ?)")
    .bind(user_id, token_type, amount, "mint")
    .run();
  
  const updatedBalance = await db
    .prepare("SELECT * FROM token_balances WHERE user_id = ? AND token_type = ?")
    .bind(user_id, token_type)
    .first();
  
  return c.json(updatedBalance as unknown as TokenBalance, 201);
});

export default app;
