const {ChargeSociete} =require('../Models/chargeSocieteModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { SessionCaisse } = require('../Models/sessionCaisseModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { isValidObjectId } = require('mongoose');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  file.originalname + Date.now())
    }
})

var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     ChargeSociete:
 *       type: object
 *       required:
 *         - libelle
 *         - societeRacine
 *       properties:
 *         libelle:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: ChargeSocietes
 *   description: The ChargeSocietes managing API
 */


/**
 * @swagger
 * paths:
 *   /chargeSocietes/upload:
 *     post:
 *       summary: upload image
 *       tags: [ChargeSocietes]
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
router.post('/upload',upload.array('myFiles'), verifytoken,async(req,res)=>{

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
 * /chargeSocietes/newChargeSociete:
 *   post:
 *     summary: Returns the list of all the ChargeSocietes
 *     tags: [ChargeSocietes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the ChargeSocietes
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
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newChargeSociete', verifytoken, async(req,res)=>{

    try{
    //const {error}=validateChargeSociete(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    if(!isValidObjectId(body.sessionCaisse)){
      res.send({status:false})
    }

    if (!ObjectId.isValid(body.sessionCaisse)) {
      body.sessionCaisse = null
    }else{
      const session = await SessionCaisse.findById(body.sessionCaisse)
      if(!session || (session && session.cloture === "oui")){
          body.sessionCaisse = null
      }  
    }

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    const chargeSociete=new ChargeSociete(body);

    const result=await chargeSociete.save()

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
 * /chargeSocietes/modifierChargeSociete/{id}:
 *   post:
 *     summary: Update the ChargeSociete by id
 *     tags: [ChargeSocietes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ChargeSociete id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the ChargeSocietes
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
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierChargeSociete/:id', verifytoken, async(req,res)=>{

    try{
   // const {error}=validateChargeSociete(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const chargeSociete = await ChargeSociete.findById(req.params.id)

    if(!chargeSociete) return res.status(401).send({status:false})


    const result = await ChargeSociete.findOneAndUpdate({_id:req.params.id}, req.body)

    const chargeSociete2 = await ChargeSociete.findById(req.params.id)

    return res.send({status:true,resultat:chargeSociete2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /chargeSocietes/deleteChargeSociete/{id}:
 *   post:
 *     summary: Remove the ChargeSociete by id
 *     tags: [ChargeSocietes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ChargeSociete id
 *
 *     responses:
 *       200:
 *         description: The ChargeSociete was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The ChargeSociete was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteChargeSociete/:id', verifytoken, async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const chargeSociete = await ChargeSociete.findById(req.params.id)

    if(!chargeSociete) return res.status(401).send({status:false})


    if(await ChargeSociete.findOneAndDelete({_id:req.params.id})){
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
 * /chargeSocietes/listChargeSocietes:
 *   post:
 *     summary: Returns the list of all the ChargeSocietes
 *     tags: [ChargeSocietes]
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
 *         description: The list of the ChargeSocietes
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
 *                            societeRacine:
 *                              type: string
 *                            order:
 *                              type: number
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listChargeSocietes', verifytoken, async(req,res)=>{
  
    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societe = await getSocieteRacine(ObjectId(req.body.societe))
    
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

    pipeline.push({ $match : { societeRacine:societe } } )

    pipeline.push({
        $lookup: {
          from: 'modereglements',
          let: { "modeReglement": "$modeReglement"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$modeReglement" ] },
                  ]
                }
              }
            },
         ],
          as:"modereglements"
        }
    })

    pipeline.push({
        $lookup: {
          from: 'sessioncaisses',
          let: { "sessionCaisse": "$sessionCaisse"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$sessionCaisse" ] },
                  ]
                }
              }
            },
         ],
          as:"sessioncaisses"
        }
    })

   
    pipeline.push({
      $set: {
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        sessionCaisse: { $arrayElemAt: ["$sessioncaisses.numero", 0] },
        montant:{ $toString: "$montant" },
   
        date:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$date" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           date:1,
           montant:1,
           motif:1,
           modeReglement:1,
           proprietaire:1,
           notes:1,
        }
    })

    var search = req.body.search
    
    for(let key in search){
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

    const articles = await ChargeSociete.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await ChargeSociete.aggregate(sommePipeline)

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
 * /chargeSocietes/getById/{id}:
 *   get:
 *     summary: Remove the ChargeSociete by id
 *     tags: [ChargeSocietes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ChargeSociete id
 *
 *     responses:
 *       200:
 *         description: The ChargeSociete was deleted
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
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The ChargeSociete was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const chargeSociete = await ChargeSociete.findOne({_id:req.params.id})

    return res.send({status:true,resultat:chargeSociete})

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
/**
 * @swagger
 * /chargeSocietes/getAllParametres:
 *   get:
 *     summary:
 *     tags: [ChargeSocietes]
 * 
 *     responses:
 *       200:
 *         description: The ChargeSocietes was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  chargeSocietes:
 *                    type: array          
 *       404:
 *         description: The chargeSocietes was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    const chargeSocietes = await ChargeSociete.find({societeRacine:societeRacine})
    const sessionCaisses = await SessionCaisse.find({societe:req.params.id})
    const modeReglements = await ModeReglement.find({societeRacine:societeRacine})

    return res.send({status:true, chargeSocietes:chargeSocietes, sessionCaisses:sessionCaisses,
        modeReglements:modeReglements})
        
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
      }
})
module.exports.routerChargeSociete=router
