const SubTrack = require('../Models/subTrackModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');

exports.getAllSubTracks = catchAsync(async (req, res, next) => {
  const subTracks = await SubTrack.find({ track: req.track._id });
  res.status(200).json({
    status: 'success',
    data: {
      subTracks,
    },
  });
});
