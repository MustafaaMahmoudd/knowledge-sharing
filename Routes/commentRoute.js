const express = require('express');
const Router = express.Router({ mergeParams: true });
const commentController = require('../Controllers/commentsController');
const authController = require('../Controllers/authController');

Router.post('/', authController.protect, commentController.create);
Router.route('/:id')
  .delete(authController.protect, commentController.deleteComment)
  .patch(authController.protect, commentController.updateComment);

module.exports = Router;
