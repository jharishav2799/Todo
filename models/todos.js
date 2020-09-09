const mongoose = require('mongoose')


const todoSchema = new mongoose.Schema({
    todoName:{
        type:String,
        required:true
    },
    todoDescription:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    duration: {
        type: Number
      }  
}, {timestamps: true} );


module.exports = mongoose.model("Todo" , todoSchema); 