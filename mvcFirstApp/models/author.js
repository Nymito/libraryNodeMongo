const mongoose = require('mongoose')
const Moovie = require('./moovie')
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// running this before w try to remove any author
authorSchema.pre('remove', function(next) {
    Moovie.find({author:this.id}, (err, moovies) =>{
        if(err){
            // cant connect to DB
            next(err)
        }else if(moovies.length>0){
            // Author has moovies, dont remove
            next(new Error('This author has moovies here'))
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)