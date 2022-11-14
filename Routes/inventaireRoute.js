const {Inventaire, getNumeroAutomatiqueInventaire} =require('../Models/inventaireModel')
const {Article} =require('../Models/articleModel')
const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel')
const {Categorie} =require('../Models/categorieModel')
var ObjectId = require('mongodb').ObjectID;
const {Personnel, validatePersonnel} =require('../Models/personnelModel')
const {Utilisateur} =require('../Models/utilisateurModel')


const {ArticleSociete, updateQteEnStock,updateQteTherique, updateQteTheriqueQteEnStock } =require('../Models/articleSocieteModel')

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
 *     Inventaire:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - magasin
 *         - categorie
 *         - cloture
 *         - personne
 *         - notes
 *         - ligneInventaire
 *       properties:
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *         magasin:
 *           type: string
 *         categorie:
 *           type: string
 *         cloture:
 *           type: boolean
 *         personne:
 *           type: string
 *         notes:
 *           type: string 
 *         ligneInventaire:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               numero:
 *                 type: number
 *               article:
 *                 type: string
 *               qteTeorique:
 *                 type: number
 *               qteInv1:
 *                 type: number
 *               qteInv2:
 *                 type: number
 *               qteInv3:
 *                 type: number
 *               qteInvValide:
 *                 type: number
 *               notes:
 *                 type: string 
 *         
 */

/**
 * @swagger
 * tags:
 *   name: Inventaires
 *   description: The Inventaires managing API
 */


/**
 * @swagger
 * paths:
 *   /inventaires/upload:
 *     post:
 *       summary: upload image
 *       tags: [Inventaires]
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
 * /inventaires/newInventaire:
 *   post:
 *     summary: Returns the list of all the Inventaires
 *     tags: [Inventaires]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                numero:
 *                  type: string
 *                date:
 *                  type: string
 *                magasin:
 *                  type: string
 *                categorie:
 *                  type: string
 *                cloture:
 *                  type: boolean
 *                personne:
 *                  type: string
 *                notes:
 *                  type: string 
 *                ligneInventaire:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      numero:
 *                        type: number
 *                      article:
 *                        type: string
 *                      qteTeorique:
 *                        type: number
 *                      qteInv1:
 *                        type: number
 *                      qteInv2:
 *                        type: number
 *                      qteInv3:
 *                        type: number
 *                      qteInvValide:
 *                        type: number
 *                      notes:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the Inventaires
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
 *                      type: string
 *                    date:
 *                      type: string
 *                    magasin:
 *                      type: string
 *                    categorie:
 *                      type: string
 *                    cloture:
 *                      type: boolean
 *                    personne:
 *                      type: string
 *                    notes:
 *                      type: string 
 *                    ligneInventaire:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          numero:
 *                            type: number
 *                          article:
 *                            type: string
 *                          qteTeorique:
 *                            type: number
 *                          qteInv1:
 *                            type: number
 *                          qteInv2:
 *                            type: number
 *                          qteInv3:
 *                            type: number
 *                          qteInvValide:
 *                            type: number
 *                          notes:
 *                            type: string
 *
 */
router.post('/newInventaire', verifytoken, async(req,res)=>{

    try{
    var societe = ObjectId(req.body.societe)
    var numeroAutomatique = await getNumeroAutomatiqueInventaire(societe)
 
    req.body.numero = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    const inventaire=new Inventaire(req.body);

    const result=await inventaire.save()

    var i = 0;

    // while(i < req.body.ligneInventaire.length){
        
    //     var qteValide = req.body.ligneInventaire[i].qteInvValide
    //     var articleSociete = await ArticleSociete.findOneAndUpdate({article:req.body.ligneInventaire[i].article, societe:societe}, {qteEnStock:Number(qteValide),  qteTheorique:Number(qteValide)})
    //     var stocks = articleSociete.stocks
    //     i++
    //     while(i < req.body.ligneInventaire.length && req.body.ligneInventaire[i].numero == 0){
    //         for(let k = 0; k < stocks.length; k++){
    //             if(req.body.ligneInventaire[i].sousProduit == stocks[k].sousProduit && req.body.ligneInventaire[i].lot == stocks[k].lot){
    //                 stocks[k].qteEnStock = req.body.ligneInventaire[i].qteInvValide
    //                 stocks[k].qteTheorique = req.body.ligneInventaire[i].qteInvValide
    //             }     
    //         }
    //         i++
    //         //var articleSociete2 = await ArticleSociete.findOneAndUpdate({_id:articleSociete.id}, {stocks:stocks})
    //     }
            
    // }

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
 * /inventaires/modifierInventaire/{id}:
 *   post:
 *     summary: Update the inventaire by id
 *     tags: [Inventaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Inventaire id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                  type: string
 *                numero:
 *                  type: string
 *                date:
 *                  type: string
 *                magasin:
 *                  type: string
 *                categorie:
 *                  type: string
 *                cloture:
 *                  type: boolean
 *                personne:
 *                  type: string
 *                notes:
 *                  type: string 
 *                ligneInventaire:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      numero:
 *                        type: number
 *                      article:
 *                        type: string
 *                      qteTeorique:
 *                        type: number
 *                      qteInv1:
 *                        type: number
 *                      qteInv2:
 *                        type: number
 *                      qteInv3:
 *                        type: number
 *                      qteInvValide:
 *                        type: number
 *                      notes:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the Inventaires
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
 *                       type: string
 *                     date:
 *                       type: string
 *                     magasin:
 *                       type: string
 *                     categorie:
 *                       type: string
 *                     cloture:
 *                       type: boolean
 *                     personne:
 *                       type: string
 *                     notes:
 *                       type: string 
 *                     ligneInventaire:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           numero:
 *                             type: number
 *                           article:
 *                             type: string
 *                           qteTeorique:
 *                             type: number
 *                           qteInv1:
 *                             type: number
 *                           qteInv2:
 *                             type: number
 *                           qteInv3:
 *                             type: number
 *                           qteInvValide:
 *                             type: number
 *                           notes:
 *                             type: string  
 *
 *
 */
router.post('/modifierInventaire/:id', verifytoken, async(req,res)=>{

    try{
    const inventaire = await Inventaire.findById(req.params.id)

    var societe = req.body.societe

    if(!inventaire) return res.status(401).send({status:false})

    // for(let i = 0; i < req.body.ligneInventaire.length; i++){
    //     var qteValide = req.body.ligneInventaire[i].qteInvValide
    //     const article = await ArticleSociete.findOneAndUpdate({article:req.body.ligneInventaire[i].article, societe:societe}, {qteEnStock:Number(qteValide),  qteTheorique:Number(qteValide)})
    // }

    const result = await Inventaire.findOneAndUpdate({_id:req.params.id}, req.body)

    const inventaire2 = await Inventaire.findById(req.params.id)

    return res.send({status:true,resultat:inventaire2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /inventaires/deleteInventaire/{id}:
 *   post:
 *     summary: Remove the inventaire by id
 *     tags: [Inventaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inventaire id
 *
 *     responses:
 *       200:
 *         description: The inventaire was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The inventaire was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteInventaire/:id', verifytoken, async(req,res)=>{

    try{
    const inventaire = await Inventaire.findById(req.params.id)

    if(!inventaire) return res.status(401).send({status:false})

    if(await Inventaire.findOneAndDelete({_id:req.params.id})){
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
 * /inventaires/listInventaires:
 *   post:
 *     summary: Returns the list of all the inventaires
 *     tags: [Inventaires]
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
 *         description: The list of the inventaires
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
 *                              type: string
 *                            date:
 *                              type: string
 *                            magasin:
 *                              type: string
 *                            categorie:
 *                              type: string
 *                            cloture:
 *                              type: boolean
 *                            personne:
 *                              type: string
 *                            notes:
 *                              type: string 
 *                            ligneInventaire:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  numero:
 *                                    type: number
 *                                  article:
 *                                    type: string
 *                                  qteTeorique:
 *                                    type: number
 *                                  qteInv1:
 *                                    type: number
 *                                  qteInv2:
 *                                    type: number
 *                                  qteInv3:
 *                                    type: number
 *                                  qteInvValide:
 *                                    type: number
 *                                  notes:
 *                                    type: string 
 *
 *
 *
 */

 router.post('/listInventaires', verifytoken, async(req,res)=>{
  
    try{
    var societe = ObjectId(req.body.magasin)

    var sort = {}
    for( let key in req.body.orderBy){
        if(Number(req.body.orderBy[key]) != 0){
             sort[key] = req.body.orderBy[key]
        }  
    }

    if(Object.keys(sort).length == 0){
        sort = { _id: -1 }
    }
   
    var pipeline = []

    pipeline.push({ $match : { societe:societe } } )

    pipeline.push({
        $lookup: {
          from: 'categories',
          let: { "categorie": "$categorie"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$categorie" ] },
                  ]
                }
              }
            },
         ],
          as:"categories"
        }
    })
   
    pipeline.push({
        $lookup: {
          from: 'utilisateurs',
          let: { "personne": "$personne"},
          pipeline: [{$match: 
              {$expr: {
                  "$and": [
                    { "$eq": [ "$_id", "$$personne" ] },
                  ]
                }
              }
            },
         ],
          as:"personnels"
        }
    })

    pipeline.push({
      $set: {
        categorie: { $arrayElemAt: ["$categories.libelle", 0] },
        personne: { $arrayElemAt: ["$personnels.nom", 0] },
        date:{ $dateToString: { 
            format: "%Y-%m-%d", date: "$date" 
        } },
        id:"$_id"
      }
    })

    pipeline.push({
       $project: { 
           id:1, 
           numero:1,
           date:1,
           categorie:1,
           cloture:1,
           personne:1,
           note:1,
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

    const articles = await Inventaire.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

    var nbrTotal = await Inventaire.aggregate(sommePipeline)

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
 * /inventaires/getById/{id}:
 *   get:
 *     summary: Remove the inventaire by id
 *     tags: [Inventaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inventaire id
 *
 *     responses:
 *       200:
 *         description: The inventaire was deleted
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
 *                       type: string
 *                     date:
 *                       type: string
 *                     magasin:
 *                       type: string
 *                     categorie:
 *                       type: string
 *                     cloture:
 *                       type: boolean
 *                     personne:
 *                       type: string
 *                     notes:
 *                       type: string 
 *                     ligneInventaire:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           numero:
 *                             type: number
 *                           article:
 *                             type: string
 *                           qteTeorique:
 *                             type: number
 *                           qteInv1:
 *                             type: number
 *                           qteInv2:
 *                             type: number
 *                           qteInv3:
 *                             type: number
 *                           qteInvValide:
 *                             type: number
 *                           notes:
 *                             type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The inventaire was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const inventaire = await Inventaire.findOne({_id:req.params.id})

    return res.send({status:true,resultat:inventaire})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.get('/getById2/:id', verifytoken, async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const inventaire = await Inventaire.findOne({_id:req.params.id}).populate('personne').populate('categorie')

    return res.send({status:true,resultat:inventaire})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /inventaires/getAllParametres:
 *   get:
 *     summary: 
 *     tags: [Inventaires]
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
 *                  articles:
 *                    type: array
 *                  categories:
 *                    type: array
 *                  societes:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', verifytoken, async(req,res)=>{
try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    
    var societe = ObjectId(req.params.id)
    var numeroAutomatique = await getNumeroAutomatiqueInventaire(societe)

    const categories = await Categorie.find({societeRacine:societeRacine})
    const personnels = await Utilisateur.find({societeRacine:societeRacine})

    return res.send({status:true, categories:categories, personnels:personnels, numeroAutomatique:numeroAutomatique.numero}) 
    
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
module.exports.routerInventaire=router
