
const { PlanPreventif } = require('../../Models/GMAOModels/planPreventifModel')

const { OperationPreventif } = require('../../Models/GMAOModels/operationPreventifModel')
const { Machine } = require('../../Models/GMAOModels/machineModel')
const { Periodicite } = require('../../Models/GMAOModels/periodiciteModel')

const { Fournisseur } = require('../../Models/fournisseurModel')
const { Technicien } = require('../../Models/GMAOModels/technicienModel')


const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../../Models/societeModel')
const { EtatTache } = require('../../Models/GMAOModels/etatTacheModel')
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
 *     PlanPreventif:
 *       type: object
 *       required:
 *         - libelle
 *         - operationPreventif
 *         - machine
 *         - dernierDate
 *         - prochaineDate
 *         - periodicite
 *         - alerteAvant
 *         - interne
 *         - dureeExecution
 *         - montant
 *         - notes
 *         - societeRacine
 *       properties:
 *         libelle:
 *           type: string
 *         operationPreventif:
 *           type: string
 *         machine:
 *           type: string
 *         dernierDate:
 *           type: date
 *         prochaineDate:
 *           type: date
 *         periodicite:
 *           type: number
 *         alerteAvant:
 *           type: number
 *         interne:
 *           type: string
 *         dureeExecution:
 *           type: number
 *         montant:
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
 *   name: PlanPreventifs
 *   description: The PlanPreventifs managing API
 */


/**
 * @swagger
 * paths:
 *   /planPreventifs/upload:
 *     post:
 *       summary: upload image
 *       tags: [PlanPreventifs]
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
router.post('/upload', upload.array('myFiles'), async (req, res) => {
  try{
  const files = req.files
  let arr = [];
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
 * /planPreventifs/newPlanPreventif:
 *   post:
 *     summary: Returns the list of all the PlanPreventifs
 *     tags: [PlanPreventifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                operationPreventif:
 *                  type: string
 *                machine:
 *                  type: string
 *                dernierDate:
 *                  type: date
 *                prochaineDate:
 *                  type: date
 *                periodicite:
 *                  type: number
 *                alerteAvant:
 *                  type: number
 *                interne:
 *                  type: string
 *                dureeExecution:
 *                  type: number
 *                montant:
 *                  type: number
 *                notes:
 *                  type: string
 *                societeRacine:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the PlanPreventifs
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
 *                    operationPreventif:
 *                      type: string
 *                    machine:
 *                      type: string
 *                    dernierDate:
 *                      type: date
 *                    prochaineDate:
 *                      type: date
 *                    periodicite:
 *                      type: number
 *                    alerteAvant:
 *                      type: number
 *                    interne:
 *                      type: string
 *                    dureeExecution:
 *                      type: number
 *                    montant:
 *                      type: string
 *                    notes:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */
router.post('/newPlanPreventif', async (req, res) => {
  try{
  var body = req.body

  body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))
  if (body.techniciens.length == 0) {
    body.techniciens = []
  } else if (body.fournisseur == "") {
    body.fournisseur = null
  }
  const planPreventif = new PlanPreventif(body);

  const result = await planPreventif.save()

  return res.send({ status: true, resultat: result })
} catch (e) {
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}
})


/**
 * @swagger
 * /planPreventifs/modifierPlanPreventif/{id}:
 *   post:
 *     summary: Update the PlanPreventif by id
 *     tags: [PlanPreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PlanPreventif id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: string
 *                libelle:
 *                 type: string
 *                operationPreventif:
 *                 type: string
 *                machine:
 *                 type: string
 *                dernierDate:
 *                 type: date
 *                prochaineDate:
 *                 type: date
 *                periodicite:
 *                 type: number
 *                alerteAvant:
 *                 type: number
 *                interne:
 *                 type: string
 *                dureeExecution:
 *                 type: number
 *                montant:
 *                 type: number
 *                notes:
 *                 type: string
 *                societeRacine:
 *                 type: string
 *     responses:
 *       200:
 *         description: The list of the PlanPreventifs
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
 *                      type: string
 *                     operationPreventif:
 *                      type: string
 *                     machine:
 *                      type: string
 *                     dernierDate:
 *                      type: date
 *                     prochaineDate:
 *                      type: date
 *                     periodicite:
 *                      type: number
 *                     alerteAvant:
 *                      type: number
 *                     interne:
 *                      type: string
 *                     dureeExecution:
 *                      type: number
 *                     montant:
 *                      type: string
 *                     notes:
 *                      type: string
 *                     societeRacine:
 *                      type: string  
 *
 *
 */
router.post('/modifierPlanPreventif/:id', async (req, res) => {
  try{
  const planPreventif = await PlanPreventif.findById(req.params.id)
 
  if (!planPreventif) return res.status(401).send({ status: false })

  const result = await PlanPreventif.findOneAndUpdate({ _id: req.params.id }, {listTaches:req.body.search.listTaches})
  
  const planPreventif2 = await PlanPreventif.findById(req.params.id)
  
  return res.send({ status: true, resultat: planPreventif2 })

} catch (e) {
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


/**
 * @swagger
 * /planPreventifs/deletePlanPreventif/{id}:
 *   post:
 *     summary: Remove the PlanPreventif by id
 *     tags: [PlanPreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PlanPreventif id
 *
 *     responses:
 *       200:
 *         description: The PlanPreventif was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The PlanPreventif was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deletePlanPreventif/:id', async (req, res) => {

  try{
  const planPreventif = await PlanPreventif.findById(req.params.id)

  if (!planPreventif) return res.status(401).send({ status: false })

  if (await PlanPreventif.findOneAndDelete({ _id: req.params.id })) {
    return res.send({ status: true })
  } else {
    return res.send({ status: false })
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
 * /planPreventifs/listPlanPreventifs:
 *   post:
 *     summary: Returns the list of all the PlanPreventifs
 *     tags: [PlanPreventifs]
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
 *         description: The list of the PlanPreventifs
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
 *                            operationPreventif:
 *                              type: string
 *                            machine:
 *                              type: string
 *                            dernierDate:
 *                              type: date
 *                            prochaineDate:
 *                              type: date
 *                            periodicite:
 *                              type: number
 *                            alerteAvant:
 *                              type: number
 *                            interne:
 *                              type: string
 *                            dureeExecution:
 *                              type: number
 *                            montant:
 *                              type: string
 *                            notes:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *
 *
 *
 */
router.post('/listPlanPreventifs', async (req, res) => {

  try{
  var societeRacine = ObjectId(req.body.societeRacine)

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
      from: 'operationpreventifs',
      let: { "operationPreventif": "$operationPreventif" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$operationPreventif"] },
            ]
          }
        }
      },
      ],
      as: "operationpreventifs"
    }
  })
  pipeline.push({
    $lookup: {
      from: 'periodicites',
      let: { "periodicite": "$periodicite" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$periodicite"] },
            ]
          }
        }
      },
      ],
      as: "periodicites"
    }
  })
  pipeline.push({
    $lookup: {
      from: 'techniciens',
      let: { "technicien": "$technicien" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$technicien"] },
            ]
          }
        }
      },
      ],
      as: "techniciens"
    }
  })
  pipeline.push({
    $lookup: {
      from: 'fournisseurs',
      let: { "fournisseur": "$fournisseur" },
      pipeline: [{
        $match:
        {
          $expr: {
            "$and": [
              { "$eq": ["$_id", "$$fournisseur"] },
            ]
          }
        }
      },
      ],
      as: "fournisseurs"
    }
  })

  pipeline.push({
    $set: {
      technicien: { $arrayElemAt: ["$techniciens.nom", 0] },
      fournisseur: { $arrayElemAt: ["$fournisseurs.nom", 0] },
      operationPreventif: { $arrayElemAt: ["$operationpreventifs.libelle", 0] },
      periodicite: { $arrayElemAt: ["$periodicites.libelle", 0] },
      montant: { $toString: "$montant" },
      dureeExecution: { $toString: "$dureeExecution" },
      alerteAvant: { $toString: "$alerteAvant" },
      dernierDate: {
        $dateToString: {
          format: "%Y-%m-%d", date: "$dernierDate"
        }
      },
      prochaineDate: {
        $dateToString: {
          format: "%Y-%m-%d", date: "$prochaineDate"
        }
      },
      id: "$_id"
    }
  })

  pipeline.push({
    $project: {
      id: 1,
      libelle: 1,
      operationPreventif: 1,
      machine: 1,
      dernierDate: 1,
      prochaineDate: 1,
      periodicite: 1,
      alerteAvant: 1,
      interne: 1,
      dureeExecution: 1,
      montant: 1,
      notes: 1,
      technicien: 1,
      fournisseur: 1,
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

  const articles = await PlanPreventif.aggregate(pipeline)

  sommePipeline.push({
    $count: "total"
  })

  var nbrTotal = await PlanPreventif.aggregate(sommePipeline)

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
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


/**
 * @swagger
 * /planPreventifs/getById/{id}:
 *   get:
 *     summary: Remove the PlanPreventif by id
 *     tags: [PlanPreventifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The PlanPreventif id
 *
 *     responses:
 *       200:
 *         description: The PlanPreventif was deleted
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
 *                     operationPreventif:
 *                       type: string
 *                     machine:
 *                       type: string
 *                     dernierDate:
 *                       type: date
 *                     prochaineDate:
 *                       type: date
 *                     periodicite:
 *                       type: number
 *                     alerteAvant:
 *                       type: number
 *                     interne:
 *                       type: string
 *                     dureeExecution:
 *                       type: number
 *                     montant:
 *                       type: string
 *                     interne:
 *                       type: string
 *                     societeRacine:
 *                       type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The PlanPreventif was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async (req, res) => {

  try{
  if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

  var planPreventif = await PlanPreventif.findOne({ _id: req.params.id })

  return res.send({ status: true, resultat: planPreventif })

} catch (e) {
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})


/**
 * @swagger
 * /planPreventifs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [PlanPreventifs]
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
 *                  operationPreventifs:
 *                    type: array   
 *                  planPreventifs:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getAllParametres/:id', async (req, res) => {
 
  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

  const operationPreventifs = await OperationPreventif.find({ societeRacine: societeRacine })
  const machines = await Machine.find({ societeRacine: societeRacine })
  const periodicites = await Periodicite.find({ societeRacine: societeRacine })
  const planPreventifs = await PlanPreventif.find({ societeRacine: societeRacine })
  const techniciens = await Technicien.find({ societeRacine: societeRacine })
  const fournisseurs = await Fournisseur.find({ societeRacine: societeRacine })
  
  return res.send({
    status: true, operationPreventifs: operationPreventifs,
    planPreventifs: planPreventifs, machines: machines, periodicites: periodicites,
    techniciens: techniciens, fournisseurs: fournisseurs,
  })

} catch (e) {
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})

/**
 * @swagger
 * /planPreventifs/getAllListeTaches:
 *   get:
 *     summary: Remove the article by id
 *     tags: [PlanPreventifs]
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
 *                  listeTaches:
 *                    type: array   
 *                  planPreventifs:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getAllListeTaches/:id', async (req, res) => {
  try{
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

  const planPreventifs = await PlanPreventif.find({ societeRacine: societeRacine })
  var list = {
    planPreventif: "",
    machine: "",
    tab: []
  }
  var allListeTaches = []
  for (let item of planPreventifs) {
    list.planPreventif = item.libelle
    list.machine = item.machine
    list.tab.push(item.listTaches)
    allListeTaches.push(list)
    list = {
      planPreventif: "",
      machine: "",
      tab: []
    }
  }

  return res.send({ status: true, allListeTaches: allListeTaches })

} catch (e) {
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
module.exports.routerPlanPreventif = router
