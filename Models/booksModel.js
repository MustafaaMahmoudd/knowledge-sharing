const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  sub_track: {
    type: mongoose.Schema.ObjectId,
    ref: 'subTrack',
  },
  bookName: String,
  author: String,
  publishDate: Date,
  description: String,
  link: String,
});

const book=mongoose.model('book',bookSchema);
module.exports=book
