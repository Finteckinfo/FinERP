# Frontend Security Guidelines for FinERP

## Overview

This document outlines security best practices for the FinERP frontend application. These guidelines ensure secure interaction with blockchain contracts and protection of user assets.

## Architecture Security

### 1. Secure Wallet Integration

#### MetaMask Connection
```javascript
// Secure wallet connection with validation
async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    // Validate network
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });
    
    if (!SUPPORTED_NETWORKS.includes(chainId)) {
      throw new Error('Unsupported network');
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}
```

#### Network Validation
```javascript
const SUPPORTED_NETWORKS = {
  '0x1': 'Ethereum Mainnet',
  '0x89': 'Polygon Mainnet', 
  '0xaa36a7': 'Sepolia Testnet'
};

// Network switching with validation
async function switchToSupportedNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }] // Mainnet
    });
  } catch (switchError) {
    // Network not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK_CONFIGS.mainnet]
      });
    }
  }
}
```

### 2. Secure API Communication

#### Environment Variables
```javascript
// .env.local (never commit to version control)
VITE_API_BASE_URL=https://api.finerp.com
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESSES={"FIN_TOKEN":"0x...","ESCROW":"0x..."}
VITE_GELATO_API_KEY=your_gelato_key

// Secure config loading
const config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL,
  contracts: JSON.parse(import.meta.env.VITE_CONTRACT_ADDRESSES || '{}')
};
```

#### Secure HTTP Client
```javascript
// Axios with security configurations
import axios from 'axios';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      logoutUser();
    }
    return Promise.reject(error);
  }
);
```

## Smart Contract Interaction Security

### 1. Transaction Security

#### Input Validation
```javascript
// Validate transaction parameters
function validateTransactionParams(to, value, data) {
  // Address validation
  if (!ethers.isAddress(to)) {
    throw new Error('Invalid recipient address');
  }
  
  // Value validation
  if (value < 0 || !Number.isInteger(value)) {
    throw new Error('Invalid transaction value');
  }
  
  // Data size validation
  if (data && data.length > MAX_DATA_SIZE) {
    throw new Error('Transaction data too large');
  }
  
  return true;
}
```

#### Gas Estimation and Limits
```javascript
// Secure gas estimation
async function estimateGasWithLimit(contract, method, params) {
  try {
    const estimatedGas = await contract[method].estimateGas(...params);
    
    // Add 20% buffer for gas price fluctuations
    const gasLimit = Math.floor(estimatedGas * 1.2);
    
    // Set maximum gas limit to prevent unlimited spending
    const maxGasLimit = 500000;
    return Math.min(gasLimit, maxGasLimit);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw new Error('Transaction may fail');
  }
}
```

#### Transaction Confirmation
```javascript
// Wait for transaction confirmation with timeout
async function waitForConfirmation(txHash, timeout = 300000) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  try {
    const receipt = await provider.waitForTransaction(txHash, 1, timeout);
    
    if (receipt.status === 1) {
      return receipt;
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      throw new Error('Transaction confirmation timeout');
    }
    throw error;
  }
}
```

### 2. Contract Instance Security

#### Contract Address Validation
```javascript
// Validate contract addresses before interaction
const CONTRACT_ADDRESSES = {
  FIN_TOKEN: '0x1234567890123456789012345678901234567890',
  ESCROW: '0x0987654321098765432109876543210987654321',
  SWAP: '0x1111111111111111111111111111111111111111'
};

function getContract(address, abi) {
  if (!CONTRACT_ADDRESSES[address]) {
    throw new Error('Unknown contract address');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(CONTRACT_ADDRESSES[address], abi, signer);
}
```

#### ABI Validation
```javascript
// Validate contract ABI
function validateABI(abi) {
  if (!Array.isArray(abi)) {
    throw new Error('Invalid ABI format');
  }
  
  // Check for required functions
  const requiredFunctions = ['balanceOf', 'transfer', 'approve'];
  const abiFunctions = abi.filter(item => item.type === 'function')
                           .map(item => item.name);
  
  for (const func of requiredFunctions) {
    if (!abiFunctions.includes(func)) {
      throw new Error(`Missing required function: ${func}`);
    }
  }
  
  return true;
}
```

## Data Security

### 1. Local Storage Security

#### Encrypted Storage
```javascript
// Use crypto-js for sensitive data encryption
import CryptoJS from 'crypto-js';

const secureStorage = {
  set(key, value) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      getEncryptionKey()
    ).toString();
    localStorage.setItem(key, encrypted);
  },
  
  get(key) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, getEncryptionKey());
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  }
};
```

#### Session Management
```javascript
// Secure session management
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.activityTimer = null;
  }
  
  startSession() {
    this.resetTimer();
    this.setupActivityListeners();
  }
  
  resetTimer() {
    clearTimeout(this.activityTimer);
    this.activityTimer = setTimeout(() => {
      this.endSession();
    }, this.sessionTimeout);
  }
  
  setupActivityListeners() {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });
  }
  
  endSession() {
    // Clear sensitive data
    secureStorage.remove('authToken');
    secureStorage.remove('walletData');
    
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### 2. Input Sanitization

#### XSS Prevention
```javascript
// Sanitize user inputs
import DOMPurify from 'dompurify';

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove HTML tags and scripts
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return clean.trim();
}

// Validate Ethereum addresses
function validateAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

// Validate amounts
function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= MAX_AMOUNT;
}
```

## Authentication & Authorization

### 1. JWT Token Security

```javascript
// Secure JWT handling
class TokenManager {
  static getToken() {
    return secureStorage.get('authToken');
  }
  
  static setToken(token) {
    // Validate token format
    if (!this.isValidToken(token)) {
      throw new Error('Invalid token format');
    }
    
    secureStorage.set('authToken', token);
  }
  
  static isValidToken(token) {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      return false;
    }
  }
  
  static isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }
  
  static refreshToken() {
    if (this.isTokenExpired()) {
      // Request new token from server
      return apiClient.post('/auth/refresh');
    }
    return Promise.resolve();
  }
}
```

### 2. Role-Based Access Control

```javascript
// Frontend role validation
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  WORKER: 'worker',
  VIEWER: 'viewer'
};

function hasRole(requiredRole) {
  const userRole = getCurrentUserRole();
  const roleHierarchy = {
    [ROLES.ADMIN]: 3,
    [ROLES.MANAGER]: 2,
    [ROLES.WORKER]: 1,
    [ROLES.VIEWER]: 0
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Route guards
const routeGuards = {
  '/admin': () => hasRole(ROLES.ADMIN),
  '/projects/create': () => hasRole(ROLES.MANAGER),
  '/dashboard': () => hasRole(ROLES.WORKER)
};
```

## Security Headers & CSP

### 1. Content Security Policy

```javascript
// CSP configuration for production
const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'"], // Remove unsafe-eval in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.finerp.com', 'https://eth-mainnet.alchemyapi.io'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};
```

### 2. Security Headers

```javascript
// Security middleware (for Node.js backend)
app.use(helmet({
  contentSecurityPolicy: {
    directives: cspConfig
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));
```

## Monitoring & Logging

### 1. Security Event Logging

```javascript
// Security event monitoring
class SecurityLogger {
  static log(event, data) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      data: this.sanitizeData(data),
      userAgent: navigator.userAgent,
      ip: data.ip // From server
    };
    
    // Send to security monitoring service
    this.sendToSecurityService(securityEvent);
  }
  
  static sanitizeData(data) {
    // Remove sensitive information
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.privateKey;
    delete sanitized.mnemonic;
    return sanitized;
  }
  
  static async sendToSecurityService(event) {
    try {
      await apiClient.post('/security/log', event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Usage examples
SecurityLogger.log('WALLET_CONNECTED', { address: userAddress });
SecurityLogger.log('TRANSACTION_FAILED', { txHash, error: error.message });
SecurityLogger.log('UNAUTHORIZED_ACCESS', { route, userRole });
```

### 2. Error Handling

```javascript
// Secure error handling without information disclosure
class SecureErrorHandler {
  static handle(error) {
    // Log full error for debugging
    console.error('Error occurred:', error);
    
    // Return generic error to user
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return 'Transaction may fail. Please check your balance and try again.';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient funds for this transaction.';
    } else {
      return 'An error occurred. Please try again later.';
    }
  }
}
```

## Development Security

### 1. Environment Security

```javascript
// Environment validation
function validateEnvironment() {
  const requiredEnvVars = [
    'VITE_API_BASE_URL',
    'VITE_ETHEREUM_RPC_URL',
    'VITE_CONTRACT_ADDRESSES'
  ];
  
  const missing = requiredEnvVars.filter(env => !import.meta.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URLs
  const api_url = import.meta.env.VITE_API_BASE_URL;
  if (!api_url.startsWith('https://')) {
    throw new Error('API URL must use HTTPS in production');
  }
}
```

### 2. Bundle Security

```javascript
// Vite configuration for security
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['ethers', 'axios'],
          security: ['crypto-js', 'dompurify']
        }
      }
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
};
```

## Testing Security

### 1. Security Test Cases

```javascript
// Security-focused test examples
describe('Security Tests', () => {
  test('should validate wallet addresses', () => {
    expect(validateAddress('0x123')).toBe(false);
    expect(validateAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
  });
  
  test('should sanitize inputs', () => {
    const malicious = '<script>alert("xss")</script>';
    expect(sanitizeInput(malicious)).toBe('');
  });
  
  test('should handle invalid tokens', () => {
    expect(() => TokenManager.setToken('invalid')).toThrow();
  });
  
  test('should enforce role-based access', () => {
    expect(hasRole(ROLES.ADMIN, ROLES.MANAGER)).toBe(false);
    expect(hasRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
  });
});
```

## Security Checklist

### Pre-Deployment Checklist
- [ ] All environment variables are properly set
- [ ] HTTPS enforced in production
- [ ] CSP headers configured
- [ ] Input validation implemented
- [ ] Error handling doesn't leak information
- [ ] Wallet connection properly validated
- [ ] Transaction parameters validated
- [ ] Sensitive data encrypted in storage
- [ ] Session timeout implemented
- [ ] Security logging enabled

### Runtime Monitoring
- [ ] Failed transaction attempts logged
- [ ] Unauthorized access attempts monitored
- [ ] Unusual wallet activity detected
- [ ] Gas usage anomalies tracked
- [ ] Network switch attempts logged

These guidelines ensure the FinERP frontend maintains high security standards while providing a smooth user experience.
