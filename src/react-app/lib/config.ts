export const APP_CONFIG = {
    // The base URL for the application, used for redirects and social links
    // In Vercel, this can be set to the production domain
    appUrl: (import.meta as any).env?.VITE_APP_URL || (typeof globalThis !== 'undefined' && (globalThis as any).window ? (globalThis as any).window.location.origin : 'http://localhost:5173'),

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
        finToken: import.meta.env.VITE_FIN_TOKEN_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        projectEscrow: import.meta.env.VITE_PROJECT_ESCROW_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        finSwap: import.meta.env.VITE_FIN_SWAP_ADDRESS || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
        multiSigWallet: import.meta.env.VITE_MULTISIG_WALLET_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
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
