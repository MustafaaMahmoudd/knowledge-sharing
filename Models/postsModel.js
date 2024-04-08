const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      require: [true, 'A post must have content'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'A post must belong to specific user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

postsSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

postsSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'posts',
  localField: '_id',
});

// postsSchema.pre('save',async function(next){
//   await this.populate({path:'user',select:'name photo'})
//   next()
// })

const post = mongoose.model('Post', postsSchema);

module.exports = post;
