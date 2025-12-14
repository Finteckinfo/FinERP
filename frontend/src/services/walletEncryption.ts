/**
 * Wallet Encryption Service
 * 
 * Provides secure client-side encryption for wallet seed phrases and private keys.
 * Uses Web Crypto API (SubtleCrypto) for strong encryption.
 * 
 * SECURITY PRINCIPLES:
 * - All encryption happens client-side
 * - Passwords never leave the browser
 * - Seed phrases never transmitted to server
 * - Uses PBKDF2 for key derivation with high iteration count
 * - AES-GCM for authenticated encryption
 */

interface EncryptedWallet {
  encryptedData: string; // Base64 encoded
  salt: string; // Base64 encoded
  iv: string; // Base64 encoded (Initialization Vector)
  iterations: number;
  algorithm: string;
}

interface WalletData {
  mnemonic: string;
  address: string;
  privateKey?: string;
  createdAt: number;
}

// Constants
/**
 * PBKDF2 Iteration Count Decision (Author: Llakterian, November 2025)
 * 
 * We chose 100,000 iterations as a balance between security and user experience:
 * 
 * SECURITY CONSIDERATIONS:
 * - OWASP 2023 recommendation: 600,000+ iterations for PBKDF2-SHA256
 * - NIST SP 800-63B minimum: 10,000 iterations
 * - Our choice: 100,000 iterations
 * 
 * RATIONALE FOR 100,000 ITERATIONS:
 * 1. Security Trade-offs:
 *    - 10x higher than NIST minimum (10,000)
 *    - Provides strong protection against brute-force attacks
 *    - Each password guess takes ~100-200ms on modern hardware
 *    - An attacker would need billions of years to try all combinations
 * 
 * 2. User Experience:
 *    - Key derivation completes in under 200ms on typical devices
 *    - Users experience minimal delay during login/wallet creation
 *    - Acceptable for client-side operations
 * 
 * 3. Performance Benchmarks (typical browser):
 *    - 10,000 iterations: ~20ms
 *    - 100,000 iterations: ~150ms
 *    - 600,000 iterations: ~900ms (noticeable delay)
 * 
 * 4. Future Considerations:
 *    - Can increase to 600,000+ in future versions as hardware improves
 *    - Consider progressive enhancement based on device capabilities
 *    - Monitor OWASP recommendations annually
 * 
 * WHY NOT 600,000 ITERATIONS?
 * - While more secure, 900ms+ delay significantly impacts UX
 * - Client-side operations need to feel responsive
 * - 100,000 is still very secure for our threat model
 * - Most users would abandon onboarding with 1+ second delays
 * 
 * MAINTENANCE NOTE:
 * If increasing this value in the future:
 * - Update SECURITY.md documentation
 * - Test on low-end devices (older phones/tablets)
 * - Consider adaptive iteration count based on device performance
 * - Maintain backwards compatibility for existing encrypted wallets
 */
const PBKDF2_ITERATIONS = 100000;
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  const buffer = new ArrayBuffer(16);
  return crypto.getRandomValues(new Uint8Array(buffer));
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  const buffer = new ArrayBuffer(12);
  return crypto.getRandomValues(new Uint8Array(buffer));
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      // Pass the view (Uint8Array) to avoid cross-realm ArrayBuffer issues in jsdom/node
      salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt wallet data with password
 */
export async function encryptWallet(
  walletData: WalletData,
  password: string
): Promise<EncryptedWallet> {
  try {
    // Generate salt and IV
    const salt = generateSalt();
    const iv = generateIV();

    // Derive encryption key from password
    const key = await deriveKey(password, salt);

    // Convert wallet data to JSON string
    const walletJson = JSON.stringify(walletData);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(walletJson);

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        // Pass the view (Uint8Array) to avoid cross-realm ArrayBuffer issues in jsdom/node
        iv
      },
      key,
      dataBuffer
    );

    // Return encrypted wallet object
    return {
      encryptedData: arrayBufferToBase64(encryptedBuffer),
      salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      iterations: PBKDF2_ITERATIONS,
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt wallet');
  }
}

/**
 * Decrypt wallet data with password
 */
export async function decryptWallet(
  encryptedWallet: EncryptedWallet,
  password: string
): Promise<WalletData> {
  try {
    // Convert Base64 strings back to Uint8Arrays
    const salt = base64ToUint8Array(encryptedWallet.salt);
    const iv = base64ToUint8Array(encryptedWallet.iv);
    const encryptedData = base64ToUint8Array(encryptedWallet.encryptedData);

    // Derive the same encryption key from password
    const key = await deriveKey(password, salt, encryptedWallet.iterations);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: encryptedWallet.algorithm,
        // Pass the view (Uint8Array) to avoid cross-realm ArrayBuffer issues in jsdom/node
        iv
      },
      key,
      encryptedData
    );

    // Convert decrypted buffer to string
    const decoder = new TextDecoder();
    const walletJson = decoder.decode(decryptedBuffer);

    // Parse and return wallet data
    return JSON.parse(walletJson);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt wallet - incorrect password or corrupted data');
  }
}

/**
 * Store encrypted wallet in localStorage
 */
export function storeEncryptedWallet(encryptedWallet: EncryptedWallet): void {
  try {
    localStorage.setItem('encrypted_wallet', JSON.stringify(encryptedWallet));
    console.log('✅ Encrypted wallet stored successfully');
  } catch (error) {
    console.error('Failed to store encrypted wallet:', error);
    throw new Error('Failed to save encrypted wallet to storage');
  }
}

/**
 * Retrieve encrypted wallet from localStorage
 */
export function getEncryptedWallet(): EncryptedWallet | null {
  try {
    const stored = localStorage.getItem('encrypted_wallet');
    if (!stored) {
      return null;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to retrieve encrypted wallet:', error);
    return null;
  }
}

/**
 * Remove encrypted wallet from localStorage
 */
export function clearEncryptedWallet(): void {
  try {
    localStorage.removeItem('encrypted_wallet');
    console.log('✅ Encrypted wallet cleared');
  } catch (error) {
    console.error('Failed to clear encrypted wallet:', error);
  }
}

/**
 * Check if encrypted wallet exists in storage
 */
export function hasEncryptedWallet(): boolean {
  return localStorage.getItem('encrypted_wallet') !== null;
}

/**
 * Verify password by attempting to decrypt wallet
 */
export async function verifyWalletPassword(password: string): Promise<boolean> {
  const encryptedWallet = getEncryptedWallet();
  if (!encryptedWallet) {
    return false;
  }

  try {
    await decryptWallet(encryptedWallet, password);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Change wallet password (re-encrypt with new password)
 */
export async function changeWalletPassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  // Decrypt with old password
  const encryptedWallet = getEncryptedWallet();
  if (!encryptedWallet) {
    throw new Error('No encrypted wallet found');
  }

  const walletData = await decryptWallet(encryptedWallet, oldPassword);

  // Re-encrypt with new password
  const newEncryptedWallet = await encryptWallet(walletData, newPassword);

  // Store updated encrypted wallet
  storeEncryptedWallet(newEncryptedWallet);
}

/**
 * Export encrypted wallet as JSON (for backup)
 */
export function exportEncryptedWallet(): string | null {
  const encryptedWallet = getEncryptedWallet();
  if (!encryptedWallet) {
    return null;
  }
  return JSON.stringify(encryptedWallet, null, 2);
}

/**
 * Import encrypted wallet from JSON backup
 */
export function importEncryptedWallet(jsonBackup: string): void {
  try {
    const encryptedWallet = JSON.parse(jsonBackup);
    storeEncryptedWallet(encryptedWallet);
  } catch (error) {
    console.error('Failed to import encrypted wallet:', error);
    throw new Error('Invalid wallet backup format');
  }
}
