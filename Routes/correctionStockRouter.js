const { CorrectionStock, getNumeroAutomatique } = require('../Models/correctionStockModel')
const { Article, getArticlesWithQuantites } = require('../Models/articleModel')
const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
const { Personnel } = require('../Models/personnelModel')
const { ArticleSociete } = require('../Models/articleSocieteModel')
const { Utilisateur } = require('../Models/utilisateurModel')
const { consolelog } = require('../Models/errorModel')
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
 *     CorrectionStock:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - magasin
 *         - cloture
 *         - personne
 *         - notes
 *         - ligneCorrectionStocks
 *       properties:
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *         magasin:
 *           type: string
 *         cloture:
 *           type: boolean
 *         personne:
 *           type: string
 *         notes:
 *           type: string 
 *         ligneCorrectionStocks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               article:
 *                 type: string
 *               qteTeorique:
 *                 type: number
 *               qteDifference:
 *                 type: number
 *               qteNouvelle:
 *                 type: number
 *               notes:
 *                 type: string 
 *         
 */

/**
 * @swagger
 * tags:
 *   name: CorrectionStocks
 *   description: The CorrectionStocks managing API
 */


/**
 * @swagger
 * paths:
 *   /correctionStocks/upload:
 *     post:
 *       summary: upload image
 *       tags: [CorrectionStocks]
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
 * /correctionStocks/newCorrectionStock:
 *   post:
 *     summary: Returns the list of all the CorrectionStocks
 *     tags: [CorrectionStocks]
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
 *                magasin:
 *                  type: string
 *                cloture:
 *                  type: boolean
 *                personne:
 *                  type: string
 *                notes:
 *                  type: string 
 *                ligneCorrectionStocks:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                      article:
 *                        type: string
 *                      qteTeorique:
 *                        type: number
 *                      qteDifference:
 *                        type: number
 *                      qteNouvelle:
 *                        type: number
 *                      notes:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the CorrectionStocks
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
 *                    magasin:
 *                      type: string
 *                    cloture:
 *                      type: boolean
 *                    personne:
 *                      type: string
 *                    notes:
 *                      type: string 
 *                    ligneCorrectionStocks:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: number
 *                          article:
 *                            type: string
 *                          qteTeorique:
 *                            type: number
 *                          qteDifference:
 *                            type: number
 *                          qteNouvelle:
 *                            type: number
 *                          notes:
 *                            type: string
 *
 */
router.post('/newCorrectionStock', verifytoken, async (req, res) => {

    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        const correctionStock = new CorrectionStock(req.body);

        const result = await correctionStock.save()

        for (let i = 0; i < req.body.ligneCorrectionStocks.length; i++) {
            let articles = await ArticleSociete.findOne({article:req.body.ligneCorrectionStocks[i].article, societe: societe})
            if(articles){
                var qteNouvelle = req.body.ligneCorrectionStocks[i].qteDifference + articles.qteEnStock
                const article = await ArticleSociete.findOneAndUpdate({ article: req.body.ligneCorrectionStocks[i].article, societe: societe }, { qteEnStock: Number(qteNouvelle), qteTheorique: Number(qteNouvelle) })
            } 
        }

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
 * /correctionStocks/modifierCorrectionStock/{id}:
 *   post:
 *     summary: Update the correctionStock by id
 *     tags: [CorrectionStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The CorrectionStock id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                  type: string
 *                numero:
 *                  type: string
 *                date:
 *                  type: string
 *                magasin:
 *                  type: string
 *                cloture:
 *                  type: boolean
 *                personne:
 *                  type: string
 *                notes:
 *                  type: string 
 *                ligneCorrectionStocks:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                      article:
 *                        type: string
 *                      qteTeorique:
 *                        type: number
 *                      qteDifference:
 *                        type: number
 *                      qteNouvelle:
 *                        type: number
 *                      notes:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the CorrectionStocks
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
 *                       type: string
 *                     date:
 *                       type: string
 *                     magasin:
 *                       type: string
 *                     cloture:
 *                       type: boolean
 *                     personne:
 *                       type: string
 *                     notes:
 *                       type: string 
 *                     ligneCorrectionStocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           article:
 *                             type: string
 *                           qteTeorique:
 *                             type: number
 *                           qteDifference:
 *                             type: number
 *                           qteNouvelle:
 *                             type: number
 *                           notes:
 *                             type: string  
 *
 *
 */

router.post('/modifierCorrectionStock/:id', verifytoken, async (req, res) => {
    try {
        const correctionStock = await CorrectionStock.findById(req.params.id)

        if (!correctionStock) return res.status(401).send({ status: false })

        var societe = correctionStock.societe

        for (let i = 0; i < correctionStock.ligneCorrectionStocks.length; i++) {
            let articles = await ArticleSociete.findOne({article:correctionStock.ligneCorrectionStocks[i].article, societe: societe})
            if(articles){
                var qteNouvelle =  articles.qteEnStock - correctionStock.ligneCorrectionStocks[i].qteDifference
                const article = await ArticleSociete.findOneAndUpdate({ article: correctionStock.ligneCorrectionStocks[i].article, societe: societe }, { qteEnStock: Number(qteNouvelle), qteTheorique: Number(qteNouvelle) })
            }   
        }

        for (let i = 0; i < req.body.ligneCorrectionStocks.length; i++) {
            let articles = await ArticleSociete.findOne({article:req.body.ligneCorrectionStocks[i].article, societe: societe})
            if(articles){
                var qteNouvelle = req.body.ligneCorrectionStocks[i].qteDifference + articles.qteEnStock
                const article = await ArticleSociete.findOneAndUpdate({ article: req.body.ligneCorrectionStocks[i].article, societe: societe }, { qteEnStock: Number(qteNouvelle), qteTheorique: Number(qteNouvelle) })
            }   
        }

        const result = await CorrectionStock.findOneAndUpdate({ _id: req.params.id }, req.body)

        const correctionStock2 = await CorrectionStock.findById(req.params.id)

        return res.send({ status: true, resultat: correctionStock2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /correctionStocks/deleteCorrectionStock/{id}:
 *   post:
 *     summary: Remove the correctionStock by id
 *     tags: [CorrectionStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The CorrectionStock id
 *
 *     responses:
 *       200:
 *         description: The CorrectionStock was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The CorrectionStock was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteCorrectionStock/:id', verifytoken, async (req, res) => {

    try {

        const correctionStock = await CorrectionStock.findById(req.params.id)

        if (!correctionStock) return res.status(401).send({ status: false })

        for (let i = 0; i < correctionStock.ligneCorrectionStocks.length; i++) {
            let articles = await ArticleSociete.findOne({article:correctionStock.ligneCorrectionStocks[i].article, societe: correctionStock.societe})
            if(articles){
                var qteNouvelle =  articles.qteEnStock - correctionStock.ligneCorrectionStocks[i].qteDifference
                const article = await ArticleSociete.findOneAndUpdate({ article: correctionStock.ligneCorrectionStocks[i].article, societe: correctionStock.societe }, { qteEnStock: Number(qteNouvelle), qteTheorique: Number(qteNouvelle) })
            }   
        }

        if (await CorrectionStock.findOneAndDelete({ _id: req.params.id })) {
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
 * /correctionStocks/listCorrectionStocks:
 *   post:
 *     summary: Returns the list of all the CorrectionStocks
 *     tags: [CorrectionStocks]
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
 *         description: The list of the CorrectionStocks
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
 *                            magasin:
 *                              type: string
 *                            cloture:
 *                              type: boolean
 *                            personne:
 *                              type: string
 *                            notes:
 *                              type: string 
 *                            ligneCorrectionStocks:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  id:
 *                                    type: number
 *                                  article:
 *                                    type: string
 *                                  qteTeorique:
 *                                    type: number
 *                                  qteDifference:
 *                                    type: number
 *                                  qteNouvelle:
 *                                    type: number
 *                                  notes:
 *                                    type: string 
 *
 *
 *
 */
router.post('/listCorrectionStocks', verifytoken, async (req, res) => {

    try {
        var societe = ObjectId(req.body.societe)

        //await ArticleSociete.findOneAndUpdate({societe:societe}, {qteEnStock:0, qteTheorique:0})

        var sort = {}
        for (let key in req.body.orderBy) {
            if (Number(req.body.orderBy[key]) != 0) {
                sort[key] = req.body.orderBy[key]
            }
        }

        if (Object.keys(sort).length == 0) {
            sort = { _id: -1 }
        }

        var pipeline = []


        pipeline.push({ $match: { societe: societe } })


        pipeline.push({
            $lookup: {
                from: 'utilisateurs',
                let: { "personnel": "$personnel" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$personnel"] },
                            ]
                        }
                    }
                }],
                as: "personnels"
            }
        })

        pipeline.push({
            $set: {
                personnel: { $arrayElemAt: ["$personnels.nom", 0] },
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$date"
                    }
                },
                id: "$_id",
            }
        })

        pipeline.push({
            $project: { id: 1, date: 1, numero: 1, personnel: 1 }
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

        const articles = await CorrectionStock.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })


        var nbrTotal = await CorrectionStock.aggregate(sommePipeline)

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
 * /correctionStocks/getById/{id}:
 *   get:
 *     summary: Remove the CorrectionStock by id
 *     tags: [CorrectionStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The CorrectionStock id
 *
 *     responses:
 *       200:
 *         description: The CorrectionStock was deleted
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
 *                     magasin:
 *                       type: string
 *                     cloture:
 *                       type: boolean
 *                     personne:
 *                       type: string
 *                     notes:
 *                       type: string 
 *                     ligneCorrectionStocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           article:
 *                             type: string
 *                           qteTeorique:
 *                             type: number
 *                           qteDifference:
 *                             type: number
 *                           qteNouvelle:
 *                             type: number
 *                           notes:
 *                             type: string  
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The CorrectionStock was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {
    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const correctionStock = await CorrectionStock.findOne({ _id: req.params.id })

        return res.send({ status: true, resultat: correctionStock })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /correctionStocks/getAllParametres:
 *   get:
 *     summary: 
 *     tags: [CorrectionStocks]
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
 *                  articles:
 *                    type: array
 *                  societes:
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
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        const articles = await getArticlesWithQuantites(societe, societeRacine)
        const personnels = await Utilisateur.find({ societeRacine: societeRacine })

        return res.send({ status: true, personnels: personnels, articles: articles, numeroAutomatique: numeroAutomatique.numero })
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
module.exports.routerCorrectionStock = router
