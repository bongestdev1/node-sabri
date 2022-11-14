const {Projet, validateProjet} =require('../Models/projetModel')


const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

const {Client} =require('../Models/clientModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel');
const { consolelog } = require('../Models/errorModel');

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
 *     Projet:
 *       type: object
 *       required:
 *         - libelle
 *         - enCours
 *         - budjet
 *         - totalVente
 *         - totalReglement
 *         - client
 *         - societeRacine
 *       properties:
 *         libelle:
 *           type: string
 *         enCours:
 *           type: boolean
 *         budjet:
 *           type: number
 *         totalVente:
 *           type: number
 *         totalReglement:
 *           type: number
 *         client:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Projets
 *   description: The Projets managing API
 */


/**
 * @swagger
 * paths:
 *   /projets/upload:
 *     post:
 *       summary: upload image
 *       tags: [Projets]
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
 * /projets/newProjet:
 *   post:
 *     summary: Returns the list of all the Projets
 *     tags: [Projets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                enCours:
 *                  type: boolean
 *                budjet:
 *                  type: number
 *                totalVente:
 *                  type: number
 *                totalReglement:
 *                  type: number
 *                client:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Projets
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
 *                    enCours:
 *                      type: boolean
 *                    budjet:
 *                      type: number
 *                    totalVente:
 *                      type: number
 *                    totalReglement:
 *                      type: number
 *                    client:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newProjet', verifytoken, async(req,res)=>{
   try{
    var body = req.body 
    
    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    const projet=new Projet(body);

    const result=await projet.save()


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
 * /projets/modifierProjet/{id}:
 *   post:
 *     summary: Update the Projet by id
 *     tags: [Projets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Projet id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                enCours:
 *                  type: boolean
 *                budjet:
 *                  type: number
 *                totalVente:
 *                  type: number
 *                totalReglement:
 *                  type: number
 *                client:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Projets
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
 *                     enCours:
 *                       type: boolean
 *                     budjet:
 *                       type: number
 *                     totalVente:
 *                       type: number
 *                     totalReglement:
 *                       type: number
 *                     client:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 */
router.post('/modifierProjet/:id', verifytoken, async(req,res)=>{

    try{
    const projet = await Projet.findById(req.params.id)

    if(!projet) return res.status(401).send({status:false})


    const result = await Projet.findOneAndUpdate({_id:req.params.id}, req.body)

    const projet2 = await Projet.findById(req.params.id)

    return res.send({status:true,resultat:projet2})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /projets/deleteProjet/{id}:
 *   post:
 *     summary: Remove the Projet by id
 *     tags: [Projets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Projet id
 *
 *     responses:
 *       200:
 *         description: The Projet was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Projet was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteProjet/:id', verifytoken, async(req,res)=>{
try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const projet = await Projet.findById(req.params.id)

    if(!projet) return res.status(401).send({status:false})


    if(await Projet.findOneAndDelete({_id:req.params.id})){
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
 * /projets/listProjets:
 *   post:
 *     summary: Returns the list of all the Projets
 *     tags: [Projets]
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
 *         description: The list of the Projets
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
 *                            enCours:
 *                              type: boolean
 *                            budjet:
 *                              type: number
 *                            totalVente:
 *                              type: number
 *                            totalReglement:
 *                              type: number
 *                            client:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */
 router.post('/listProjets', verifytoken, async(req,res)=>{
  
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

    pipeline.push({
        $lookup: {
          from: 'clients',
          let: { "client": "$client"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$client" ] },
                  ]
                }
              }
            },
         ],
          as:"clients"
        }
    })
   
    pipeline.push({
      $set: {
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        libelle:{ $toString: "$libelle" },
        adresse:{ $toString: "$adresse" },
        enCours:{ $toString: "$enCours" },
        budjet:{ $toString: "$budjet" },
        totalVente:{ $toString: "$totalVente" },
        totalReglement:{ $toString: "$totalReglement" },
        date:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$createdAt" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           client:1,
           enCours:1,
           budjet:1,
           totalVente:1,
           totalReglement:1,
           libelle:1,
           adresse:1,
        }
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

    const articles = await Projet.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await Projet.aggregate(sommePipeline)

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
 * /projets/getById/{id}:
 *   get:
 *     summary: Remove the Projet by id
 *     tags: [Projets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Projet id
 *
 *     responses:
 *       200:
 *         description: The Projet was deleted
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
 *                     enCours:
 *                       type: boolean
 *                     budjet:
 *                       type: number
 *                     totalVente:
 *                       type: number
 *                     totalReglement:
 *                       type: number
 *                     client:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Projet was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const projet = await Projet.findOne({_id:req.params.id})

    return res.send({status:true,resultat:projet})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /projets/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [Projets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The projet id
 * 
 *     responses:
 *       200:
 *         description: The projet was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  clients:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{
    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
    const clients = await Client.find({societeRacine:societeRacine})
    const projets = await Projet.find({societeRacine:societeRacine})
    
    return res.send({status:true, clients:clients,projets:projets }) 
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

module.exports.routerProjet=router
