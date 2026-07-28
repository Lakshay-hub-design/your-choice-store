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

      // Don't overwrite req.query.
      // Store validated query separately if needed.
      req.validatedQuery = validatedData.query;

      next();
    } catch (error) {
      console.error("Validation error:", error);

      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: error.issues || [],
      });
    }
  };
};

export default validate;
