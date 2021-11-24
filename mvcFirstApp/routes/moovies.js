const express =  require('express')
const router = express.Router()
const Moovie = require('../models/moovie')
const Author = require('../models/author')

// ALL moovies roue
router.get('/', async ( req, res) => {
    res.send('All moovies')
})

// New moovie
router.get('/new', async (req,res)=>{
    try{
        const authors = await Author.find({})
        const moovie = new Moovie()
        res.render('moovies/new', {
            authors:authors,
            moovie:moovie
        })
    }catch {
        res.redirect('/moovies')
    }
})

// Create moovie route

router.post('/', async (req,res)=>{
    res.send('Create moovie')
})

module.exports = router