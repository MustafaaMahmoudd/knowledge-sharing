const User = require('../Models/UserModel');
const { find, deleteMany } = require('../Models/articleModel');
const App = require('../utilities/AppErrors');
const AppError = require('../utilities/AppErrors');
const catchAsync = require('../utilities/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  users.forEach((el) => {
    el.photo = `${req.protocol}://${req.get('host')}/img/users/${el.photo}`;
    if (el.file) {
      el.file = `${req.protocol}://${req.get('host')}/files/${el.file}`;
    }
  });
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getAllUnverifiedExperts = catchAsync(async (req, res, next) => {
  const users = await User.find({
    verifiedAsExpert: false,
  });
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'deleted successfully',
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    //to make sure that the uploaded file is image
    console.log(file);
    cb(null, true); // there is no error
  } else {
    cb(new AppError('Not an image! please upload only image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

filterObj = (obj, ...allow) => {
  if (!obj) return;
  let object = {};
  Object.keys(obj).forEach((el) => {
    if (allow.includes(el)) object[el] = obj[el];
  });
  return object;
};

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    return next(new App('there is no user,please try to login', 404));
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/img/users/${
    user.photo
  }`;
  res.status(200).json({
    status: 'success',
    data: {
      user,
      imageUrl,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new App('this route is not for reset password', 400)); //bad request
  }
  let filterBody = filterObj(req.body, 'name', 'email', 'track');
  let imageUrl;
  if (req.file) {
    filterBody.photo = req.file.filename;
    imageUrl = `${req.protocol}://${req.get('host')}/img/users/${
      req.file.filename
    }`;
  } else {
    imageUrl = `${req.protocol}://${req.get('host')}/img/users/default.jpg`;
  }
  if (req.track) {
    filterBody.track = req.track.id;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
      imageUrl,
    },
  });
});




exports.getOne = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id }).populate({
    path: 'articles',
  });
  if (!user) {
    return next(new App('Error there is no user', 404));
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/img/users/${
    user.photo
  }`;
  user.verified = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user,
      imageUrl,
    },
  });
});

exports.verifyExpert = catchAsync(async (req, res, next) => {
  const expert = await User.findOne({ _id: req.params.id });
  console.log(expert);
  expert.verifiedAsExpert = true;
  await expert.save({ validateBeforeSave: false });
  res.status(201).json({
    status: 'success',
    message: 'role has been verified successfully',
  });
});

exports.deleteUnVerifiedUsers = catchAsync(async (req, res, next) => {
  const query = {
    verified: false,
    codeVerificationExpires: { $lt: Date.now() },
  };
  const users = await User.deleteMany(query);
  console.log(users);
  if (users.deletedCount == 0) {
    return res.status(404).json({
      message: "There are no users who didn't verify their accounts",
    });
  }
  res.status(200).json({
    status: 'success',
    message: `${users.deletedCount} users deleted successfully`,
  });
});
