const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, 'An article must have title'],
  },
  track: {
    type: mongoose.Schema.ObjectId,
    ref: 'Track',
    require: [true, 'an article must belong to specific track'],
  },
  publishedAt: {
    type: Date,
    default: Date.now(),
  },
  send: {
    type: Boolean,
    default: false,
  },
  body: {
    type: String,
    require: [true, 'an article must have content'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

articleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
