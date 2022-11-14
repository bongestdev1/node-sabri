const {HistoriqueArticleAchat} =require('../Models/historiqueArticleAchatModel')
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
 *     HistoriqueArticleAchat:
 *       type: object
 *       required:
 *         - reference
 *         - designation
 *         - dateBA
 *         - numBonAchat
 *         - nomFournisseur
 *         - quantite
 *         - prixVenteHT
 *         - totalTTC
 *         - societeRacine
 *       properties:
 *         reference:
 *           type: string
 *         designation:
 *           type: string
 *         dateBA:
 *           type: string
 *         numBonAchat:
 *           type: string
 *         nomFournisseur:
 *           type: string
 *         quantite:
 *           type: string
 *         prixVenteHT:
 *           type: string
 *         totalTTC:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: HistoriqueArticleAchats
 *   description: The HistoriqueArticleAchats managing API
 */


/**
 * @swagger
 * paths:
 *   /historiqueArticleAchats/upload:
 *     post:
 *       summary: upload image
 *       tags: [HistoriqueArticleAchats]
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
    const files = req.files
    let arr=[];
    files.forEach(element => {

        arr.push(element.path)

    })
    return res.send(arr)
})


/**
 * @swagger
 * /historiqueArticleAchats/newHistoriqueArticleAchat:
 *   post:
 *     summary: Returns the list of all the HistoriqueArticleAchats
 *     tags: [HistoriqueArticleAchats]
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
 *                dateBA:
 *                  type: string
 *                numBonAchat:
 *                  type: string
 *                nomFournisseur:
 *                  type: string
 *                quantite:
 *                  type: string
 *                prixVenteHT:
 *                  type: string
 *                totalTTC:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the HistoriqueArticleAchats
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
 *                    dateBA:
 *                      type: string
 *                    numBonAchat:
 *                      type: string
 *                    nomFournisseur:
 *                      type: string
 *                    quantite:
 *                      type: string
 *                    prixVenteHT:
 *                      type: string
 *                    totalTTC:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newHistoriqueArticleAchat', verifytoken, async(req,res)=>{
try{
    //const {error}=validateHistoriqueArticleAchat(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

    const historiqueArticleAchat=new HistoriqueArticleAchat(body);

    const result=await historiqueArticleAchat.save()

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
 * /historiqueArticleAchats/modifierHistoriqueArticleAchat/{id}:
 *   post:
 *     summary: Update the HistoriqueArticleAchat by id
 *     tags: [HistoriqueArticleAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleAchat id

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
 *                dateBA:
 *                  type: string
 *                numBonAchat:
 *                  type: string
 *                nomFournisseur:
 *                  type: string
 *                quantite:
 *                  type: string
 *                prixVenteHT:
 *                  type: string
 *                totalTTC:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the HistoriqueArticleAchats
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
 *                     dateBA:
 *                       type: string
 *                     numBonAchat:
 *                       type: string
 *                     nomFournisseur:
 *                       type: string
 *                     quantite:
 *                       type: string
 *                     prixVenteHT:
 *                       type: string
 *                     totalTTC:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierHistoriqueArticleAchat/:id', verifytoken, async(req,res)=>{
try{
   // const {error}=validateHistoriqueArticleAchat(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const historiqueArticleAchat = await HistoriqueArticleAchat.findById(req.params.id)

    if(!historiqueArticleAchat) return res.status(401).send({status:false})


    const result = await HistoriqueArticleAchat.findOneAndUpdate({_id:req.params.id}, req.body)

    const historiqueArticleAchat2 = await HistoriqueArticleAchat.findById(req.params.id)

    return res.send({status:true,resultat:historiqueArticleAchat2})
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /historiqueArticleAchats/deleteHistoriqueArticleAchat/{id}:
 *   post:
 *     summary: Remove the HistoriqueArticleAchat by id
 *     tags: [HistoriqueArticleAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleAchat id
 *
 *     responses:
 *       200:
 *         description: The HistoriqueArticleAchat was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The HistoriqueArticleAchat was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteHistoriqueArticleAchat/:id', verifytoken, async(req,res)=>{

  try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const historiqueArticleAchat = await HistoriqueArticleAchat.findById(req.params.id)

    if(!historiqueArticleAchat) return res.status(401).send({status:false})


    if(await HistoriqueArticleAchat.findOneAndDelete({_id:req.params.id})){
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
 * /historiqueArticleAchats/listHistoriqueArticleAchats:
 *   post:
 *     summary: Returns the list of all the HistoriqueArticleAchats
 *     tags: [HistoriqueArticleAchats]
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
 *         description: The list of the HistoriqueArticleAchats
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
 *                            dateBA:
 *                              type: string
 *                            numBonAchat:
 *                              type: string
 *                            nomFournisseur:
 *                              type: string
 *                            quantite:
 *                              type: string
 *                            prixVenteHT:
 *                              type: string
 *                            totalTTC:
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
 router.post('/listHistoriqueArticleAchats', verifytoken, async(req,res)=>{
  
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
          from: 'fournisseurs',
          let: { "fournisseur": "$fournisseur"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$fournisseur" ] },
                  ]
                }
              }
            },
         ],
          as:"fournisseurs"
        }
    })
   
    pipeline.push({
      $set: {
        nomFournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
        totalTTC:{ $toString: "$totalTTC" },
        prixVenteHT:{ $toString: "$prixVenteHT" },
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
           nomFournisseur:1,
           quantite:1,
           prixVenteHT:1,
           totalTTC:1,
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

    const articles = await HistoriqueArticleAchat.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await HistoriqueArticleAchat.aggregate(sommePipeline)

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
 * /historiqueArticleAchats/getById/{id}:
 *   get:
 *     summary: Remove the HistoriqueArticleAchat by id
 *     tags: [HistoriqueArticleAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The HistoriqueArticleAchat id
 *
 *     responses:
 *       200:
 *         description: The HistoriqueArticleAchat was deleted
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
 *                     dateBA:
 *                       type: string
 *                     numBonAchat:
 *                       type: string
 *                     nomFournisseur:
 *                       type: string
 *                     quantite:
 *                       type: string
 *                     prixVenteHT:
 *                       type: string
 *                     totalTTC:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The HistoriqueArticleAchat was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{
  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const historiqueArticleAchat = await HistoriqueArticleAchat.findOne({_id:req.params.id})

    return res.send({status:true,resultat:historiqueArticleAchat})
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
 * /historiqueArticleAchats/getAllParametres:
 *   get:
 *     summary:
 *     tags: [HistoriqueArticleAchats]
 * 
 *     responses:
 *       200:
 *         description: The HistoriqueArticleAchats was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  historiqueArticleAchats:
 *                    type: array          
 *       404:
 *         description: The HistoriqueArticleAchats was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{

    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
    const historiqueArticleAchats = await HistoriqueArticleAchat.find({societeRacine:societeRacine})

    return res.send({status:true, historiqueArticleAchats:historiqueArticleAchats})     
})
/**
 * @swagger
 * /historiqueArticleAchats/getByIdArticle:
 *   get:
 *     summary:
 *     tags: [HistoriqueArticleAchats]
 * 
 *     responses:
 *       200:
 *         description: The HistoriqueArticleAchats was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  historiqueArticleAchats:
 *                    type: array          
 *       404:
 *         description: The HistoriqueArticleAchats was not found
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
    var fournisseur = ObjectId(req.body.search.nomFournisseur)
    var typeDocument = req.body.search.typeDocument

    pipeline.push({ $match: { societeRacine: societeRacine, idArticle:article , nomFournisseur:fournisseur, typeDocument:typeDocument } } )

    pipeline.push({
        $lookup: {
          from: 'fournisseurs',
          let: { "nomFournisseur": "$nomFournisseur"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$nomFournisseur" ] },
                  ]
                }
              }
            },
         ],
          as:"fournisseurs"
        }
    })
   
    pipeline.push({
        $set: {
          nomFournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
          totalTTC:{ $toString: "$totalTTC" },
          prixVenteHT:{ $toString: "$prixVenteHT" },
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
             nomFournisseur:1,
             quantite:1,
             prixVenteHT:1,
             typeDocument:1,
             totalTTC:1,
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

    const articles = await HistoriqueArticleAchat.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await HistoriqueArticleAchat.aggregate(sommePipeline)

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

module.exports.routerHistoriqueArticleAchat=router
