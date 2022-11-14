const { BonRetourClient, getNumeroAutomatique } = require('../Models/bonRetourClientModel')
const { BonRetourClientArticle } = require('../Models/bonRetourClientArticleModel')

const { Article, getArticlesWithQuantites, getArticlesWithQuantitesfilterBySearch, setNullForObject } = require('../Models/articleModel')
const { Client } = require('../Models/clientModel')

const { ArticleSociete, updateQteEnStock, updateQteTherique, updateQteTheriqueQteEnStock } = require('../Models/articleSocieteModel')
var ObjectId = require('mongodb').ObjectID;
const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Reglement, getReglementsByDocuments, setLiltrageBonRetourClient, deleteLiltrageOfBon } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel')
const { ModeReglement } = require('../Models/modeReglementModel')
const { BonLivraison } = require('../Models/bonLivraisonModel')
const { SituationReglement } = require('../Models/situationReglementModel')
const { Frais } = require('../Models/fraisModel')
const { Transporteur } = require('../Models/transporteursModel')
const { PrixSpecifiqueLigne } = require('../Models/prixSpecifiqueLigneModel')
const { PrixSpecifiqueLigneTypeTier } = require('../Models/prixSpecifiqueLigneTypeTierModel')
const { validateVerifierAccee } = require('../Models/utilisateurModel')
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
 *     BonRetourClient:
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
 *         montantPaye:
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
 *               prixVente:
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
 *   name: BonRetourClients
 *   description: The BonRetourClients managing API
 */


/**
 * @swagger
 * paths:
 *   /bonRetourClients/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonRetourClients]
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
 * /bonRetourClients/newBonRetourClient:
 *   post:
 *     summary: Returns the list of all the BonRetourClients
 *     tags: [BonRetourClients]
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
 *                montantPaye:
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
 *     responses:
 *       200:
 *         description: The list of the BonRetourClients
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
router.post('/newBonRetourClient', verifytoken, async (req, res) => {

    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isRetourVenteContoire)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num
        req.body.factureAvoir = null
        
        req.body = setNullForObject(req.body)

        const bonRetourClient = new BonRetourClient(req.body);

        if (req.body.idTypeTransfert != undefined && req.body.idTypeTransfert != null && req.body.idTypeTransfert.length > 1 && req.body.typeTransfert != "") {
            bonRetourClient.transfertBonLivraison = req.body.idTypeTransfert
        }

        const result = await bonRetourClient.save()

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonRetourClientArticle(req.body.articles[i])

            await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")

            item.bonRetourClient = result.id
            item.date = result.date
            const resul = item.save()
        }

        var somme = await setLiltrageBonRetourClient(result, req.body.reglements, exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme
        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        await BonRetourClient.findOneAndUpdate({ _id: result.id }, req.body)

        var client2 = await Client.findById(req.body.client)
        var totalCredit = client2.credit;

        totalCredit += Number(req.body.montantTotal);

        var client = await Client.findByIdAndUpdate(client2.id, { credit: totalCredit })

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
 * /bonRetourClients/modifierBonRetourClient/{id}:
 *   post:
 *     summary: Update the bonRetourClient by id
 *     tags: [BonRetourClients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonRetourClient id

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
 *         description: The list of the BonRetourClients
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

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth();
}

router.post('/modifierBonRetourClient/:id', verifytoken, async (req, res) => {

    try {
        const bonRetourClient = await BonRetourClient.findById(req.params.id)

        var d1 = new Date();
        var d2 = new Date(bonRetourClient.date);

        if (!isSameDay(d1, d2)) {
            var isAutorisee = await validateVerifierAccee(req.user.user.id, "modifierBonRetourClientBloquant")
            if (!isAutorisee) {
                return res.send({ status: false, message: 1 })
            }
        }

        var client2 = await Client.findById(bonRetourClient.client)
        var totalCredit = client2.credit;

        totalCredit -= Number(bonRetourClient.montantTotal);

        var client = await Client.findByIdAndUpdate(client2.id, { credit: totalCredit })

        var client3 = await Client.findById(req.body.client)
        var totalCredit = client3.credit;

        totalCredit += Number(req.body.montantTotal);

        var client = await Client.findByIdAndUpdate(client3.id, { credit: totalCredit })

        if (!bonRetourClient) return res.status(401).send({ status: false })

        var somme = await setLiltrageBonRetourClient(bonRetourClient, req.body.reglements, bonRetourClient.exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme

        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        req.body = setNullForObject(req.body)

        const result = await BonRetourClient.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonRetourClient2 = await BonRetourClient.findById(req.params.id)

        const bonRetourClientArticles = await BonRetourClientArticle.find({ bonRetourClient: req.params.id })

        for (let i = 0; i < bonRetourClientArticles.length; i++) {
            await updateQteTheriqueQteEnStock(bonRetourClientArticles[i], "moin", "moin")
            const deleteItem = await BonRetourClientArticle.findOneAndDelete({ _id: bonRetourClientArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonRetourClientArticle(req.body.articles[i])

            await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")

            item.bonRetourClient = result.id
            item.date = result.date
            const resul = item.save()
        }

        return res.send({ status: true, resultat: bonRetourClient2 })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }

})


/**
 * @swagger
 * /bonRetourClients/addExpedition/{id}:
 *   post:
 *     summary: Update the bonRetourClient by id
 *     tags: [BonRetourClients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonRetourClient id
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
 *         description: The list of the BonRetourClients
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

    try {
        const bonRetourClient = await BonRetourClient.findById(req.params.id)

        if (!bonRetourClient) return res.status(401).send({ status: false })


        var expeditions = []

        expeditions.push(req.body)

        for (let i = 0; i < bonRetourClient.expeditions.length; i++) {
            expeditions.push(bonRetourClient.expeditions[i])
        }

        const result = await BonRetourClient.findOneAndUpdate({ _id: req.params.id }, { expeditions: expeditions })

        const bonRetourClient2 = await BonRetourClient.findById(req.params.id)

        return res.send({ status: true, resultat: bonRetourClient2.expeditions })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }

})


/**
 * @swagger
 * /bonRetourClients/deleteBonRetourClient/{id}:
 *   post:
 *     summary: Remove the bonRetourClient by id
 *     tags: [BonRetourClients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonRetourClient id
 *
 *     responses:
 *       200:
 *         description: The bonRetourClient was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonRetourClient was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonRetourClient/:id', verifytoken, async (req, res) => {

    try {
        const bonRetourClient = await BonRetourClient.findById(req.params.id)

        var d1 = new Date();
        var d2 = new Date(bonRetourClient.date);

        if (!isSameDay(d1, d2)) {
            var isAutorisee = await validateVerifierAccee(req.user.user.id, "supprimerBonRetourClientBloquant")
            if (!isAutorisee) {
                return res.send({ status: false, message: 2 })
            }
        }

        var client2 = await Client.findById(bonRetourClient.client)
        var totalCredit = client2.credit;

        totalCredit -= Number(bonRetourClient.montantTotal);

        var client = await Client.findByIdAndUpdate(client2.id, { credit: totalCredit })

        if (!bonRetourClient) return res.status(401).send({ status: false })

        const bonRetourClientArticles = await BonRetourClientArticle.find({ bonRetourClient: req.params.id })

        for (let i = 0; i < bonRetourClientArticles.length; i++) {
            await updateQteTheriqueQteEnStock(bonRetourClientArticles[i], "moin", "moin")
            const deleteItem = await BonRetourClientArticle.findOneAndDelete({ _id: bonRetourClientArticles[i].id })
        }

        await deleteLiltrageOfBon(bonRetourClient.id);

        if (await BonRetourClient.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonRetourClients/listBonRetourClients:
 *   post:
 *     summary: Returns the list of all the bonRetourClients
 *     tags: [BonRetourClients]
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
 *         description: The list of the bonRetourClients
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

router.post('/listBonRetourClients', verifytoken, async (req, res) => {

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

        pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe, isRetourVenteContoire: req.body.isRetourVenteContoire } })

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
            $lookup: {
                from: 'bonlivraisons',
                let: { "transfertBonLivraison": { $convert: { input: '$transfertBonLivraison', to: 'objectId', onError: null, onNull: null } } },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$transfertBonLivraison"] },
                            ]
                        }
                    }
                },
                ],
                as: "bonlivraisons"
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
                transfertBonLivraison: { $arrayElemAt: ["$bonlivraisons.numero", 0] },

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
                date: 1,
                numero: 1,
                transfertBonLivraison: 1
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


        const articles = await BonRetourClient.aggregate(pipeline)


        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await BonRetourClient.aggregate(sommePipeline)

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
 * /bonRetourClients/getById/{id}:
 *   get:
 *     summary: Remove the bonRetourClient by id
 *     tags: [BonRetourClients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonRetourClient id
 *
 *     responses:
 *       200:
 *         description: The bonRetourClient was deleted
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
 *         description: The bonRetourClient was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonRetourClient = await BonRetourClient.findOne({ _id: req.params.id })

        if(!bonRetourClient){
            return res.send({ status: false})
        }
        
        const bonRetourClientArticles = await BonRetourClientArticle.find({ bonRetourClient: req.params.id })

        var reglements = await getReglementsByDocuments(req.params.id)

        var somme = 0
        for (let i = 0; i < reglements.length; i++) {
            somme += reglements[i].montantAPayer
        }

        if (somme != bonRetourClient.montantPaye) {
            await BonRetourClient.findByIdAndUpdate(bonRetourClient.id, { montantPaye: somme, restPayer: bonRetourClient.montantTotal - somme })
            bonRetourClient = await BonRetourClient.findOne({ _id: req.params.id })
        }

        var documentDeTransfert = {}
        if (ObjectId.isValid(bonRetourClient.transfertBonLivraison)) {
            documentDeTransfert = await BonLivraison.findOne({ _id: bonRetourClient.transfertBonLivraison })
        }

        return res.send({ status: true, resultat: bonRetourClient, articles: bonRetourClientArticles, reglements: reglements, documentDeTransfert: documentDeTransfert })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/getByIdImpression/:id', async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonLivraison = await BonRetourClient.findOne({ _id: req.params.id }).populate('client')

        const bonLivraisonArticles = await BonRetourClientArticle.find({ bonRetourClient: req.params.id }).populate('unite1').populate('article')

        return res.send({ status: true, resultat: bonLivraison, articles: bonLivraisonArticles })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /bonRetourClients/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonRetourClients]
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
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isRetourVenteContoire)

        const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enVente: 'oui' })
        const clients = await Client.find({ societeRacine: societeRacine })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const modeReglements = await ModeReglement.find({ societeRacine: societeRacine })
        const situationReglements = await SituationReglement.find({ societeRacine: societeRacine })

        const frais = await Frais.find({
            societeRacine: societeRacine,
        });

        const transporteurs = await Transporteur.find({
            societeRacine: societeRacine,
        });

        return res.send({ transporteurs: transporteurs, allFrais: frais, status: true, situationReglements: situationReglements, uniteMesures: uniteMesures, articles: articles, clients: clients, numeroAutomatique: numeroAutomatique.numero, modeReglements: modeReglements })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


router.get('/getBonLivraisons/:idSociete/:idClient', verifytoken, async (req, res) => {

    try {
        if (!ObjectId.isValid(req.params.idSociete) || !ObjectId.isValid(req.params.idClient)) {
            return res.send({
                status: false,
                documents: [],
                idClient: req.params.idClient
            })
        }

        var documents = await BonLivraison.find({ societe: ObjectId(req.params.idSociete), client: ObjectId(req.params.idClient) })

        var prixSpecifiqueLignes = await PrixSpecifiqueLigne.find({client:req.params.idClient, isEnable:true})
        const client = await Client.findById(req.params.idClient)
        var prixSpecifiqueLigneTypeTiers = []
        if(client.typeTiers){
            prixSpecifiqueLigneTypeTiers = await PrixSpecifiqueLigneTypeTier.find({typeTier:client.typeTiers, isEnable:true})
        }
  
        return res.send({
            status: true,
            documents: documents,
            idClient: req.params.idClient,
            prixSpecifiqueLignes:prixSpecifiqueLignes,
            prixSpecifiqueLigneTypeTiers:prixSpecifiqueLigneTypeTiers
        })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})
router.post('/getTransfertBonLivraison', async (req, res) => {
console.log(req.body.numero);
    try {
        var pipeline =[]

        pipeline.push({
            $match:{
                numero : req.body.numero
            }
        })
        pipeline.push({
            $project:{
                transfertBonLivraison : 1
            }
        })

        var rslt = await BonRetourClient.aggregate(pipeline)

        res.send({rslt:rslt})
    } catch (error) {
                // statements to handle any exceptions
                console.log(error)
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
        res.sendStatus(401);
    }
}
module.exports.routerBonRetourClient = router
