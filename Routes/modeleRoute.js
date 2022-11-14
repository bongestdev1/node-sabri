const {Modele, validateModele, getNumeroAutomatiqueModele} =require('../Models/modeleModel')
const {Marque} =require('../Models/marqueModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

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
 *     Modele:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *         marque:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Modeles
 *   description: The Modeles managing API
 */


/**
 * @swagger
 * paths:
 *   /modeles/upload:
 *     post:
 *       summary: upload image
 *       tags: [Modeles]
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
 * /modeles/newModele:
 *   post:
 *     summary: Returns the list of all the Modeles
 *     tags: [Modeles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                marque:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the Modeles
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
 *                    marque:
 *                      type: string
 *
 */

router.post('/newModele',verifytoken , async(req,res)=>{

  try{
    //const {error}=validateModele(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
    var numero = getNumeroAutomatiqueModele(body.societeRacine)
    body.num = numero.num
    
    const modele=new Modele(body);

    const result=await modele.save()

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
 * /modeles/modifierModele/{id}:
 *   post:
 *     summary: Update the Modele by id
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Modele id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                marque:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Modeles
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
 *                     marque:
 *                       type: string
 *
 */

router.post('/modifierModele/:id',verifytoken , async(req,res)=>{

  try{
    //const {error}=validateModele(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const modele = await Modele.findById(req.params.id)

    if(!modele) return res.status(401).send({status:false})


    const result = await Modele.findOneAndUpdate({_id:req.params.id}, req.body)

    const modele2 = await Modele.findById(req.params.id)

    return res.send({status:true,resultat:modele2})
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /modeles/deleteModele/{id}:
 *   post:
 *     summary: Remove the modele by id
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Modele id
 *
 *     responses:
 *       200:
 *         description: The Modele was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Modele was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteModele/:id',verifytoken , async(req,res)=>{

  try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const modele = await Modele.findById(req.params.id)

    if(!modele) return res.status(401).send({status:false})


    if(await Modele.findOneAndDelete({_id:req.params.id})){
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
 * /modeles/listModeles:
 *   post:
 *     summary: Returns the list of all the Modeles
 *     tags: [Modeles]
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
 *         description: The list of the Modeles
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
 *                            marque:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listModeles',verifytoken , async(req,res)=>{
  
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
    pipeline.push({ $match : { societeRacine:societeRacine } } )
    
    pipeline.push({
      $lookup: {
        from: 'marques',
        let: { "marque": "$marque"},
        pipeline: [{$match: 
          {$expr: {
              "$and": [
                { "$eq": [ "$_id", "$$marque" ] },
              ]
            }
          }
        }],
        as:"marques"
      }
    })

    
    pipeline.push({
      $set: {
        marque: { $arrayElemAt: ["$marques.libelle", 0] },
        id:"$_id",
      }
    })

    pipeline.push({
       $project: { id:1, libelle:1, marque:1}
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

    const articles = await Modele.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

   
    var nbrTotal = await Modele.aggregate(sommePipeline)

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
 * /modeles/getById/{id}:
 *   get:
 *     summary: Remove the Modele by id
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Modele id
 *
 *     responses:
 *       200:
 *         description: The Modele was deleted
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
 *                     marque:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Modele was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken , async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const modele = await Modele.findOne({_id:req.params.id})

    return res.send({status:true,resultat:modele})
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /modeles/getAllParametres:
 *   get:
 *     summary: Remove the modele by id
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The modele id
 * 
 *     responses:
 *       200:
 *         description: The modele was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  marques:
 *                    type: array         
 *       404:
 *         description: The modele was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id',verifytoken , async(req,res)=>{

  try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    const marques = await Marque.find({societeRacine:societeRacine})
    
    return res.send({status:true, marques:marques }) 
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

module.exports.routerModele=router
