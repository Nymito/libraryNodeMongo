const express =  require('express')
const router = express.Router()
const Moovie = require('../models/moovie')
router.get('/', async ( req, res) => {
    let moovies
    try{
        moovies = await Moovie.find().sort({createdAt: 'desc'}).limit(10).exec()
    }catch{
        moovies = []
    }
    res.render('index.ejs', { moovies: moovies})
})

module.exports = router