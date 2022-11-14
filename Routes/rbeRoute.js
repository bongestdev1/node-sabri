
const { ProjetInterne, getNumeroAutomatique } = require('../Models/projetInterneModel')

const { StatuOpportunite } = require('../Models/statuOpportuniteModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel');
const { BonLivraison } = require('../Models/bonLivraisonModel');
const { BonCasse } = require('../Models/bonCasseModel');
const { CorrectionStock } = require('../Models/correctionStockModel');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now())
  }
})


var upload = multer({ storage: storage })


router.post('/getRbe/:idArticle', verifytoken, async (req, res) => {

  try{
  const societe = ObjectId(req.body.societe)

  var dateStart = new Date()
  var dateEnd = new Date()

  if (req.body.dateStart) {
    dateStart = new Date(req.body.dateStart)
  }

  if (req.body.dateEnd) {
    dateEnd = new Date(req.body.dateEnd)
  }

  if (!ObjectId.isValid(req.params.idArticle)) return res.status(400).send({ status: false })

  var pipeline = []

  pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

  pipeline.push({
    $lookup: {
      from: 'bonlivraisonarticles',
      let: { article: ObjectId(req.params.idArticle), bonLivraison: "$_id" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$$article", "$article"] },
              { "$eq": ["$$bonLivraison", "$bonLivraison"] },
            ]
          },
        }
      }],
      as: "bonlivraisonarticles",
    },
  })

  pipeline.push({
    $lookup: {
      from: "clients",
      let: { client: "$client" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$_id", "$$client"] }],
            },
          },
        },
      ],
      as: "clients",
    },
  });

  pipeline.push({
    $unwind:
    {
      path: "$bonlivraisonarticles"
    }
  })


  pipeline.push({
    $lookup: {
      from: 'liltrages',
      let: { "document": { $toString: "$_id" }, "dateDocument": "$date" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$document", "$$document"] },
            ]
          },

          montantAPayer: { $ne: 0 }
        }

      },
      {
        $lookup: {
          from: 'reglements',
          let: { "reglement": { $convert: { input: '$reglement', to: 'objectId', onError: null, onNull: null } } },
          pipeline: [{
            $match:
            {
              $expr: {
                "$and": [
                  { "$eq": ["$_id", "$$reglement"] },
                ]
              }
            }
          },

          {
            $lookup: {
              from: 'modereglements',
              let: { "modeReglement": "$modeReglement" },
              pipeline: [{
                $match:
                {
                  $expr: {
                    "$and": [
                      { "$eq": ["$_id", "$$modeReglement"] },
                    ]
                  }
                }
              },
              ],
              as: "modereglements"
            }
          },

          {
            $set: {
              modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
            }
          },
          {
            $project: {
              id: 1,
              modeReglement: 1,
              tresorerie: 1,
              montant: 1,
              dateReglement: 1,
              numCheque: 1,
              dateEcheance: 1,
              situationReglement: 1,
              notes: 1,
              reste: 1,
              numero: 1
            }
          }
          ],
          as: "reglements"
        },
      },
      {
        $set: {
          numeroReglement: { $arrayElemAt: ["$reglements.numero", 0] },
          dateReglement: { $arrayElemAt: ["$reglements.dateReglement", 0] },
          modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
          dateDocument: "$$dateDocument",
          id: "$_id",
        },
      },
      {
        $project: {
          numeroReglement: 1,
          dateReglement: 1,
          modeReglement: 1,
          montantAPayer: 1,
          dateDocument: 1,
          nbj: { $dateDiff: { startDate: "$dateDocument", endDate: "$dateReglement", unit: "day" } },
          montantNbj: { $multiply: [{ $dateDiff: { startDate: "$dateDocument", endDate: "$dateReglement", unit: "day" } }, "$montantAPayer"] },
          id: 1,
          _id: 0
        }
      },

      ],
      as: "liltrages"
    }
  })


  pipeline.push({
    $unwind:
    {
      path: "$bonlivraisonarticles.bonReceptions"
    }
  })

   pipeline.push({
    $lookup: {
      from: "bonreceptions",
      let: { bonReception: "$bonlivraisonarticles.bonReceptions.bonReception" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$_id", "$$bonReception"] }],
            },
          },
        },
      ],
      as: "bonreceptions2",
    },
  })

  pipeline.push({
    $unwind:
    {
      path: "$bonreceptions2"
    }
  })

  pipeline.push({
    $group:
    {
      _id: "$_id",
      client: { $first: { $first: "$clients" } },
      date: { $first: "$date" },
      totalTTC: { $first: "$totalTTC" },
      numero: { $first: "$numero" },
      liltrages: { $first: "$liltrages" },
      bonlivraisonarticles: { $first: "$bonlivraisonarticles" },
      bonReceptions2: { $push: "$bonreceptions2" },
      bonReceptions1: { $push: "$bonlivraisonarticles.bonReceptions" }
    }
  })

  pipeline.push({
    $set: {
      nbj: { $sum: "$liltrages.nbj" },
      aaa: { $divide: [{ $sum: "$liltrages.montantNbj" }, "$totalTTC"] },
      id: "$_id",
    }
  })

  pipeline.push({
    $set: {
      montantAfterMultiply: { $multiply: ["$aaa", "$totalTTC"] }
    }
  })

  pipeline.push({
    $set: {
      dlm: { $divide: [ "$montantAfterMultiply", "$totalTTC"] },
    }
  })

  const bonLivraisons1 = await BonLivraison.aggregate(pipeline)

  var bonLivraisons = JSON.parse(JSON.stringify(bonLivraisons1))



 // console.log(bonLivraisons)

  sommePrixRevientTTC =  0

  for(let i = 0; i < bonLivraisons.length; i++){
    var sommeDMS = 0
    for(let j = 0; j < bonLivraisons[i].bonReceptions1.length; j++){
      var date1 = new Date(bonLivraisons[i].bonReceptions2[j].date);
      var date2 = new Date(bonLivraisons[i].date);
      var Time = date2.getTime() - date1.getTime();
      var days = Time / (1000 * 3600 * 24);
      sommeDMS += days * bonLivraisons[i].bonReceptions1[j].quantite
      
    }

    bonLivraisons[i].dms = sommeDMS / bonLivraisons[i].bonlivraisonarticles.quantiteVente
    bonLivraisons[i].dma = bonLivraisons[i].dms + bonLivraisons[i].dlm
    bonLivraisons[i].qteFoisDma = bonLivraisons[i].dma * bonLivraisons[i].bonlivraisonarticles.quantiteVente
    bonLivraisons[i].quantiteVente = bonLivraisons[i].bonlivraisonarticles.quantiteVente
   
    if(bonLivraisons[i].totalTTC > 0){
      sommePrixRevientTTC += bonLivraisons[i].bonlivraisonarticles.prixRevient +  bonLivraisons[i].bonlivraisonarticles.prixRevient * bonLivraisons[i].bonlivraisonarticles.tauxTVA/100
    }
    
    bonLivraisons[i].raisonSociale = bonLivraisons[i].client.raisonSociale
    bonLivraisons[i].montantTotal = bonLivraisons[i].totalTTC
    
    bonLivraisons[i].totalTTC = undefined
    bonLivraisons[i].client = undefined
    bonLivraisons[i].bonReceptions1 = undefined
    bonLivraisons[i].bonReceptions2 = undefined
    bonLivraisons[i].bonlivraisonarticles = undefined
    bonLivraisons[i].dlm = undefined
    bonLivraisons[i].dms = undefined
    bonLivraisons[i].liltrages = undefined
    bonLivraisons[i].nbj = undefined
    bonLivraisons[i].montantAfterMultiply = undefined
    bonLivraisons[i].aaa = undefined
    bonLivraisons[i]._id = undefined
  }

  for(let i = 0; i < bonLivraisons.length; i++){
    bonLivraisons[i].prixRevientTTC = sommePrixRevientTTC / bonLivraisons.length
  }

  var pipelineBonCasse = []

  pipelineBonCasse.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

  pipelineBonCasse.push({
    $lookup: {
      from: 'boncassearticles',
      let: { article: ObjectId(req.params.idArticle), bonCasse: "$_id" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$$article", "$article"] },
              { "$eq": ["$$bonCasse", "$bonCasse"] },
            ]
          },
        }
      }],
      as: "boncassearticles",
    },
  })

  pipelineBonCasse.push({
    $unwind:
    {
      path: "$boncassearticles"
    }
  })

  const bonCasses = await BonCasse.aggregate(pipelineBonCasse)
  
  var quantite = 0
  
  for(let i = 0; i < bonCasses.length; i++){
    if(bonCasses[i].boncassearticles.quantiteVente > 0){
      quantite += bonCasses[i].boncassearticles.quantiteVente
    }
  }

  if(quantite >  0){
    bonLivraisons.push({
      qteFoisDma : 0,
      quantiteVente : quantite,
      raisonSociale : "Casse",
      montantTotal : 0,
      dma : 0
    })
  }
  
  var pipelineCorrectionStock = []

  pipelineCorrectionStock.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

  pipelineCorrectionStock.push({
    $project: {
      date: 1,
      ligneCorrectionStocks: {
        $filter: {
          input: "$ligneCorrectionStocks",
          as: "item",
          cond: { "$eq": ["$$item.article", ObjectId(req.params.idArticle)] }
        }
      }
    }
  })

  pipelineCorrectionStock.push({
    $unwind:
    {
      path: "$ligneCorrectionStocks"
    }
  })

  const correctionstocks = await CorrectionStock.aggregate(pipelineCorrectionStock)
  console.log(correctionstocks)

  var quantite = 0
  
  for(let i = 0; i < correctionstocks.length; i++){
    if(correctionstocks[i].ligneCorrectionStocks.qteDifference < 0){
      quantite += correctionstocks[i].ligneCorrectionStocks.qteDifference
    }
  }

  if(quantite < 0){
    bonLivraisons.push({
      qteFoisDma : 0,
      quantiteVente : -1 * quantite,
      raisonSociale : "Correction stocks",
      montantTotal : 0,
      dma : 0
    })
  }
     
  return res.send({ status: true, listGlobal: bonLivraisons, request: req.body })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})

router.post('/getAllParametres', verifytoken, async (req, res) => {
 try{
  var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
  var exercice = req.body.exercice
  var numeroAutomatique = await getNumeroAutomatique(societeRacine, exercice)

  const projetInternes = await ProjetInterne.find({ societeRacine: societeRacine })

  const statutOpportunites = await StatuOpportunite.find({ societeRacine: societeRacine })

  return res.send({
    status: true, projetInternes: projetInternes,
    numeroAutomatique: numeroAutomatique.numero,
    statutOpportunites: statutOpportunites
  })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


function verifytoken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, 'secretkey', (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.user = authData;
        next();
      }
    });

  } else {
    console.log("etape100");
    res.sendStatus(401);
  }
}
module.exports.routerRbe = router
