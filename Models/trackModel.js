const mongoose = require('mongoose');
const slugify = require('slugify');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    require: [true, 'A track must have a name'],
  },

  slug: String,

  photo: {
    type: String,
    require: [true, 'A track must have photo'],
  },
  description: String,

  companies: Array,
});

trackSchema.index({ slug: 1 });

trackSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
