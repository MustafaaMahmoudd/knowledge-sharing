const express = require('express');
const articleController = require('../Controllers/articleController');
const authController = require('../Controllers/authController');
const Router = express.Router();

Router.route('/')
  .get(articleController.getAllArticles)
  .post(
    authController.protect,
    authController.restrictTo('Doctor','Software-engineer'),
    articleController.createArticle
  );

Router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('Doctor', 'Software-engineer'),
  articleController.updateArticle
);
Router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('Doctor', 'Software-engineer','Admin'),
  articleController.deleteArticle
);

module.exports = Router;
