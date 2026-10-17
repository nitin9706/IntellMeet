const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (err) {
    const statusCode = err?.statusCode || 500;
    const message = err?.message || "Something went wrong";

    return res.status(statusCode).json({
      success: false,
      message,
      errors: err?.errors || [],
    });
  }
};
export { asyncHandler };
