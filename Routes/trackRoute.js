const trackController = require('../Controllers/trackController');
const articleController = require('../Controllers/articleController');
const express = require('express');
const Router = express.Router();
const articleRoute = require('./articleRoute');
const subTrackRoute = require('./subTrackRoute');

Router.get('/sendArticle', trackController.getEmailsOnEachTrack,articleController.sendArticles);
Router.route('/')
  .get(trackController.getTracks)
  .post(trackController.createTrack);

Router.patch('/:id',trackController.updateOne);

Router.get('/:slug', trackController.getOne);
Router.use('/:slug/articles', trackController.getTrackId, articleRoute);
Router.use('/:slug/details', trackController.getTrackId, subTrackRoute);

module.exports = Router;
