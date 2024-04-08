const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  posts: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  body: String,
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'users',
    select: 'name photo',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
