const logger = require('pino')({ name: 'error-handler' });

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

function handleError(err, req, res, next) {
  if (err instanceof AppError) {
    logger.warn({ err: err.message, code: err.code, status: err.statusCode, path: req.path }, 'Application error');
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err.name === 'ValidationError') {
    logger.warn({ err: err.message, path: req.path }, 'Validation error');
    return res.status(400).json({
      error: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  if (err.name === 'UnauthorizedError' || err.code === 'EBADCSRFTOKEN') {
    logger.warn({ err: err.message, path: req.path }, 'CSRF/Auth error');
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  if (err.type === 'entity.too.large') {
    logger.warn({ path: req.path }, 'Payload too large');
    return res.status(413).json({
      error: 'Request payload too large. Maximum size allowed is 2MB.',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  logger.error({ err: err.message, stack: err.stack, path: req.path }, 'Unhandled server error');
  return res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  handleError,
  asyncHandler,
};