const mongoose=require('mongoose');
console.log("sdf")
const courseSchema=new mongoose.Schema({
    sub_track:{
        type:mongoose.Schema.ObjectId,
        ref:'subTrack'
    },
    courseName:String,
    description:String,
    instructorName:String,
    link:String,
})
const course=mongoose.model('course',courseSchema);
module.exports=course