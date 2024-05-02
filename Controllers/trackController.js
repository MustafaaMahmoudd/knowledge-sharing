const Track = require('../Models/trackModel');
const AppError = require('../utilities/AppErrors');
const catchAsync = require('../utilities/catchAsync');

const sendResult = (res, statusCode, track) => {
  res.status(statusCode).json({
    status: 'success',
    data: {
      track,
    },
  });
};

exports.getTracks = catchAsync(async (req, res, next) => {
  const tracks = await Track.find().select('name photo slug');
  tracks.forEach(
    (el) =>
      (el.photo = `${req.protocol}://${req.get('host')}/img/tracks/${el.photo}`)
  );

  res.status(200).json({
    status: 'success',
    data: {
      tracks,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const track = await Track.findOne({ slug: req.params.slug });
  if (!track) return next(new AppError('There is no such a track!', 404)); // Not found
  sendResult(res, 200, track);
});

exports.createTrack = catchAsync(async (req, res, next) => {
  const track = await Track.create(req.body);
  sendResult(res, 201, track);
});

exports.getTrackId = catchAsync(async (req, res, next) => {
  const currentTrack = await Track.findOne({ slug: req.params.slug });
  console.log(currentTrack);
  req.track = currentTrack;
  next();
});

exports.updateOne = catchAsync(async (req, res, next) => {
  const track = await Track.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({
    status: 'success',
    data: {
      track,
    },
  });
});

exports.getEmailsOnEachTrack = catchAsync(async (req, res, next) => {
  const fields = await Track.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'track',
        as: 'usersWithFields',
      },
    },
    {
      $unwind: '$usersWithFields',
    },
    {
      $project: {
        _id: 0,
        name: 0,
        slug: 0,
        companies: 0,
        photo: 0,
        description: 0,
        __v: 0,
      },
    },
    {
      $group: {
        _id: '$usersWithFields.track',
        emails: { $push: '$usersWithFields.email' },
      },
    },
  ]);
  console.log(fields);
  // const final = fields.map((ell) => {
  //   // let emails = [];
  //   email = ell.usersWithFields.map((el) => {
  //     if (el.emails.length === 0) {
  //       const { emails, _id } = el; // Destructure emails key and rest of the object
  //       return { id: _id };

  //     } else {
  //       return { id: el.id, emails: emails };
  //     }
  //   });

  //   // console.log(email);
  // });
  // req.final=final
  // next()
  // let array = [];
  // fields.forEach((el) => {
  //   if (el.usersWithFields.length > 0) {
  //     array.push(el.usersWithFields);
  //   }
  // });
  // console.log(array);
  //   const processedTracks = new Set();

  // // Extract track and email properties, avoiding repetition
  // const extractedData = array.flatMap(arr =>
  //     arr.filter(obj => {
  //         if (!processedTracks.has(obj.track)) {
  //             processedTracks.add(obj.track);
  //             return true;
  //         }
  //         return false;
  //     }).map(({ email, track }) => ({ email, track }))
  // );
  //   console.log(extractedData);
  req.fields = fields;
  next();
  // res.status(200).json({
  // fields,
  // array,
  // extractedData,
  // final,
  // });
});
