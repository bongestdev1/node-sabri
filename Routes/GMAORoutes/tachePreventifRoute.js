
const {TachePreventif} =require('../../Models/GMAOModels/tachePreventifModel')

const {Machine} =require('../../Models/GMAOModels/machineModel')
const {Personnel} =require('../../Models/personnelModel')
const {PlanPreventif} =require('../../Models/GMAOModels/planPreventifModel')
const {EtatTache} =require('../../Models/GMAOModels/etatTacheModel')


const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../../Models/societeModel')
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
 *     TachePreventif:
 *       type: object
 *       required:
 *         - planPreventif
 *         - dateExecution
 *         - personnel
 *         - machine
 *         - montant
 *         - notes
 *         - societeRacine
 *       properties:
 *         planPreventif:
 *           type: string
 *         dateExecution:
 *           type: date
 *         personnel:
 *           type: string
 *         machine:
 *           type: string
 *         montant:
 *           type: number
 *         notes:
 *           type: string
 *         societeRacine:
 *           type: string
 *         
 */

/**
 * @swagger
 * tags:
 *   name: TachePreventifs
 *   description: The TachePreventifs managing API
 */


/**
 * @swagger
 * paths:
 *   /tachePreventifs/upload:
 *     post:
 *       summary: upload image
 *       tags: [TachePreventifs]
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
router.post('/upload',upload.array('myFiles'),async(req,res)=>{
  try{
    const files = req.files
    let arr=[];
    files.forEach(element => {

        arr.push(element.path)

    })
    return res.send(arr)
  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



/**
 * @swagger
 * /tachePreventifs/newTachePreventif:
 *   post:
 *     summary: Returns the list of all the TachePreventifs
 *     tags: [TachePreventifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                planPreventif:
 *                  type: string
 *                dateExecution:
 *                  type: date
 *                personnel:
 *                  type: string
 *                machine:
 *                  type: string
 *                montant:
 *                  type: number
 *                notes:
 *                  type: string
 *                societeRacine:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the TachePreventifs
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
 *                    planPreventif:
 *                      type: string
 *                    dateExecution:
 *                      type: date
 *                    personnel:
 *                      type: string
 *                    machine:
 *                      type: string
 *                    montant:
 *                      type: string
 *                    notes:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newTachePreventif', async(req,res)=>{
  try{
    var body = req.body 
    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

    const tachePreventif=new TachePreventif(body);

    const planPre = await PlanPreventif.findById(tachePreventif.planPreventif)
    tachePreventif.numero = planPre.listTaches.length + 1

    planPre.listTaches.push(tachePreventif)

    await PlanPreventif.findByIdAndUpdate(tachePreventif.planPreventif, {listTaches : planPre.listTaches})

    const result=await tachePreventif.save()
    return res.send({status:true,resultat:result})

  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

    
})


/**
 * @swagger
 * /tachePreventifs/modifierTachePreventif/{id}:
 *   post:
 *     summary: Update the TachePreventif by id
 *     tags: [TachePreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TachePreventif id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: string
 *                planPreventif:
 *                 type: string
 *                dateExecution:
 *                 type: date
 *                personnel:
 *                 type: string
 *                machine:
 *                 type: string
 *                montant:
 *                 type: number
 *                notes:
 *                 type: string
 *                societeRacine:
 *                 type: string
 *     responses:
 *       200:
 *         description: The list of the TachePreventifs
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
 *                     planPreventif:
 *                      type: string
 *                     dateExecution:
 *                      type: date
 *                     personnel:
 *                      type: string
 *                     machine:
 *                      type: string
 *                     montant:
 *                      type: string
 *                     notes:
 *                      type: string
 *                     societeRacine:
 *                      type: string  
 *
 *
 */

router.post('/modifierTachePreventif/:id', async(req,res)=>{

  try{
    const tachePreventif = await TachePreventif.findById(req.params.id)

    if(!tachePreventif) return res.status(401).send({status:false})

    const result = await TachePreventif.findOneAndUpdate({_id:req.params.id}, req.body)

    const tachePreventif2 = await TachePreventif.findById(req.params.id)

    return res.send({status:true,resultat:tachePreventif2})

  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /tachePreventifs/deleteTachePreventif/{id}:
 *   post:
 *     summary: Remove the TachePreventif by id
 *     tags: [TachePreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TachePreventif id
 *
 *     responses:
 *       200:
 *         description: The TachePreventif was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The TachePreventif was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteTachePreventif/:id', async(req,res)=>{

  try{
    const tachePreventif = await TachePreventif.findById(req.params.id)

    if(!tachePreventif) return res.status(401).send({status:false})

    if(await TachePreventif.findOneAndDelete({_id:req.params.id})){
        return res.send({status:true})
    }else{
        return res.send({status:false})
    }

  } catch (e) {
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
 * /tachePreventifs/listTachePreventifs:
 *   post:
 *     summary: Returns the list of all the TachePreventifs
 *     tags: [TachePreventifs]
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
 *         description: The list of the TachePreventifs
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
 *                            planPreventif:
 *                              type: string
 *                            dateExecution:
 *                              type: date
 *                            personnel:
 *                              type: string
 *                            machine:
 *                              type: string
 *                            montant:
 *                              type: string
 *                            notes:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *
 *
 *
 */
 router.post('/listTachePreventifs', async(req,res)=>{

  try{
    var societeRacine = ObjectId(req.body.societeRacine)

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

    pipeline.push({ $match : { societeRacine:societeRacine } } )
    

    const article2 = await TachePreventif.aggregate(pipeline)
    console.log("article2",article2)
    pipeline.push({
        $lookup: {
          from: 'personnels',
          let: { "personnel": "$personnel"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$personnel" ] },
                  ]
                }
              }
            },
         ],
          as:"personnels"
        }
    })
    pipeline.push({
        $lookup: {
          from: 'machines',
          let: { "machine": "$machine"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$machine" ] },
                  ]
                }
              }
            },
         ],
          as:"machines"
        }
    })
    pipeline.push({
        $lookup: {
          from: 'planpreventifs',
          let: { "planPreventif": "$planPreventif"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$planPreventif" ] },
                  ]
                }
              }
            },
         ],
          as:"planpreventifs"
        }
    })
    pipeline.push({
        $lookup: {
          from: 'etattaches',
          let: { "etatTache": "$etatTache"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$etatTache" ] },
                  ]
                }
              }
            },
         ],
          as:"etattaches"
        }
    })
    
    pipeline.push({
      $set: {
        personnel: { $arrayElemAt: ["$personnels.nom", 0] },
        machine:{ $arrayElemAt: ["$machines.libelle", 0] },
        planPreventif:{ $arrayElemAt: ["$planpreventifs.libelle", 0] },
        etatTache:{ $arrayElemAt: ["$etattaches.libelle", 0] },
        montant:{ $toString: "$montant" },
        dateExecution:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$dateExecution" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           personnel:1,
           machine:1,
           planPreventif:1,
           etatTache:1,
           dateExecution:1,
           montant:1,
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

    const articles = await TachePreventif.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await TachePreventif.aggregate(sommePipeline)

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
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



/**
 * @swagger
 * /tachePreventifs/getById/{id}:
 *   get:
 *     summary: Remove the TachePreventif by id
 *     tags: [TachePreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TachePreventif id
 *
 *     responses:
 *       200:
 *         description: The TachePreventif was deleted
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
 *                     planPreventif:
 *                       type: string
 *                     dateExecution:
 *                       type: date
 *                     personnel:
 *                       type: string
 *                     machine:
 *                       type: string
 *                     montant:
 *                       type: string
 *                     interne:
 *                       type: string
 *                     societeRacine:
 *                       type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The TachePreventif was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    var tachePreventif = await TachePreventif.findOne({_id:req.params.id})

    return res.send({status:true,resultat:tachePreventif})

  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /tachePreventifs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [TachePreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The article id
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
 *                  planPreventifs:
 *                    type: array  
 *                  machines:
 *                    type: array  
 *                  personnels:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', async(req,res)=>{
  
  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    
    const machines = await Machine.find({societeRacine:societeRacine})
    const personnels = await Personnel.find({societeRacine:societeRacine})
    const planPreventifs = await PlanPreventif.find({societeRacine:societeRacine})
    const etatTaches = await EtatTache.find({societeRacine:societeRacine})

    return res.send({status:true,planPreventifs:planPreventifs,
        machines:machines,personnels:personnels,etatTaches:etatTaches}) 
    
      } catch (e) {
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
module.exports.routerTachePreventif=router
