const { FactureAvoir, getNumeroAutomatiqueFactureAvoirFactureAvoir, getNumeroAutomatiqueFactureAvoir } = require('../Models/factureAvoirModel')

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

const { Fournisseur } = require('../Models/fournisseurModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { BonReceptionArticle } = require('../Models/bonReceptionArticleModel')
const { Parametres } = require('../Models/parametresModel')
const { isValidObjectId } = require('mongoose')
const { consolelog } = require('../Models/errorModel')
const { Console } = require('console')
const { BonRetourClient } = require('../Models/bonRetourClientModel')
const { FactureVente } = require('../Models/factureVenteModel')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const mimeType = file.mimetype.split('/');
        const fileType = mimeType[1];
        const fileName = Date.now() + file.originalname + '.' + fileType;
        cb(null, fileName);
    }
})

var upload = multer({ storage: storage })

/**
 * @swagger
 * /bonAvoirs/newBonAvoir:
 *   post:
 *     summary: Returns the list of all the BonAvoirs
 *     tags: [BonAvoirs]
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
 *         description: The list of the BonAvoirs
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
router.post('/newFactureAvoir', verifytoken, async (req, res) => {

    try {

        if(!isValidObjectId(req.body.fournisseur)){
            return res.send({ status: false })
        }

        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatiqueFactureAvoir(societe, exercice)

        var societeRacine = await getSocieteRacine(req.body.societe)

        for (let i = 0; i < req.body.bonRetourClients.length; i++) {
            var bonRetourClient = await BonRetourClient.findById(req.body.bonRetourClients[i])
            try{
                if (!bonRetourClient || (bonRetourClient.factureAvoir && isValidObjectId(bonRetourClient.factureAvoir) && bonRetourClient.factureAvoir !== null)) {
                    return res.send({ status: false, message: 6 })
                }
            }catch(e){

            }
        }

        if(req.body.factureVente && isValidObjectId(req.body.factureVente) && req.body.typeAvoir === "Avoir-facture"){
            var factureVente = await FactureVente.findById(req.body.factureVente)
               
            if(factureVente.factureAvoir && isValidObjectId(factureVente.factureAvoir) ){
                return res.send({ status: false, message: 6 })
            }
        }
       
        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num
        var parametres = await Parametres.findOne({ societeRacine: societeRacine })

        const factureAvoir = new FactureAvoir(req.body);

        const result = await factureAvoir.save()

        if(req.body.factureVente && isValidObjectId(req.body.factureVente) && req.body.typeAvoir === "Avoir-facture"){
            var factureVente = await FactureVente.findByIdAndUpdate(req.body.factureVente, {factureAvoir: result.id})
            var factureVente = await FactureVente.findById(req.body.factureVente)
            console.log(factureVente)
        }

        // var sommeBR = 0
        for (let i = 0; i < req.body.bonRetourClients.length; i++) {
            var bonRetourClient = await BonRetourClient.findByIdAndUpdate(req.body.bonRetourClients[i], { factureAvoir: result.id })
            // sommeBR += bonRetourClient.montantTotal
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
 * /bonAvoirs/modifierBonAvoir/{id}:
 *   post:
 *     summary: Update the bonAvoir by id
 *     tags: [BonAvoirs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonAvoir id

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
 *         description: The list of the BonAvoirs
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

router.post('/modifierFactureAvoir/:id', verifytoken, async (req, res) => {

    try {

        const factureAvoir = await FactureAvoir.findById(req.params.id)

        if (!factureAvoir) return res.status(401).send({ status: false })

        var societeRacine = await getSocieteRacine(factureAvoir.societe)

        for (let i = 0; i < req.body.bonRetourClients.length; i++) {
            var bonRetourClient = await BonRetourClient.findById(req.body.bonRetourClients[i])
            if (bonRetourClient.factureAvoir && isValidObjectId(bonRetourClient.factureAvoir) && bonRetourClient.factureAvoir+"" != ObjectId(req.params.id)+"") {
                return res.send({ status: false, message: 6 })
            }
        }

        if(req.body.typeAvoir === "Avoir-facture"){
            var factureVente = await FactureVente.findOne({factureAvoir:factureAvoir.id})
            
            if (factureVente) {
                await FactureVente.findByIdAndUpdate(factureAvoir.id, {factureAvoir:null})
            }

            if(req.body.factureVente && isValidObjectId(req.body.factureVente)){
                var factureVente = await FactureVente.findByIdAndUpdate(req.body.factureVente, {factureAvoir: factureAvoir.id})
            }else{
                return res.send({ status: false, message: 6 })
            }

            var factureVente = await FactureVente.findOne({factureAvoir:factureAvoir.id})
            console.log(factureVente)
        }

        const result = await FactureAvoir.findOneAndUpdate({ _id: req.params.id }, req.body)

        var factureAvoir2 = await FactureAvoir.findById(req.params.id)

        //Start Bon retour Avoir
        var bonRetourClients = await BonRetourClient.find({ factureAvoir: req.params.id })
        var parametres = await Parametres.findOne({ societeRacine: societeRacine })
        for (let i = 0; i < bonRetourClients.length; i++) {
            var bonRetourClient = await BonRetourClient.findByIdAndUpdate(bonRetourClients[i], { factureAvoir: null })
        }
        // var sommeBR = 0
        for (let i = 0; i < req.body.bonRetourClients.length; i++) {
            var bonRetourClient = await BonRetourClient.findByIdAndUpdate(req.body.bonRetourClients[i], { factureAvoir: result.id })
            // sommeBR += bonRetourClient.montantTotal
        }
        //End Bon retour Avoir

        return res.send({ status: true, resultat: factureAvoir2 })

    } catch (e) {
        consolelog(e) 
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})



/**
 * @swagger
 * /bonAvoirs/deleteBonAvoir/{id}:
 *   post:
 *     summary: Remove the bonAvoir by id
 *     tags: [BonAvoirs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAvoir id
 *
 *     responses:
 *       200:
 *         description: The bonAvoir was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonAvoir was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteFactureAvoir/:id', verifytoken, async (req, res) => {

    try {
        const factureAvoir = await FactureAvoir.findById(req.params.id)

        if (!factureAvoir) {
            return res.send({ status: true })
        }

        var societeRacine = await getSocieteRacine(factureAvoir.societe)

        var parametres = await Parametres.findOne({ societeRacine: societeRacine })

        if (!factureAvoir) return res.status(401).send({ status: false })

        var bonReceptions = await BonReception.find({ factureAvoir: req.params.id })

        for (let i = 0; i < bonReceptions.length; i++) {
            var bReception = await BonReception.findByIdAndUpdate(bonReceptions[i].id, { totalTTCFacture: 0, totalHTFacture: 0, totalRemiseFacture: 0, factureAvoir: null, isTransfert: "non" })
            const bonReceptionArticles = await BonReceptionArticle.find({ bonReception: bonReceptions[i].id })
            for (let j = 0; j < bonReceptionArticles.length; j++) {
                await BonReceptionArticle.findByIdAndUpdate(bonReceptionArticles[j].id, {
                    remiseFacturePourcentage: 0,
                    remiseFactureMontant: 0,
                    remiseFactureTotal: 0,
                    prixAvoirHTReelFacture: 0,
                    prixAvoirTTCReelFacture: 0,
                    TotalHTFacture: 0,
                    TotalTTCFacture: 0,
                })

                if (!bReception.isChangeStock && factureAvoir.isChangeStock) {
                    await updateQteEnStock(bonReceptionArticles[j], "moin", "moin")
                }
            }
        }

        var fournisseur2 = await Fournisseur.findOne({_id:factureAvoir.fournisseur})
        var totalCredit = fournisseur2.credit;
        totalCredit += Number(factureAvoir.montantTotal);
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

        if (await FactureAvoir.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonAvoirs/listBonAvoirs:
 *   post:
 *     summary: Returns the list of all the bonAvoirs
 *     tags: [BonAvoirs]
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
 *         description: The list of the bonAvoirs
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
 *                                  prixAvoir:
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

router.post('/listFactureAvoirs', verifytoken, async (req, res) => {

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
                        format: "%d-%m-%Y", date: "$date"
                    }
                },

                id: "$_id",


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
                numero: 1,
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

        const articles = await FactureAvoir.aggregate(pipeline)
        
        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await FactureAvoir.aggregate(sommePipeline)

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
 * /bonAvoirs/getById/{id}:
 *   get:
 *     summary: Remove the bonAvoir by id
 *     tags: [BonAvoirs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAvoir id
 *
 *     responses:
 *       200:
 *         description: The bonAvoir was deleted
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
 *                          prixAvoir:
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
 *         description: The bonAvoir was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var factureAvoir = await FactureAvoir.findOne({ _id: req.params.id })

        if(factureAvoir.typeAvoir === "Avoir-marchandises"){
            var bonRetourClients = await BonRetourClient.find({ factureAvoir: req.params.id })
            return res.send({ status: true, resultat: factureAvoir, bonRetourClients: bonRetourClients })
        }else if(factureAvoir.typeAvoir === "Avoir-facture"){
            var factureVente = await FactureVente.findOne({factureAvoir: factureAvoir.id})
            var newFactureAvoir = JSON.parse(JSON.stringify(factureAvoir))
            try{
                newFactureAvoir.factureVente = factureVente.id
            }catch(e){
            }

            console.log(factureVente)
            return res.send({ status: true, resultat: factureAvoir, bonRetourClients: [] })
        }
   
        return res.send({ status: false })

    } catch (e) {
        consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getByIdImpression/:id', async (req, res) => {

    try {
        var factureAvoir = await FactureAvoir.findById(req.params.id).populate('fournisseur')

        var bonReceptionsComplete = []
        var bonReceptions = await BonReception.find({ factureAvoir: req.params.id })

        for (let i = 0; i < bonReceptions.length; i++) {
            var lignesBonReception = await BonReceptionArticle.find({ bonReception: bonReceptions[i].id }).populate('unite1').populate('article')
            var objet = { bonLivraison: bonReceptions[i], lignesBonLivraison: lignesBonReception }
            bonReceptionsComplete.push(objet)
        }

        return res.send({ status: true, resultat: factureAvoir, bonLivraisons: bonReceptionsComplete })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.post('/getBonReceptions', verifytoken, async (req, res) => {

    try {
        var bonReceptionsComplete = []
        var bonReceptions = req.body.bonReceptions

        for (let i = 0; i < bonReceptions.length; i++) {
            if (ObjectId.isValid(bonReceptions[i])) {
                var bonReception = await BonReception.findById(bonReceptions[i])
                if (ObjectId.isValid(bonReception.factureAvoir)) {
                    return res.send({ status: false, message: 6 })
                }
                var bonReception2 = JSON.parse(JSON.stringify(bonReception))

                bonReception2.articles = await BonReceptionArticle.find({ bonReception: bonReceptions[i] })

                bonReceptionsComplete.push(bonReception2)
            }
        }

        return res.send({ status: true, bonReceptions: bonReceptionsComplete })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getBonRetourClients/:idClient/:idSociete', verifytoken, async (req, res) => {

    try {

        var pipeline = []

        pipeline.push({ $match: { client: ObjectId(req.params.idClient), societe: ObjectId(req.params.idSociete), factureAvoir: null,  isRetourVenteContoire: false  } })

        pipeline.push({
            $lookup: {
                from: 'bonretourclientarticles',
                let: { bonRetourClient: "$_id" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$$bonRetourClient", "$bonRetourClient"] },
                            ],
                        },
                                            
                    }
                }],
                as: "articles",
            },
        })

        pipeline.push({
            $set: {
                id: "$_id",
            },
        })
        

        var bonRetourClients = await BonRetourClient.aggregate(pipeline)

        return res.send({ status: true, bonRetourClients: bonRetourClients })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getFacturesClient/:idClient/:idSociete', verifytoken, async (req, res) => {

    try {

        var pipeline = []

        // pipeline.push({ $match: { client: ObjectId(req.params.idClient), societe: ObjectId(req.params.idSociete), factureAvoir: null} })
        pipeline.push({ $match: { client: ObjectId(req.params.idClient), societe: ObjectId(req.params.idSociete)} })

        pipeline.push({
            $set: {
                id: "$_id",
            },
        })
        

        var factureVentes = await FactureVente.aggregate(pipeline)

        return res.send({ status: true, factureVentes: factureVentes })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /bonAvoirs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonAvoirs]
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
        var numeroAutomatique = await getNumeroAutomatiqueFactureAvoir(societe, exercice)

        const clients = await Client.find({ societeRacine: societeRacine })

        return res.send({
            status: true, 
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
module.exports.routerFactureAvoir = router
