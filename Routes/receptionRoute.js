const { BonAchatArticle } = require('../Models/bonAchatArticleModel')
const { BonAchat } = require('../Models/bonAchatModel')

const { Reception, getNumeroAutomatique } = require('../Models/receptionModel')

const { Article, getArticlesWithQuantites } = require('../Models/articleModel')

const { ChargeDirecte } = require('../Models/chargeDirecteModel')
const { ArticleSociete, updateQteEnStock, updateQteTherique, updateQteTheriqueQteEnStock } = require('../Models/articleSocieteModel')
var ObjectId = require('mongodb').ObjectID;

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')

const { Fournisseur } = require('../Models/fournisseurModel')
const { BonCommande } = require('../Models/bonCommandeModel')
const { BonCommandeArticle } = require('../Models/bonCommandeArticleModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Reglement, setLiltrageBonAchat, getReglementsByDocuments } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { Transporteur } = require('../Models/transporteursModel')
const { consolelog } = require('../Models/errorModel')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now())
  }
})


var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     BonAchat:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - tiers
 *         - plafondCredit
 *         - credit
 *         - restPayer
 *         - montantPaye
 *         - totalRedevance
 *         - totalFodec
 *         - escompte
 *         - montantEscompte
 *         - totalRemise
 *         - totalDC
 *         - totaleHT
 *         - totalTVA
 *         - tFiscale
 *         - totalTTC
 *         - totalGain
 *         - ligneBLs
 *       properties:
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *         tiers:
 *           type: string
 *         plafondCredit:
 *           type: number
 *         credit:
 *           type: number
 *         restPayer:
 *           type: number
 *         totalTTC:
 *           type: number
 *         totalGain:
 *           type: number 
 *         ligneBLs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               article:
 *                 type: string
 *               numero:
 *                 type: number
 *               reference:
 *                 type: string
 *               designation:
 *                 type: string
 *               prixHT:
 *                 type: number
 *               totalTTC:
 *                 type: number 
 *         
 */

/**
 * @swagger
 * tags:
 *   name: BonAchats
 *   description: The BonAchats managing API
 */

/**
 * @swagger
 * /bonAchats/addExpedition/{id}:
 *   post:
 *     summary: Update the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonAchat id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                transporteur:
 *                  type: string
 *                date:
 *                  type: string
 *                articles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      numero:
 *                        type: number
 *                      article:
 *                        type: string
 *                      reference:
 *                        type: string
 *                      designation:
 *                        type: string
 *                      quantiteVente:
 *                        type: number
 *                      quantiteALivree:
 *                        type: number
 *                      quantiteRestant:
 *                        type: number
 *                      unite:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the BonAchats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 resultat:
 *                   type: array
 *
 */
router.post('/addReception', verifytoken, async (req, res) => {

  try{
  var societe = ObjectId(req.body.societe)
  var exercice = req.body.exercice
  var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

  req.body.numero = numeroAutomatique.numero
  req.body.num = numeroAutomatique.num

  var reception = new Reception(req.body)

  var resultat = await reception.save()

  for (let i = 0; i < req.body.articles.length; i++) {

    bonAchat = await BonAchat.findById(reception.document)
    if (bonAchat.validationStockBonAchat == 'non') {
      await updateQteTheriqueQteEnStock({ article: req.body.articles[i].article, societe: societe, quantiteVente: req.body.articles[i].quantiteARecevoit }, "plus", "plus")
    }

    var articleSociete = await ArticleSociete.find({ article: req.body.articles[i].article, societe: societe })
    var stocks = []
    if (articleSociete.stocks) {
      stocks = articleSociete.stocks
    }
    var isExiste = false
    for (let k = 0; k < stocks.length; k++) {
      if (stocks[k].sousProduit == req.body.articles[i].sousProduit && stocks[k].lot == req.body.articles[i].lot) {
        isExiste = true
        stocks[k].qteEnStock += req.body.articles[i].quantiteARecevoit
      }
    }

    if (!isExiste) {
      stocks.push({ qteEnStock: req.body.articles[i].quantiteARecevoit, lot: req.body.articles[i].lot, sousProduit: req.body.articles[i].sousProduit, unite: req.body.articles[i].unite })
    }

    await ArticleSociete.findOneAndUpdate({ article: req.body.articles[i].article, societe: societe }, { stocks: stocks })

  }

  return res.send({ status: true, resultat: resultat })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}
})

/**
 * @swagger
 * /bonAchats/modifierBonAchat/{id}:
 *   post:
 *     summary: Update the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonAchat id

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
 *                 type: string
 *                date:
 *                 type: string
 *                tiers:
 *                 type: string
 *                plafondCredit:
 *                 type: number
 *                totalGain:
 *                 type: number
 *                ligneBLs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      article:
 *                        type: string
 *                      numero:
 *                        type: number
 *                      reference:
 *                        type: string
 *                      totalTVA:
 *                        type: number
 *                      redevance:
 *                        type: number
 *                      totalTTC:
 *                        type: number 
 *     responses:
 *       200:
 *         description: The list of the BonAchats
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
 *                      type: string
 *                     date:
 *                      type: string
 *                     tiers:
 *                      type: string
 *                     plafondCredit:
 *                      type: number
 *                     totalTTC:
 *                      type: number
 *                     totalGain:
 *                      type: number
 *                     ligneBLs:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          article:
 *                            type: string
 *                          numero:
 *                            type: number
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixHT:
 *                            type: number
 *                          tauxRemise:
 *                            type: number
 *                          montantRemise:
 *                            type: number
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *
 *
 */
router.post('/modifierReception/:id', verifytoken, async (req, res) => {

  try{
  const reception = await Reception.findById(req.params.id)
  if (!reception) return res.status(401).send({ status: false })

  const result = await Reception.findOneAndUpdate({ _id: req.params.id }, req.body)

  const reception2 = await Reception.findById(req.params.id)

  return res.send({ status: true, resultat: reception2 })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


router.post('/receptions', verifytoken, async (req, res) => {

  try{
  var dateStart = new Date(req.body.dateStart)
  var dateEnd = new Date(req.body.dateEnd)
  var societe = ObjectId(req.body.magasin)

  var sort = {}
  for (let key in req.body.orderBy) {
    if (Number(req.body.orderBy[key]) != 0) {
      sort[key] = req.body.orderBy[key]
    }
  }

  if (Object.keys(sort).length == 0) {
    sort = { createdAt: -1 }
  }

  var pipeline = []

  pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

  pipeline.push({
    $lookup: {
      from: 'transporteurs',
      let: { "transporteur": "$transporteur" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$transporteur"] },
            ]
          }
        }
      },
      ],
      as: "transporteurs"
    }
  })

  pipeline.push({
    $set: {
      transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },

      date: {
        $dateToString: {
          format: "%Y-%m-%d", date: "$date"
        }
      },
      id: "$_id"
    }
  })

  pipeline.push({
    $project: {
      id: 1,
      numero: 1,
      typeDocument: 1,
      transporteur: 1,
      date: 1,
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

  const articles = await BonAchat.aggregate(pipeline)

  sommePipeline.push({
    $count: "total"
  })

  var nbrTotal = await BonAchat.aggregate(sommePipeline)

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

router.post('/listReception', verifytoken, async (req, res) => {

  try{
  var dateStart = new Date(req.body.dateStart)
  var dateEnd = new Date(req.body.dateEnd)
  var societe = ObjectId(req.body.societe)

  var sort = {}
  for (let key in req.body.orderBy) {
    if (Number(req.body.orderBy[key]) != 0) {
      sort[key] = req.body.orderBy[key]
    }
  }

  if (Object.keys(sort).length == 0) {
    sort = { createdAt: -1 }
  }
  var pipeline = []

  pipeline.push({ $match : { date: { $lte: dateEnd, $gte: dateStart}, societe:societe } } )

  pipeline.push({
    $lookup: {
      from: 'transporteurs',
      let: { "transporteur": "$transporteur" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$transporteur"] },
            ]
          }
        }
      },
      ],
      as: "transporteurs"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'bonachats',
      let: { "document": { "$toObjectId": "$document" } },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$document"] },
            ]
          }
        }
      },
      ],
      as: "bonachats"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'utilisateurs',
      let: { "idConnecte": "$idConnecte" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$idConnecte"] },
            ]
          }
        }
      },
      ],
      as: "utilisateurs"
    }
  })

  pipeline.push({
    $set: {
      transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
      document: { $arrayElemAt: ["$bonachats.numero", 0] },
      idConnecte: { $arrayElemAt: ["$utilisateurs.nom", 0] },

      date: {
        $dateToString: {
          format: "%Y-%m-%d", date: "$date"
        }
      },
      id: "$_id"
    }
  })

  pipeline.push({
    $project: {
      id: 1,
      numero: 1,
      exercice: 1,
      typeDocument: 1,
      transporteur: 1,
      date: 1,
      idConnecte: 1,
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

  const articles = await Reception.aggregate(pipeline)

  sommePipeline.push({
    $count: "total"
  })

  var nbrTotal = await Reception.aggregate(sommePipeline)

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
* /bonCommandes/getById/{id}:
*   get:
*     summary: Remove the bonCommande by id
*     tags: [BonCommandes]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The bonCommande id
*
*     responses:
*       200:
*         description: The bonCommande was deleted
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
*                     tiers:
*                       type: string
*                     plafondCredit:
*                       type: number
*                     credit:
*                       type: number
*                     totalTTC:
*                       type: number
*                     totalGain:
*                       type: number
*                     ligneBLs:
*                      type: array
*                      items:
*                        type: object
*                        properties:
*                          article:
*                            type: string
*                          numero:
*                            type: number
*                          reference:
*                            type: string
*                            type: number
*                          redevance:
*                            type: number
*                          totalTTC:
*                            type: number 
*                     createdAt:
*                       type: string
*                     updatedAt:
*                       type: string
*       404:
*         description: The bonCommande was not found
*       500:
*         description: Some error happened
*/
router.get('/getById/:id', verifytoken, async (req, res) => {

  try{
  if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

  var reception = await Reception.findOne({ _id: req.params.id })

  return res.send({ status: true, resultat: reception })
} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}
})

/**
 * @swagger
 * /tauxTVAs/deleteTauxTVA/{id}:
 *   post:
 *     summary: Remove the tauxTVA by id
 *     tags: [TauxTVAs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tauxTVA id
 *
 *     responses:
 *       200:
 *         description: The tauxTVA was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The tauxTVA was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteReception/:id', verifytoken, async (req, res) => {

  try{
  //if(req.user.user.role != "admin") return res.status(401).send({status:false})

  const reception = await Reception.findById(req.params.id)

  if (!reception) return res.status(401).send({ status: false })


  if (await Reception.findOneAndDelete({ _id: req.params.id })) {
    return res.send({ status: true })
  } else {
    return res.send({ status: false })
  }

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}
})

router.post('/getAllParametres', verifytoken, async(req,res)=>{

  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
  
  const transporteurs = await Transporteur.find({societeRacine:societeRacine})  
  return res.send({status:true, transporteurs:transporteurs}) 
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

module.exports.routerReception = router
