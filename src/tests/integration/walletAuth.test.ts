/**
 * Wallet Authentication Integration Tests
 * 
 * Author: Llakterian
 * Date: November 2025
 * 
 * This test suite validates the wallet authentication flow including:
 * - Wallet encryption/decryption
 * - Password validation
 * - Security question recovery
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encryptWallet,
  decryptWallet,
  storeEncryptedWallet,
  getEncryptedWallet,
  clearEncryptedWallet,
  hasEncryptedWallet,
  verifyWalletPassword,
  changeWalletPassword,
  exportEncryptedWallet,
  importEncryptedWallet
} from '@/services/walletEncryption';
import {
  storeSecurityAnswers,
  verifySecurityAnswers,
  clearSecurityQuestions
} from '@/services/securityQuestions';

describe('Wallet Encryption Service', () => {
  const mockWalletData = {
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
    address: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    createdAt: Date.now()
  };

  const testPassword = 'Test@Password123';
  const weakPassword = 'weak';

  beforeEach(() => {
    // Clear localStorage before each test
    clearEncryptedWallet();
    clearSecurityQuestions();
  });

  afterEach(() => {
    // Clean up after each test
    clearEncryptedWallet();
    clearSecurityQuestions();
  });

  describe('Encryption/Decryption', () => {
    it('should successfully encrypt wallet data', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);

      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedData).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.iterations).toBe(100000);
      expect(encrypted.algorithm).toBe('AES-GCM');
    });

    it('should successfully decrypt wallet data with correct password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      const decrypted = await decryptWallet(encrypted, testPassword);

      expect(decrypted).toEqual(mockWalletData);
      expect(decrypted.mnemonic).toBe(mockWalletData.mnemonic);
      expect(decrypted.address).toBe(mockWalletData.address);
    });

    it('should fail to decrypt with incorrect password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);

      await expect(
        decryptWallet(encrypted, 'WrongPassword123!')
      ).rejects.toThrow('Failed to decrypt wallet');
    });

    it('should generate unique salts for different encryptions', async () => {
      const encrypted1 = await encryptWallet(mockWalletData, testPassword);
      const encrypted2 = await encryptWallet(mockWalletData, testPassword);

      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
    });

    it('should encrypt and decrypt data with special characters', async () => {
      const specialWalletData = {
        ...mockWalletData,
        mnemonic: 'test 测试 тест テスト  special-chars_123'
      };

      const encrypted = await encryptWallet(specialWalletData, testPassword);
      const decrypted = await decryptWallet(encrypted, testPassword);

      expect(decrypted.mnemonic).toBe(specialWalletData.mnemonic);
    });
  });

  describe('LocalStorage Operations', () => {
    it('should store encrypted wallet in localStorage', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      const stored = getEncryptedWallet();
      expect(stored).toEqual(encrypted);
    });

    it('should check if encrypted wallet exists', async () => {
      expect(hasEncryptedWallet()).toBe(false);

      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      expect(hasEncryptedWallet()).toBe(true);
    });

    it('should clear encrypted wallet from localStorage', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      expect(hasEncryptedWallet()).toBe(true);

      clearEncryptedWallet();

      expect(hasEncryptedWallet()).toBe(false);
      expect(getEncryptedWallet()).toBeNull();
    });

    it('should return null when no wallet is stored', () => {
      const wallet = getEncryptedWallet();
      expect(wallet).toBeNull();
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      const isValid = await verifyWalletPassword(testPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      const isValid = await verifyWalletPassword('WrongPassword123!');
      expect(isValid).toBe(false);
    });

    it('should return false when no wallet exists', async () => {
      const isValid = await verifyWalletPassword(testPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Password Change', () => {
    it('should successfully change wallet password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      const newPassword = 'NewTest@Password456';
      await changeWalletPassword(testPassword, newPassword);

      // Old password should no longer work
      const oldPasswordValid = await verifyWalletPassword(testPassword);
      expect(oldPasswordValid).toBe(false);

      // New password should work
      const newPasswordValid = await verifyWalletPassword(newPassword);
      expect(newPasswordValid).toBe(true);

      // Should be able to decrypt with new password
      const stored = getEncryptedWallet();
      const decrypted = await decryptWallet(stored!, newPassword);
      expect(decrypted).toEqual(mockWalletData);
    });

    it('should fail to change password with incorrect old password', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      await expect(
        changeWalletPassword('WrongOldPassword123!', 'NewPassword123!')
      ).rejects.toThrow();
    });

    it('should fail to change password when no wallet exists', async () => {
      await expect(
        changeWalletPassword(testPassword, 'NewPassword123!')
      ).rejects.toThrow('No encrypted wallet found');
    });
  });

  describe('Import/Export', () => {
    it('should export encrypted wallet as JSON', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      storeEncryptedWallet(encrypted);

      const exported = exportEncryptedWallet();
      expect(exported).toBeTruthy();

      const parsed = JSON.parse(exported!);
      expect(parsed).toEqual(encrypted);
    });

    it('should import encrypted wallet from JSON', async () => {
      const encrypted = await encryptWallet(mockWalletData, testPassword);
      const jsonBackup = JSON.stringify(encrypted);

      importEncryptedWallet(jsonBackup);

      const stored = getEncryptedWallet();
      expect(stored).toEqual(encrypted);

      // Should be able to decrypt imported wallet
      const decrypted = await decryptWallet(stored!, testPassword);
      expect(decrypted).toEqual(mockWalletData);
    });

    it('should return null when exporting non-existent wallet', () => {
      const exported = exportEncryptedWallet();
      expect(exported).toBeNull();
    });

    it('should throw error when importing invalid JSON', () => {
      expect(() => {
        importEncryptedWallet('invalid json');
      }).toThrow();
    });
  });
});

describe('Security Questions Service', () => {
  const mockSecurityQA = [
    { questionId: 'childhood_pet', answer: 'Fluffy' },
    { questionId: 'birth_city', answer: 'New York' },
    { questionId: 'mother_maiden', answer: 'Smith' }
  ];

  beforeEach(() => {
    clearSecurityQuestions();
  });

  afterEach(() => {
    clearSecurityQuestions();
  });

  describe('Storing Security Answers', () => {
    it('should store security answers as hashes', async () => {
      await storeSecurityAnswers(mockSecurityQA);

      // Check that answers are stored in localStorage
      const stored = localStorage.getItem('security_answers');
      expect(stored).toBeTruthy();

      // Parse and verify structure
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toHaveProperty('questionId');
      expect(parsed[0]).toHaveProperty('answerHash');
      expect(parsed[0].answerHash).not.toBe(mockSecurityQA[0].answer); // Should be hashed
    });

    it('should verify correct security answers', async () => {
      await storeSecurityAnswers(mockSecurityQA);

      const isValid = await verifySecurityAnswers(mockSecurityQA);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect security answers', async () => {
      await storeSecurityAnswers(mockSecurityQA);

      const incorrectAnswers = [
        { questionId: 'childhood_pet', answer: 'Spot' }, // Wrong answer
        { questionId: 'birth_city', answer: 'New York' },
        { questionId: 'mother_maiden', answer: 'Smith' }
      ];

      const isValid = await verifySecurityAnswers(incorrectAnswers);
      expect(isValid).toBe(false);
    });

    it('should normalize answers (case-insensitive)', async () => {
      await storeSecurityAnswers(mockSecurityQA);

      // Security questions normalize answers to lowercase, so this should work
      const caseDifferentAnswers = [
        { questionId: 'childhood_pet', answer: 'fluffy' }, // Different case
        { questionId: 'birth_city', answer: 'new york' },
        { questionId: 'mother_maiden', answer: 'SMITH' }
      ];

      const isValid = await verifySecurityAnswers(caseDifferentAnswers);
      expect(isValid).toBe(true); // Should pass because answers are normalized
    });

    it('should handle special characters in answers', async () => {
      const specialAnswers = [
        { questionId: 'childhood_pet', answer: "Mr. Whiskers!" },
        { questionId: 'birth_city', answer: 'São Paulo' },
        { questionId: 'mother_maiden', answer: "O'Brien-Smith" }
      ];

      await storeSecurityAnswers(specialAnswers);
      const isValid = await verifySecurityAnswers(specialAnswers);
      expect(isValid).toBe(true);
    });
  });

  describe('Recovery Scenario', () => {
    it('should handle partial answer mismatch', async () => {
      await storeSecurityAnswers(mockSecurityQA);

      const partiallyWrong = [
        { questionId: 'childhood_pet', answer: 'Fluffy' }, // Correct
        { questionId: 'birth_city', answer: 'Wrong' }, // Wrong
        { questionId: 'mother_maiden', answer: 'Smith' } // Correct
      ];

      const isValid = await verifySecurityAnswers(partiallyWrong);
      expect(isValid).toBe(false); // Should fail if any answer is wrong
    });

    it('should clear security answers', async () => {
      await storeSecurityAnswers(mockSecurityQA);
      expect(localStorage.getItem('security_answers')).toBeTruthy();

      clearSecurityQuestions();
      expect(localStorage.getItem('security_answers')).toBeNull();
    });
  });
});

describe('Full Wallet Authentication Flow', () => {
  const testWallet = {
    mnemonic: 'test wallet mnemonic phrase with twenty five words here for the test case scenario',
    address: 'TEST_ADDRESS_123456',
    createdAt: Date.now()
  };

  const testPassword = 'SecurePass@2025';
  const testSecurityQA = [
    { questionId: 'childhood_pet', answer: 'TestAnswer1' },
    { questionId: 'birth_city', answer: 'TestAnswer2' },
    { questionId: 'mother_maiden', answer: 'TestAnswer3' }
  ];

  beforeEach(() => {
    clearEncryptedWallet();
    clearSecurityQuestions();
  });

  afterEach(() => {
    clearEncryptedWallet();
    clearSecurityQuestions();
  });

  it('should complete full wallet creation and recovery flow', async () => {
    // Step 1: Create and encrypt wallet
    const encrypted = await encryptWallet(testWallet, testPassword);
    storeEncryptedWallet(encrypted);

    // Step 2: Store security questions
    await storeSecurityAnswers(testSecurityQA);

    // Step 3: Verify initial setup
    expect(hasEncryptedWallet()).toBe(true);
    const passwordValid = await verifyWalletPassword(testPassword);
    expect(passwordValid).toBe(true);

    // Step 4: Simulate password reset via security questions
    const securityValid = await verifySecurityAnswers(testSecurityQA);
    expect(securityValid).toBe(true);

    // Step 5: Change password after security question verification
    const newPassword = 'NewSecurePass@2025';
    await changeWalletPassword(testPassword, newPassword);

    // Step 6: Verify new password works
    const newPasswordValid = await verifyWalletPassword(newPassword);
    expect(newPasswordValid).toBe(true);

    // Step 7: Decrypt and verify wallet data
    const stored = getEncryptedWallet();
    const decrypted = await decryptWallet(stored!, newPassword);
    expect(decrypted.mnemonic).toBe(testWallet.mnemonic);
    expect(decrypted.address).toBe(testWallet.address);
  });

  it('should handle complete wallet backup and restore', async () => {
    // Create and store wallet
    const encrypted = await encryptWallet(testWallet, testPassword);
    storeEncryptedWallet(encrypted);
    await storeSecurityAnswers(testSecurityQA);

    // Export wallet
    const backup = exportEncryptedWallet();
    expect(backup).toBeTruthy();

    // Clear everything
    clearEncryptedWallet();
    clearSecurityQuestions();
    expect(hasEncryptedWallet()).toBe(false);

    // Restore from backup
    importEncryptedWallet(backup!);

    // Verify restored wallet
    expect(hasEncryptedWallet()).toBe(true);
    const passwordValid = await verifyWalletPassword(testPassword);
    expect(passwordValid).toBe(true);

    const restored = getEncryptedWallet();
    const decrypted = await decryptWallet(restored!, testPassword);
    expect(decrypted).toEqual(testWallet);
  });

  it('should prevent unauthorized access attempts', async () => {
    const encrypted = await encryptWallet(testWallet, testPassword);
    storeEncryptedWallet(encrypted);

    // Multiple failed password attempts should still fail
    for (let i = 0; i < 5; i++) {
      const isValid = await verifyWalletPassword('WrongPassword' + i);
      expect(isValid).toBe(false);
    }

    // Correct password should still work
    const isValid = await verifyWalletPassword(testPassword);
    expect(isValid).toBe(true);
  });
});

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    clearEncryptedWallet();
    clearSecurityQuestions();
  });

  it('should handle empty wallet data', async () => {
    const emptyWallet = {
      mnemonic: '',
      address: '',
      createdAt: Date.now()
    };

    const encrypted = await encryptWallet(emptyWallet, 'Password123!');
    const decrypted = await decryptWallet(encrypted, 'Password123!');

    expect(decrypted).toEqual(emptyWallet);
  });

  it('should handle very long mnemonic phrases', async () => {
    const longMnemonic = 'word '.repeat(1000).trim();
    const walletData = {
      mnemonic: longMnemonic,
      address: 'TEST_ADDRESS',
      createdAt: Date.now()
    };

    const encrypted = await encryptWallet(walletData, 'Password123!');
    const decrypted = await decryptWallet(encrypted, 'Password123!');

    expect(decrypted.mnemonic).toBe(longMnemonic);
  });

  it('should handle password with unicode characters', async () => {
    const unicodePassword = 'Test密码Password';
    const walletData = {
      mnemonic: 'test mnemonic',
      address: 'TEST',
      createdAt: Date.now()
    };

    const encrypted = await encryptWallet(walletData, unicodePassword);
    const decrypted = await decryptWallet(encrypted, unicodePassword);

    expect(decrypted).toEqual(walletData);
  });

  it('should maintain data integrity across multiple encrypt/decrypt cycles', async () => {
    let walletData = {
      mnemonic: 'test mnemonic phrase',
      address: 'TEST_ADDRESS',
      createdAt: Date.now()
    };

    // Encrypt and decrypt 10 times
    for (let i = 0; i < 10; i++) {
      const encrypted = await encryptWallet(walletData, 'Password123!');
      walletData = await decryptWallet(encrypted, 'Password123!');
    }

    expect(walletData.mnemonic).toBe('test mnemonic phrase');
    expect(walletData.address).toBe('TEST_ADDRESS');
  });
});
