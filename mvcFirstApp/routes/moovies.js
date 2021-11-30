// libraries imports
const express =  require('express')
const router = express.Router()
const Moovie = require('../models/moovie')
const Author = require('../models/author')

const fs = require('fs')

//all different image types that we accept
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// ALL moovies roue
router.get('/', async ( req, res) => {
    let query =  Moovie.find()
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate',req.query.publishedAfter)
    }
    try{
        const moovies = await query.exec()
        res.render('moovies/index', {
            moovies: moovies,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
    
})

// New moovie
router.get('/new', async (req,res)=>{
    renderNewPage(res, new Moovie())
})

// Create moovie route

router.post('/', async (req,res)=>{
    const moovie = new Moovie({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        durationHour: parseInt(req.body.durationHour),
        durationMin: parseInt(req.body.durationMin),
        description: req.body.description,
    })
    saveCover(moovie, req.body.cover)

    try{
        const newMoovie = await moovie.save()
        //res.redirect(`moovies/${newMoovie.id}`)
        res.redirect('moovies')
    }catch{
        //console.error(e)      
        renderNewPage(res, moovie, true)
    }
})

async function renderNewPage(res, moovie, hasError = false) {
    try{
        const authors = await Author.find({})
        const params = {
            authors:authors,
            moovie:moovie
        }
        if(hasError) params.errorMessage = 'Error creating moovie'
        res.render('moovies/new', params)
    }catch {
        res.redirect('/moovies')
    }
}

function saveCover(moovie, coverEncoded){
    if( coverEncoded == null) return

    const cover = JSON.parse(coverEncoded)
    if( cover != null && imageMimeTypes.includes(cover.type)){
        moovie.coverImage = new Buffer.from(cover.data, 'base64')
        moovie.coverImageType = cover.type
    }
}
module.exports = router