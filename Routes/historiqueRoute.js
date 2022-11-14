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

module.exports.routerHistorique=router
