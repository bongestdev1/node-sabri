const { PrixSpecifiqueLigne, verifierIntervalleEntreQuantite } = require('../Models/prixSpecifiqueLigneModel')
const { Categorie } = require('../Models/categorieModel')
const { Article, getArticlesWithQuantites, SousProduit } = require('../Models/articleModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')
const { Client } = require('../Models/clientModel')

const { PrixSpecifiqueLigneTypeTier } = require('../Models/prixSpecifiqueLigneTypeTierModel')

const { Fournisseur } = require('../Models/fournisseurModel')

var ObjectId = require('mongodb').ObjectID;

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { TypeTier } = require('../Models/typeTierModel')
const { Frais } = require('../Models/fraisModel')
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
 *         - totalmarge
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
 *         montantPaye:
 *           type: number
 *         totalRedevance:
 *           type: number
 *         totalFodec:
 *           type: number
 *         escompte:
 *           type: number
 *         montantEscompte:
 *           type: number
 *         totalmarge:
 *           type: number
 *         totalDC:
 *           type: number
 *         totaleHT:
 *           type: number
 *         totalTVA:
 *           type: number
 *         tFiscale:
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
 *               tauxmarge:
 *                 type: number
 *               montantmarge:
 *                 type: number
 *               prixVente:
 *                 type: number
 *               quantite:
 *                 type: number
 *               unite:
 *                 type: string
 *               totalmarge:
 *                 type: number
 *               totalHt:
 *                 type: number
 *               tauxTVA:
 *                 type: number
 *               totalTVA:
 *                 type: number
 *               redevance:
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
 * paths:
 *   /bonAchats/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonAchats]
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
router.post('/upload', upload.array('myFiles'), verifytoken, async (req, res) => {
  try {
    const files = req.files
    let arr = [];
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
 * /bonAchats/newBonAchat:
 *   post:
 *     summary: Returns the list of all the BonAchats
 *     tags: [BonAchats]
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
 *                tiers:
 *                  type: string
 *                plafondCredit:
 *                  type: number
 *                credit:
 *                  type: number
 *                restPayer:
 *                  type: number
 *                montantPaye:
 *                  type: number
 *                totalRedevance:
 *                  type: number
 *                totalFodec:
 *                  type: number
 *                escompte:
 *                  type: number
 *                montantEscompte:
 *                  type: number
 *                totalmarge:
 *                  type: number
 *                totalDC:
 *                  type: number
 *                totaleHT:
 *                  type: number
 *                totalTVA:
 *                  type: number
 *                tFiscale:
 *                  type: number
 *                totalTTC:
 *                  type: number
 *                totalGain:
 *                  type: number
 *                ligneBLs:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      article:
 *                        type: string
 *                      numero:
 *                        type: number
 *                      reference:
 *                        type: string
 *                      designation:
 *                        type: string
 *                      prixHT:
 *                        type: number
 *                      tauxmarge:
 *                        type: number
 *                      montantmarge:
 *                        type: number
 *                      prixVente:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string
 *                      totalmarge:
 *                        type: number
 *                      totalHt:
 *                        type: number
 *                      tauxTVA:
 *                        type: number
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
 *                    id:
 *                      type: string
 *                    numero:
 *                      type: string
 *                    date:
 *                      type: string
 *                    tiers:
 *                      type: string
 *                    plafondCredit:
 *                      type: number
 *                    credit:
 *                      type: number
 *                    restPayer:
 *                      type: number
 *                    montantPaye:
 *                      type: number
 *                    totalRedevance:
 *                      type: number
 *                    totalFodec:
 *                      type: number
 *                    escompte:
 *                      type: number
 *                    montantEscompte:
 *                      type: number
 *                    totalmarge:
 *                      type: number
 *                    totalDC:
 *                      type: number
 *                    totaleHT:
 *                      type: number
 *                    totalTVA:
 *                      type: number
 *                    tFiscale:
 *                      type: number
 *                    totalTTC:
 *                      type: number
 *                    totalGain:
 *                      type: number
 *                    ligneBLs:
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
 *                          tauxmarge:
 *                            type: number
 *                          montantmarge:
 *                            type: number
 *                          prixVente:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *                          totalmarge:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
 *                            type: number
 *                          redevance:
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *
 */
router.post('/newPrixSpecifique', verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(req.body.societe)
    var newList = []
    var errorList = []

    for (let i = 0; i < req.body.ligneInventaire.length; i++) {
      var item = req.body.ligneInventaire[i]
      item.societeRacine = societeRacine
      var isFind = false

      var itemVerif = await PrixSpecifiqueLigne.findOne({ article: ObjectId(item.article), client: ObjectId(item.client) })
      if (itemVerif) {
        isFind = true
      }

      var champsObjet = ["article", "sousProduit", "client"]
      for (let key of champsObjet) {
        if (!ObjectId.isValid(item[key])) {
          item[key] = null
        }
      }

      item.societeRacine = societeRacine
      //var isValid = await verifierIntervalleEntreQuantite(item)
      if (!isFind) {
        item = new PrixSpecifiqueLigne(item)
        var resul = await item.save()
        newList.push(resul)
      } else {
        console.log(item)
        await PrixSpecifiqueLigne.findOneAndUpdate({ _id: itemVerif.id }, item)
        newList.push(item)
      }

    }


    return res.send({ status: true, resultat: newList })
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

router.post('/newPrixSpecifiqueTypeTier', verifytoken, async (req, res) => {
  try {

    console.log(req.body.ligneInventaire)

    var societeRacine = await getSocieteRacine(req.body.societe)
    var newList = []
    var errorList = []

    for (let i = 0; i < req.body.ligneInventaire.length; i++) {
      var item = req.body.ligneInventaire[i]
      item.societeRacine = societeRacine
      var isFind = false

      var itemVerif = await PrixSpecifiqueLigneTypeTier.findOne({ article: ObjectId(item.article), typeTier: ObjectId(item.typeTier) })
      if (itemVerif) {
        isFind = true
      }

      var champsObjet = ["article", "sousProduit", "typeTier"]
      for (let key of champsObjet) {
        if (!ObjectId.isValid(item[key])) {
          item[key] = null
        }
      }

      item.societeRacine = societeRacine
      //var isValid = await verifierIntervalleEntreQuantite(item)
      if (!isFind) {
        item = new PrixSpecifiqueLigneTypeTier(item)
        var resul = await item.save()
        newList.push(resul)
      } else {
        console.log(item)
        await PrixSpecifiqueLigneTypeTier.findOneAndUpdate({ _id: itemVerif.id }, item)
        newList.push(item)
      }

    }


    return res.send({ status: true, resultat: newList })
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
 *                credit:
 *                 type: number
 *                restPayer:
 *                 type: number
 *                montantPaye:
 *                 type: number
 *                totalRedevance:
 *                 type: number
 *                totalFodec:
 *                 type: number
 *                escompte:
 *                 type: number
 *                montantEscompte:
 *                 type: number
 *                totalmarge:
 *                 type: number
 *                totalDC:
 *                 type: number
 *                totaleHT:
 *                 type: number
 *                totalTVA:
 *                 type: number
 *                tFiscale:
 *                 type: number
 *                totalTTC:
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
 *                      designation:
 *                        type: string
 *                      prixHT:
 *                        type: number
 *                      tauxmarge:
 *                        type: number
 *                      montantmarge:
 *                        type: number
 *                      prixVente:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string
 *                      totalmarge:
 *                        type: number
 *                      totalHt:
 *                        type: number
 *                      tauxTVA:
 *                        type: number
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
 *                     credit:
 *                      type: number
 *                     restPayer:
 *                      type: number
 *                     montantPaye:
 *                      type: number
 *                     totalRedevance:
 *                      type: number
 *                     totalFodec:
 *                      type: number
 *                     escompte:
 *                      type: number
 *                     montantEscompte:
 *                      type: number
 *                     totalmarge:
 *                      type: number
 *                     totaleHT:
 *                      type: number
 *                     totalTVA:
 *                      type: number
 *                     tFiscale:
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
 *                          tauxmarge:
 *                            type: number
 *                          montantmarge:
 *                            type: number
 *                          prixVente:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *                          totalmarge:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
 *                            type: number
 *                          redevance:
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *
 *
 */

/**
 * @swagger
 * /bonAchats/deleteBonAchat/{id}:
 *   post:
 *     summary: Remove the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAchat id
 *
 *     responses:
 *       200:
 *         description: The bonAchat was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonAchat was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deletePrixSpecifique/:id', verifytoken, async (req, res) => {

  try {
    if (await PrixSpecifiqueLigne.findOneAndDelete({ _id: req.params.id })) {
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


router.post('/listPrixSpecifiqueByCategorie', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(req.body.societe)

    var pipeline = []

    if (ObjectId.isValid(req.body.article)) {
      pipeline.push({ $match: { _id: ObjectId(req.body.article) } })
    } else if (ObjectId.isValid(req.body.categorie)) {
      pipeline.push({ $match: { categorie: ObjectId(req.body.categorie) } })
    } else {
      pipeline.push({ $match: { societeRacine: ObjectId(societeRacine) } })
    }

    var objectLet = {}
    var objectLetFiltre = {}
    if (ObjectId.isValid(req.body.client)) {
      objectLet = { client: ObjectId(req.body.client) }
      objectLetFiltre = { "$eq": ["$$client", "$_id"] }
    } else if (ObjectId.isValid(req.body.typeTier)) {
      objectLet = { typeTiers: ObjectId(req.body.typeTier) }
      objectLetFiltre = { "$eq": ["$$typeTiers", "$typeTiers"] }
    } else {
      objectLet = { societeRacine: ObjectId(societeRacine) }
      objectLetFiltre = { "$eq": ["$$societeRacine", "$societeRacine"] }
    }


    pipeline.push({
      $set: {
        article: "$_id"
      }
    })

    pipeline.push({
      $lookup: {
        from: 'clients',
        let: objectLet,
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                objectLetFiltre,
              ]
            },
          }
        },
        {
          $set:
          {
            client: "$_id"
          }
        },
        ],
        as: "clients",
      },
    })

    pipeline.push({
      $unwind:
      {
        path: "$clients",
      }
    })


    pipeline.push({
      $set:
      {
        client: "$clients.client",
        raisonSociale: "$clients.raisonSociale",
        sousProduit: "",
        quantiteMin: 0,
        quantiteMax: 0,
        isEnable: true,
      }
    },)

    pipeline.push({
      $project:
      {
        client: 1,
        raisonSociale: 1,
        _id: 0,
        article: 1,
        frais: 1,
        prixRevient: 1,
        prixVenteHT: 1,
        prixAchat: 1,
        redevance: 1,
        tauxTVA: 1,
        margeAppliqueeSur: 1,
        sousProduit: 1,
        marge: 1,
        margePourcentage: 1,
        quantiteMin: 1,
        quantiteMax: 1,
        isEnable: 1,
      }
    })


    pipeline.push({
      $lookup: {
        from: 'prixspecifiquelignes',
        let: { client: "$client", article: "$article" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { $eq: ["$client", "$$client"] },
                { $eq: ["$article", "$$article"] }
              ]
            },
          }
        },
        ],
        as: "prixspecifiquelignes",
      },
    })


    pipeline.push({
      $unwind:
      {
        path: "$prixspecifiquelignes",
        preserveNullAndEmptyArrays: true
      }
    })

    pipeline.push({
      $set:
      {
        marge2: "$prixspecifiquelignes.marge",
        margePourcentage: "$prixspecifiquelignes.margePourcentage",
        newPrixVenteHT: "$prixspecifiquelignes.newPrixVenteHT",
        quantiteMin: "$prixspecifiquelignes.quantiteMin",
        quantiteMax: "$prixspecifiquelignes.quantiteMax",
        note: "$prixspecifiquelignes.note",
        frais2: "$prixspecifiquelignes.frais",
        isEnable2: "$prixspecifiquelignes.isEnable"
     
      }
    })

    // pipeline.push({
    //   $project:
    //   {
    //     prixspecifiquelignes: 0,
    //   }
    // })

    var articles = await Article.aggregate(pipeline)

    var newArticles = []

    for (let i = 0; i < articles.length; i++) {
      var item = JSON.parse(JSON.stringify(articles[i]))

      if (item.isEnable2 !== undefined) {
        item.isEnable = item.isEnable2
      }

      if (!item.margePourcentage) {
        item.margePourcentage = item.marge
      }

      if (!item.marge2) {
        item.marge = 0
      }else{
        item.marge = item.marge2
      }

      if (!item.prixRevient) {
        item.prixRevient = 0
      }
      if (!item.newPrixVenteHT) {
        item.newPrixVenteHT = 0
      }
      if (!item.quantiteMin) {
        item.quantiteMin = 0
      }

      if (!item.quantiteMax) {
        item.quantiteMax = 0
      }
      if (!item.note) {
        item.note = ""
      }

      if (item.frais2) {
        item.frais = item.frais2
      } else {
        var frais = []
        for (let itemF of item.frais) {
          if (itemF.montant > 0) {
            frais.push({ idFrais: itemF.frais })
          }
        }
        item.frais = frais
      }

      newArticles.push(item)

    }

    return res.send({ status: true, prix: newArticles })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.post('/listPrixSpecifiqueTypetierByCategorie', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(req.body.societe)

    var pipeline = []

    if (ObjectId.isValid(req.body.article)) {
      console.log("pas 1")
      pipeline.push({ $match: { _id: ObjectId(req.body.article) } })
    } else if (ObjectId.isValid(req.body.categorie)) {
      console.log("pas 2")
      pipeline.push({ $match: { categorie: ObjectId(req.body.categorie) } })
    } else {
      console.log("pas 3")
      pipeline.push({ $match: { societeRacine: ObjectId(societeRacine) } })
    }

    var objectLet = {}
    var objectLetFiltre = {}
    if (ObjectId.isValid(req.body.typeTier)) {
      console.log("pas 4")
      objectLet = { typeTiers: ObjectId(req.body.typeTier) }
      objectLetFiltre = { "$eq": ["$$typeTiers", "$_id"] }
    } else {
      console.log("pas 5")
      objectLet = { societeRacine: ObjectId(societeRacine) }
      objectLetFiltre = { "$eq": ["$$societeRacine", "$societeRacine"] }
    }

    pipeline.push({
      $set: {
        article: "$_id"
      }
    })

    pipeline.push({
      $lookup: {
        from: 'typetiers',
        let: objectLet,
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                objectLetFiltre,
              ]
            },
          }
        },
        {
          $set:
          {
            idtypeTier: "$_id",
            typeTier: "$libelle"
          }
        },
        ],
        as: "typetiers",
      },
    })

    pipeline.push({
      $unwind:
      {
        path: "$typetiers",
      }
    })


    pipeline.push({
      $set:
      {
        typeTier: "$typetiers._id",
        libelle: "$typetiers.libelle",
        sousProduit: "",
        quantiteMin: 0,
        quantiteMax: 0,
        isEnable:true
      }
    },)

    pipeline.push({
      $project:
      {
        typeTier: 1,
        libelle: 1,
        _id: 0,
        article: 1,
        frais: 1,
        prixRevient: 1,
        prixVenteHT: 1,
        prixAchat: 1,
        margeAppliqueeSur: 1,
        sousProduit: 1,
        marge: 1,
        margePourcentage: 1,
        quantiteMin: 1,
        quantiteMax: 1,
        isEnable:1,
        tauxTVA:1,
        redevance:1,
      }
    })


    pipeline.push({
      $lookup: {
        from: 'prixspecifiquelignetypetiers',
        let: { typeTier: "$typeTier", article: "$article" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { $eq: ["$typeTier", "$$typeTier"] },
                { $eq: ["$article", "$$article"] }
              ]
            },
          }
        },
        ],
        as: "prixspecifiquetypetierlignes",
      },
    })


    pipeline.push({
      $unwind:
      {
        path: "$prixspecifiquetypetierlignes",
        preserveNullAndEmptyArrays: true
      }
    })

    pipeline.push({
      $set:
      {
        marge2: "$prixspecifiquetypetierlignes.marge",
        margePourcentage: "$prixspecifiquetypetierlignes.margePourcentage",
        newPrixVenteHT: "$prixspecifiquetypetierlignes.newPrixVenteHT",
        quantiteMin: "$prixspecifiquetypetierlignes.quantiteMin",
        quantiteMax: "$prixspecifiquetypetierlignes.quantiteMax",
        note: "$prixspecifiquetypetierlignes.note",
        frais2: "$prixspecifiquetypetierlignes.frais",
        isEnable2: "$prixspecifiquetypetierlignes.isEnable"
      }
    })

    // pipeline.push({
    //   $project:
    //   {
    //     prixspecifiquelignes: 0,
    //   }
    // })

    var articles = await Article.aggregate(pipeline)

    var newArticles = []

    for (let i = 0; i < articles.length; i++) {
      var item = JSON.parse(JSON.stringify(articles[i]))
      if (!item.margePourcentage) {
        item.margePourcentage = item.marge
      }

      if (!item.marge2) {
        item.marge = 0
      }else{
        item.marge = item.marge2
      }

      if (item.isEnable2 !== undefined) {
        item.isEnable = item.isEnable2
      }

      if (!item.prixRevient) {
        item.prixRevient = 0
      }

      if (!item.newPrixVenteHT) {
        item.newPrixVenteHT = 0
      }

      if (!item.quantiteMin) {
        item.quantiteMin = 0
      }

      if (!item.quantiteMax) {
        item.quantiteMax = 0
      }

      if (!item.note) {
        item.note = ""
      }

      if (item.frais2) {
        item.frais = item.frais2
      } else {
        var frais = []
        for (let itemF of item.frais) {
          if (itemF.montant > 0) {
            frais.push({ idFrais: itemF.frais })
          }
        }
        item.frais = frais
      }

      newArticles.push(item)

    }

    return res.send({ status: true, prix: newArticles })

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
 * /bonAchats/listBonAchats:
 *   post:
 *     summary: Returns the list of all the bonAchats
 *     tags: [BonAchats]
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
 *         description: The list of the BonAchats
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
 *                            tiers:
 *                              type: number
 *                            plafondCredit:
 *                              type: number
 *                            credit:
 *                              type: number
 *                            restPayer:
 *                              type: number
 *                            montantPaye:
 *                              type: number
 *                            totalRedevance:
 *                              type: number
 *                            totalFodec:
 *                              type: number
 *                            escompte:
 *                              type: number
 *                            montantEscompte:
 *                              type: number
 *                            totalmarge:
 *                              type: number
 *                            totalDC:
 *                              type: number
 *                            totaleHT:
 *                              type: number
 *                            totalTVA:
 *                              type: number
 *                            tFiscale:
 *                              type: number
 *                            totalTTC:
 *                              type: number
 *                            totalGain:
 *                              type: number
 *                            ligneBLs:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  article:
 *                                    type: string
 *                                  numero:
 *                                    type: number
 *                                  reference:
 *                                    type: string
 *                                  designation:
 *                                    type: string
 *                                  prixHT:
 *                                    type: number
 *                                  tauxmarge:
 *                                    type: number
 *                                  montantmarge:
 *                                    type: number
 *                                  prixVente:
 *                                    type: number
 *                                  quantite:
 *                                    type: number
 *                                  unite:
 *                                    type: string
 *                                  totalmarge:
 *                                    type: number
 *                                  totalHt:
 *                                    type: number
 *                                  tauxTVA:
 *                                    type: number
 *                                  totalTVA:
 *                                    type: number
 *                                  redevance:
 *                                    type: number
 *                                  totalTTC:
 *                                    type: number 
 *                                  createdAt:
 *                                    type: string
 *                                  updatedAt:
 *                                    type: string
 *
 */
router.post('/listPrixSpecifique', verifytoken, async (req, res) => {

  try {

    console.log("listPrixSpecifique")

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

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

    pipeline.push({ $match: { societeRacine: societeRacine } })

    pipeline.push({
      $lookup: {
        from: 'sousproduits',
        let: { "sousProduit": "$sousProduit" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$sousProduit"] },
              ]
            }
          }
        }],
        as: "sousproduits"
      }
    })

    pipeline.push({
      $lookup: {
        from: 'typetiers',
        let: { "typeTier": "$typeTier" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$typeTier"] },
              ]
            }
          }
        }],
        as: "typetiers"
      }
    })

    pipeline.push({
      $lookup: {
        from: 'articles',
        let: { "article": "$article" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$article"] },
              ]
            }
          }
        }],
        as: "articles"
      }
    })

    pipeline.push({
      $lookup: {
        from: 'clients',
        let: { "client": "$client" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$client"] },
              ]
            }
          }
        }],
        as: "clients"
      }
    })


    pipeline.push({
      $set: {
        reference: { $arrayElemAt: ["$articles.reference", 0] },
        designation: { $arrayElemAt: ["$articles.designation", 0] },
        sousProduit: { $arrayElemAt: ["$sousproduits.reference", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        prixVenteHT: { $arrayElemAt: ["$articles.prixVenteHT", 0] },
        prixAchat: { $arrayElemAt: ["$articles.prixAchat", 0] },
        prixRevient: { $arrayElemAt: ["$articles.prixRevient", 0] },

        articleID: { $arrayElemAt: ["$articles._id", 0] },
        sousProduitID: { $arrayElemAt: ["$sousproduits._id", 0] },
        clientID: { $arrayElemAt: ["$clients._id", 0] },

        id: "$_id",
        marge: { $toString: "$marge" },
        margePourcentage: { $toString: "$margePourcentage" },
        quantiteMin: { $toString: "$quantiteMin" },
        quantiteMax: { $toString: "$quantiteMax" },
      }
    })

    pipeline.push({
      $project: {
        reference: 1,
        designation: 1,

        article: 1,
        sousProduit: 1,
        client: 1,

        articleID: 1,
        sousProduitID: 1,
        typeTierID: 1,
        clientID: 1,

        id: "$_id",
        marge: 1,
        margePourcentage: 1,
        quantiteMin: 1,
        quantiteMax: 1,
        prixVenteHT: 1,
        note: 1,
        societeRacine: 1
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

    const articles = await PrixSpecifiqueLigne.aggregate(pipeline)

    var newList = []
    for (let i = 0; i < articles.length; i++) {

      newList.push({
        id: articles[i].id,
        article: articles[i].articleID,
        sousProduit: articles[i].sousProduitID,
        client: articles[i].clientID,
        societeRacine: articles[i].societeRacine,

        marge: articles[i].marge,
        margePourcentage: articles[i].margePourcentage,
        quantiteMin: articles[i].quantiteMin,
        quantiteMax: articles[i].quantiteMax,
        note: articles[i].note,
        prixVenteHT: articles[i].prixVenteHT,
        prixSpecifique: 0
      })
    }

    return res.send({ status: true, resultat: newList, request: req.body })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



/**
 * @swagger
 * /bonAchats/getById/{id}:
 *   get:
 *     summary: Remove the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAchat id
 *
 *     responses:
 *       200:
 *         description: The bonAchat was deleted
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
 *                     restPayer:
 *                       type: number
 *                     montantPaye:
 *                       type: number
 *                     totalRedevance:
 *                       type: number
 *                     totalFodec:
 *                       type: number
 *                     escompte:
 *                       type: number
 *                     montantEscompte:
 *                       type: number
 *                     totalmarge:
 *                       type: number
 *                     totalDC:
 *                       type: number
 *                     totaleHT:
 *                       type: number
 *                     totalTVA:
 *                       type: number
 *                     tFiscale:
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
 *                          designation:
 *                            type: string
 *                          prixHT:
 *                            type: number
 *                          tauxmarge:
 *                            type: number
 *                          montantmarge:
 *                            type: number
 *                          prixVente:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: number
 *                          totalmarge:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
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
 *         description: The bonAchat was not found
 *       500:
 *         description: Some error happened
 */
// router.get('/getById/:id', async (req, res) => {

//   try{
//   if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

//   const prixSpecifiqueLignes = await PrixSpecifiqueLigne.find({ prixSpecifique: req.params.id })

//   var prixSpecifique = await PrixSpecifique.findOne({ _id: req.params.id })

//   return res.send({ status: true, resultat: prixSpecifique, articles: prixSpecifiqueLignes })
// } catch (e) {
    
//   // statements to handle any exceptions
//   console.log(e)
//   return res.send({ status: false }) // pass exception object to error handler
// }
// })



/**
 * @swagger
 * /bonAchats/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonAchats]
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
 *                  article:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post('/getAllParametres', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var societe = ObjectId(req.body.societe)

    const articles = await getArticlesWithQuantites(societe, societeRacine)
    const clients = await Client.find({ societeRacine: societeRacine })
    const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
    const typeTiers = await TypeTier.find({ societeRacine: societeRacine })
    const categories = await Categorie.find({ societeRacine: societeRacine })

    const frais = await Frais.find({ societeRacine: societeRacine });

    return res.send({
      status: true, typeTiers: typeTiers, categories: categories, uniteMesures: uniteMesures, articles: articles,
      clients: clients, frais: frais
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
module.exports.routerPrixSpecifique = router
