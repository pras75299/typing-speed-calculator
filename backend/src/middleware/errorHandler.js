function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 403;
    message = 'Invalid token';
  }

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    status = 409;
    message = 'Resource already exists';
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

