const { DevisAchat, getNumeroAutomatique } = require('../Models/devisAchatModel')
const { DevisAchatArticle } = require('../Models/devisAchatArticleModel')
const { Parametres } = require('../Models/parametresModel')

const { Reception } = require('../Models/receptionModel')

const { Article, getArticlesWithQuantites, getArticlesWithQuantitesfilterBySearch } = require('../Models/articleModel')

const { ChargeDirecte } = require('../Models/chargeDirecteModel')
const { ArticleSociete, updateQteEnStock, updateQteTherique, updateQteTheriqueQteEnStock } = require('../Models/articleSocieteModel')
var ObjectId = require('mongodb').ObjectID;

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')

const { Fournisseur } = require('../Models/fournisseurModel')
const { BonCommande } = require('../Models/bonCommandeModel')
const { BonCommandeArticle } = require('../Models/bonCommandeArticleModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Reglement, setLiltragedevisAchat, getReglementsByDocuments } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { HistoriqueArticleAchat } = require('../Models/historiqueArticleAchatModel')
const { Transporteur } = require('../Models/transporteursModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { OrdreEmission } = require('../Models/ordreEmissionModel')
const { DemandeOffrePrix } = require('../Models/demandeOffrePrixModel')
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
 *     devisAchat:
 *       type: object
 *       required:
 *         - numero
 *         - date
 *         - tiers
 *         - plafondCredit
 *         - credit
 *         - restPayer
 *         - montantPaye
 *         - totalRedevance
 *         - totalFodec
 *         - escompte
 *         - montantEscompte
 *         - totalRemise
 *         - totalDC
 *         - totaleHT
 *         - totalTVA
 *         - tFiscale
 *         - totalTTC
 *         - totalGain
 *         - ligneBLs
 *       properties:
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *         tiers:
 *           type: string
 *         plafondCredit:
 *           type: number
 *         credit:
 *           type: number
 *         restPayer:
 *           type: number
 *         montantPaye:
 *           type: number
 *         totalRedevance:
 *           type: number
 *         totalFodec:
 *           type: number
 *         escompte:
 *           type: number
 *         montantEscompte:
 *           type: number
 *         totalRemise:
 *           type: number
 *         totalDC:
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
 *         ligneBLs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               article:
 *                 type: string
 *               numero:
 *                 type: number
 *               reference:
 *                 type: string
 *               designation:
 *                 type: string
 *               prixHT:
 *                 type: number
 *               tauxRemise:
 *                 type: number
 *               montantRemise:
 *                 type: number
 *               prixAchat:
 *                 type: number
 *               quantite:
 *                 type: number
 *               unite:
 *                 type: string
 *               totalRemise:
 *                 type: number
 *               totalHt:
 *                 type: number
 *               tauxTVA:
 *                 type: number
 *               totalTVA:
 *                 type: number
 *               redevance:
 *                 type: number
 *               totalTTC:
 *                 type: number 
 *         
 */

/**
 * @swagger
 * tags:
 *   name: devisAchats
 *   description: The devisAchats managing API
 */


/**
 * @swagger
 * paths:
 *   /devisAchats/upload:
 *     post:
 *       summary: upload image
 *       tags: [devisAchats]
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
router.post('/upload', upload.array('myFiles'),verifytoken, async (req, res) => {
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
 * /devisAchats/newdevisAchat:
 *   post:
 *     summary: Returns the list of all the devisAchats
 *     tags: [devisAchats]
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
 *                tiers:
 *                  type: string
 *                plafondCredit:
 *                  type: number
 *                credit:
 *                  type: number
 *                restPayer:
 *                  type: number
 *                montantPaye:
 *                  type: number
 *                totalRedevance:
 *                  type: number
 *                totalFodec:
 *                  type: number
 *                escompte:
 *                  type: number
 *                montantEscompte:
 *                  type: number
 *                totalRemise:
 *                  type: number
 *                totalDC:
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
 *                ligneBLs:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      article:
 *                        type: string
 *                      numero:
 *                        type: number
 *                      reference:
 *                        type: string
 *                      designation:
 *                        type: string
 *                      prixHT:
 *                        type: number
 *                      tauxRemise:
 *                        type: number
 *                      montantRemise:
 *                        type: number
 *                      prixAchat:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string
 *                      totalRemise:
 *                        type: number
 *                      totalHt:
 *                        type: number
 *                      tauxTVA:
 *                        type: number
 *                      totalTVA:
 *                        type: number
 *                      redevance:
 *                        type: number
 *                      totalTTC:
 *                        type: number 
 *     responses:
 *       200:
 *         description: The list of the devisAchats
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
 *                    tiers:
 *                      type: string
 *                    plafondCredit:
 *                      type: number
 *                    credit:
 *                      type: number
 *                    restPayer:
 *                      type: number
 *                    montantPaye:
 *                      type: number
 *                    totalRedevance:
 *                      type: number
 *                    totalFodec:
 *                      type: number
 *                    escompte:
 *                      type: number
 *                    montantEscompte:
 *                      type: number
 *                    totalRemise:
 *                      type: number
 *                    totalDC:
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
 *                    ligneBLs:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          article:
 *                            type: string
 *                          numero:
 *                            type: number
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixHT:
 *                            type: number
 *                          tauxRemise:
 *                            type: number
 *                          montantRemise:
 *                            type: number
 *                          prixAchat:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *                          totalRemise:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
 *                            type: number
 *                          redevance:
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *
 */
router.post('/newDevisAchat',verifytoken, async (req, res) => {

    try{
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    if(!ObjectId.isValid(req.body.demandeOffrePrix)){
        req.body.demandeOffrePrix = null
    }

    if(!ObjectId.isValid(req.body.bonCommande)){
        req.body.bonCommande = null
    }

    req.body.numero = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    const devisAchat = new DevisAchat(req.body);

    const result = await devisAchat.save()

    for (let i = 0; i < req.body.articles.length; i++) {
        let item = new DevisAchatArticle(req.body.articles[i])
        if (devisAchat.validationStockDevisAchat == 'oui') {
            await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")
        }

        item.devisAchat = result.id
        item.date = result.date
        item.societe = result.societe
        const resul = await item.save()
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
 * /devisAchats/modifierDevisAchat/{id}:
 *   post:
 *     summary: Update the DevisAchat by id
 *     tags: [DevisAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DevisAchat id

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
 *                tiers:
 *                 type: string
 *                plafondCredit:
 *                 type: number
 *                credit:
 *                 type: number
 *                restPayer:
 *                 type: number
 *                montantPaye:
 *                 type: number
 *                totalRedevance:
 *                 type: number
 *                totalFodec:
 *                 type: number
 *                escompte:
 *                 type: number
 *                montantEscompte:
 *                 type: number
 *                totalRemise:
 *                 type: number
 *                totalDC:
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
 *                ligneBLs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      article:
 *                        type: string
 *                      numero:
 *                        type: number
 *                      reference:
 *                        type: string
 *                      designation:
 *                        type: string
 *                      prixHT:
 *                        type: number
 *                      tauxRemise:
 *                        type: number
 *                      montantRemise:
 *                        type: number
 *                      prixAchat:
 *                        type: number
 *                      quantite:
 *                        type: number
 *                      unite:
 *                        type: string
 *                      totalRemise:
 *                        type: number
 *                      totalHt:
 *                        type: number
 *                      tauxTVA:
 *                        type: number
 *                      totalTVA:
 *                        type: number
 *                      redevance:
 *                        type: number
 *                      totalTTC:
 *                        type: number 
 *     responses:
 *       200:
 *         description: The list of the DevisAchats
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
 *                     tiers:
 *                      type: string
 *                     plafondCredit:
 *                      type: number
 *                     credit:
 *                      type: number
 *                     restPayer:
 *                      type: number
 *                     montantPaye:
 *                      type: number
 *                     totalRedevance:
 *                      type: number
 *                     totalFodec:
 *                      type: number
 *                     escompte:
 *                      type: number
 *                     montantEscompte:
 *                      type: number
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
 *                     ligneBLs:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          article:
 *                            type: string
 *                          numero:
 *                            type: number
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixHT:
 *                            type: number
 *                          tauxRemise:
 *                            type: number
 *                          montantRemise:
 *                            type: number
 *                          prixAchat:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: string
 *                          totalRemise:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
 *                            type: number
 *                          redevance:
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *
 *
 */

router.post('/modifierDevisAchat/:id',verifytoken, async (req, res) => {

    try{
    if(req.body.demandeOffrePrix === ""){
        req.body.demandeOffrePrix = null
    }

    console.log(req.body.articles)
    
    const devisAchat = await DevisAchat.findById(req.params.id)

    if (devisAchat.societe != req.body.societe) {
        return res.send({ status: false })
    }

    if (!devisAchat) return res.status(401).send({ status: false })

    const result = await DevisAchat.findOneAndUpdate({ _id: req.params.id }, req.body)

    const devisAchat2 = await DevisAchat.findById(req.params.id)

    const devisAchatArticles = await DevisAchatArticle.find({ devisAchat: req.params.id })

    for (let i = 0; i < devisAchatArticles.length; i++) {
        if (devisAchat2.validationStockDevisAchat == 'non') {
            await updateQteTheriqueQteEnStock(devisAchatArticles[i], "moin", "moin")
        }

        const deleteItem = await DevisAchatArticle.findOneAndDelete({ _id: devisAchatArticles[i].id })
    }

    for (let i = 0; i < req.body.articles.length; i++) {
        if (devisAchat2.validationStockDevisAchat == 'non') {
            await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")
        }
        let item = new DevisAchatArticle(req.body.articles[i])
        item.devisAchat = result.id
        item.date = result.date
        const resul = item.save()
    }

    return res.send({ status: true, resultat: devisAchat2 })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})





/**
 * @swagger
 * /devisAchats/deletedevisAchat/{id}:
 *   post:
 *     summary: Remove the devisAchat by id
 *     tags: [devisAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The devisAchat id
 *
 *     responses:
 *       200:
 *         description: The devisAchat was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The devisAchat was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteDevisAchat/:id',verifytoken, async (req, res) => {

    try{
    const devisAchat = await DevisAchat.findById(req.params.id)

    var fournisseur = await Fournisseur.findById(devisAchat.fournisseur)

    if (!devisAchat) return res.status(401).send({ status: false })

    const devisAchatArticles = await DevisAchatArticle.find({ devisAchat: req.params.id })

    for (let i = 0; i < devisAchatArticles.length; i++) {

        await updateQteTheriqueQteEnStock(devisAchatArticles[i], "moin", "moin")

        const deleteItem = await DevisAchatArticle.findOneAndDelete({ _id: devisAchatArticles[i].id })

        // if(fournisseur != undefined)
        // {
        //     const deleteHisto = await HistoriqueArticleAchat.find({idArticle:devisAchatArticles[i].article,nomFournisseur:fournisseur.id})
        //     for(let item of deleteHisto)
        //     {
        //         console.log("yyyyy")
        //         await HistoriqueArticleAchat.deleteMany({})
        //    }
        // }

        if (fournisseur != undefined) {
            const deleteHisto = await HistoriqueArticleAchat.find({ idArticle: devisAchatArticles[i].article, nomFournisseur: fournisseur.id, totalHT: devisAchatArticles[i].totalHT })

            if (deleteHisto.length > 0) {
                await HistoriqueArticleAchat.deleteOne({ idArticle: devisAchatArticles[i].id, nomFournisseur: fournisseur.id, totalHT: devisAchatArticles[i].totalHT })
            }
        }

    }

    if (await DevisAchat.findOneAndDelete({ _id: req.params.id })) {
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
 * /devisAchats/listDevisAchats:
 *   post:
 *     summary: Returns the list of all the devisAchats
 *     tags: [DevisAchats]
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
 *         description: The list of the DevisAchats
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
 *                            tiers:
 *                              type: number
 *                            plafondCredit:
 *                              type: number
 *                            credit:
 *                              type: number
 *                            restPayer:
 *                              type: number
 *                            montantPaye:
 *                              type: number
 *                            totalRedevance:
 *                              type: number
 *                            totalFodec:
 *                              type: number
 *                            escompte:
 *                              type: number
 *                            montantEscompte:
 *                              type: number
 *                            totalRemise:
 *                              type: number
 *                            totalDC:
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
 *                            ligneBLs:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  article:
 *                                    type: string
 *                                  numero:
 *                                    type: number
 *                                  reference:
 *                                    type: string
 *                                  designation:
 *                                    type: string
 *                                  prixHT:
 *                                    type: number
 *                                  tauxRemise:
 *                                    type: number
 *                                  montantRemise:
 *                                    type: number
 *                                  prixAchat:
 *                                    type: number
 *                                  quantite:
 *                                    type: number
 *                                  unite:
 *                                    type: string
 *                                  totalRemise:
 *                                    type: number
 *                                  totalHt:
 *                                    type: number
 *                                  tauxTVA:
 *                                    type: number
 *                                  totalTVA:
 *                                    type: number
 *                                  redevance:
 *                                    type: number
 *                                  totalTTC:
 *                                    type: number 
 *                                  createdAt:
 *                                    type: string
 *                                  updatedAt:
 *                                    type: string
 *
 *
 *
 */



router.post('/listDevisAchats',verifytoken, async (req, res) => {

    try{
    var dateStart = new Date(req.body.dateStart)
    var dateEnd = new Date(req.body.dateEnd)
    var societe = ObjectId(req.body.magasin)

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
            from: 'boncommandes',
            let: { "bonCommande": {$convert: {input: '$bonCommande', to : 'objectId', onError: null,onNull: null}} },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$bonCommande"] },
                        ]
                    }
                }
            },
            ],
            as: "boncommandes"
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
            bonCommande: { $arrayElemAt: ["$boncommandes.numero", 0] },
            fournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
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
            fournisseur: 1,
            totalRemise: 1,
            totalHT: 1,
            totalTVA: 1,
            tFiscale: 1,
            totalTTC: 1,
            totalGain: 1,
            isTransfert: 1,
            bonCommande:1,
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

    const articles = await DevisAchat.aggregate(pipeline)

    sommePipeline.push({
        $count: "total"
    })

    var nbrTotal = await DevisAchat.aggregate(sommePipeline)

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
 * /DevisAchats/getById/{id}:
 *   get:
 *     summary: Remove the DevisAchat by id
 *     tags: [DevisAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DevisAchat id
 *
 *     responses:
 *       200:
 *         description: The DevisAchat was deleted
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
 *                     tiers:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     credit:
 *                       type: number
 *                     restPayer:
 *                       type: number
 *                     montantPaye:
 *                       type: number
 *                     totalRedevance:
 *                       type: number
 *                     totalFodec:
 *                       type: number
 *                     escompte:
 *                       type: number
 *                     montantEscompte:
 *                       type: number
 *                     totalRemise:
 *                       type: number
 *                     totalDC:
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
 *                     ligneBLs:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          article:
 *                            type: string
 *                          numero:
 *                            type: number
 *                          reference:
 *                            type: string
 *                          designation:
 *                            type: string
 *                          prixHT:
 *                            type: number
 *                          tauxRemise:
 *                            type: number
 *                          montantRemise:
 *                            type: number
 *                          prixAchat:
 *                            type: number
 *                          quantite:
 *                            type: number
 *                          unite:
 *                            type: number
 *                          totalRemise:
 *                            type: number
 *                          totalHt:
 *                            type: number
 *                          tauxTVA:
 *                            type: number
 *                          totalTVA:
 *                            type: number
 *                          redevance:
 *                            type: number
 *                          totalTTC:
 *                            type: number 
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The DevisAchat was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken, async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    const devisAchatArticles = await DevisAchatArticle.find({ devisAchat: req.params.id })
    var tabLigneArticle = ["societe", "remiseParMontant", "bonReception", "sousProduit","prixAchatHTReel2","quantiteAchat2","prixAchatHTReel","quantiteAchat","sansRemise","coefficient","unite2","unite1","plafondRemise","prixTTC","totalRedevance","date","quantiteLivree","bonReception","montantRemise","prixSpecifique","totalRemise","totalHT","tauxTVA","totalTVA","redevance","totalTTC","pVenteConseille","marge","article","totalRedevance","tauxRemise","plafondRemise","prixTTC","prixTTC","prixTTC","prixTTC","totalFrais","prixDC","tauxDC","prixFodec","isFodec","prixFourn","remiseF","prixAchat","designation","reference","numero"]
    
    var devisAchat = await DevisAchat.findOne({ _id: req.params.id })

    return res.send({ status: true, resultat: devisAchat, articles: devisAchatArticles})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


router.get('/getByIdImpression/:id', async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    var bonLivraison = await DevisAchat.findOne({ _id: req.params.id }).populate('fournisseur')

    const bonLivraisonArticles = await DevisAchatArticle.find({ devisAchat: req.params.id }).populate('unite1').populate('article')

    return res.send({ status: true, resultat: bonLivraison, articles: bonLivraisonArticles  })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /devisAchats/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [devisAchats]
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
 *                  article:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post('/getAllParametres',verifytoken, async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enAchat: 'oui' })
    const clients = await Fournisseur.find({ societeRacine: societeRacine })
    const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
    const demandeOffrePrix = await DemandeOffrePrix.find({societe:societe})

    return res.send({
        demandeOffrePrix:demandeOffrePrix,
        status: true,  uniteMesures: uniteMesures, articles: articles,
        clients: clients, numeroAutomatique: numeroAutomatique.numero,
    })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

router.post('/getBAArticles',verifytoken, async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var devisAchat = ObjectId(req.body.devisAchat)

    const articles = await DevisAchatArticle.find({devisAchat:devisAchat ,societe: societeRacine })
    
    return res.send({
        status: true, articles: articles
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
module.exports.routerDevisAchat = router
