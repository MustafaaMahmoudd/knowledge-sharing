const Article = require('../Models/articleModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');
const Email = require('../utilities/email');
const { publicDecrypt } = require('crypto');

exports.getAllArticles = catchAsync(async (req, res, next) => {
  if (!req.track) {
    const articles = await Article.find();
    return res.status(200).json({
      status: 'success',
      data: {
        articles,
      },
    });
  }
  const articles = await Article.find({ track: req.track._id });
  if (!articles) {
    next(new AppError('There are no articles!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      articles,
    },
  });
});

exports.createArticle = catchAsync(async (req, res, next) => {
  req.body.track = req.track._id;
  req.body.user = req.user._id;
  const article = await Article.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      article,
    },
  });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ _id: req.params.id });
  if (article.user.id.equals(req.user._id)) {
    await Article.updateOne({ _id: article._id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: 'success',
      data: {
        article,
      },
    });
  }

  return next(new AppError('this is not your article to edit ', 403)); // unauthorized
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ _id: req.params.id });
  if (article.user._id.equals(req.user._id)) {
    await Article.deleteOne({ _id: article._id });
    return res.status(200).json({
      status: 'success',
      message: 'deleted successfully',
    });
  }
  if (article.user.role === 'admin') {
    await Article.deleteOne({ _id: article._id });
    return res.status(200).json({
      status: 'success',
      message: 'deleted successfully',
    });
  }
  return next(new AppError('this is not your article to delete ', 403));
});
exports.sendArticles = catchAsync(async (req, res, next) => {
  let articles;
  // const Articles = req.fields.forEach(async (el) => {
  let ar;
  for (ar of req.fields) {
    console.log(ar.emails);
    articles = await Article.find({ track: ar._id,send:false});
    console.log(articles);
    let el;

    // for (el of articles) {
    //   el.user.photo = `${req.protocol}://${req.get('host')}/img/users/${
    //     el.user.photo
    //   }`;
    // }
      // el.send = true;
      // await el.save({ validateBeforeSave: false }); // No need for { validateBeforeSave: false }
      await new Email().sendArticles(
        req,
        'Weekly newsLetters',
        'articlesEmail',
        articles,
        ar.emails
      );
      Article.updateMany({track:ar._id},{$set:{send:true}})
  }
  // });
  res.status(200).json({
    status: 'success',
    message: 'emails are sent successfully',
  });
});
