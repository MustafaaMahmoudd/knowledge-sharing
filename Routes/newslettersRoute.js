const express=require('express')
const authController=require('../Controllers/authController');
const trackController=require('../Controllers/trackController');
const userController=require('../Controllers/userController')
const Router=express.Router()
Router.use(authController.protect)
Router.patch('/:slug',trackController.getTrackId,userController.updateMe)


module.exports=Router