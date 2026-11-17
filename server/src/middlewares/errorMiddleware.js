import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;

    const multerMessages = {
      LIMIT_FILE_SIZE: "Each image must be 5 MB or smaller.",
      LIMIT_FILE_COUNT: "You can upload a maximum of 8 images.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field or too many images.",
    };

    message = multerMessages[err.code] || "File upload failed.";
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed.";

    details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";

    details = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";

    const field = Object.keys(err.keyPattern || {})[0];

    details = field ? [{ field, message: `${field} already exists.` }] : null;
  }

  // Mongoose invalid ObjectId / cast error
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid value provided.";
    details = [
      {
        field: err.path,
        message: `Invalid ${err.path}.`,
      },
    ];
  }

  // Log the error
  logger.error("API Error", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  const response = {
    success: false,
    message: statusCode >= 500 ? "Internal Server Error" : message,
  };

  if (details) {
    response.errors = details;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
