const postController = require('../Controllers/postController');
const authController = require('../Controllers/authController');
const commentRoute=require('./commentRoute')
const express = require('express');
const Router = express.Router();

Router.route('/')
  .post(
    authController.protect,
    authController.restrictTo('Beginner'),
    postController.createPost
  )
  .get(postController.getAllPosts);
Router.get('/myPosts', authController.protect,postController.getMyPosts);
Router.route('/:id')
  .delete(authController.protect, postController.deletePost)
  .patch(authController.protect, postController.updatePost);
Router.use('/:id/comments',commentRoute)
module.exports = Router;
