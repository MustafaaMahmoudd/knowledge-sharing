const express = require('express');
const subTrackController = require('../Controllers/subTrackController');
const Router = express.Router();

Router.get('/', subTrackController.getAllSubTracks);

module.exports = Router;
