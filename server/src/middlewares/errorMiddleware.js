import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error("API Error", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  const response = {
    success: false,
    message: err.statusCode ? err.message : "Internal Server Error",
  };

  if (err.details) {
    response.errors = err.details;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
