const { BonTransfert, getNumeroAutomatique } = require('../Models/bonTransfertModel')
const { BonTransfertArticle } = require('../Models/bonTransfertArticleModel')
const { Article, getArticlesWithQuantites } = require('../Models/articleModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')
const { Utilisateur } = require('../Models/utilisateurModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');
var ObjectId = require('mongodb').ObjectID;

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
const { ArticleSociete } = require('../Models/articleSocieteModel')
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
 *     BonTransfert:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - totalRemise
 *         - totaleHT
 *         - totalTVA
 *         - tFiscale
 *         - totalTTC
 *         - totalGain
 *         - montantPaye
 *         - credit
 *         - magasinDepart
 *         - magasinArrive
 *         - societe
 *         - expeditions
 *       properties:
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *         totalRemise:
 *           type: number
 *         totaleHT:
 *           type: number
 *         totalTVA:
 *           type: number
 *         tFiscale:
 *           type: number
 *         totalTTC:
 *           type: number
 *         totalGain:
 *           type: number
 *         montantPaye:
 *           type: number
 *         credit:
 *           type: number
 *         magasinDepart:
 *           type: string
 *         magasinArrive:
 *           type: string
 *         societe:
 *           type: string
 *         expeditions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               transporteur:
 *                 type: string
 *               date:
 *                 type: string
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     numero:
 *                      type: number
 *                     article:
 *                      type: string
 *                     reference:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     quantiteVente:
 *                       type: number
 *                     quantiteLivree:
 *                       type: number
 *                     quantiteALivree:
 *                       type: number
 *                     quantiteRestant:
 *                       type: number
 *                     unite:
 *                       type: string
 *         
 */

/**
 * @swagger
 * tags:
 *   name: BonTransferts
 *   description: The BonTransferts managing API
 */


/**
 * @swagger
 * paths:
 *   /bonTransferts/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonTransferts]
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
 * /bonTransferts/newBonTransfert:
 *   post:
 *     summary: Returns the list of all the BonTransferts
 *     tags: [BonTransferts]
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
 *                totalRemise:
 *                  type: number
 *                totaleHT:
 *                  type: number
 *                totalTVA:
 *                  type: number
 *                tFiscale:
 *                  type: number
 *                totalTTC:
 *                  type: number
 *                totalGain:
 *                  type: number
 *                montantPaye:
 *                  type: number
 *                credit:
 *                  type: number
 *                magasinDepart:
 *                  type: string
 *                magasinArrive:
 *                  type: string
 *                expeditions:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      transporteur:
 *                        type: string
 *                      date:
 *                        type: string
 *                      articles:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            numero:
 *                              type: number
 *                            article:
 *                              type: string
 *                            reference:
 *                              type: string
 *                            designation:
 *                              type: string
 *                            quantiteVente:
 *                              type: number
 *                            quantiteLivree:
 *                              type: number
 *                            quantiteALivree:
 *                              type: number
 *                            quantiteRestant:
 *                              type: number
 *                            unite:
 *                              type: string 
 *     responses:
 *       200:
 *         description: The list of the BonTransferts
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
 *                    totalRemise:
 *                      type: number
 *                    totaleHT:
 *                      type: number
 *                    totalTVA:
 *                      type: number
 *                    tFiscale:
 *                      type: number
 *                    totalTTC:
 *                      type: number
 *                    totalGain:
 *                      type: number
 *                    montantPaye:
 *                      type: number
 *                    credit:
 *                      type: number
 *                    magasinDepart:
 *                      type: string
 *                    magasinArrive:
 *                      type: string
 *                    expeditions:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          transporteur:
 *                            type: string
 *                          articles:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                numero:
 *                                  type: number
 *                                article:
 *                                  type: string
 *                                reference:
 *                                  type: string
 *                                designation:
 *                                  type: string
 *                                quantiteVente:
 *                                  type: number
 *                                quantiteLivree:
 *                                  type: number
 *                                quantiteALivree:
 *                                  type: number
 *                                quantiteRestant:
 *                                  type: number
 *                                unite:
 *                                  type: string
 *
 */
router.post('/newBonTransfert', verifytoken, async (req, res) => {

    try{
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    req.body.numero = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    const bonTransfert = new BonTransfert(req.body);
    const result = await bonTransfert.save()
    for (let i = 0; i < req.body.articles.length; i++) {
        let item = new BonTransfertArticle(req.body.articles[i])

        //modification stock de societe Arrivee et societe depart
        if (ObjectId.isValid(req.body.magasinArrive) && ObjectId.isValid(req.body.magasinDepart) && ObjectId.isValid(req.body.articles[i].article)) {
            let articleSocieteDepart = await ArticleSociete.findOne({ article: req.body.articles[i].article, societe: req.body.magasinDepart })
            if(articleSocieteDepart){
                await ArticleSociete.findOneAndUpdate({ _id: articleSocieteDepart.id }, { qteEnStock: Number(articleSocieteDepart.qteEnStock) - Number(req.body.articles[i].quantiteVente), qteTheorique: Number(articleSocieteDepart.qteTheorique) - Number(req.body.articles[i].quantiteVente) })
            }
            let articleSocieteArrive = await ArticleSociete.findOne({ article: req.body.articles[i].article, societe: req.body.magasinArrive })
            if(articleSocieteArrive){
                await ArticleSociete.findOneAndUpdate({ _id: articleSocieteArrive.id }, { qteEnStock: Number(articleSocieteArrive.qteEnStock) + Number(req.body.articles[i].quantiteVente), qteTheorique: Number(articleSocieteArrive.qteTheorique) + Number(req.body.articles[i].quantiteVente) })
            }
            //modification stock de societe Arrivee et societe depart
        }

        item.bonTransfert = result.id
        item.date = result.date
        item.societe = societe
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
 * /bonTransferts/modifierBonTransfert/{id}:
 *   post:
 *     summary: Update the BonTransfert by id
 *     tags: [BonTransferts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTransfert id

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
 *                 type: string
 *                date:
 *                 type: string
 *                totalRemise:
 *                 type: number
 *                totaleHT:
 *                 type: number
 *                totalTVA:
 *                 type: number
 *                tFiscale:
 *                 type: number
 *                totalTTC:
 *                 type: number
 *                totalGain:
 *                 type: number
 *                montantPaye:
 *                 type: number
 *                credit:
 *                 type: number
 *                magasinDepart:
 *                 type: string
 *                magasinArrive:
 *                 type: string
 *                expeditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      transporteur:
 *                        type: string
 *                      date:
 *                        type: string
 *                      articles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                            numero:
 *                              type: number
 *                            article:
 *                              type: string
 *                            reference:
 *                              type: string
 *                            designation:
 *                              type: string
 *                            quantiteVente:
 *                              type: number
 *                            quantiteLivree:
 *                              type: number
 *                            quantiteALivree:
 *                              type: number
 *                            quantiteRestant:
 *                              type: number
 *                            unite:
 *                              type: string
 *     responses:
 *       200:
 *         description: The list of the BonTransferts
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
 *                      type: string
 *                     date:
 *                      type: string
 *                     totalRemise:
 *                      type: number
 *                     totaleHT:
 *                      type: number
 *                     totalTVA:
 *                      type: number
 *                     tFiscale:
 *                      type: number
 *                     totalTTC:
 *                      type: number
 *                     totalGain:
 *                      type: number
 *                     montantPaye:
 *                      type: number
 *                     montantPaye:
 *                      type: number
 *                     magasinDepart:
 *                      type: string
 *                     magasinArrive:
 *                      type: string
 *                     expeditions:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          transporteur:
 *                            type: string
 *                          date:
 *                            type: string
 *                          articles:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                numero:
 *                                  type: number
 *                                article:
 *                                  type: string
 *                                reference:
 *                                  type: string
 *                                designation:
 *                                  type: string
 *                                quantiteVente:
 *                                  type: number
 *                                quantiteLivree:
 *                                  type: number
 *                                quantiteALivree:
 *                                  type: number
 *                                quantiteRestant:
 *                                  type: number
 *                                unite:
 *                                  type: string
 *
 *
 */

router.post('/modifierBonTransfert/:id', verifytoken, async (req, res) => {

    try{
    const bonTransfert = await BonTransfert.findById(req.params.id)

    if (!bonTransfert) return res.status(401).send({ status: false })

    /*var body = Object.keys(req.body).reduce((object, key) => {
        if (key !== "societe" && key !== "magasinDepart") {
          object[key] = req.body[key]
        }
        return object
    }, {})*/

    const result = await BonTransfert.findOneAndUpdate({ _id: req.params.id }, req.body)

    const bonTransfert2 = await BonTransfert.findById(req.params.id)

    const bonTransfertArticles = await BonTransfertArticle.find({ bonTransfert: req.params.id })

    for (let i = 0; i < bonTransfertArticles.length; i++) {
        let article = await Article.findById(bonTransfertArticles[i].article)

        //modification stock de societe Arrivee et societe depart
        let articleSocieteDepart = await ArticleSociete.findOne({ article: bonTransfertArticles[i].article, societe: bonTransfert.magasinDepart })
        if(articleSocieteDepart) await ArticleSociete.findOneAndUpdate({ _id: articleSocieteDepart.id }, { qteEnStock: Number(articleSocieteDepart.qteEnStock) + Number(bonTransfertArticles[i].quantiteVente), qteTheorique: Number(articleSocieteDepart.qteTheorique) + Number(bonTransfertArticles[i].quantiteVente) })
        let articleSocieteArrive = await ArticleSociete.findOne({ article: bonTransfertArticles[i].article, societe: bonTransfert.magasinArrive })
        if(articleSocieteArrive)  await ArticleSociete.findOneAndUpdate({ _id: articleSocieteArrive.id }, { qteEnStock: Number(articleSocieteArrive.qteEnStock) - Number(bonTransfertArticles[i].quantiteVente), qteTheorique: Number(articleSocieteArrive.qteTheorique) - Number(bonTransfertArticles[i].quantiteVente) })
        //modification stock de societe Arrivee et societe depart

        const deleteItem = await BonTransfertArticle.findOneAndDelete({ _id: bonTransfertArticles[i].id })
    }

    for (let i = 0; i < req.body.articles.length; i++) {
        let item = new BonTransfertArticle(req.body.articles[i])
        let article = await Article.findById(req.body.articles[i].article)

        //modification stock de societe Arrivee et societe depart
        let articleSocieteDepart = await ArticleSociete.findOne({ article: req.body.articles[i].article, societe: req.body.magasinDepart })
        if(articleSocieteDepart) await ArticleSociete.findOneAndUpdate({ _id: articleSocieteDepart.id }, { qteEnStock: Number(articleSocieteDepart.qteEnStock) - Number(req.body.articles[i].quantiteVente), qteTheorique: Number(articleSocieteDepart.qteTheorique) - Number(req.body.articles[i].quantiteVente) })
        let articleSocieteArrive = await ArticleSociete.findOne({ article: req.body.articles[i].article, societe: req.body.magasinArrive })
        if(articleSocieteArrive) await ArticleSociete.findOneAndUpdate({ _id: articleSocieteArrive.id }, { qteEnStock: Number(articleSocieteArrive.qteEnStock) + Number(req.body.articles[i].quantiteVente), qteTheorique: Number(articleSocieteArrive.qteTheorique) + Number(req.body.articles[i].quantiteVente) })
        //modification stock de societe Arrivee et societe depart

        item.bonTransfert = result.id
        item.date = result.date
        item.societe = result.societe
        const resul = item.save()
    }
    return res.send({ status: true, resultat: bonTransfert2 })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /bonTransferts/addExpedition/{id}:
 *   post:
 *     summary: Update the BonTransfert by id
 *     tags: [BonTransferts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTransfert id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                transporteur:
 *                  type: string
 *                date:
 *                  type: string
 *                articles:
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
 *                      quantiteVente:
 *                        type: number
 *                      quantiteALivree:
 *                        type: number
 *                      quantiteRestant:
 *                        type: number
 *                      unite:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the BonTransferts
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

router.post('/addExpedition/:id', verifytoken, async (req, res) => {

    try{
    const bonTransfert = await BonTransfert.findById(req.params.id)

    if (!bonTransfert) return res.status(401).send({ status: false })


    var expeditions = []

    expeditions.push(req.body)

    for (let i = 0; i < bonTransfert.expeditions.length; i++) {
        expeditions.push(bonTransfert.expeditions[i])
    }

    const result = await BonTransfert.findOneAndUpdate({ _id: req.params.id }, { expeditions: expeditions })

    const bonTransfert2 = await BonTransfert.findById(req.params.id)

    return res.send({ status: true, resultat: bonTransfert2.expeditions })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /bonTransferts/deleteBonTransfert/{id}:
 *   post:
 *     summary: Remove the BonTransfert by id
 *     tags: [BonTransferts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTransfert id
 *
 *     responses:
 *       200:
 *         description: The BonTransfert was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The BonTransfert was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonTransfert/:id', verifytoken, async (req, res) => {

    try{
    const bonTransfert = await BonTransfert.findById(req.params.id)

    if (!bonTransfert) return res.status(401).send({ status: false })

    const bonTransfertArticles = await BonTransfertArticle.find({ bonTransfert: req.params.id })

    for (let i = 0; i < bonTransfertArticles.length; i++) {
        let article = await Article.findById(bonTransfertArticles[i].article)

        //modification stock de societe Arrivee et societe depart
        let articleSocieteDepart = await ArticleSociete.findOne({ article: bonTransfertArticles[i].article, societe: bonTransfert.magasinDepart })
        if(articleSocieteDepart) await ArticleSociete.findOneAndUpdate({ _id: articleSocieteDepart.id }, { qteEnStock: Number(articleSocieteDepart.qteEnStock) + Number(bonTransfertArticles[i].quantiteVente), qteTheorique: Number(articleSocieteDepart.qteTheorique) + Number(bonTransfertArticles[i].quantiteVente) })
        let articleSocieteArrive = await ArticleSociete.findOne({ article: bonTransfertArticles[i].article, societe: bonTransfert.magasinArrive })
        if(articleSocieteArrive) await ArticleSociete.findOneAndUpdate({ _id: articleSocieteArrive.id }, { qteEnStock: Number(articleSocieteArrive.qteEnStock) - Number(bonTransfertArticles[i].quantiteVente), qteTheorique: Number(articleSocieteArrive.qteTheorique) - Number(bonTransfertArticles[i].quantiteVente) })
        //modification stock de societe Arrivee et societe depart

        const deleteItem = await BonTransfertArticle.findOneAndDelete({ _id: bonTransfertArticles[i].id })
    }

    if (await BonTransfert.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonTransferts/listBonTransferts:
 *   post:
 *     summary: Returns the list of all the BonTransferts
 *     tags: [BonTransferts]
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
 *         description: The list of the BonTransferts
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
 *                            totalRemise:
 *                              type: number
 *                            totaleHT:
 *                              type: number
 *                            totalTVA:
 *                              type: number
 *                            tFiscale:
 *                              type: number
 *                            totalTTC:
 *                              type: number
 *                            totalGain:
 *                              type: number
 *                            montantPaye:
 *                              type: number
 *                            credit:
 *                              type: number
 *                            magasinDepart:
 *                              type: string
 *                            magasinArrive:
 *                              type: string
 *                            expeditions:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  transporteur:
 *                                    type: string
 *                                  date:
 *                                    type: string
 *                                  articles:
 *                                    type: array
 *                                    items:
 *                                      type: object
 *                                      properties:
 *                                        numero:
 *                                          type: number
 *                                        article:
 *                                          type: string
 *                                        reference:
 *                                          type: string
 *                                        designation:
 *                                          type: string
 *                                        quantiteVente:
 *                                          type: number
 *                                        quantiteLivree:
 *                                          type: number
 *                                        quantiteALivree:
 *                                          type: number
 *                                        quantiteRestant:
 *                                          type: number
 *                                        unite:
 *                                          type: string
 *                                  createdAt:
 *                                    type: string
 *                                  updatedAt:
 *                                    type: string
 *
 *
 *
 */

router.post('/listBonTransferts', verifytoken, async (req, res) => {

    try{
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

    pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, $or: [{ magasinArrive: societe }, { magasinDepart: societe }] } })

    pipeline.push({
        $lookup: {
            from: 'societes',
            let: { "magasinArrive": "$magasinArrive" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$magasinArrive"] },
                        ]
                    }
                }
            },
            ],
            as: "magasinarrives"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'societes',
            let: { "magasinDepart": "$magasinDepart" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$magasinDepart"] },
                        ]
                    }
                }
            },
            ],
            as: "magasindeparts"
        }
    })

    pipeline.push({
        $set: {
            magasinArrive: { $arrayElemAt: ["$magasinarrives.raisonSociale", 0] },
            magasinDepart: { $arrayElemAt: ["$magasindeparts.raisonSociale", 0] },
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
            magasinDepart: 1,
            magasinArrive: 1,
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

    const articles = await BonTransfert.aggregate(pipeline)

    sommePipeline.push({
        $count: "total"
    })

    var nbrTotal = await BonTransfert.aggregate(sommePipeline)

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
 * /bonTransferts/getById/{id}:
 *   get:
 *     summary: Remove the BonTransfert by id
 *     tags: [BonTransferts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonTransfert id
 *
 *     responses:
 *       200:
 *         description: The BonTransfert was deleted
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
 *                     totalRemise:
 *                       type: number
 *                     totaleHT:
 *                       type: number
 *                     totalTVA:
 *                       type: number
 *                     tFiscale:
 *                       type: number
 *                     totalTTC:
 *                       type: number
 *                     totalGain:
 *                       type: number
 *                     montantPaye:
 *                       type: number
 *                     credit:
 *                       type: number
 *                     magasinDepart:
 *                       type: string
 *                     magasinArrive:
 *                       type: string
 *                     expeditions:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          transporteur:
 *                            type: string
 *                          date:
 *                            type: string
 *                          articles:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                numero:
 *                                  type: number
 *                                article:
 *                                  type: string
 *                                reference:
 *                                  type: string
 *                                designation:
 *                                  type: string
 *                                quantiteVente:
 *                                  type: number
 *                                quantiteLivree:
 *                                  type: number
 *                                quantiteALivree:
 *                                  type: number
 *                                quantiteRestant:
 *                                  type: number
 *                                unite:
 *                                  type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The BonTransfert was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    var bonTransfert = await BonTransfert.findOne({ _id: req.params.id })

    const bonTransfertArticles = await BonTransfertArticle.find({ bonTransfert: req.params.id })

    return res.send({ status: true, resultat: bonTransfert, bonTransfertArticles: bonTransfertArticles })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /bonTransferts/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonTransferts]
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
 *                  societes:
 *                    type: array        
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post('/getAllParametres', verifytoken, async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    const articles = await getArticlesWithQuantites(societe, societeRacine)
    const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
    const societes = await getSocietesBySocieteParent(societeRacine)
    const utilisateurs = await Utilisateur.find({ societeRacine: societeRacine }).select({ id: 1, nom: 1, prenom: 1, email: 1 })
    /*var societesFiltree = []
    for(let item of societes){
        if(item.id != societe){
            societesFiltree.push(item)
        }
    }*/
    return res.send({ status: true, uniteMesures: uniteMesures, articles: articles, numeroAutomatique: numeroAutomatique.numero, societes: societes, utilisateurs: utilisateurs })

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
module.exports.routerBonTransfert = router
