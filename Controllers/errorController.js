const AppError = require('../utilities/AppErrors');
const handleCastError = (err) => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleJwtError = (err) => {
  const message = `invalid Token,please login again`;
  return new AppError(message, 401);
};
const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value},please use another value`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrPro = (err, res) => {
  //operational, trusted error : send messages to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //programming error or other unknown error : don't leak error details
  else {
    console.error('Error', err);
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name == 'CastError') {
      error = handleCastError(error);
    }
    if (error.name == 'TokenExpiredError') {
      error = handleJwtError(error);
    }
    if (error.code == 11000) {
      error = handleDuplicateError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    sendErrPro(error, res);
  }
};
