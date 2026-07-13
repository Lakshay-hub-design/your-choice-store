const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      console.error("Validation error:", error);
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: error.errors,
      });
    }
  };
};

export default validate;
