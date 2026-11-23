// Catch-all for unmatched routes.
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

// Final error handler. Mongoose validation/cast errors are mapped to
// 400s so the frontend gets a usable message instead of a raw 500.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = 'A record with that value already exists';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
