export const APP_CONFIG = {
    // The base URL for the application, used for redirects and social links
    // In Vercel, this can be set to the production domain
    appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),

    // Supabase Configuration
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },

    // App Metadata
    name: 'FinPro',
    description: 'Decentralized Project Management with Blockchain Escrow',

    // Contract Addresses (Local Anvil)
    contracts: {
        finToken: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
        projectEscrow: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
        finSwap: '0x59b670e9fA9D0A427751Af201D676719a970857b',
        multiSigWallet: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
    },

    // Account Abstraction Configuration
    accountAbstraction: {
        entryPointAddress: import.meta.env.VITE_ENTRY_POINT_ADDRESS || '0x0000000000000000000000000000000000000001',
        paymasterAddress: import.meta.env.VITE_PAYMASTER_ADDRESS || '0x0000000000000000000000000000000000000002',
        paymasterSigningKey: import.meta.env.VITE_PAYMASTER_SIGNING_KEY || '',
        bundlerUrl: import.meta.env.VITE_BUNDLER_URL || '',
        rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
    },
};
