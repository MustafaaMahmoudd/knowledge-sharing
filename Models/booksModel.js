const mongoose = require('mongoose');
console.log('sd')
const bookSchema = new mongoose.Schema({
  sub_track: {
    type: mongoose.Schema.ObjectId,
    ref: 'subTrack',
  },
  bookName: String,
  author: String,
  publishDate: String,
  description: String,
  link: String,
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  });

const Book=mongoose.model('book',bookSchema);
module.exports=Book
