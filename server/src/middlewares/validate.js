const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }

      if (validatedData.params !== undefined) {
        req.params = validatedData.params;
      }

      if (validatedData.query !== undefined) {
        req.validatedQuery = validatedData.query;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default validate;
