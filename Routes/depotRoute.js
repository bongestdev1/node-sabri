const { Depot, validateDepot, getNumeroAutomatiqueDepot } = require('../Models/depotModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;


/**
 * @swagger
 * /depots/newDepot:
 *   post:
 *     summary: Returns the list of all the depots
 *     tags: [Depots]
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
 *                depots:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the Depots
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

router.post('/newDepot', verifytoken, async (req, res) => {

    //const {error}=validateDepot(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    try {

        var body = req.body

        body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
        var numero = await getNumeroAutomatiqueDepot(body.societeRacine)
        body.num = numero.num

        const fepot = new Depot(body);

        const resultDepot = await fepot.save()

        var newDepots = []

        return res.send({ status: true, resultat: resultDepot })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /Depots/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [Depots]
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
 *                  Depots:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getAllParametres/:id', verifytoken, async (req, res) => {
    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

        const depots = await Depot.find({ societeRacine: societeRacine })

        return res.send({ status: true, depots: depots })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /Depots/modifierDepot/{id}:
 *   post:
 *     summary: Update the Depot by id
 *     tags: [Depots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Depot id

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
 *                Depots:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the Depots
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

router.post('/modifierDepot/:id', verifytoken, async (req, res) => {

    /* const {error}=validateDepot(req.body)
     if(error) return res.status(400).send({status:false,message:error.details[0].message})
 */
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    try {
        const depot = await Depot.findById(req.params.id)

        if (!depot) return res.status(401).send({ status: false })

        const result = await Depot.findOneAndUpdate({ _id: req.params.id }, req.body)



        const depot2 = await Depot.findById(req.params.id)

        return res.send({ status: true, resultat: depot2 })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /Depots/deleteDepot/{id}:
 *   post:
 *     summary: Remove the Depot by id
 *     tags: [Depots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Depot id
 *
 *     responses:
 *       200:
 *         description: The Depot was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Depot was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteDepot/:id', verifytoken, async (req, res) => {

    try {
        const depot = await Depot.findById(req.params.id)

        if (!depot) return res.status(401).send({ status: false })


        if (await Depot.findOneAndDelete({ _id: req.params.id })) {
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
 * /Depots/listDepots:
 *   post:
 *     summary: Returns the list of all the Depots
 *     tags: [Depots]
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
 *         description: The list of the Depots
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

router.post('/listDepots', verifytoken, async (req, res) => {

    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})

    try {
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
            result = await Depot.paginate({ $and: listFilter }, options)
        } else if (listFilter.length == 1) {
            result = await Depot.paginate(listFilter[0], options)
        } else {
            result = await Depot.paginate({}, options)
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
 * /Depots/getById/{id}:
 *   get:
 *     summary: Remove the Depot by id
 *     tags: [Depots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Depot id
 *
 *     responses:
 *       200:
 *         description: The Depot was deleted
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
 *         description: The Depot was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const depot = await Depot.findOne({ _id: req.params.id })

        return res.send({ status: true, resultat: depot })
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

module.exports.routerDepot = router
