const { Categorie, getNumeroAutomatiqueCategorie } = require('../Models/categorieModel')
const { CategorieFamille } = require('../Models/categorieFamilleModel')
const { Famille } = require('../Models/familleModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel');
const { consolelog } = require('../Models/errorModel');

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
 *     Categorie:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *         order:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: The categories managing API
 */


/**
 * @swagger
 * paths:
 *   /categories/upload:
 *     post:
 *       summary: upload image
 *       tags: [Categories]
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
router.post('/upload', upload.array('myFiles'),verifytoken ,async (req, res) => {
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
 * /categories/newCategorie:
 *   post:
 *     summary: Returns the list of all the categories
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                order:
 *                  type: number
 *                familles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the categories
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
 *                    order:
 *                      type: number
 *
 */

router.post('/newCategorie',verifytoken , async (req, res) => {

    try{
    var body = req.body

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
    var numero = await getNumeroAutomatiqueCategorie(body.societeRacine)
    body.num = numero.num

    const categorie = new Categorie(body);

    const resultCategorie = await categorie.save()

    const familles = req.body.familles

    var newFamilles = []

    for (let i = 0; i < familles.length; i++) {
        const nbrFamilles = await Famille.count({ _id: familles[i].id })
        const nbrExistesDeja = await CategorieFamille.count({ categorie: resultCategorie.id, famille: familles[i].id })

        if (nbrExistesDeja == 0 && nbrFamilles == 1) {
            const categorieFamille = new CategorieFamille({ categorie: resultCategorie.id, famille: familles[i].id, societeRacine: body.societeRacine });
            const resultCategorieFamille = await categorieFamille.save()
            newFamilles.push(resultCategorieFamille)
        }
    }

    return res.send({ status: true, resultat: resultCategorie })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /categories/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The projet id
 * 
 *     responses:
 *       200:
 *         description: The projet was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  categories:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getAllParametres/:id',verifytoken , async (req, res) => {
   
    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

    const categories = await Categorie.find({ societeRacine: societeRacine })

    return res.send({ status: true, categories: categories })
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})
/**
 * @swagger
 * /categories/modifierCategorie/{id}:
 *   post:
 *     summary: Update the categorie by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The categorie id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                order:
 *                  type: number
 *                familles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the categories
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
 *                     order:
 *                       type: number
 *                     
 *
 *
 */

router.post('/modifierCategorie/:id',verifytoken , async (req, res) => {

    try{
    const categorie = await Categorie.findById(req.params.id)

    if (!categorie) return res.status(401).send({ status: false })

    const result = await Categorie.findOneAndUpdate({ _id: req.params.id }, {
        libelle: req.body.libelle,
        order: req.body.order
    })

    const familles = req.body.familles

    for (let i = 0; i < familles.length; i++) {
        const nbrFamilles = await Famille.count({ _id: familles[i].id })
        const nbrExistesDeja = await CategorieFamille.count({ categorie: req.params.id, famille: familles[i].id })

        if (nbrExistesDeja == 0 && nbrFamilles == 1) {
            const categorieFamille = new CategorieFamille({ categorie: req.params.id, famille: familles[i].id, societeRacine: categorie.societeRacine });
            const resultCategorieFamille = await categorieFamille.save()
        }
    }

    const categorieFamilles = await CategorieFamille.find({ categorie: req.params.id })

    for (let i = 0; i < categorieFamilles.length; i++) {
        var isExist = false
        for (let j = 0; j < familles.length; j++) {
            if (categorieFamilles[i].famille == familles[j].id) {
                isExist = true
            }
        }
        if (!isExist) {
            const deleteCategorieFamille = await CategorieFamille.findOneAndDelete({ _id: categorieFamilles[i].id })
        }
    }

    const categorie2 = await Categorie.findById(req.params.id)

    return res.send({ status: true, resultat: categorie2 })
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /categories/deleteCategorie/{id}:
 *   post:
 *     summary: Remove the categorie by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The categorie id
 *
 *     responses:
 *       200:
 *         description: The categorie was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The categorie was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteCategorie/:id',verifytoken , async (req, res) => {

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const categorie = await Categorie.findById(req.params.id)

    if (!categorie) return res.status(401).send({ status: false })


    if (await Categorie.findOneAndDelete({ _id: req.params.id })) {
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
 * /categories/listCategories:
 *   post:
 *     summary: Returns the list of all the categories
 *     tags: [Categories]
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
 *         description: The list of the categories
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
 *                            order:
 *                              type: number
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

router.post('/listCategories',verifytoken ,async (req, res) => {

    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})

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

    var listFilter = []

    listFilter.push({ societeRacine: societeRacine })


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

            listFilter.push({ $or: [objet1, objet2, objet3] })
        }
    }

    const options = {
        page: Number(req.body.page),
        limit: Number(req.body.limit),
        customLabels: myCustomLabels,
        //populate: 'client'
        sort: sort
    };

    var result = []

    if (listFilter.length > 1) {
        result = await Categorie.paginate({ $and: listFilter }, options)
    } else if (listFilter.length == 1) {
        result = await Categorie.paginate(listFilter[0], options)
    } else {
        result = await Categorie.paginate({}, options)
    }

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
 * /categories/getById/{id}:
 *   get:
 *     summary: Remove the categorie by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The categorie id
 *
 *     responses:
 *       200:
 *         description: The categorie was deleted
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
 *                     order:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The categorie was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken , async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    const categorie = await Categorie.findOne({ _id: req.params.id })

    const categorieFamilles = await CategorieFamille.find({ categorie: req.params.id }).populate({ path: "famille", select: "_id, libelle" })

    return res.send({ status: true, resultat: categorie, familles: categorieFamilles })
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

module.exports.routerCategorie = router
