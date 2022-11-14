
const { TacheProjetInterne, getNumeroAutomatique } = require('../Models/tacheProjetInterneModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel');
const { ProjetInterne } = require('../Models/projetInterneModel');
const { Personnel } = require('../Models/personnelModel');

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel');
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

/**
 * @swagger
 * components:
 *   schemas:
 *     TacheProjetInterne:
 *       type: object
 *       required:
 *         - reference
 *         - libelle
 *         - projetInterne
 *         - affecteA
 *         - dateDebut
 *         - dateFin
 *         - chargeTravail
 *         - avancement
 *         - description
 *         - societeRacine
 *       properties:
 *         reference:
 *           type: string
 *         libelle:
 *           type: string
 *         projetInterne:
 *           type: string
 *         affecteA:
 *           type: string
 *         dateDebut:
 *           type: date
 *         dateFin:
 *           type: date
 *         chargeTravail:
 *           type: date
 *         avancement:
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
 *   name: TacheProjetInternes
 *   description: The TacheProjetInternes managing API
 */


/**
 * @swagger
 * paths:
 *   /tacheProjetInternes/upload:
 *     post:
 *       summary: upload image
 *       tags: [TacheProjetInternes]
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
  try{
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
 * /tacheProjetInternes/newTacheProjetInterne:
 *   post:
 *     summary: Returns the list of all the TacheProjetInternes
 *     tags: [TacheProjetInternes]
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
 *                projetInterne:
 *                  type: string
 *                affecteA:
 *                  type: string
 *                dateDebut:
 *                  type: date
 *                dateFin:
 *                  type: date
 *                chargeTravail:
 *                  type: date
 *                avancement:
 *                  type: number
 *                description:
 *                  type: string
 *                societeRacine:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the TacheProjetInternes
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
 *                    projetInterne:
 *                      type: string
 *                    affecteA:
 *                      type: string
 *                    dateDebut:
 *                      type: date
 *                    dateFin:
 *                      type: date
 *                    chargeTravail:
 *                      type: date
 *                    avancement:
 *                      type: number
 *                    description:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newTacheProjetInterne', verifytoken, async (req, res) => {

  try{
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    req.body.reference = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    var body = req.body
    body.societeRacine = await getSocieteRacine(societe)
    const tacheProjetInterne = new TacheProjetInterne(body);

    const result = await tacheProjetInterne.save()

    return res.send({ status: true, resultat: result })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /tacheProjetInternes/modifierTacheProjetInterne/{id}:
 *   post:
 *     summary: Update the TacheProjetInterne by id
 *     tags: [TacheProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TacheProjetInterne id

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
 *                projetInterne:
 *                 type: string
 *                affecteA:
 *                 type: string
 *                dateDebut:
 *                 type: date
 *                dateFin:
 *                 type: date
 *                chargeTravail:
 *                 type: date
 *                avancement:
 *                 type: number
 *                description:
 *                 type: string
 *                societeRacine:
 *                 type: string
 *     responses:
 *       200:
 *         description: The list of the TacheProjetInternes
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
 *                     projetInterne:
 *                      type: string
 *                     affecteA:
 *                      type: string
 *                     dateDebut:
 *                      type: date
 *                     dateFin:
 *                      type: date
 *                     chargeTravail:
 *                      type: date
 *                     avancement:
 *                      type: number
 *                     description:
 *                      type: string
 *                     societeRacine:
 *                      type: string  
 *
 *
 */
router.post('/modifierTacheProjetInterne/:id', verifytoken, async (req, res) => {
  
  try{
  const tacheProjetInterne = await TacheProjetInterne.findById(req.params.id)

    if (!tacheProjetInterne) return res.status(401).send({ status: false })

    const result = await TacheProjetInterne.findOneAndUpdate({ _id: req.params.id }, req.body)

    const tacheProjetInterne2 = await TacheProjetInterne.findById(req.params.id)

    return res.send({ status: true, resultat: tacheProjetInterne2 })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /tacheProjetInternes/deleteTacheProjetInterne/{id}:
 *   post:
 *     summary: Remove the TacheProjetInterne by id
 *     tags: [TacheProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TacheProjetInterne id
 *
 *     responses:
 *       200:
 *         description: The TacheProjetInterne was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The TacheProjetInterne was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteTacheProjetInterne/:id', verifytoken, async (req, res) => {
  
  try{
  const tacheProjetInterne = await TacheProjetInterne.findById(req.params.id)

    if (!tacheProjetInterne) return res.status(401).send({ status: false })

    if (await TacheProjetInterne.findOneAndDelete({ _id: req.params.id })) {
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
 * /tacheProjetInternes/listTacheProjetInternes:
 *   post:
 *     summary: Returns the list of all the TacheProjetInternes
 *     tags: [TacheProjetInternes]
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
 *         description: The list of the TacheProjetInternes
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
 *                            projetInterne:
 *                              type: string
 *                            affecteA:
 *                              type: string
 *                            dateDebut:
 *                              type: date
 *                            dateFin:
 *                              type: date
 *                            chargeTravail:
 *                              type: date
 *                            avancement:
 *                              type: number
 *                            description:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *
 *
 *
 */
router.post('/listTacheProjetInternes', verifytoken, async (req, res) => {
  
  try{
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
        from: 'projetinternes',
        let: { "projetInterne": "$projetInterne" },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$_id", "$$projetInterne"] },
              ]
            }
          }
        }],
        as: "projetinternes"
      }
    })
  
    pipeline.push({
        $lookup: {
          from: 'personnels',
          let: { "affecteA": "$affecteA" },
          pipeline: [{
            $match:
            {
              $expr: {
                "$and": [
                  { "$eq": ["$_id", "$$affecteA"] },
                ]
              }
            }
          }],
          as: "personnels"
        }
      })  

    pipeline.push({
      $set: {
        projetInterne: { $arrayElemAt: ["$projetinternes.libelle", 0] },
        affecteA: { $arrayElemAt: ["$personnels.nom", 0] },
        avancement: { $toString: "$avancement" },
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
        projetInterne: 1, 
        affecteA: 1, 
        dateDebut: 1, 
        dateFin: 1, 
        chargeTravail: 1, 
        avancement: 1, 
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
  
    const articles = await TacheProjetInterne.aggregate(pipeline)
  
    sommePipeline.push({
      $count: "total"
    })
  
  
    var nbrTotal = await TacheProjetInterne.aggregate(sommePipeline)
  
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
 * /tacheProjetInternes/getById/{id}:
 *   get:
 *     summary: Remove the TacheProjetInterne by id
 *     tags: [TacheProjetInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TacheProjetInterne id
 *
 *     responses:
 *       200:
 *         description: The TacheProjetInterne was deleted
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
 *                     projetInterne:
 *                       type: string
 *                     affecteA:
 *                       type: string
 *                     dateDebut:
 *                       type: date
 *                     dateFin:
 *                       type: date
 *                     chargeTravail:
 *                       type: date
 *                     avancement:
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
 *         description: The TacheProjetInterne was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

  try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    var tacheProjetInterne = await TacheProjetInterne.findOne({ _id: req.params.id })

    return res.send({ status: true, resultat: tacheProjetInterne })
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /tacheProjetInternes/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [TacheProjetInternes]
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
 *                  projetInternes:
 *                    type: array   
 *                  tacheprojetInternes:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post('/getAllParametres', verifytoken, async (req, res) => {
  try{ 
  var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societeRacine, exercice)
  
    const projetInternes = await ProjetInterne.find({ societeRacine: societeRacine })
    const tacheprojetInternes = await TacheProjetInterne.find({ societeRacine: societeRacine })
    
    var societe = ObjectId(req.body.societe)
    const personnels = await Personnel.find({societe:societe})

    return res.send({
        status: true, projetInternes: projetInternes,
        tacheprojetInternes: tacheprojetInternes,
        personnels: personnels,
        numeroAutomatique: numeroAutomatique.numero,
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
module.exports.routerTacheProjetInterne = router
