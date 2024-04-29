const express = require('express');
const subTrackController = require('../Controllers/subTrackController');
const Router = express.Router();

Router.get('/', subTrackController.getAllSubTracks);
Router.get('/steps',subTrackController.getSteps)

module.exports = Router;
