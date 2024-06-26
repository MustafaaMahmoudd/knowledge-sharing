const SubTrack = require('../Models/subTrackModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppErrors');
const Book=require('../Models/booksModel')
const Course=require('../Models/coursesModel')


exports.getAllSubTracks = catchAsync(async (req, res, next) => {
  const subTracks = SubTrack.find({ track: req.track._id }).select('-number')
  let sortBy=req.query.sort;
  const finalSubTracks=await subTracks.sort(sortBy)
  res.status(200).json({
    status: 'success',
    length: subTracks.length,
    data: {
      finalSubTracks,
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


exports.updateSubTracks = catchAsync(async (req, res, next) => {

  // const subTrack=SubTrack.findByIdAndUpdate(req.params.id,req.body,{
  //   new:true,
  //   runValidators:true,
  // })
  const subTrack=SubTrack.updateOne({$set:{show:!show}});
  res.status(200).json({
    status: 'success',
    length: subTracks.length,
    data: {
      finalSubTracks,
    },
  });
});
