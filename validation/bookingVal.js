const validateBody = (req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] ${req.method} ${req.url}`);
    next();
  };

  module.exports = {
    validateBody,
  };