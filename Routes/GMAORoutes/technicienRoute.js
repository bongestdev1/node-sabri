const { Technicien, validateTechnicien } = require('../../Models/GMAOModels/technicienModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');
const { TypeTier } = require('../../Models/typeTierModel');

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;


var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../../Models/userModel');

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
 *     Technicien:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - role
 *         - email
 *         - telephone
 *         - adresse
 *         - societeRacine
 *       properties:
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         role:
 *           type: string
 *         email:
 *           type: string
 *         telephone:
 *           type: string
 *         adresse:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Techniciens
 *   description: The Techniciens managing API
 */


/**
 * @swagger
 * paths:
 *   /techniciens/upload:
 *     post:
 *       summary: upload image
 *       tags: [Techniciens]
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
 * /techniciens/newTechnicien:
 *   post:
 *     summary: Returns the list of all the Techniciens
 *     tags: [Techniciens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                prenom:
 *                  type: string
 *                role:
 *                  type: string
 *                email:
 *                  type: string
 *                telephone:
 *                  type: string
 *                adresse:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Techniciens
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
 *                    nom:
 *                      type: string
 *                    prenom:
 *                      type: string
 *                    role:
 *                      type: string
 *                    email:
 *                      type: string
 *                    telephone:
 *                      type: string
 *                    adresse:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newTechnicien', async (req, res) => {

    try{
    //const {error}=validateTechnicien(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

    const technicien=new Technicien(req.body);

    const result = await technicien.save()

    return res.send({ status: true, resultat: result })

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /techniciens/modifierTechnicien/{id}:
 *   post:
 *     summary: Update the Technicien by id
 *     tags: [Techniciens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Technicien id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                prenom:
 *                  type: string
 *                role:
 *                  type: string
 *                email:
 *                  type: string
 *                telephone:
 *                  type: string
 *                adresse:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Techniciens
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
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     adresse:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierTechnicien/:id', async (req, res) => {

    try{
    // const {error}=validateTechnicien(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const technicien = await Technicien.findById(req.params.id)

    if (!technicien) return res.status(401).send({ status: false })


    const result = await Technicien.findOneAndUpdate({ _id: req.params.id }, req.body)

    const technicien2 = await Technicien.findById(req.params.id)

    return res.send({ status: true, resultat: technicien2 })

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /techniciens/deleteTechnicien/{id}:
 *   post:
 *     summary: Remove the Technicien by id
 *     tags: [Techniciens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Technicien id
 *
 *     responses:
 *       200:
 *         description: The Technicien was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Technicien was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteTechnicien/:id', async (req, res) => {

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const technicien = await Technicien.findById(req.params.id)

    if (!technicien) return res.status(401).send({ status: false })


    if (await Technicien.findOneAndDelete({ _id: req.params.id })) {
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
 * /techniciens/listTechniciens:
 *   post:
 *     summary: Returns the list of all the Techniciens
 *     tags: [Techniciens]
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
 *         description: The list of the Techniciens
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
 *                            nom:
 *                              type: string
 *                            prenom:
 *                              type: string
 *                            role:
 *                              type: string
 *                            email:
 *                              type: string
 *                            telephone:
 *                              type: string
 *                            adresse:
 *                              type: string
 *                            societeRacine:
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

router.post('/listTechniciens', async (req, res) => {

    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societeRacine))
  
    var sort = {}
    
    for( let key in req.body.orderBy){
        if(Number(req.body.orderBy[key]) != 0){
             sort[key] = req.body.orderBy[key]
        }  

    }

    if (Object.keys(sort).length == 0) {
        sort = { createdAt: -1 }
    }

   
    var listFilter =[]

    listFilter.push({societeRacine:societeRacine})

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
        result = await Technicien.paginate({ $and: listFilter }, options)
    } else if (listFilter.length == 1) {
        result = await Technicien.paginate(listFilter[0], options)
    } else {
        result = await Technicien.paginate({}, options)
    }
    return res.send({ status: true, resultat: result, request: req.body })

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /techniciens/getAllParametres/{id}:
 *   get:
 *     summary: Remove the Technicien by id
 *     tags: [Techniciens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Technicien id
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
 *                  roles:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', async(req,res)=>{
    
    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
    const roles = await TypeTier.find({societeRacine:societeRacine})
    const techniciens = await Technicien.find({societeRacine:societeRacine})
    return res.send({status:true,roles:roles,techniciens:techniciens}) 

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
    
})


/**
 * @swagger
 * /techniciens/getById/{id}:
 *   get:
 *     summary: Remove the Technicien by id
 *     tags: [Techniciens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Technicien id
 *
 *     responses:
 *       200:
 *         description: The Technicien was deleted
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
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     adresse:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Technicien was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    const technicien = await Technicien.findOne({ _id: req.params.id })

    return res.send({ status: true, resultat: technicien })

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

module.exports.routerTechnicien = router
