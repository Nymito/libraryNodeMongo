// libraries imports
const express =  require('express')
const router = express.Router()
const Moovie = require('../models/moovie')
const Author = require('../models/author')

const fs = require('fs')
const { redirect } = require('express/lib/response')

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
        res.redirect(`moovies/${newMoovie.id}`)
        
    }catch{
        //console.error(e)      
        renderNewPage(res, moovie, true)
    }
})

//show moovie route
router.get('/:id', async (req, res) =>{
    try{
        const moovie = await Moovie.findById(req.params.id).populate('author').exec()
        res.render('moovies/show', {moovie:moovie})
    }catch{
        res.redirect('/')
    }
})

// edit moovie
router.get('/:id/edit', async (req,res)=>{
    try{
        const moovie = await Moovie.findById(req.params.id)
        renderEditPage(res, moovie)
    }catch{
        res.redirect('/')
    }
    
})

// Update moovie route

router.put('/:id', async (req,res)=>{
    let moovie
    try{
        moovie = await Moovie.findById(req.params.id)
        moovie.title = req.body.title
        moovie.author = req.body.author
        moovie.publishDate = new Date(req.body.publishDate)
        moovie.durationHour = req.body.durationHour
        moovie.durationMin = req.body.durationMin
        moovie.description = req.body.description
        if(req.body.cover != null && req.body.cover!= ""){
            saveCover(moovie,req.body.cover)
        }
        await moovie.save()
        res.redirect(`/moovies/${moovie.id}`)
        
    }catch{
        if(moovie !=null){
            renderEditPage(res, moovie, true)
        }else {
            res.redirect("/")
        }
        //console.error(e)      
        
    }
})


//delete moovie page route
router.delete('/:id', async (req,res) => {
    let moovie
    try{
        moovie = await Moovie.findById(req.params.id)
        await moovie.remove()
        res.redirect('/moovies')
    }catch{
        if( moovie != null ){
            res.render('/moovies/show', {
                moovie: moovie,
                errorMessage: 'Could not remove the moovie'
            })
        }else {
            res.redirect('/')
        }
    }
})


async function renderFormPage(res, moovie, form, hasError = false) {
    try{
        const authors = await Author.find({})
        const params = {
            authors:authors,
            moovie:moovie
        }
        if(hasError){
            if(form === 'edit') params.errorMessage = 'Error updating moovie'
            else params.errorMessage = 'Error creating moovie'
            
        }
        
        
        res.render(`moovies/${form}`, params)
    }catch {
        res.redirect('/moovies')
    }
}

async function renderNewPage(res, moovie, hasError = false) {
    renderFormPage(res,moovie, 'new', hasError )
}


async function renderEditPage(res, moovie, hasError = false) {
    renderFormPage(res,moovie, 'edit', hasError )
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