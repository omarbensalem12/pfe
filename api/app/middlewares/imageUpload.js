const multer = require('multer');
const storage = multer.memoryStorage(); // Store images in memory

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit (adjust as needed)
});

module.exports = upload;