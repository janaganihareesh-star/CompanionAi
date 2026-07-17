const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Local File System Storage for Images
 * Resolves MongoDB Base64 bloat by saving files to disk.
 */
class UploadService {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Saves a base64 image string to the local disk
   * @param {string} base64String 
   * @returns {string} The local file path
   */
  async saveBase64Image(base64String) {
    return new Promise((resolve, reject) => {
      try {
        const matches = base64String.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return resolve(null); // Not a valid base64 image
        }

        const extension = matches[1].split('/')[1] || 'png';
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        
        const fileName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFile(filePath, buffer, (err) => {
          if (err) return reject(err);
          // Return the relative URL path to serve it via express static
          resolve(`/uploads/${fileName}`);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new UploadService();
