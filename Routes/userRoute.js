const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const rateLimit = require('express-rate-limit');
const express = require('express');

const Router = express.Router();
const limiter = rateLimit({
  max: 100,
  window: 60 * 24 * 1000,
  message: 'Too many requests from this IP, please try again in hour',
});

Router.route('/')
  .get(
    authController.protect,
    authController.restrictTo('Admin'),
    userController.getAllUsers
  )
  .delete(userController.deleteUnVerifiedUsers);
Router.get(
  '/allUsers',
  authController.protect,
  authController.restrictTo('Admin'),
  userController.getAllUnverifiedExperts
);
Router.get('/logout', authController.logout);

Router.get('/getMe', authController.protect, userController.getMe);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

Router.patch(
  '/updatePassword',
  authController.updatePassword
);

Router.patch(
  '/verifyExpert/:id',
  authController.protect,
  authController.restrictTo('Admin'),
  userController.verifyExpert
);

Router.route('/:id')
  .get(authController.protect, userController.getOne)
  .delete(
    authController.protect,
    authController.restrictTo('Admin'),
    userController.deleteUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('Admin'),
    userController.updateUser
  );
// Router.use('/signup',limit.limiter);
Router.use(limiter);
Router.post('/signup', authController.uploadedFile, authController.signUp);
Router.patch('/verify-email/:code', authController.verify);
Router.patch('/resetPassword/:resetToken', authController.resetPassword);
Router.post('/login', authController.login);
module.exports = Router;
