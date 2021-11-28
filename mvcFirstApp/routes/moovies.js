// libraries imports
const express =  require('express')
const router = express.Router()
const Moovie = require('../models/moovie')
const Author = require('../models/author')
const Multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Moovie.coverImageBasePath)

//all different image types that we accept
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = Multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
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

router.post('/', upload.single('cover'), async (req,res)=>{
    const fileName = req.file != null ? req.file.filename : null
    const moovie = new Moovie({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        durationHour: parseInt(req.body.durationHour),
        durationMin: parseInt(req.body.durationMin),
        description: req.body.description,
        coverImageName: fileName,
    })
    try{
        const newMoovie = await moovie.save()
        //res.redirect(`moovies/${newMoovie.id}`)
        res.redirect('moovies')
    }catch{
        //console.error(e)
        if (moovie.coverImageName != null ){
            removeMoovieCover(moovie.coverImageName)
        }
        
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

function removeMoovieCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err =>{
        if (err) console.err(err)
    })
}
module.exports = router