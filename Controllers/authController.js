const User = require('../Models/UserModel');
const crypto = require('crypto');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');
const Email = require('../utilities/email');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { promisify } = require('util');
// const { create } = require('../Models/articleModel');

const signToken = (id) => {
  // first is payload , second is the secret , third is the expires date of this token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (res, user, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //store jwt in the browser and don't modify it
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('application/pdf')) {
    console.log(file.filename);
    cb(null, true); // there is no error
  } else {
    cb(new AppError('Not an pdf! please upload only pdf', 400), false);
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../public/files`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const name = file.originalname.split('.')[0];
    const finalName = `${name}-${Date.now()}.${ext}`;
    cb(null, finalName);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});
exports.uploadedFile = upload.single('file');

exports.signUp = catchAsync(async (req, res, next) => {
  if (req.body.role === 'Admin') {
    return next(new AppError('you are not allowed to register as admin', 401));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  if (req.body.role === 'Doctor' || req.body.role === 'Software-engineer') {
    newUser.verifiedAsExpert = false;
    await newUser.save({ validateBeforeSave: false });
  }
  if (req.file) {
    newUser.file = req.file.filename;
    await newUser.save({ validateBeforeSave: false });
  }
  const code = newUser.createVerificationCode();
  await newUser.save({ validateBeforeSave: false });
  await new Email(newUser, code).sendConfirmationCode(
    'email',
    'Verify Your Account'
  );
  res.status(201).json({
    status:"success",
    newUser,
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  const hashCode = crypto
    .createHash('sha256')
    .update(req.params.code)
    .digest('hex');
  const user = await User.findOne({
    verificationCode: hashCode,
    codeVerificationExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new AppError(
        'The verification code is either expired or not correct',
        404
      )
    );
  (user.verified = true), (user.verificationCode = undefined);
  user.codeVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  createSendToken(res, user, 200);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('please provide your email and password', 400)); //bad request
  const user = await User.findOne({ email, verified: true }).select(
    '+password'
  );
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError(
        'Incorrect email or password or the email has not been verified',
        401
      )
    ); //unauthorized
  createSendToken(res, user, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookie.jwt) token = req.cookie.jwt;

  // verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belong to this token is no longer exist', 401)
    ); //unauthorized
  }
  //check if currentUser changes his password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'user recently changed his password! please login again',
        401
      )
    );
  }
  req.user = currentUser;
  next();
});



exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000), // expires after 10 seconds
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};


exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (req.user.verifiedAsExpert) {
      if (
        !(role.includes(req.user.role) && req.user.verifiedAsExpert === true)
      ) {
        return next(new AppError('you shave no permission to do that'), 403); //forbeddin
      }
    } else {
      if (!role.includes(req.user.role)) {
        return next(new AppError('you have no permission to do that'), 403);
      }
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('please,provide email', 400)); //bad request
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('there is no user with this email', 404)); //not found
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await new Email(user, url).sendResetToken(
      'emailReset',
      'Reset the password'
    );
    res.status(200).json({
      status: 'success',
      message: 'email send successfully',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('error while sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400)); //bad request
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  createSendToken(res, user, 201);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return new AppError('The password is wrong', 401);
  }

  (user.password = req.body.password),
    (user.passwordConfirm = req.body.passwordConfirm),
    await user.save();
  createSendToken(res, user, 201);
});
