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
      console.error("VALIDATION ERROR:", error.issues);
      next(
        new ApiError(400, "Validation failed", {
          details: error.issues || [],
        })
      );
    }
  };
};

export default validate;
