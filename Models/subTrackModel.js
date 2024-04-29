const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const subTrackSchema = new mongoose.Schema({
  name: String,
  track: {
    type: mongoose.Schema.ObjectId,
    ref: 'Track',
  },
  description: String,
  sub_sub_track: [
    {
      name: String,
    },
  ],
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

subTrackSchema.virtual('courses',{
  ref:'course',
  localField:'_id',
  foreignField:'sub_track'
})
subTrackSchema.virtual('books',{
  ref:'book',
  localField:'_id',
  foreignField:'sub_track'
})

const subTrack = mongoose.model('subTrack', subTrackSchema);

module.exports = subTrack;
