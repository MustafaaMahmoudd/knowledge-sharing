const mongoose=require('mongoose');
const courseSchema=new mongoose.Schema({
    sub_track:{
        type:mongoose.Schema.ObjectId,
        ref:'subTrack'
    },
    courseName:String,
    description:String,
    instructorName:String,
    link:String,
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  })
const Course=mongoose.model('course',courseSchema);
module.exports=Course