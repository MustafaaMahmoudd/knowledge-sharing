const SubTrack = require('../Models/subTrackModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');
const Book = require('../Models/booksModel');
const Course = require('../Models/coursesModel');

exports.getAllSubTracks = catchAsync(async (req, res, next) => {
  const subTracks = await SubTrack.find({ track: req.track._id });
  res.status(200).json({
    status: 'success',
    length: subTracks.length,
    data: {
      subTracks,
    },
  });
});

exports.getSteps = catchAsync(async (req, res, next) => {
  const steps = await SubTrack.find({ track: req.track._id }).select('name')
    .populate({ path: 'books' })
    .populate({ path: 'courses' });
  res.status(200).json({
    status: 'success',
    length: steps.length,
    data: steps,
    // books
  });
});
