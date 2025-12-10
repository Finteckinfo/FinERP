import { ethers } from 'ethers';

// FINSwap DEX Contract ABI (simplified)
const FINSWAP_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) returns (uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) returns (uint256 amountA, uint256 amountB)",
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) returns (uint256 amountOut)",
  "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
  "function getPoolId(address tokenA, address tokenB) pure returns (bytes32)"
];

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
}

export interface LiquidityParams {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
}

// Get contract instance
function getDexContract(signer: any): ethers.Contract {
  const contractAddress = import.meta.env.VITE_DEX_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('FINSwap DEX contract address not configured');
  }
  return new ethers.Contract(contractAddress, FINSWAP_ABI, signer);
}

// Add liquidity to pool
export async function addLiquidity(
  signer: any,
  params: LiquidityParams
): Promise<string> {
  try {
    const contract = getDexContract(signer);
    const amountAWei = ethers.parseEther(params.amountA);
    const amountBWei = ethers.parseEther(params.amountB);

    // Approve tokens first (this would need to be done before calling this function)
    // const tokenAContract = new ethers.Contract(params.tokenA, ERC20_ABI, signer);
    // const tokenBContract = new ethers.Contract(params.tokenB, ERC20_ABI, signer);
    // await tokenAContract.approve(contractAddress, amountAWei);
    // await tokenBContract.approve(contractAddress, amountBWei);

    const tx = await contract.addLiquidity(params.tokenA, params.tokenB, amountAWei, amountBWei);
    const receipt = await tx.wait();

    // Extract liquidity amount from events
    const liquidity = '1000'; // Placeholder

    return liquidity;
  } catch (error) {
    console.error('Error adding liquidity:', error);
    throw error;
  }
}

// Remove liquidity from pool
export async function removeLiquidity(
  signer: any,
  tokenA: string,
  tokenB: string,
  liquidity: string
): Promise<{ amountA: string; amountB: string }> {
  try {
    const contract = getDexContract(signer);
    const liquidityWei = ethers.parseEther(liquidity);

    const tx = await contract.removeLiquidity(tokenA, tokenB, liquidityWei);
    const receipt = await tx.wait();

    // Extract amounts from events
    const amountA = '500'; // Placeholder
    const amountB = '500'; // Placeholder

    return {
      amountA,
      amountB
    };
  } catch (error) {
    console.error('Error removing liquidity:', error);
    throw error;
  }
}

// Swap tokens
export async function swapTokens(
  signer: any,
  params: SwapParams
): Promise<string> {
  try {
    const contract = getDexContract(signer);
    const amountInWei = ethers.parseEther(params.amountIn);
    const amountOutMinWei = ethers.parseEther(params.amountOutMin);

    // Approve token first
    // const tokenContract = new ethers.Contract(params.tokenIn, ERC20_ABI, signer);
    // await tokenContract.approve(contractAddress, amountInWei);

    const tx = await contract.swap(params.tokenIn, params.tokenOut, amountInWei, amountOutMinWei);
    const receipt = await tx.wait();

    // Extract amount out from events
    const amountOut = params.amountOutMin; // Placeholder

    return amountOut;
  } catch (error) {
    console.error('Error swapping tokens:', error);
    throw error;
  }
}

// Get expected output amount for a swap
export async function getAmountsOut(
  provider: any,
  amountIn: string,
  path: string[]
): Promise<string[]> {
  try {
    const contract = getDexContract(provider);
    const amountInWei = ethers.parseEther(amountIn);

    const amounts = await contract.getAmountsOut(amountInWei, path);

    return amounts.map((amount: any) => ethers.formatEther(amount));
  } catch (error) {
    console.error('Error getting amounts out:', error);
    throw error;
  }
}

// Get pool ID for token pair
export function getPoolId(tokenA: string, tokenB: string): string {
  // Simple implementation - in real DEX this would be more complex
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
  return ethers.keccak256(ethers.solidityPacked(['address', 'address'], [token0, token1]));
}
