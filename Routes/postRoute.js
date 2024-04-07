const postController = require('../Controllers/postController');
const authController = require('../Controllers/authController');
const express = require('express');
const Router = express.Router();

Router.route('/')
  .post(
    authController.protect,
    authController.restrictTo('Beginner'),
    postController.createPost
  )
  .get(postController.getAllPosts);
Router.route('/:id')
  .delete(authController.protect, postController.deletePost)
  .patch(authController.protect, postController.updatePost);

module.exports = Router;
