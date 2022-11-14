
const { ConditionReglement, validateConditionReglement } = require('../Models/conditionReglementModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

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
 *     ConditionReglement:
 *       type: object
 *       required:
 *         - libelle
 *         - societeRacine
 *       properties:
 *         libelle:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: ConditionReglements
 *   description: The ConditionReglements managing API
 */


/**
 * @swagger
 * paths:
 *   /conditionReglements/upload:
 *     post:
 *       summary: upload image
 *       tags: [ConditionReglements]
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
 * /conditionReglements/newConditionReglement:
 *   post:
 *     summary: Returns the list of all the ConditionReglements
 *     tags: [ConditionReglements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the ConditionReglements
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
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newConditionReglement', verifytoken, async (req, res) => {

    try {
        //const {error}=validateConditionReglement(req.body)
        //if(error) return res.status(400).send({status:false,message:error.details[0].message})

        //if(req.user.user.role != "admin") return res.status(401).send({status:false})
        var body = req.body


        body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

        const conditionReglement = new ConditionReglement(body);


        const result = await conditionReglement.save()

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
 * /conditionReglements/modifierConditionReglement/{id}:
 *   post:
 *     summary: Update the ConditionReglement by id
 *     tags: [ConditionReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ConditionReglement id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the ConditionReglements
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
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierConditionReglement/:id', verifytoken, async (req, res) => {

    try {
        // const {error}=validateConditionReglement(req.body)
        //if(error) return res.status(400).send({status:false,message:error.details[0].message})

        //if(req.user.user.role != "admin") return res.status(401).send({status:false})

        const conditionReglement = await ConditionReglement.findById(req.params.id)

        if (!conditionReglement) return res.status(401).send({ status: false })


        const result = await ConditionReglement.findOneAndUpdate({ _id: req.params.id }, req.body)

        const conditionReglement2 = await ConditionReglement.findById(req.params.id)

        return res.send({ status: true, resultat: conditionReglement2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /conditionReglements/deleteConditionReglement/{id}:
 *   post:
 *     summary: Remove the ConditionReglement by id
 *     tags: [ConditionReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ConditionReglement id
 *
 *     responses:
 *       200:
 *         description: The ConditionReglement was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The ConditionReglement was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteConditionReglement/:id', verifytoken, async (req, res) => {

    try {
        //if(req.user.user.role != "admin") return res.status(401).send({status:false})

        const conditionReglement = await ConditionReglement.findById(req.params.id)

        if (!conditionReglement) return res.status(401).send({ status: false })

        if (await ConditionReglement.findOneAndDelete({ _id: req.params.id })) {
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
 * /conditionReglements/listConditionReglements:
 *   post:
 *     summary: Returns the list of all the ConditionReglements
 *     tags: [ConditionReglements]
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
 *         description: The list of the ConditionReglements
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

router.post('/listConditionReglements', verifytoken, async (req, res) => {

    try {
        //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
        var societeRacine = await getSocieteRacine(ObjectId(req.body.societeRacine))

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
            result = await ConditionReglement.paginate({ $and: listFilter }, options)
        } else if (listFilter.length == 1) {
            result = await ConditionReglement.paginate(listFilter[0], options)
        } else {
            result = await ConditionReglement.paginate({}, options)
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
 * /conditionReglements/getById/{id}:
 *   get:
 *     summary: Remove the ConditionReglement by id
 *     tags: [ConditionReglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ConditionReglement id
 *
 *     responses:
 *       200:
 *         description: The ConditionReglement was deleted
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
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The ConditionReglement was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const conditionReglement = await ConditionReglement.findOne({ _id: req.params.id })

        return res.send({ status: true, resultat: conditionReglement })

    } catch (e) {
    consolelog(e) 
    
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
router.get('/getAllParametres/:id', verifytoken, async (req, res) => {
    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

        const conditionReglements = await ConditionReglement.find({ societeRacine: societeRacine })

        return res.send({
            status: true, conditionReglements: conditionReglements,
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

module.exports.routerConditionReglement = router
