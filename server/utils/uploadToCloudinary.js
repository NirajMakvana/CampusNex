const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload buffer to cloudinary (used with multer memoryStorage)
const uploadToCloudinary = (buffer, folder = 'campusnex') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
