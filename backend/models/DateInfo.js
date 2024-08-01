const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;


const DateSchema= new Schema({
    initDateT1: {
        type: Date,
        required: true
      }, 
    endDateT1: {
        type: Date,
        required: true
      }, 
    initDateT2: {
        type: Date,
        required: true
      }, 
    endDateT2: {
        type: Date,
        required: true
      }, 
    initDateT3: {
        type: Date,
        required: true
      }, 
    endDateT3: {
        type: Date,
        required: true
      },       
});


const DateInfo = mongoose.model('DateInfo', DateSchema);

module.exports = DateInfo;
