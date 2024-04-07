const AppError = require('../utilities/AppErrors');
const Post = require('../Models/postsModel');
const catchAsync = require('../utilities/catchAsync');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  posts.forEach((el) => {
    // Check if the photo URL already contains the base URL
    if (!el.user.photo.startsWith(`${req.protocol}://${req.get('host')}`)) {
      // If not, append the base URL to the photo URL
      el.user.photo = `${req.protocol}://${req.get('host')}/img/users/${
        el.user.photo
      }`;
    }
  });
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const post = await Post.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (post.user.equals(req.user._id)) {
    await Post.deleteOne({ _id: post._id });
    return res.status(200).json({
      status: 'success',
      message: 'deleted successfully',
    });
  } else {
    return next(new AppError('This is not your post to delete', 403));
  }
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (post.user.equals(req.user._id)) {
    await Post.updateOne({ _id: post._id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  }
  return next(new AppError('this is not your post to edit', 403));
});
