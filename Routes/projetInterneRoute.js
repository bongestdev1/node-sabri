
const {ProjetInterne, getNumeroAutomatique } =require('../Models/projetInterneModel')

const {StatuOpportunite} =require('../Models/statuOpportuniteModel')
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
 *     ProjetInterne:
 *       type: object
 *       required:
 *         - reference
 *         - libelle
 *         - dateDebut
 *         - dateFin
 *         - statutOpportunite
 *         - probabiliteOpportunite
 *         - mantantOpportunite
 *         - budget
 *         - tauxAvancement
 *         - description
 *         - societeRacine
 *       properties:
 *         reference:
 *           type: string
 *         libelle:
 *           type: string
 *         dateDebut:
 *           type: date
 *         dateFin:
 *           type: date
 *         statutOpportunite:
 *           type: string
 *         probabiliteOpportunite:
 *           type: number
 *         mantantOpportunite:
 *           type: number
 *         budget:
 *           type: number
 *         tauxAvancement:
 *           type: number
 *         description:
 *           type: string
 *         societeRacine:
 *           type: string
 *         
 */

/**
 * @swagger
 * tags:
 *   name: ProjetInternes
 *   description: The ProjetInternes managing API
 */


/**
 * @swagger
 * paths:
 *   /projetInternes/upload:
 *     post:
 *       summary: upload image
 *       tags: [ProjetInternes]
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
 * /projetInternes/newProjetInterne:
 *   post:
 *     summary: Returns the list of all the ProjetInternes
 *     tags: [ProjetInternes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                reference:
 *                  type: string
 *                libelle:
 *                  type: string
 *                dateDebut:
 *                  type: date
 *                dateFin:
 *                  type: date
 *                statutOpportunite:
 *                  type: string
 *                probabiliteOpportunite:
 *                  type: number
 *                mantantOpportunite:
 *                  type: number
 *                budget:
 *                  type: number
 *                tauxAvancement:
 *                  type: number
 *                description:
 *                  type: string 
 *                societeRacine:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the ProjetInternes
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
 *                    libelle:
 *                      type: string
 *                    dateDebut:
 *                      type: date
 *                    dateFin:
 *                      type: date
 *                    statutOpportunite:
 *                      type: number
 *                    probabiliteOpportunite:
 *                      type: number
 *                    mantantOpportunite:
 *                      type: number
 *                    budget:
 *                      type: number
 *                    tauxAvancement:
 *                      type: number
 *                    description:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newProjetInterne', verifytoken, async(req,res)=>{

  try{
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    req.body.reference = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(societe))

    const projetInterne=new ProjetInterne(body);

    const result=await projetInterne.save()

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
 * /projetInternes/modifierProjetInterne/{id}:
 *   post:
 *     summary: Update the ProjetInterne by id
 *     tags: [ProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ProjetInterne id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: string
 *                reference:
 *                 type: string
 *                libelle:
 *                 type: string
 *                dateDebut:
 *                 type: date
 *                dateFin:
 *                 type: date
 *                statutOpportunite:
 *                 type: number
 *                probabiliteOpportunite:
 *                 type: number
 *                mantantOpportunite:
 *                 type: number
 *                budget:
 *                 type: number
 *                tauxAvancement:
 *                 type: number
 *                description:
 *                 type: string
 *                societeRacine:
 *                 type: string
 *     responses:
 *       200:
 *         description: The list of the ProjetInternes
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
 *                      type: string
 *                     libelle:
 *                      type: string
 *                     dateDebut:
 *                      type: date
 *                     dateFin:
 *                      type: date
 *                     statutOpportunite:
 *                      type: number
 *                     probabiliteOpportunite:
 *                      type: number
 *                     mantantOpportunite:
 *                      type: number
 *                     budget:
 *                      type: number
 *                     tauxAvancement:
 *                      type: number
 *                     description:
 *                      type: string 
 *                     societeRacine:
 *                      type: string 
 *
 *
 */
router.post('/modifierProjetInterne/:id', verifytoken, async(req,res)=>{

  try{
    const projetInterne = await ProjetInterne.findById(req.params.id)

    if(!projetInterne) return res.status(401).send({status:false})

    const result = await ProjetInterne.findOneAndUpdate({_id:req.params.id}, req.body)

    const projetInterne2 = await ProjetInterne.findById(req.params.id)

    return res.send({status:true,resultat:projetInterne2})

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /projetInternes/deleteProjetInterne/{id}:
 *   post:
 *     summary: Remove the ProjetInterne by id
 *     tags: [ProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ProjetInterne id
 *
 *     responses:
 *       200:
 *         description: The ProjetInterne was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The ProjetInterne was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteProjetInterne/:id', verifytoken, async(req,res)=>{

  try{
    const projetInterne = await ProjetInterne.findById(req.params.id)

    if(!projetInterne) return res.status(401).send({status:false})

    if(await ProjetInterne.findOneAndDelete({_id:req.params.id})){
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
 * /projetInternes/listProjetInternes:
 *   post:
 *     summary: Returns the list of all the ProjetInternes
 *     tags: [ProjetInternes]
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
 *         description: The list of the ProjetInternes
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
 *                            libelle:
 *                              type: string
 *                            dateDebut:
 *                              type: date
 *                            dateFin:
 *                              type: date
 *                            statutOpportunite:
 *                              type: number
 *                            probabiliteOpportunite:
 *                              type: number
 *                            mantantOpportunite:
 *                              type: number
 *                            budget:
 *                              type: number
 *                            tauxAvancement:
 *                              type: number
 *                            description:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *
 *
 *
 */
 router.post('/listProjetInternes', verifytoken, async(req,res)=>{

  try{
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

    pipeline.push({ $match: { societeRacine: societeRacine } })

    pipeline.push({
      $lookup: {
        from: 'statuopportunites',
        let: { "statutOpportunite": "$statutOpportunite" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$statutOpportunite"] },
              ]
            }
          }
        }],
        as: "statuopportunites"
      }
    })

    pipeline.push({
      $set: {
        statutOpportunite: { $arrayElemAt: ["$statuopportunites.libelle", 0] },
        probabiliteOpportunite: { $toString: "$probabiliteOpportunite" },
        mantantOpportunite: { $toString: "$mantantOpportunite" },
        budget: { $toString: "$budget" },
        tauxAvancement: { $toString: "$tauxAvancement" },
        dateDebut:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$dateDebut" 
        } },
        dateFin:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$dateFin" 
        } },
        id: "$_id",
  
      }
    })
  
    pipeline.push({
      $project: { 
        id: 1, 
        reference: 1, 
        libelle: 1, 
        statutOpportunite: 1, 
        probabiliteOpportunite: 1, 
        dateDebut: 1, 
        dateFin: 1, 
        mantantOpportunite: 1, 
        budget: 1, 
        tauxAvancement: 1,
        description: 1,
    }
    })
  
    var search = req.body.search
  
    for (let key in search) {
      if (search[key] != "") {
        var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1)
        var word2 = search[key].toUpperCase()
        var word3 = search[key].toLowerCase()
  
  
        var objet1 = {}
        objet1[key] = { $regex: '.*' + word1 + '.*' }
  
        var objet2 = {}
        objet2[key] = { $regex: '.*' + word2 + '.*' }
  
        var objet3 = {}
        objet3[key] = { $regex: '.*' + word3 + '.*' }
  
        let objectMatch = { $or: [objet1, objet2, objet3] }
  
        let objectParent = { $match: objectMatch }
        pipeline.push(objectParent)
      }
    }
  
  
    var sommePipeline = []
    for (let key in pipeline) {
      sommePipeline.push(pipeline[key])
    }
  
    pipeline.push({
      $sort: sort
    })
  
    var skip = Number(req.body.page - 1) * Number(req.body.limit)
  
    pipeline.push({ $limit: skip + Number(req.body.limit) })
  
    pipeline.push({ $skip: skip })
  
    const articles = await ProjetInterne.aggregate(pipeline)
  
    sommePipeline.push({
      $count: "total"
    })
  
  
    var nbrTotal = await ProjetInterne.aggregate(sommePipeline)
  
    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }]
    }
  
    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit)
    var pages = nbrTotal[0].total / req.body.limit
  
    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1
    }
  
    const result = { docs: articles, pages: pages }
  
    return res.send({ status: true, resultat: result, request: req.body })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

  })



/**
 * @swagger
 * /projetInternes/getById/{id}:
 *   get:
 *     summary: Remove the ProjetInterne by id
 *     tags: [ProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ProjetInterne id
 *
 *     responses:
 *       200:
 *         description: The ProjetInterne was deleted
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
 *                     libelle:
 *                       type: string
 *                     dateDebut:
 *                       type: date
 *                     dateFin:
 *                       type: date
 *                     statutOpportunite:
 *                       type: number
 *                     probabiliteOpportunite:
 *                       type: number
 *                     mantantOpportunite:
 *                       type: number
 *                     budget:
 *                       type: number
 *                     tauxAvancement:
 *                       type: number
 *                     description:
 *                       type: string
 *                     societeRacine:
 *                       type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The ProjetInterne was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    var projetInterne = await ProjetInterne.findOne({_id:req.params.id})

    return res.send({status:true,resultat:projetInterne})

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /projetInternes/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [ProjetInternes]
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
 *                  statutOpportunites:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.post('/getAllParametres', verifytoken, async(req,res)=>{
  
  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societeRacine, exercice)
     
    const projetInternes = await ProjetInterne.find({societeRacine:societeRacine})

    const statutOpportunites = await StatuOpportunite.find({societeRacine:societeRacine})

    return res.send({status:true,projetInternes:projetInternes,
        numeroAutomatique: numeroAutomatique.numero,
         statutOpportunites:statutOpportunites}) 
    
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
module.exports.routerProjetInterne=router
