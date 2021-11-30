const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/moovieCovers'

const moovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String, 
    },
    publishDate: {
        type:Date,
        required: true
    },
    durationHour: {
        type: Number,
        required: true
    },
    durationMin: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }

})

moovieSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})
module.exports = mongoose.model('Moovie', moovieSchema)
module.exports.coverImageBasePath = coverImageBasePath