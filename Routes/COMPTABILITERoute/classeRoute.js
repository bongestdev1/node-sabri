
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../../Models/userModel')

var ObjectId = require('mongodb').ObjectID;
const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../../Models/societeModel')
const { Classe } = require('../../Models/COMPTABILITEModel/classeModel')

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
 *     Classe:
 *       type: object
 *       required:
 *         - classeParent
 *         - code
 *         - libelle
 *       properties:
 *         classeParent:
 *           type: string
 *         code:
 *           type: string
 *         libelle:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: The Classes managing API
 */


/**
 * @swagger
 * paths:
 *   /classes/upload:
 *     post:
 *       summary: upload image
 *       tags: [Classes]
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
  const files = req.files
  let arr = [];
  files.forEach(element => {

    arr.push(element.path)

  })
  return res.send(arr)
})


/**
 * @swagger
 * /classes/newClasse:
 *   post:
 *     summary: Returns the list of all the Classes
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 classeParent:
 *                   type: string
 *                 code:
 *                   type: string
 *                 libelle:
 *                   type: string
 *     responses:
 *       200:
 *         description: The list of the Classes
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
 *                    classeParent:
 *                      type: string
 *                    code:
 *                      type: string
 *                    libelle:
 *                      type: string
 *
 */
router.post('/newClasse', async (req, res) => {

  //const {error}=validateClasse(req.body)
  //if(error) return res.status(400).send({status:false,message:error.details[0].message})

  //if(req.user.user.role != "admin") return res.status(401).send({status:false})
  var body = req.body

  body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

  const classe = new Classe(body);

  const result = await classe.save()

  console.log(result)
  return res.send({ status: true, resultat: result })

})


/**
 * @swagger
 * /classes/modifierClasse/{id}:
 *   post:
 *     summary: Update the Classe by id
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Classe id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *                classeParent:
 *                  type: string
 *                code:
 *                  type: string
 *                libelle:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Classes
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
 *                     classeParent:
 *                       type: string
 *                     code:
 *                       type: string
 *                     libelle:
 *                       type: string
 *
 *
 */

router.post('/modifierClasse/:id', async (req, res) => {

  //const {error}=validateClasse(req.body)
  //if(error) return res.status(400).send({status:false,message:error.details[0].message})

  //if(req.user.user.role != "admin") return res.status(401).send({status:false})
  const classe = await Classe.findById(req.params.id)

  if (!classe) return res.status(401).send({ status: false })

  const result = await Classe.findOneAndUpdate({ _id: req.params.id }, { listTaches: req.body.search.listTaches })

  const classe2 = await Classe.findById(req.params.id)

  return res.send({ status: true, resultat: classe2 })
})

/**
 * @swagger
 * /classes/deleteClasse/{id}:
 *   post:
 *     summary: Remove the Classe by id
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Classe id
 *
 *     responses:
 *       200:
 *         description: The Classe was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Classe was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteClasse/:id', async (req, res) => {

  //if(req.user.user.role != "admin") return res.status(401).send({status:false})

  const classe = await Classe.findById(req.params.id)

  if (!classe) return res.status(401).send({ status: false })


  if (await Classe.findOneAndDelete({ _id: req.params.id })) {
    return res.send({ status: true })
  } else {
    return res.send({ status: false })
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
 * /classes/listClasses:
 *   post:
 *     summary: Returns the list of all the Classes
 *     tags: [Classes]
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
 *         description: The list of the Classes
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
 *                            classeParent:
 *                              type: string
 *                            code:
 *                              type: string
 *                            libelle:
 *                              type: string
 *
 *
 *
 */

router.post('/listClasses', async (req, res) => {

  //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
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
   
    var listFilter =[]
    listFilter.push({societeRacine:societeRacine})
    
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

            listFilter.push({$or:[objet1, objet2, objet3]})
        }  
    }

    const options = {
        page: Number(req.body.page),
        limit: Number(req.body.limit),
        customLabels: myCustomLabels,
        //populate: 'client'
        sort:sort
    };

    var result = []
    
    if(listFilter.length > 1){
      result = await  Classe.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  Classe.paginate(listFilter[0], options)
    }else{
      result = await  Classe.paginate({}, options)
    }

    return res.send({status:true, resultat:result, request:req.body})
    
})


/**
 * @swagger
 * /classes/getById/{id}:
 *   get:
 *     summary: Remove the Classe by id
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Classe id
 *
 *     responses:
 *       200:
 *         description: The Classe was deleted
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
 *                     classeParent:
 *                       type: string
 *                     code:
 *                       type: string
 *                     libelle:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Classe was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async (req, res) => {

  if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

  const classe = await Classe.findOne({ _id: req.params.id })

  return res.send({ status: true, resultat: classe })

})


/**
 * @swagger
 * /classes/getAllParametres:
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
 *                  classes:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', async (req, res) => {
  var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

  const classes = await Classe.find({ societeRacine: societeRacine })

  return res.send({
    status: true, classes: classes,
  })

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

module.exports.routerClasse = router
