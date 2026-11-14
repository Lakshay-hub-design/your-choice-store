import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (validatedData.body) {
        req.body = validatedData.body;
      }

      if (validatedData.params) {
        req.params = validatedData.params;
      }

      req.validatedQuery = validatedData.query;

      next();
    } catch (error) {
      console.error("Validation error:", error);

      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Validation failed",
        errors: error.issues || [],
      });
    }
  };
};

export default validate;
