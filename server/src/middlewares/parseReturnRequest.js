const parseReturnRequest = (req, res, next) => {
  try {
    if (typeof req.body.items === "string") {
      req.body.items = JSON.parse(req.body.items);
    }

    next();
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid return items format.",
    });
  }
};

export default parseReturnRequest;
