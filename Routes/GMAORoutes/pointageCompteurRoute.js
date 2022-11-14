
const {PointageCompteur,getNumeroAutomatique} =require('../../Models/GMAOModels/pointageCompteurModel')

const {Vehicule} =require('../../Models/GMAOModels/vehiculeModel')
const {Chauffeur} =require('../../Models/GMAOModels/chauffeurModel')


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
 *     PointageCompteur:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - vehicule
 *         - chauffeur
 *         - valeurCompteur
 *         - notes
 *         - societeRacine
 *       properties:
 *         numero:
 *           type: number
 *         date:
 *           type: date
 *         vehicule:
 *           type: string
 *         chauffeur:
 *           type: string
 *         valeurCompteur:
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
 *   name: PointageCompteurs
 *   description: The PointageCompteurs managing API
 */


/**
 * @swagger
 * paths:
 *   /pointageCompteurs/upload:
 *     post:
 *       summary: upload image
 *       tags: [PointageCompteurs]
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
 * /pointageCompteurs/newPointageCompteur:
 *   post:
 *     summary: Returns the list of all the PointageCompteurs
 *     tags: [PointageCompteurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                numero:
 *                  type: number
 *                date:
 *                  type: date
 *                vehicule:
 *                  type: string
 *                chauffeur:
 *                  type: string
 *                valeurCompteur:
 *                  type: number
 *                notes:
 *                  type: string
 *                societeRacine:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the PointageCompteurs
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
 *                    numero:
 *                      type: number
 *                    date:
 *                      type: date
 *                    vehicule:
 *                      type: string
 *                    chauffeur:
 *                      type: string
 *                    valeurCompteur:
 *                      type: number
 *                    notes:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newPointageCompteur', async(req,res)=>{
  try{
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))
    var chiffres = ['0','1','2','3','4','5','6','7','8','9']

    var number = ""
    for(let i = 0; i < body.numero.length; i++){
      if(chiffres.includes(body.numero[i])){
        number += body.numero[i]
      }else{
        number = ""
      }
    }

    body.num = Number(number)
    const pointageCompteur=new PointageCompteur(body);

    const result=await pointageCompteur.save()

    return res.send({status:true,resultat:result})
    
  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /pointageCompteurs/modifierPointageCompteur/{id}:
 *   post:
 *     summary: Update the PointageCompteur by id
 *     tags: [PointageCompteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PointageCompteur id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: string
 *                numero:
 *                 type: number
 *                date:
 *                 type: date
 *                vehicule:
 *                 type: string
 *                chauffeur:
 *                 type: string
 *                valeurCompteur:
 *                 type: number
 *                notes:
 *                 type: string
 *                societeRacine:
 *                 type: string
 *     responses:
 *       200:
 *         description: The list of the PointageCompteurs
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
 *                     numero:
 *                      type: number
 *                     date:
 *                      type: date
 *                     vehicule:
 *                      type: string
 *                     chauffeur:
 *                      type: string
 *                     valeurCompteur:
 *                      type: number
 *                     notes:
 *                      type: string
 *                     societeRacine:
 *                      type: string  
 *
 *
 */

router.post('/modifierPointageCompteur/:id', async(req,res)=>{
  try{
    const pointageCompteur = await PointageCompteur.findById(req.params.id)

    if(!pointageCompteur) return res.status(401).send({status:false})

    var chiffres = ['0','1','2','3','4','5','6','7','8','9']
    var body = req.body 
    
    body.societeRacine = pointageCompteur.societeRacine
    var number = ""
    for(let i = 0; i < body.numero.length; i++){
      if(chiffres.includes(body.numero[i])){
        number += body.numero[i]
      }else{
        number = ""
      }
    }

    body.num = Number(number)

    const result = await PointageCompteur.findOneAndUpdate({_id:req.params.id}, body)

    const pointageCompteur2 = await PointageCompteur.findById(req.params.id)

    return res.send({status:true,resultat:pointageCompteur2})

  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /pointageCompteurs/deletePointageCompteur/{id}:
 *   post:
 *     summary: Remove the PointageCompteur by id
 *     tags: [PointageCompteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PointageCompteur id
 *
 *     responses:
 *       200:
 *         description: The PointageCompteur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The PointageCompteur was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deletePointageCompteur/:id', async(req,res)=>{

  try{
    const pointageCompteur = await PointageCompteur.findById(req.params.id)

    if(!pointageCompteur) return res.status(401).send({status:false})

    if(await PointageCompteur.findOneAndDelete({_id:req.params.id})){
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
 * /pointageCompteurs/listPointageCompteurs:
 *   post:
 *     summary: Returns the list of all the PointageCompteurs
 *     tags: [PointageCompteurs]
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
 *         description: The list of the PointageCompteurs
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
 *                            numero:
 *                              type: number
 *                            date:
 *                              type: date
 *                            vehicule:
 *                              type: string
 *                            chauffeur:
 *                              type: string
 *                            valeurCompteur:
 *                              type: number
 *                            notes:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *
 *
 *
 */
router.post('/listPointageCompteurs', async(req,res)=>{

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
    
    pipeline.push({
        $lookup: {
          from: 'chauffeurs',
          let: { "chauffeur": "$chauffeur"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$chauffeur" ] },
                  ]
                }
              }
            },
         ],
          as:"chauffeurs"
        }
    })
    pipeline.push({
        $lookup: {
          from: 'vehicules',
          let: { "vehicule": "$vehicule"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$vehicule" ] },
                  ]
                }
              }
            },
         ],
          as:"vehicules"
        }
    })
    pipeline.push({
      $set: {
        vehicule: { $arrayElemAt: ["$vehicules.libelle", 0] },
        chauffeur: { $arrayElemAt: ["$chauffeurs.nom", 0] },
        valeurCompteur:{ $toString: "$valeurCompteur" },
        date:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$date" 
        } },
        id:"$_id"
      }
    })
    pipeline.push({
       $project: { 
           id:1, 
           vehicule:1,
           chauffeur:1,
           date:1,
           numero:1,
           valeurCompteur:1,
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

    const articles = await PointageCompteur.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await PointageCompteur.aggregate(sommePipeline)

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
 * /pointageCompteurs/getById/{id}:
 *   get:
 *     summary: Remove the PointageCompteur by id
 *     tags: [PointageCompteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PointageCompteur id
 *
 *     responses:
 *       200:
 *         description: The PointageCompteur was deleted
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
 *                     numero:
 *                       type: number
 *                     date:
 *                       type: date
 *                     vehicule:
 *                       type: string
 *                     chauffeur:
 *                       type: string
 *                     valeurCompteur:
 *                       type: number
 *                     notes:
 *                       type: string
 *                     societeRacine:
 *                       type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The PointageCompteur was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    var pointageCompteur = await PointageCompteur.findOne({_id:req.params.id})

    return res.send({status:true,resultat:pointageCompteur})

  } catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /pointageCompteurs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [PointageCompteurs]
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
 *                  chauffeurs:
 *                    type: array   
 *                  pointageCompteurs:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', async(req,res)=>{
  
  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

    const chauffeurs = await Chauffeur.find({societeRacine:societeRacine})
    const vehicules = await Vehicule.find({societeRacine:societeRacine})
    const pointageCompteurs = await PointageCompteur.find({societeRacine:societeRacine})

    const numero = await getNumeroAutomatique(societeRacine)

    return res.send({status:true, chauffeurs:chauffeurs,
        pointageCompteurs:pointageCompteurs,vehicules:vehicules,
        numero:numero}) 
    
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
module.exports.routerPointageCompteur=router
