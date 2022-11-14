const { BonTravail, getNumeroAutomatique } = require('../Models/bonTravailModel')
const { BonTravailArticle } = require('../Models/bonTravailArticleModel')
const { Article, getArticlesWithQuantitesfilterBySearch } = require('../Models/articleModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')
const { Personnel } = require('../Models/personnelModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now())
    }
})
const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
const { consolelog } = require('../Models/errorModel')
var ObjectId = require('mongodb').ObjectID;


var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     BonTravail:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - personnel
 *         - societe
 *         - articleAchats
 *       properties:
 *         numero:
 *           type: number
 *         date:
 *           type: date
 *         personnel:
 *           type: string
 *         societe:
 *           type: string
 *         articleAchats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               numero:
 *                 type: number
 *               article:
 *                 type: string
 *               reference:
 *                 type: string
 *               designation:
 *                 type: string
 *               prixVenteHT:
 *                 type: number
 *               quantite:
 *                 type: number
 *               unite:
 *                 type: string
 *         
 */

/**
 * @swagger
 * tags:
 *   name: BonTravails
 *   description: The BonTravails managing API
 */


/**
 * @swagger
 * paths:
 *   /bonTravails/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonTravails]
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
 * /bonTravails/newBonTravail:
 *   post:
 *     summary: Returns the list of all the BonTravails
 *     tags: [BonTravails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                numero:
 *                  type: number
 *                date:
 *                  type: date
 *                personnel:
 *                  type: string
 *                societe:
 *                  type: string
 *                articleAchats:
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
 *                      prixVenteHT:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the BonTravails
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
 *                      type: number
 *                    date:
 *                      type: date
 *                    personnel:
 *                      type: string
 *                    societe:
 *                      type: string
 *                    articleAchats:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          numero:
 *                            type: number
 *                          article:
 *                            type: string
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixVenteHT:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *
 */
router.post('/newBonTravail', verifytoken, async (req, res) => {
    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        const bonTravail = new BonTravail(req.body);
        const result = await bonTravail.save()

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonTravailArticle(req.body.articles[i])

            let article = await Article.findById(req.body.articles[i].article)
            article = await Article.findOneAndUpdate({ _id: req.body.articles[i].article }, { qteEnStock: Number(article.qteEnStock) - Number(req.body.articles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) - Number(req.body.articles[i].quantiteVente) })

            item.bonTravail = result.id
            item.date = result.date
            const resul = item.save()
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
 * /bonTravails/modifierBonTravail/{id}:
 *   post:
 *     summary: Update the BonTravail by id
 *     tags: [BonTravails]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTravail id

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
 *                 type: number
 *                date:
 *                 type: date
 *                personnel:
 *                 type: string
 *                societe:
 *                 type: string
 *                articleAchats:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      numero:
 *                        type: number
 *                      article:
 *                        type: string
 *                      reference:
 *                        type: string
 *                      designation:
 *                        type: string
 *                      prixVenteHT:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string
 *     responses:
 *       200:
 *         description: The list of the BonTravails
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
 *                      type: number
 *                     date:
 *                      type: string
 *                     personnel:
 *                      type: string
 *                     societe:
 *                      type: string
 *                     articleAchats:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          numero:
 *                            type: number
 *                          article:
 *                            type: string
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixVenteHT:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *
 *
 */

router.post('/modifierBonTravail/:id', verifytoken, async (req, res) => {

    try {
        const bonTravail = await BonTravail.findById(req.params.id)

        if (!bonTravail) return res.status(401).send({ status: false })


        const result = await BonTravail.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonTravail2 = await BonTravail.findById(req.params.id)

        const bonTravailArticles = await BonTravailArticle.find({ bonTravail: req.params.id })

        for (let i = 0; i < bonTravailArticles.length; i++) {

            let article = await Article.findById(bonTravailArticles[i].article)
            article = await Article.findOneAndUpdate({ _id: bonTravailArticles[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(bonTravailArticles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(bonTravailArticles[i].quantiteVente) })

            const deleteItem = await BonTravailArticle.findOneAndDelete({ _id: bonTravailArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonTravailArticle(req.body.articles[i])

            let article = await Article.findById(req.body.articles[i].article)
            article = await Article.findOneAndUpdate({ _id: req.body.articles[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(req.body.articles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(req.body.articles[i].quantiteVente) })

            item.bonTravail = result.id
            item.date = result.date
            const resul = item.save()
        }
        return res.send({ status: true, resultat: bonTravail2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonTravails/addArticleAchats/{id}:
 *   post:
 *     summary: Update the BonTravail by id
 *     tags: [BonTravails]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTravail id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                numero:
 *                  type: number
 *                article:
 *                  type: string
 *                reference:
 *                  type: string
 *                designation:
 *                  type: string
 *                prixVenteHT:
 *                  type: string
 *                quantite:
 *                  type: number
 *                unite:
 *                  type: string 
 *     responses:
 *       200:
 *         description: The list of the BonTravails
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

router.post('/addArticleAchats/:id', verifytoken, async (req, res) => {

    try {
        const bonTravail = await BonTravail.findById(req.params.id)

        if (!bonTravail) return res.status(401).send({ status: false })


        var articleAchats = []

        articleAchats.push(req.body)

        for (let i = 0; i < bonTravail.articleAchats.length; i++) {
            articleAchats.push(bonTravail.articleAchats[i])
        }

        const result = await BonTravail.findOneAndUpdate({ _id: req.params.id }, { articleAchats: articleAchats })

        const bonTravail2 = await BonTravail.findById(req.params.id)

        return res.send({ status: true, resultat: bonTravail2.articleAchats })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonTravails/deleteBonTravail/{id}:
 *   post:
 *     summary: Remove the BonTravail by id
 *     tags: [BonTravails]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTravail id
 *
 *     responses:
 *       200:
 *         description: The BonTravail was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The BonTravail was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonTravail/:id', verifytoken, async (req, res) => {

    try {
        const bonTravail = await BonTravail.findById(req.params.id)

        if (!bonTravail) return res.status(401).send({ status: false })


        const bonTravailArticles = await BonTravailArticle.find({ bonTravail: req.params.id })

        for (let i = 0; i < bonTravailArticles.length; i++) {
            let article = await Article.findById(bonTravailArticles[i].article)
            article = await Article.findOneAndUpdate({ _id: bonTravailArticles[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(bonTravailArticles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(bonTravailArticles[i].quantiteVente) })
            const deleteItem = await BonTravailArticle.findOneAndDelete({ _id: bonTravailArticles[i].id })
        }

        if (await BonTravail.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonTravails/listBonTravails:
 *   post:
 *     summary: Returns the list of all the BonTravails
 *     tags: [BonTravails]
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
 *         description: The list of the BonTravails
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
 *                              type: number
 *                            date:
 *                              type: date
 *                            personnel:
 *                              type: string
 *                            societe:
 *                              type: string
 *                            articleAchats:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  numero:
 *                                    type: number
 *                                  article:
 *                                    type: string
 *                                  reference:
 *                                    type: string
 *                                  designation:
 *                                    type: string
 *                                  prixVenteHT:
 *                                    type: number
 *                                  quantite:
 *                                    type: number
 *                                  unite:
 *                                    type: string
 *                                  createdAt:
 *                                    type: string
 *                                  updatedAt:
 *                                    type: string
 *
 *
 *
 */

router.post('/listBonTravails', verifytoken, async (req, res) => {

    try {
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
            sort = { _id: -1 }
        }

        var pipeline = []

        pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

        pipeline.push({
            $lookup: {
                from: 'personnels',
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
                },
                ],
                as: "personnels"
            }
        })


        pipeline.push({
            $set: {
                personnel: { $arrayElemAt: ["$personnels.nom", 0] },
                totalRemise: { $toString: "$totalRemise" },
                totalHT: { $toString: "$totalHT" },
                totalTVA: { $toString: "$totalTVA" },
                tFiscale: { $toString: "$timbreFiscale" },
                totalTTC: { $toString: "$totalTTC" },
                totalGain: { $toString: "$totalGain" },

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
                personnel: 1,
                totalRemise: 1,
                totalHT: 1,
                totalTVA: 1,
                tFiscale: 1,
                totalTTC: 1,
                totalGain: 1,
                date: 1,
                numero: 1
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

        const articles = await BonTravail.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await BonTravail.aggregate(sommePipeline)

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
 * /bonTravails/getById/{id}:
 *   get:
 *     summary: Remove the BonTravail by id
 *     tags: [BonTravails]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTravail id
 *
 *     responses:
 *       200:
 *         description: The BonTravail was deleted
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
 *                       type: number
 *                     date:
 *                       type: date
 *                     personnel:
 *                       type: string
 *                     articleAchats:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          numero:
 *                             type: number
 *                          article:
 *                             type: string
 *                          reference:
 *                             type: string
 *                          designation:
 *                             type: string
 *                          prixVenteHT:
 *                             type: number
 *                          quantite:
 *                             type: number
 *                          unite:
 *                             type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The BonTravail was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonTravail = await BonTravail.findOne({ _id: req.params.id })

        const bonTravailArticles = await BonTravailArticle.find({ bonTravail: req.params.id })

        return res.send({ status: true, resultat: bonTravail, bonTravailArticles: bonTravailArticles })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonTravails/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonTravails]
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
 *                  articles:
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
        var numeroAutomatique = await getNumeroAutomatique(societeRacine, exercice)

        const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enVente: 'non' })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const personnels = await Personnel.find({ societe: societe })

        return res.send({
            status: true,
            personnels: personnels,
            uniteMesures: uniteMesures,
            articles: articles,
            numeroAutomatique: numeroAutomatique.numero
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
module.exports.routerBonTravail = router
