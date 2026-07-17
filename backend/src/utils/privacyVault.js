const crypto = require('crypto');

// In production, this MUST be a 32-byte secure string injected via Environment Variables
// E.g., process.env.ENCRYPTION_KEY
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32); 

class PrivacyVault {
  encrypt(text) {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
      console.error('[PrivacyVault] Encryption failed', err);
      return text;
    }
  }

  decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (err) {
      console.error('[PrivacyVault] Decryption failed (Key mismatch or corrupted data)', err);
      return text;
    }
  }
}

module.exports = new PrivacyVault();
