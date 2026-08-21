class HttpError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

function notFound(req, res, _next) {
  res.status(404).json({
    error: `Not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, _req, res, _next) {
  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    return res.status(status >= 400 ? status : 502).json({
      error: "AI service request failed",
      details: err.response?.data || err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate key",
      key: err.keyValue,
    });
  }

  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV !== "production" && status === 500
      ? { details: err.message }
      : {}),
  });
}

module.exports = {
  HttpError,
  notFound,
  errorHandler,
};
