/**
 * Global Error Handling Middleware
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: err.name || "Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
