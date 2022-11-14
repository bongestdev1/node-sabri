const {HistoriqueArticleVente} =require('../Models/historiqueArticleVenteModel')
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
        cb(null,  file.originalname + Date.now())
    }
})

var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     HistoriqueArticleVente:
 *       type: object
 *       required:
 *         - reference
 *         - designation
 *         - dateBL
 *         - numBonLiv
 *         - nomClient
 *         - quantite
 *         - prixVenteHT
 *         - totalHT
 *         - societeRacine
 *       properties:
 *         reference:
 *           type: string
 *         designation:
 *           type: string
 *         dateBL:
 *           type: string
 *         numBonLiv:
 *           type: string
 *         nomClient:
 *           type: string
 *         quantite:
 *           type: string
 *         prixVenteHT:
 *           type: string
 *         totalHT:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: HistoriqueArticleVentes
 *   description: The HistoriqueArticleVentes managing API
 */


/**
 * @swagger
 * paths:
 *   /historiqueArticleVentes/upload:
 *     post:
 *       summary: upload image
 *       tags: [HistoriqueArticleVentes]
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
 * /historiqueArticleVentes/newHistoriqueArticleVente:
 *   post:
 *     summary: Returns the list of all the HistoriqueArticleVentes
 *     tags: [HistoriqueArticleVentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                reference:
 *                  type: string
 *                designation:
 *                  type: string
 *                dateBL:
 *                  type: string
 *                numBonLiv:
 *                  type: string
 *                nomClient:
 *                  type: string
 *                quantite:
 *                  type: string
 *                prixVenteHT:
 *                  type: string
 *                totalHT:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the HistoriqueArticleVentes
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
 *                    reference:
 *                      type: string
 *                    designation:
 *                      type: string
 *                    dateBL:
 *                      type: string
 *                    numBonLiv:
 *                      type: string
 *                    nomClient:
 *                      type: string
 *                    quantite:
 *                      type: string
 *                    prixVenteHT:
 *                      type: string
 *                    totalHT:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newHistoriqueArticleVente', verifytoken, async(req,res)=>{
try{
    //const {error}=validateHistoriqueArticleVente(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

    const historiqueArticleVente=new HistoriqueArticleVente(body);

    const result=await historiqueArticleVente.save()

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
 * /historiqueArticleVentes/modifierHistoriqueArticleVente/{id}:
 *   post:
 *     summary: Update the HistoriqueArticleVente by id
 *     tags: [HistoriqueArticleVentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleVente id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                reference:
 *                  type: string
 *                designation:
 *                  type: string
 *                dateBL:
 *                  type: string
 *                numBonLiv:
 *                  type: string
 *                nomClient:
 *                  type: string
 *                quantite:
 *                  type: string
 *                prixVenteHT:
 *                  type: string
 *                totalHT:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the HistoriqueArticleVentes
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
 *                     reference:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     dateBL:
 *                       type: string
 *                     numBonLiv:
 *                       type: string
 *                     nomClient:
 *                       type: string
 *                     quantite:
 *                       type: string
 *                     prixVenteHT:
 *                       type: string
 *                     totalHT:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierHistoriqueArticleVente/:id', verifytoken, async(req,res)=>{

  try{
   // const {error}=validateHistoriqueArticleVente(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const historiqueArticleVente = await HistoriqueArticleVente.findById(req.params.id)

    if(!historiqueArticleVente) return res.status(401).send({status:false})


    const result = await HistoriqueArticleVente.findOneAndUpdate({_id:req.params.id}, req.body)

    const historiqueArticleVente2 = await HistoriqueArticleVente.findById(req.params.id)

    return res.send({status:true,resultat:historiqueArticleVente2})

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /historiqueArticleVentes/deleteHistoriqueArticleVente/{id}:
 *   post:
 *     summary: Remove the HistoriqueArticleVente by id
 *     tags: [HistoriqueArticleVentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleVente id
 *
 *     responses:
 *       200:
 *         description: The HistoriqueArticleVente was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The HistoriqueArticleVente was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteHistoriqueArticleVente/:id', verifytoken, async(req,res)=>{

  try{

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const historiqueArticleVente = await HistoriqueArticleVente.findById(req.params.id)

    if(!historiqueArticleVente) return res.status(401).send({status:false})


    if(await HistoriqueArticleVente.findOneAndDelete({_id:req.params.id})){
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
 * /historiqueArticleVentes/listHistoriqueArticleVentes:
 *   post:
 *     summary: Returns the list of all the HistoriqueArticleVentes
 *     tags: [HistoriqueArticleVentes]
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
 *         description: The list of the HistoriqueArticleVentes
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
 *                            reference:
 *                              type: string
 *                            designation:
 *                              type: string
 *                            dateBL:
 *                              type: string
 *                            numBonLiv:
 *                              type: string
 *                            nomClient:
 *                              type: string
 *                            quantite:
 *                              type: string
 *                            prixVenteHT:
 *                              type: string
 *                            totalHT:
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
 router.post('/listHistoriqueArticleVentes', verifytoken, async(req,res)=>{
  
  try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societeRacine = ObjectId(req.body.societe)
  
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

    pipeline.push({ $match: { societeRacine: societeRacine } })
    
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
        nomClient: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        totalHT:{ $toString: "$totalHT" },
        prixVenteHT:{ $toString: "$prixVenteHT" },
        prixTTC:{ $toString: "$prixTTC" },
        date:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$date" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1,
           idArticle:1, 
           reference:1,
           designation:1,
           date:1,
           numero:1,
           nomClient:1,
           quantite:1,
           prixVenteHT:1,
           totalHT:1,
           prixTTC:1,
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

    const articles = await HistoriqueArticleVente.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await HistoriqueArticleVente.aggregate(sommePipeline)

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
 * /historiqueArticleVentes/getById/{id}:
 *   get:
 *     summary: Remove the HistoriqueArticleVente by id
 *     tags: [HistoriqueArticleVentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleVente id
 *
 *     responses:
 *       200:
 *         description: The HistoriqueArticleVente was deleted
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
 *                     reference:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     dateBL:
 *                       type: string
 *                     numBonLiv:
 *                       type: string
 *                     nomClient:
 *                       type: string
 *                     quantite:
 *                       type: string
 *                     prixVenteHT:
 *                       type: string
 *                     totalHT:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The HistoriqueArticleVente was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const historiqueArticleVente = await HistoriqueArticleVente.findOne({_id:req.params.id})

    return res.send({status:true,resultat:historiqueArticleVente})

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
 * /historiqueArticleVentes/getAllParametres:
 *   get:
 *     summary:
 *     tags: [HistoriqueArticleVentes]
 * 
 *     responses:
 *       200:
 *         description: The HistoriqueArticleVentes was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  historiqueArticleVentes:
 *                    type: array          
 *       404:
 *         description: The HistoriqueArticleVentes was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{

    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
    const historiqueArticleVentes = await HistoriqueArticleVente.find({societeRacine:societeRacine})

    return res.send({status:true, historiqueArticleVentes:historiqueArticleVentes})     
})
/**
 * @swagger
 * /historiqueArticleVentes/getByIdArticle:
 *   get:
 *     summary:
 *     tags: [HistoriqueArticleVentes]
 * 
 *     responses:
 *       200:
 *         description: The HistoriqueArticleVentes was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  historiqueArticleVentes:
 *                    type: array          
 *       404:
 *         description: The HistoriqueArticleVentes was not found
 *       500:
 *         description: Some error happened
 */
 router.post('/getByIdArticle', verifytoken, async(req,res)=>{

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

    var article = ObjectId(req.body.search.idArticle)
    var client = ObjectId(req.body.search.nomClient)
    var typeDocument = req.body.search.typeDocument

    pipeline.push({ $match: { societeRacine: societeRacine, idArticle:article, nomClient: client,typeDocument:typeDocument} } )


    pipeline.push({
        $lookup: {
          from: 'clients',
          let: { "nomClient": "$nomClient"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$nomClient" ] },
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
          nomClient: { $arrayElemAt: ["$clients.raisonSociale", 0] },
          totalHT:{ $toString: "$totalHT" },
          prixVenteHT:{ $toString: "$prixVenteHT" },
          prixTTC:{ $toString: "$prixTTC" },
          date:{ $dateToString: { 
              format: "%Y-%m-%d", date: "$date" 
          } },
          id:"$_id"
        }
      })
  
      pipeline.push({
         $project: { 
             id:1,
             idArticle:1, 
             reference:1,
             designation:1,
             date:1,
             numero:1,
             nomClient:1,
             quantite:1,
             prixVenteHT:1,
             totalHT:1,
             typeDocument:1,
             prixTTC:1,
          }
      })

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

    const articles = await HistoriqueArticleVente.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await HistoriqueArticleVente.aggregate(sommePipeline)

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

module.exports.routerHistoriqueArticleVente=router
