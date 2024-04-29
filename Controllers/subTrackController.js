const SubTrack = require('../Models/subTrackModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');
const Book=require('../Models/booksModel')
const Course=require('../Models/coursesModel')


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
  // const books=await Course.find()
  let query;
   query = SubTrack.find({ track: req.track._id }).select('name')
    .populate({ path: 'books' })
    .populate({ path: 'courses' });
  const page=req.query.page *1;
  const limit=req.query.limit *1;
  const skip=(page-1)*limit
  const steps=await query.skip(skip).limit(limit);
  res.status(200).json({
    status: 'success',
    length: steps.length,
    data: steps,
    // books
  });
});
