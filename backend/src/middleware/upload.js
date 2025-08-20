const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentacube/listings', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed formats
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit',
        quality: 'auto:eco' // More aggressive compression for 200KB limit
      }
    ]
  },
});

// Single image upload (for backward compatibility)
const singleUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 200KB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multiple image upload (up to 3 images)
const multipleUpload = multer({
  storage,
  limits: { 
    fileSize: 200 * 1024, // 200KB per file
    files: 3 // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = {
  single: singleUpload.single('image'),
  multiple: multipleUpload.array('images', 3),
  singleUpload,
  multipleUpload
};
