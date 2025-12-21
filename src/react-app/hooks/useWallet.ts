import { useState, useEffect } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

import { useWallet as useWalletFromContext } from '@/react-app/context/WalletContext';

export const useWallet = useWalletFromContext;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useContract(contractAddress: string, abi: any[]) {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (provider && account && contractAddress) {
      const signer = provider.getSigner();
      signer.then(s => {
        const contractInstance = new Contract(contractAddress, abi, s);
        setContract(contractInstance);
      });
    } else {
      setContract(null);
    }
  }, [provider, account, contractAddress, abi]);

  return contract;
}

export { formatEther, parseEther };
