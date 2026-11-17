import multer from "multer";

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 8;

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const imageFileFilter = (req, file, cb) => {
  if (!allowedImageTypes.includes(file.mimetype)) {
    const error = new Error("Only JPG, PNG, and WEBP images are allowed.");

    error.statusCode = 400;

    return cb(error);
  }

  cb(null, true);
};

// Generic upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Product images: maximum 8 images, 5 MB each
export const productUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_PRODUCT_IMAGES,
  },
  fileFilter: imageFileFilter,
});

// Profile picture: maximum 5 MB
export const avatarUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: imageFileFilter,
});

export default upload;
