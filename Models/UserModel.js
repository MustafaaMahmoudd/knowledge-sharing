const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const Article = require('./articleModel');
const Post = require('./postsModel');
const Comment = require('./commentsModel');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The name is required,please provide your name'],
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    file: String,
    verifiedAsExpert: Boolean,
    role: {
      type: String,
      enum: ['Doctor', 'Beginner', 'Software-engineer', 'Admin'],
    },
    password: {
      type: String,
      required: [true, 'please provide password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      require: [true, 'please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'passwords are not the same',
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    track: {
      type: mongoose.Schema.ObjectId,
      ref: 'Track',
    },
    verificationCode: String,
    codeVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    passwordChangedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

userSchema.virtual('articles', {
  ref: 'Article',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //because saving into database in slower than issuing JWT
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12); // 12 increase the time required to compute the hash,
  // making it harder for attackers to brute-force passwords.
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  this.verificationCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
  this.codeVerificationExpires = Date.now() + 10 * 60 * 1000; //valid for 10 minutes
  return code;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (currentJwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtSec = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return currentJwtTimeStamp < passwordChangedAtSec;
  }
  return false;
};

userSchema.statics.deleteArticlesRelatedToDeletedUser = async function (
  userId
) {
  const Articles=await Articles.find({user:userId})
  if(Articles){
    await Article.deleteMany({ user: userId })
  }
  const posts = await Post.find({ user: userId });
  if (posts) {
    await Promise.all(
      posts.map(async (post) => {
        await Comment.deleteMany({ posts: post._id });
      })
    );
    await Post.deleteMany({ user: userId });
  }
  const comments=await Comment.find({user:userId})
  if(comments){
    await Comment.deleteMany({ user: userId });
  }
};

// userSchema.post(/^findOneAndDelete/, async function (doc) {
//   await doc.constructor.deleteArticlesRelatedToDeletedUser(doc._id);
// });
const User = mongoose.model('User', userSchema);
module.exports = User;
