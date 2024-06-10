const User = require('../Models/UserModel');
const Article = require('../Models/articleModel');
const Post = require('../Models/postsModel');
const Comment = require('../Models/commentsModel');
const { find, deleteMany } = require('../Models/articleModel');
const App = require('../utilities/AppErrors');
const AppError = require('../utilities/AppErrors');
const catchAsync = require('../utilities/catchAsync');
const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: { $ne: 'Admin' } });
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
      number: users.length,
    },
  });
});

exports.getAllUnverifiedExperts = catchAsync(async (req, res, next) => {
  const users = await User.find({
    verifiedAsExpert: false,
  });
  users.forEach((user) => {
    user.file = `${req.protocol}://${req.get('host')}/files/${user.file}`;
  });
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const sessionOne = await mongoose.startSession();
  const user = await User.findOne({ _id: req.params.id });
  if (user.role === 'Doctor' || user.role === 'Software-engineer') {
    sessionOne.startTransaction();
    try {
      await User.findByIdAndDelete(req.params.id).session(sessionOne);
      await Article.deleteMany({ user: req.params.id }).session(sessionOne);
      await sessionOne.commitTransaction();
      sessionOne.endSession();
      res.status(200).json({
        status: 'success',
        message: 'user deleted successfully',
      });
    } catch (err) {
      await sessionOne.abortTransaction();
      sessionOne.endSession();
      res.status(500).json({
        status: 'failed',
        message: err,
      });
    }
  } else if (user.role === 'Beginner') {
    sessionOne.startTransaction();
    try {
      const Posts = await Post.find({ user: req.params.id }).session(
        sessionOne
      );

      // Delete all comments associated with each post
      for (const post of Posts) {
        await Comment.deleteMany({ posts: post._id }).session(sessionOne);
      }

      // Delete the user and all associated posts within a transaction
      await User.findByIdAndDelete(req.params.id).session(sessionOne);
      await Post.deleteMany({ user: req.params.id }).session(sessionOne);

      const comments = await Comment.find({ user: req.params.id });
      if (comments.length > 0) {
        await Comment.deleteMany({ user: req.params.id }).session(sessionOne);
      }

      // Commit the transaction if all operations are successful
      await sessionOne.commitTransaction();
      sessionOne.endSession();
      res.status(200).json({
        status: 'success',
        message: 'user deleted successfully',
      });
    } catch (err) {
      await sessionOne.abortTransaction();
      res.status(500).json({
        status: 'failed',
        message: err,
      });
    }
  }
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
// exports.resizeUserPhoto = (file) => {
//   return async (req, res, next) => {
//     if (!req.file) return next();
//     req.file.filename = `${file}-${req.user.id}-${Date.now()}.jpeg`;
//     await sharp(req.file.buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 100 })
//       .toFile(`public/img/${file}s/${req.file.filename}`);
//     next();
//   };
// };

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
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
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

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.user.role != 'Admin') {
    return new AppError('your are not allowed to edit this user', 403);
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
