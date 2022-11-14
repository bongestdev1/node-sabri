const { FactureVente, getNumeroAutomatique } = require('../Models/factureVenteModel')

const { Article, getArticlesWithQuantites, getArticlesWithQuantitesfilterBySearch } = require('../Models/articleModel')
const { Client } = require('../Models/clientModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')

const { ArticleSociete, updateQteEnStock, updateQteTherique, updateQteTheriqueQteEnStock } = require('../Models/articleSocieteModel')
var ObjectId = require('mongodb').ObjectID;
const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
const { Commande } = require('../Models/commandeModel')

const { OrdreEmission } = require('../Models/ordreEmissionModel')
const { CommandeArticle } = require('../Models/commandeArticleModel')

const { Devis } = require('../Models/devisModel')
const { ModeReglement } = require('../Models/modeReglementModel')
const { Reglement, setLiltrageBonLivraison, getReglementsByDocuments } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel')
const { HistoriqueArticleVente } = require('../Models/historiqueArticleVenteModel')
const { BonLivraison } = require('../Models/bonLivraisonModel')
const { BonLivraisonArticle } = require('../Models/bonLivraisonArticleModel')
const { consolelog } = require('../Models/errorModel')
const { isValidObjectId } = require('mongoose')

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
 *     BonLivraison:
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
 *         - montantPaye
 *         - credit
 *         - expeditions
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
 *         montantPaye:
 *           type: number
 *         credit:
 *           type: number
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
 *   name: BonLivraisons
 *   description: The BonLivraisons managing API
 */


/**
 * @swagger
 * paths:
 *   /bonLivraisons/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonLivraisons]
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
 * /bonLivraisons/newBonLivraison:
 *   post:
 *     summary: Returns the list of all the BonLivraisons
 *     tags: [BonLivraisons]
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
 *                      prixVente:
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
 *                      montantPaye:
 *                        type: number 
 *     responses:
 *       200:
 *         description: The list of the BonLivraisons
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
 *                    montantPaye:
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
 *                          prixVente:
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
router.post('/newFactureVente', verifytoken, async (req, res) => {

    try {

        if(!isValidObjectId(req.body.client)){
            return res.send({ status: false })
        }

        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        for (let i = 0; i < req.body.bonLivraisons.length; i++) {
            var bonLivraison = await BonLivraison.findById(req.body.bonLivraisons[i])
            if (ObjectId.isValid(bonLivraison.factureVente)) {
                return res.send({ status: false, message: 5 })
            }
        }

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num
        req.body.factureAvoir = null
        
        const factureVente = new FactureVente(req.body);

        const result = await factureVente.save()

        for (let i = 0; i < req.body.bonLivraisons.length; i++) {
            await BonLivraison.findByIdAndUpdate(req.body.bonLivraisons[i], { factureVente: result.id, isTransfert: "oui" })
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
 * /bonLivraisons/modifierBonLivraison/{id}:
 *   post:
 *     summary: Update the bonLivraison by id
 *     tags: [BonLivraisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonLivraison id

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
 *                montantPaye:
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
 *                      prixVente:
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
 *         description: The list of the BonLivraisons
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
 *                     montantPaye:
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
 *                          prixVente:
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

router.post('/modifierFactureVente/:id', verifytoken, async (req, res) => {

    try {
        const factureVente = await FactureVente.findById(req.params.id)

        if (!factureVente) return res.status(401).send({ status: false })


        for (let i = 0; i < req.body.bonLivraisons.length; i++) {
            var bonLivraison = await BonLivraison.findById(req.body.bonLivraisons[i])
            if (ObjectId.isValid(bonLivraison.factureVente) && bonLivraison.factureVente != req.params.id) {
                return res.send({ status: false, message: 5 })
            }
        }

        const result = await FactureVente.findOneAndUpdate({ _id: req.params.id }, req.body)

        var factureVente2 = await FactureVente.findById(req.params.id)

        var bonLivraisons = await BonLivraison.find({ factureVente: req.params.id })

        for (let i = 0; i < bonLivraisons.length; i++) {
            await BonLivraison.findByIdAndUpdate(bonLivraisons[i].id, { factureVente: null, isTransfert: "non" })
        }

        for (let i = 0; i < req.body.bonLivraisons.length; i++) {
            await BonLivraison.findByIdAndUpdate(req.body.bonLivraisons[i], { factureVente: result.id, isTransfert: "oui" })
        }

        return res.send({ status: true, resultat: factureVente2 })

    } catch (e) {
        consolelog(e)

        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})



/**
 * @swagger
 * /bonLivraisons/deleteBonLivraison/{id}:
 *   post:
 *     summary: Remove the bonLivraison by id
 *     tags: [BonLivraisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonLivraison id
 *
 *     responses:
 *       200:
 *         description: The bonLivraison was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonLivraison was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteFactureVente/:id', verifytoken, async (req, res) => {

    try {
        const factureVente = await FactureVente.findById(req.params.id)

        if (!factureVente) return res.status(401).send({ status: false })

        var bonLivraisons = await BonLivraison.find({ factureVente: req.params.id })

        for (let i = 0; i < bonLivraisons.length; i++) {
            await BonLivraison.findByIdAndUpdate(bonLivraisons[i].id, { factureVente: null, isTransfert: "oui" })
        }

        if (await FactureVente.findOneAndDelete({ _id: req.params.id })) {
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
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator'
};


/**
 * @swagger
 * /bonLivraisons/listBonLivraisons:
 *   post:
 *     summary: Returns the list of all the bonLivraisons
 *     tags: [BonLivraisons]
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
 *         description: The list of the bonLivraisons
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
 *                            montantPaye:
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
 *                                  prixVente:
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

router.post('/listFactureVentes', verifytoken, async (req, res) => {

    try {
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
                from: 'clients',
                let: { "client": "$client" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$client"] },
                            ]
                        }
                    }
                },
                ],
                as: "clients"
            }
        })

        pipeline.push({
            $set: {
                client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
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
                client: 1,
                totalRemise: 1,
                totalHT: 1,
                totalTVA: 1,
                tFiscale: 1,
                totalTTC: 1,
                totalGain: 1,
                isTransfert: 1,
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

        const articles = await FactureVente.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await FactureVente.aggregate(sommePipeline)

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
 * /bonLivraisons/getById/{id}:
 *   get:
 *     summary: Remove the bonLivraison by id
 *     tags: [BonLivraisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonLivraison id
 *
 *     responses:
 *       200:
 *         description: The bonLivraison was deleted
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
 *                     montantPaye:
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
 *                          prixVente:
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
 *         description: The bonLivraison was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var factureVente = await FactureVente.findOne({ _id: req.params.id })

        var bonLivraisons = await BonLivraison.find({ factureVente: req.params.id })

        var bonLivraisonsComplete = []

        for (let i = 0; i < bonLivraisons.length; i++) {
            var bonLivraison = JSON.parse(JSON.stringify(bonLivraisons[i]))
            bonLivraison.articles = await BonLivraisonArticle.find({ bonLivraison: bonLivraisons[i].id })
            bonLivraisonsComplete.push(bonLivraison)
        }

        return res.send({ status: true, resultat: factureVente, bonLivraisons: bonLivraisonsComplete })

    } catch (e) {
        consolelog(e)

        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getByIdImpression/:id', async (req, res) => {

    try {
        var factureVente = await FactureVente.findById(req.params.id).populate('client')

        var bonLivraisonsComplete = []
        var bonLivraisons = await BonLivraison.find({ factureVente: req.params.id })

        for (let i = 0; i < bonLivraisons.length; i++) {
            var lignesBonLivraison = await BonLivraisonArticle.find({ bonLivraison: bonLivraisons[i].id }).populate('unite1').populate('article')
            var objet = { bonLivraison: bonLivraisons[i], lignesBonLivraison: lignesBonLivraison }
            bonLivraisonsComplete.push(objet)
        }

        return res.send({ status: true, resultat: factureVente, bonLivraisons: bonLivraisonsComplete })

    } catch (e) {
        consolelog(e)

        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.post('/getBonLivraisons', verifytoken, async (req, res) => {

    try {
        var bonLivraisonsComplete = []
        var bonLivraisons = req.body.bonLivraisons

        for (let i = 0; i < bonLivraisons.length; i++) {
            var bonLivraison = await BonLivraison.findById(bonLivraisons[i])
            if (ObjectId.isValid(bonLivraison.factureVente)) {
                return res.send({ status: false, message: 5 })
            }
            var bonLivraison2 = JSON.parse(JSON.stringify(bonLivraison))

            bonLivraison2.articles = await BonLivraisonArticle.find({ bonLivraison: bonLivraisons[i] })
            bonLivraisonsComplete.push(bonLivraison2)
        }


        return res.send({ status: true, bonLivraisons: bonLivraisonsComplete })

    } catch (e) {
        consolelog(e)

        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getBonLivraisons/:idClient/:idSociete', verifytoken, async (req, res) => {

    try {
        var pipeline = []

        pipeline.push({ $match: { isVenteContoire: false, client: ObjectId(req.params.idClient), societe: ObjectId(req.params.idSociete), factureVente: null } })

        pipeline.push({
            $lookup: {
                from: 'bonlivraisonarticles',
                let: { bonLivraison: "$_id" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$$bonLivraison", "$bonLivraison"] },
                            ]
                        },
                    }
                }],
                as: "articles",
            },
        })

        pipeline.push({
            $set: {
                id: "$_id"
            },
        })

        var newBonLivraison = await BonLivraison.aggregate(pipeline)

        return res.send({ status: true, bonLivraisons: newBonLivraison })

    } catch (e) {
        consolelog(e)

        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /bonLivraisons/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonLivraisons]
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
router.post('/getAllParametres', verifytoken, async (req, res) => {

    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        const clients = await Client.find({ societeRacine: societeRacine })

        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })

        return res.send({
            status: true, uniteMesures: uniteMesures,
            clients: clients, numeroAutomatique: numeroAutomatique.numero
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
module.exports.routerFactureVente = router
