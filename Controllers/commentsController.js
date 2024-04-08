const Comment = require('../Models/commentsModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');

exports.create = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.posts = req.params.id;
  const comment = await Comment.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
//   const comment = await Comment.findOne({ posts: req.params.id });
const comment=await Comment.findOne({_id:req.params.id})
  if (comment.user.equals(req.user._id)) {
    await Comment.deleteOne({ _id: req.params.id});
    return res.status(200).json({
      status: 'success',
      message: 'comment deleted successfully',
    });
  } else {
    return next(new AppError('This is not your comment to delete', 403));
  }
});
exports.updateComment = catchAsync(async (req, res, next) => {
//   const comment = await Comment.findOne({ posts: req.params.id });
const comment=await Comment.findOne({_id:req.params.id})
  if (comment.user.equals(req.user._id)) {
    await Comment.updateOne({ _id: req.params.id},req.body,{
        new:true,
        runValidators:true
    });
    return res.status(200).json({
      status: 'success',
      message: 'comment updated successfully',
      data:{
        comment
      }
    });
  } else {
    return next(new AppError('This is not your comment to edit', 403));
  }
});
