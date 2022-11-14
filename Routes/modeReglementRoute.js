const {ModeReglement, validateModeReglement, getNumeroAutomatiqueModeReglement} =require('../Models/modeReglementModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')
const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     ModeReglement:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *         ordre:
 *           type: number
 *         valeurRetiree:
 *           type: number
 *         tierNecessaire:
 *           type: string
 *         plan:
 *           type: string
 * 
 */

/**
 * @swagger
 * tags:
 *   name: ModeReglements
 *   description: The ModeReglements managing API
 */


/**
 * @swagger
 * paths:
 *   /modeReglements/upload:
 *     post:
 *       summary: upload image
 *       tags: [ModeReglements]
 *       requestBody:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: file
 *       responses:
 *         200:
 *           description: The image was successfully saved
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pathImage:
 *                       type: string
 *         500:
 *           description: Some server error
 */
router.post('/upload',upload.array('myFiles'),verifytoken ,async(req,res)=>{
    try{
    const files = req.files
    let arr=[];
    files.forEach(element => {
       arr.push(element.path)
    })
    return res.send(arr)
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



/**
 * @swagger
 * /modeReglements/newModeReglement:
 *   post:
 *     summary: Returns the list of all the ModeReglements
 *     tags: [ModeReglements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                ordre:
 *                  type: number
 *                valeurRetiree:
 *                  type: number
 *                tierNecessaire:
 *                  type: string
 *                plan:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the modeReglements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 resultat:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                    libelle:
 *                      type: string
 *                    ordre:
 *                      type: number
 *                    valeurRetiree:
 *                      type: number
 *                    tierNecessaire:
 *                      type: string
 *                    plan:
 *                      type: string
 *
 */
router.post('/newModeReglement', verifytoken ,async(req,res)=>{

    try{
    //const {error}=validateModeReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    var numero = await getNumeroAutomatiqueModeReglement(body.societeRacine)
    body.num = numero.num

    const modeReglement=new ModeReglement(body);

    const result=await modeReglement.save()


    return res.send({status:true,resultat:result})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /modeReglements/modifierModeReglement/{id}:
 *   post:
 *     summary: Update the modeReglement by id
 *     tags: [ModeReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The modeReglement id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                ordre:
 *                  type: number
 *                valeurRetiree:
 *                  type: number
 *                tierNecessaire:
 *                  type: string
 *                plan:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the modeReglements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 resultat:
 *                   type: object
 *                   properties:
 *                     libelle:
 *                       type: string
 *                     ordre:
 *                       type: number
 *                     valeurRetiree:
 *                       type: number
 *                     tierNecessaire:
 *                       type: string
 *                     plan:
 *                       type: string
 *
 *
 */

router.post('/modifierModeReglement/:id', verifytoken ,async(req,res)=>{

    try{
   // const {error}=validateModeReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const modeReglement = await ModeReglement.findById(req.params.id)

    if(!modeReglement) return res.status(401).send({status:false})

    const result = await ModeReglement.findOneAndUpdate({_id:req.params.id}, req.body)

    const modeReglement2 = await ModeReglement.findById(req.params.id)

    return res.send({status:true,resultat:modeReglement2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /modeReglements/deleteModeReglement/{id}:
 *   post:
 *     summary: Remove the modeReglement by id
 *     tags: [ModeReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The modeReglement id
 *
 *     responses:
 *       200:
 *         description: The modeReglement was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The modeReglement was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteModeReglement/:id', verifytoken ,async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const modeReglement = await ModeReglement.findById(req.params.id)

    if(!modeReglement) return res.status(401).send({status:false})


    if(await ModeReglement.findOneAndDelete({_id:req.params.id})){
        return res.send({status:true})
    }else{
        return res.send({status:false})
    }

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'itemsList',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator'
};


/**
 * @swagger
 * /modeReglements/listModeReglements:
 *   post:
 *     summary: Returns the list of all the modeReglements
 *     tags: [ModeReglements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                page:
 *                  type: number
 *                limit:
 *                  type: number
 *                search:
 *                  type: object
 *                orderBy:
 *                  type: object
 *     responses:
 *       200:
 *         description: The list of the modeReglements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                      page:
 *                         type: number
 *                      limit:
 *                         type: number
 *                      search:
 *                         type: object
 *                      orderBy:
 *                         type: object
 *                 resultat:
 *                   type: object
 *                   properties:
 *                      total:
 *                         type: number
 *                      limit:
 *                         type: number
 *                      page:
 *                         type: number
 *                      pages:
 *                         type: number
 *                      docs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                            id:
 *                              type: string
 *                            libelle:
 *                              type: string
 *                            ordre:
 *                              type: number
 *                            valeurRetiree:
 *                              type: number
 *                            tierNecessaire:
 *                              type: string
 *                            plan:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listModeReglements', verifytoken ,async(req,res)=>{
  
    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
  
    var sort = {}
    for( let key in req.body.orderBy){
        if(Number(req.body.orderBy[key]) != 0){
             sort[key] = req.body.orderBy[key]
        }  
    }

    if(Object.keys(sort).length == 0){
        sort = {createdAt:-1}
    }

    var pipeline = []

    pipeline.push({ $match : {societeRacine : societeRacine} } )
    
   
    pipeline.push({
      $set: {
        id:"$_id",
        ordre:{ $toString: "$ordre" }, 
        valeurRetiree:{ $toString: "$valeurRetiree" },
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           libelle:1, 
           ordre:1, 
           valeurRetiree:1, 
           tierNecessaire:1, 
           enCours:1, 
           image:1}
    })

    var search = req.body.search
    
    for( let key in search){
            
        if(search[key] != ""){
            var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1)
            var word2 = search[key].toUpperCase()
            var word3 = search[key].toLowerCase()

         
            var objet1 = {}
            objet1[key] = { $regex: '.*' + word1 + '.*' }
           
            var objet2 = {}
            objet2[key] = { $regex: '.*' + word2 + '.*' }
            
            var objet3 = {}
            objet3[key] = { $regex: '.*' + word3 + '.*' }

            let objectMatch = {$or:[objet1, objet2, objet3]}
            
            let objectParent = {$match : objectMatch}
            pipeline.push(objectParent)
        }  
    }

    
    var sommePipeline = []
    for(let key in pipeline){
      sommePipeline.push(pipeline[key])
    }

    pipeline.push({
      $sort:sort
    })

    var skip = Number(req.body.page - 1) * Number(req.body.limit)

    pipeline.push({$limit: skip + Number(req.body.limit)})

    pipeline.push({$skip: skip})

    const articles = await ModeReglement.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

   
    var nbrTotal = await ModeReglement.aggregate(sommePipeline)

    if(nbrTotal.length == 0){
      nbrTotal = [{total:0}]
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit)
    var pages = nbrTotal[0].total / req.body.limit

    if(pages > nbrTotalTrunc){
      pages = nbrTotalTrunc + 1
    }

    const result = {docs:articles, pages:pages}

    return res.send({status:true, resultat:result, request:req.body})
   
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})



/**
 * @swagger
 * /modeReglements/getById/{id}:
 *   get:
 *     summary: Remove the modeReglement by id
 *     tags: [ModeReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The modeReglement id
 *
 *     responses:
 *       200:
 *         description: The modeReglement was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  resultat:
 *                    type: object
 *                    properties:
 *                     id:
 *                       type: string
 *                     libelle:
 *                       type: string
 *                     ordre:
 *                       type: number
 *                     valeurRetiree:
 *                       type: number
 *                     tierNecessaire:
 *                       type: string
 *                     plan:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The modeReglement was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken ,async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const modeReglement = await ModeReglement.findOne({_id:req.params.id})

    return res.send({status:true,resultat:modeReglement})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /modeReglements/getAllParametres/{id}:
 *   get:
 *     summary: Remove the ModeReglements by id
 *     tags: [ModeReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ModeReglements id
 * 
 *     responses:
 *       200:
 *         description: The bl was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  modeReglements:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken ,async(req,res)=>{
   try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    const modeReglements = await ModeReglement.find({societeRacine:societeRacine})
    return res.send({status:true,modeReglements:modeReglements}) 
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

function verifytoken(req, res, next){
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'secretkey', (err, authData) => {
            if(err){
                res.sendStatus(403);
            }else{
                req.user = authData;
                next();
            }
        });

    }else{
        console.log("etape100");
        res.sendStatus(401);
    }

}

module.exports.routerModeReglement=router
