/**
 * Secure Storage Utility
 * 
 * Provides encrypted localStorage operations using Web Crypto API.
 * Encrypts sensitive data before storing and decrypts on retrieval.
 */

interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

class SecureStorage {
  private static instance: SecureStorage;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly ITERATIONS = 100000;
  private keyCache: Map<string, CryptoKey> = new Map();

  private constructor() {}

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Generate encryption key from password using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or generate application-specific encryption key
   * Uses user's session or device identifier as password
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    // Use a combination of user agent and a stored device ID
    let deviceId = localStorage.getItem('__device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('__device_id', deviceId);
    }

    const password = `${navigator.userAgent}-${deviceId}`;
    const cacheKey = 'app_encryption_key';

    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const key = await this.deriveKey(password, salt);
    this.keyCache.set(cacheKey, key);
    return key;
  }

  /**
   * Encrypt data
   */
  private async encrypt(data: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const key = await this.deriveKey(
      `${navigator.userAgent}-${localStorage.getItem('__device_id')}`,
      salt
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      dataBuffer
    );

    return {
      ciphertext: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt)
    };
  }

  /**
   * Decrypt data
   */
  private async decrypt(encryptedData: EncryptedData): Promise<string> {
    const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);
    const saltBuffer = this.base64ToArrayBuffer(encryptedData.salt);
    const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);

    const key = await this.deriveKey(
      `${navigator.userAgent}-${localStorage.getItem('__device_id')}`,
      new Uint8Array(saltBuffer)
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: ivBuffer
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Set item in encrypted localStorage
   */
  public async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      const encrypted = await this.encrypt(jsonValue);
      localStorage.setItem(key, JSON.stringify(encrypted));
    } catch (error) {
      console.error('SecureStorage: Failed to encrypt and store item', error);
      throw new Error('Failed to securely store data');
    }
  }

  /**
   * Get item from encrypted localStorage
   */
  public async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      const encrypted: EncryptedData = JSON.parse(stored);
      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('SecureStorage: Failed to decrypt item', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Check if item exists
   */
  public hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Clear all secure storage
   */
  public clear(): void {
    this.keyCache.clear();
  }

  /**
   * Convert ArrayBuffer or Uint8Array to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();
