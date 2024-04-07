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
});

const subTrack = mongoose.model('subTrack', subTrackSchema);

module.exports = subTrack;
