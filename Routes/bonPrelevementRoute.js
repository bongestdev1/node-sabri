const { BonPrelevement } = require('../Models/bonPrelevementModel')
const { BonPrelevementArticle } = require('../Models/bonPrelevementArticleModel')
const { Article } = require('../Models/articleModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
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
 *     BonPrelevement:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - magasinier
 *         - personnel
 *         - articleAchats
 *       properties:
 *         numero:
 *           type: number
 *         date:
 *           type: date
 *         magasinier:
 *           type: string
 *         personnel:
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
 *   name: BonPrelevements
 *   description: The BonPrelevements managing API
 */


/**
 * @swagger
 * paths:
 *   /bonPrelevements/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonPrelevements]
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
 * /bonPrelevements/newBonPrelevement:
 *   post:
 *     summary: Returns the list of all the BonPrelevements
 *     tags: [BonPrelevements]
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
 *                magasinier:
 *                  type: string
 *                personnel:
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
 *         description: The list of the BonPrelevements
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
 *                    magasinier:
 *                      type: string
 *                    personnel:
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
router.post('/newBonPrelevement', verifytoken, async (req, res) => {

    try {
        var body = req.body

        body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

        const bonPrelevement = new BonPrelevement(body);
        const result = await bonPrelevement.save()


        for (let i = 0; i < req.body.articleAchats.length; i++) {
            let item = new BonPrelevementArticle(req.body.articleAchats[i])

            let article = await Article.findById(req.body.articleAchats[i].article)
            article = await Article.findOneAndUpdate({ _id: req.body.articleAchats[i].article }, { qteEnStock: Number(article.qteEnStock) - Number(req.body.articleAchats[i].quantite), qteTheorique: Number(article.qteTheorique) - Number(req.body.articleAchats[i].quantite) })

            item.bonPrelevement = result.id
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
 * /bonPrelevements/modifierBonPrelevement/{id}:
 *   post:
 *     summary: Update the BonPrelevement by id
 *     tags: [BonPrelevements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonPrelevement id

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
 *                magasinier:
 *                 type: string
 *                personnel:
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
 *         description: The list of the BonPrelevements
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
 *                     magasinier:
 *                      type: string
 *                     personnel:
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

router.post('/modifierBonPrelevement/:id', verifytoken, async (req, res) => {

    try {
        const bonPrelevement = await BonPrelevement.findById(req.params.id)

        if (!bonPrelevement) return res.status(401).send({ status: false })


        const result = await BonPrelevement.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonPrelevement2 = await BonPrelevement.findById(req.params.id)

        const bonPrelevementArticles = await BonPrelevementArticle.find({ bonPrelevement: req.params.id })

        for (let i = 0; i < bonPrelevementArticles.length; i++) {

            let article = await Article.findById(bonPrelevementArticles[i].article)
            article = await Article.findOneAndUpdate({ _id: bonPrelevementArticles[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(bonPrelevementArticles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(bonPrelevementArticles[i].quantiteVente) })

            const deleteItem = await BonPrelevementArticle.findOneAndDelete({ _id: bonPrelevementArticles[i].id })
        }

        for (let i = 0; i < req.body.articleAchats.length; i++) {
            let item = new BonPrelevementArticle(req.body.articleAchats[i])

            let article = await Article.findById(req.body.articleAchats[i].article)
            article = await Article.findOneAndUpdate({ _id: req.body.articleAchats[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(req.body.articles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(req.body.articles[i].quantiteVente) })

            item.bonPrelevement = result.id
            item.date = result.date
            const resul = item.save()
        }
        return res.send({ status: true, resultat: bonPrelevement2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonPrelevements/addArticleAchats/{id}:
 *   post:
 *     summary: Update the BonPrelevement by id
 *     tags: [BonPrelevements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonPrelevement id
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
 *         description: The list of the BonPrelevements
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
        const bonPrelevement = await BonPrelevement.findById(req.params.id)

        if (!bonPrelevement) return res.status(401).send({ status: false })


        var articleAchats = []

        articleAchats.push(req.body)

        for (let i = 0; i < bonPrelevement.articleAchats.length; i++) {
            articleAchats.push(bonPrelevement.articleAchats[i])
        }

        const result = await BonPrelevement.findOneAndUpdate({ _id: req.params.id }, { articleAchats: articleAchats })

        const bonPrelevement2 = await BonPrelevement.findById(req.params.id)

        return res.send({ status: true, resultat: bonPrelevement2.articleAchats })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonPrelevements/deleteBonPrelevement/{id}:
 *   post:
 *     summary: Remove the BonPrelevement by id
 *     tags: [BonPrelevements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonPrelevement id
 *
 *     responses:
 *       200:
 *         description: The BonPrelevement was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The BonPrelevement was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonPrelevement/:id', verifytoken, async (req, res) => {

    try {
        const bonPrelevement = await BonPrelevement.findById(req.params.id)

        if (!bonPrelevement) return res.status(401).send({ status: false })


        const bonPrelevementArticles = await BonPrelevementArticle.find({ bonPrelevement: req.params.id })

        for (let i = 0; i < bonPrelevementArticles.length; i++) {
            let article = await Article.findById(bonPrelevementArticles[i].article)
            article = await Article.findOneAndUpdate({ _id: bonPrelevementArticles[i].article }, { qteEnStock: Number(article.qteEnStock) + Number(bonPrelevementArticles[i].quantiteVente), qteTheorique: Number(article.qteTheorique) + Number(req.body.articles[i].quantiteVente) })

            const deleteItem = await BonPrelevementArticle.findOneAndDelete({ _id: bonPrelevementArticles[i].id })
        }

        if (await BonPrelevement.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonPrelevements/listBonPrelevements:
 *   post:
 *     summary: Returns the list of all the BonPrelevements
 *     tags: [BonPrelevements]
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
 *         description: The list of the BonPrelevements
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
 *                            magasinier:
 *                              type: string
 *                            personnel:
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

router.post('/listBonPrelevements', verifytoken, async (req, res) => {

    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

        var sort = {}
        for (let key in req.body.orderBy) {
            if (Number(req.body.orderBy[key]) != 0) {
                sort[key] = req.body.orderBy[key]
            }
        }

        if (Object.keys(sort).length == 0) {
            sort = { _id: -1 }
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
            populate: [{ path: 'article' }],
            sort: sort
        };

        var result = []

        if (listFilter.length > 1) {
            result = await BonPrelevement.paginate({ $and: listFilter }, options)
        } else if (listFilter.length == 1) {
            result = await BonPrelevement.paginate(listFilter[0], options)
        } else {
            result = await BonPrelevement.paginate({}, options)
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
 * /bonPrelevements/getById/{id}:
 *   get:
 *     summary: Remove the BonPrelevement by id
 *     tags: [BonPrelevements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonPrelevement id
 *
 *     responses:
 *       200:
 *         description: The BonPrelevement was deleted
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
 *                     magasinier:
 *                       type: string
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
 *         description: The BonPrelevement was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonPrelevement = await BonPrelevement.findOne({ _id: req.params.id })

        const bonPrelevementArticles = await BonPrelevementArticle.find({ bonPrelevement: req.params.id })

        return res.send({ status: true, resultat: bonPrelevement, bonPrelevementArticles: bonPrelevementArticles })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonPrelevements/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonPrelevements]
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
router.get('/getAllParametres', verifytoken, async (req, res) => {

    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

        const articles = await Article.find({ societeRacine: societeRacine })
        const articles2 = []
        for (let i of articles) {
            if (i.enVente === "oui") {
                articles2.push(i)
            }
        }
        return res.send({ status: true, articles2: articles2 })
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
module.exports.routerBonPrelevement = router
