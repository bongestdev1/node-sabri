const {ReglementFournisseur} =require('../Models/reglementFournisseurModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')
const {Client} =require('../Models/clientModel')
const {Fournisseur} =require('../Models/fournisseurModel')
const {ModeReglement} =require('../Models/modeReglementModel')
var ObjectId = require('mongodb').ObjectID;

const {BonRetourClient} =require('../Models/bonRetourClientModel')
const {BonLivraison} =require('../Models/bonLivraisonModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { consolelog } = require('../Models/errorModel');

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
 *     reglement:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         client:
 *           type: string
 *         modeReglement:
 *           type: string
 *         tresorerie:
 *           type: string
 *         montant:
 *           type: number
 *         dateReglement:
 *           type: date
 *         numCheque:
 *           type: number
 *         dateEcheance:
 *           type: string
 *         notes:
 *           type: string
 * 
 */

/**
 * @swagger
 * tags:
 *   name: Reglements
 *   description: The Reglements managing API
 */


/**
 * @swagger
 * paths:
 *   /reglements/upload:
 *     post:
 *       summary: upload image
 *       tags: [Reglements]
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
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



/**
 * @swagger
 * /reglementFournisseurs/newReglementFournisseur:
 *   post:
 *     summary: Returns the list of all the Reglements
 *     tags: [ReglementFournisseurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                client:
 *                  type: string
 *                modeReglement:
 *                  type: string
 *                tresorerie:
 *                  type: string
 *                montant:
 *                  type: number
 *                dateReglement:
 *                  type: date
 *                numCheque:
 *                  type: number
 *                dateEcheance:
 *                  type: string
 *                notes:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the reglements
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
 *                    client:
 *                      type: string
 *                    modeReglement:
 *                      type: string
 *                    tresorerie:
 *                      type: string
 *                    montant:
 *                      type: number
 *                    dateReglement:
 *                      type: date
 *                    numCheque:
 *                      type: number
 *                    dateEcheance:
 *                      type: string
 *                    notes:
 *                      type: string
 *
 */
router.post('/newReglementFournisseur', verifytoken, async(req,res)=>{

  try{
    //const {error}=validateReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})


    const reglement=new ReglementFournisseur(req.body);

    const fournisseur = await Fournisseur.findById(req.body.fournisseur)
    if(!fournisseur) return res.status(401).send({status:false})
    const result2 = await Fournisseur.findOneAndUpdate({_id:req.body.fournisseur},{credit:fournisseur.credit + req.body.montant})
   
    const result=await reglement.save()


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
 * /reglementFournisseurs/modifierReglementFournisseur/{id}:
 *   post:
 *     summary: Update the reglementFournisseur by id
 *     tags: [ReglementFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglementFournisseur id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                client:
 *                  type: string
 *                modeReglement:
 *                  type: string
 *                tresorerie:
 *                  type: string
 *                montant:
 *                  type: number
 *                dateReglement:
 *                  type: date
 *                numCheque:
 *                  type: number
 *                dateEcheance:
 *                  type: string
 *                notes:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the reglements
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
 *                     client:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     tresorerie:
 *                       type: string
 *                     montant:
 *                       type: number
 *                     dateReglement:
 *                       type: date
 *                     numCheque:
 *                       type: number
 *                     dateEcheance:
 *                       type: string
 *                     notes:
 *                       type: string
 *
 *
 */

router.post('/modifierReglementFournisseur/:id', verifytoken, async(req,res)=>{

  try{
   // const {error}=validateReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const reglement = await ReglementFournisseur.findById(req.params.id)

    if(!reglement) return res.status(401).send({status:false})

    
    
    const result = await ReglementFournisseur.findOneAndUpdate({_id:req.params.id}, req.body)

    
    if(req.body.client){
        const client = await Client.findById(req.body.client)
        if(!client) return res.status(401).send({status:false}) 

        const result2 = await Client.findOneAndUpdate({_id:req.body.client},{credit:client.credit - reglement.montant + req.body.montant})
    }else if(req.body.fournisseur){
        const fournisseur = await Fournisseur.findById(req.body.fournisseur)
        if(!fournisseur) return res.status(401).send({status:false}) 

        const result2 = await Fournisseur.findOneAndUpdate({_id:req.body.fournisseur},{credit:fournisseur.credit - reglement.montant + req.body.montant})
    }

    const reglement2 = await ReglementFournisseur.findById(req.params.id)

    return res.send({status:true,resultat:reglement2})
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /reglementFournisseurs/deleteReglementFournisseur/{id}:
 *   post:
 *     summary: Remove the reglementFournisseur by id
 *     tags: [ReglementFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglementFournisseur id
 *
 *     responses:
 *       200:
 *         description: The reglementFournisseur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The reglementFournisseur was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteReglementFournisseur/:id', verifytoken, async(req,res)=>{

  try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const reglement = await ReglementFournisseur.findById(req.params.id)

    if(!reglement) return res.status(401).send({status:false})

    if(req.body.client){
        const client = await Client.findById(req.body.client)
        if(!client) return res.status(401).send({status:false}) 

        const result2 = await Client.findOneAndUpdate({_id:req.body.client},{credit:client.credit - reglement.montant})
    }else if(req.body.fournisseur){
        const fournisseur = await Fournisseur.findById(req.body.fournisseur)
        if(!fournisseur) return res.status(401).send({status:false}) 

        const result2 = await Fournisseur.findOneAndUpdate({_id:req.body.fournisseur},{credit:fournisseur.credit - reglement.montant})
    }


    if(await Reglement.findOneAndDelete({_id:req.params.id})){
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
 * /reglementFournisseurs/listReglementFournisseurs:
 *   post:
 *     summary: Returns the list of all the reglementFournisseurs
 *     tags: [ReglementFournisseurs]
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
 *         description: The list of the ReglementFournisseurs
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
 *                            client:
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
 router.post('/listReglementFournisseurs', verifytoken, async(req,res)=>{
  
  try{
    var dateStart =new Date(req.body.dateStart)
    var dateEnd = new Date(req.body.dateEnd)
    var societe = ObjectId(req.body.magasin)
    
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
    
    
    pipeline.push({ $match : { dateReglement: { $lte: dateEnd, $gte: dateStart}, societe:societe } } )

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
        fournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
       
        montant:{ $toString: "$montant" },
        numCheque:{ $toString: "$numCheque" },
        
        dateReglement:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$dateReglement" 
        } },

        dateEcheance:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$dateEcheance" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           fournisseur:1,
           modeReglement:1,
           tresorerie:1,
           montant:1,
           dateReglement:1,
           numCheque:1,
           dateEcheance:1,
           notes:1
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

    const articles = await ReglementFournisseur.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await ReglementFournisseur.aggregate(sommePipeline)

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
 * /reglementFournisseurs/listEcheances:
 *   post:
 *     summary: Returns the list of all the reglementFournisseurs
 *     tags: [ReglementFournisseurs]
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
 *         description: The list of the ReglementFournisseurs
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
 *                            client:
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
 router.post('/listEcheances', verifytoken, async(req,res)=>{
  
  try{
  var dateStart =new Date(req.body.dateStart)
  var dateEnd = new Date(req.body.dateEnd)
  var societe = ObjectId(req.body.magasin)
  
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
  
  
  pipeline.push({ $match : {  numCheque: { $ne: "" },dateEcheance: { $lte: dateEnd, $gte: dateStart}, societe:societe } } )

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
      fournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
      modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
     
      montant:{ $toString: "$montant" },
      numCheque:{ $toString: "$numCheque" },
      
      dateReglement:{ $dateToString: { 
          format: "%Y-%m-%d", date: "$dateReglement" 
      } },

      dateEcheance:{ $dateToString: { 
          format: "%Y-%m-%d", date: "$dateEcheance" 
      } },
      id:"$_id"
    }
  })

  pipeline.push({
     $project: { 
         id:1, 
         fournisseur:1,
         modeReglement:1,
         tresorerie:1,
         montant:1,
         dateReglement:1,
         numCheque:1,
         dateEcheance:1,
         notes:1
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

  const articles = await ReglementFournisseur.aggregate(pipeline)

  sommePipeline.push({
    $count: "total"
  })

  var nbrTotal = await ReglementFournisseur.aggregate(sommePipeline)

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
 * /reglementFournisseurs/getById/{id}:
 *   get:
 *     summary: Remove the reglementFournisseur by id
 *     tags: [ReglementFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglementFournisseur id
 *
 *     responses:
 *       200:
 *         description: The reglementFournisseur was deleted
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
 *         description: The reglementFournisseur was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

  try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const reglementFournisseur = await ReglementFournisseur.findOne({_id:req.params.id})

    return res.send({status:true,resultat:reglementFournisseur})

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /reglementFournisseurs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [ReglementFournisseurs]
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
 *                  clients:
 *                    type: array
 *                  fournisseurs:
 *                    type: array
 *                  modeLivraisons:
 *                    type: array
 *                  
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{

  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
  const fournisseurs = await Fournisseur.find({societeRacine:societeRacine})
  const modeReglements = await ModeReglement.find({societeRacine:societeRacine})

  return res.send({status:true, modeReglements:modeReglements, fournisseurs:fournisseurs}) 
  
} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


/**
 * @swagger
 * /reglementFournisseurs/getByIdClient/{id}:
 *   post:
 *     summary: Remove the reglementFournisseurs by id
 *     tags: [ReglementFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ReglementFournisseurs id
 * 
 *     responses:
 *       200:
 *         description: The ReglementFournisseurs was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     raisonSociale:
 *                       type: string
 *                     matriculeFiscale:
 *                       type: string
 *                     classement:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     statusProspection:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     paysFacturation:
 *                       type: string
 *                     gouvernoratFacturation:
 *                       type: string
 *                     delegationFacturation:
 *                       type: string
 *                     localiteFacturation:
 *                       type: string
 *                     codePostaleFacturation:
 *                       type: string
 *                     adresseFacturation:
 *                       type: string
 *                     paysLivraison:
 *                       type: string
 *                     gouvernoratLivraison:
 *                       type: string
 *                     delegationLivraison:
 *                       type: string
 *                     localiteLivraison:
 *                       type: string
 *                     codePostaleLivraison:
 *                       type: string
 *                     adresseLivraison:
 *                       type: string
 *                     autresAdresse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           pays:
 *                             type: string
 *                           gouvernorat:
 *                             type: string
 *                           delegation:
 *                             type: string
 *                           localite:
 *                             type: string
 *                           codePostale:
 *                             type: string
 *                           adresse:
 *                             type: string
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           civilite:
 *                             type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           valeur:
 *                             type: string
 *                           imprimable:
 *                             type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
 router.post('/getByIdClient/:id', verifytoken, async(req,res)=>{
    try{
    var dateStart = new Date(req.body.dateStart)
    var dateEnd = new Date(req.body.dateEnd)

    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})
  
    const client = await Client.findOne({_id:req.params.id})
  
    const reglements = await ReglementFournisseur.find({client:req.params.id, dateReglement:{ $gte: dateStart, $lte: dateEnd}}).populate({path:"client",select:"_id, raisonSociale"})

    const bonRetours = await BonRetourClient.find({client:req.params.id, date:{ $gte: dateStart, $lte: dateEnd}}).populate({path:"client",select:"_id, raisonSociale"})
    
    const bonLivs = await BonLivraison.find({client:req.params.id, date:{ $gte: dateStart, $lte: dateEnd}}).populate({path:"client",select:"_id, raisonSociale"})
   
    return res.send({status:true,reglements:reglements,bonRetours:bonRetours,bonLivs:bonLivs,request:req.body })
  
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

  })

  /**
 * @swagger
 * /reglementFournisseurs/getByIdClientCredit/{id}:
 *   post:
 *     summary: Remove the reglementFournisseurs by id
 *     tags: [ReglementFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglementFournisseurs id
 * 
 *     responses:
 *       200:
 *         description: The reglementFournisseurs was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     raisonSociale:
 *                       type: string
 *                     matriculeFiscale:
 *                       type: string
 *                     classement:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     statusProspection:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     paysFacturation:
 *                       type: string
 *                     gouvernoratFacturation:
 *                       type: string
 *                     delegationFacturation:
 *                       type: string
 *                     localiteFacturation:
 *                       type: string
 *                     codePostaleFacturation:
 *                       type: string
 *                     adresseFacturation:
 *                       type: string
 *                     paysLivraison:
 *                       type: string
 *                     gouvernoratLivraison:
 *                       type: string
 *                     delegationLivraison:
 *                       type: string
 *                     localiteLivraison:
 *                       type: string
 *                     codePostaleLivraison:
 *                       type: string
 *                     adresseLivraison:
 *                       type: string
 *                     autresAdresse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           pays:
 *                             type: string
 *                           gouvernorat:
 *                             type: string
 *                           delegation:
 *                             type: string
 *                           localite:
 *                             type: string
 *                           codePostale:
 *                             type: string
 *                           adresse:
 *                             type: string
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           civilite:
 *                             type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           valeur:
 *                             type: string
 *                           imprimable:
 *                             type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
 router.post('/getByIdClientCredit/:id', verifytoken, async(req,res)=>{

  try{
    var dateYestr = new Date(req.body.dateYestr) - 1
    console.log(dateYestr)

    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})
  
    const client = await Client.findOne({_id:req.params.id})
  
    const reglements = await ReglementFournisseur.find({client:req.params.id, dateReglement:{ $lte: dateYestr}}).populate({path:"client",select:"_id, raisonSociale"})

    const bonRetours = await BonRetourClient.find({client:req.params.id, date:{ $lte: dateYestr}}).populate({path:"client",select:"_id, raisonSociale"})
    
    const bonLivs = await BonLivraison.find({client:req.params.id, date:{ $lte: dateYestr}}).populate({path:"client",select:"_id, raisonSociale"})
   
    return res.send({status:true,reglements:reglements,bonRetours:bonRetours,bonLivs:bonLivs,request:req.body })
 
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

module.exports.routerReglementFournisseur=router
