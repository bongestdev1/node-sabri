const { DemandeAchatInterne, getNumeroAutomatique } = require('../Models/demandeAchatInterneModel')
const { DemandeAchatInterneArticle } = require('../Models/demandeAchatInterneArticleModel')
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

const { Liltrage } = require('../Models/liltrageModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { HistoriqueArticleAchat } = require('../Models/historiqueArticleAchatModel')
const { Transporteur } = require('../Models/transporteursModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { Utilisateur } = require('../Models/utilisateurModel')
const { EtatGlobal } = require('../Models/etatGlobalModel')
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
 *     DemandeAchatInterne:
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
 *   name: DemandeAchatInternes
 *   description: The DemandeAchatInternes managing API
 */


/**
 * @swagger
 * paths:
 *   /demandeAchatInternes/upload:
 *     post:
 *       summary: upload image
 *       tags: [demandeAchatInternes]
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
 * /demandeAchatInternes/newDemandeAchatInterne:
 *   post:
 *     summary: Returns the list of all the DemandeAchatInternes
 *     tags: [DemandeAchatInternes]
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
 *         description: The list of the DemandeAchatInternes
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
router.post('/newDemandeAchatInterne', verifytoken, async (req, res) => {
    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        req.body = setNullToReqBody(req.body)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        const demandeAchatInterne = new DemandeAchatInterne(req.body);

        const result = await demandeAchatInterne.save()

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new DemandeAchatInterneArticle(req.body.articles[i])

            item.demandeAchatInterne = result.id
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
 * /demandeAchatInternes/modifierDemandeAchatInterne/{id}:
 *   post:
 *     summary: Update the DemandeAchatInterne by id
 *     tags: [DemandeAchatInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DemandeAchatInterne id

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
 *         description: The list of the DemandeAchatInternes
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
function setNullToReqBody(reqBody) {
    var tabCleEtranger = ["utilisateurDemander", "utilisateurAccepter", "etat"]

    for (let key of tabCleEtranger) {
        if (!ObjectId.isValid(reqBody[key])) {
            reqBody[key] = null
        }
    }

    return reqBody
}

router.post('/modifierDemandeAchatInterne/:id', verifytoken, async (req, res) => {
    try {
        req.body = setNullToReqBody(req.body)

        const demandeAchatInterne = await DemandeAchatInterne.findById(req.params.id)

        if (!demandeAchatInterne) return res.status(401).send({ status: false })

        const result = await DemandeAchatInterne.findOneAndUpdate({ _id: req.params.id }, req.body)

        const demandeAchatInterne2 = await DemandeAchatInterne.findById(req.params.id)

        const demandeAchatInterneArticles = await DemandeAchatInterneArticle.find({ demandeAchatInterne: req.params.id })

        for (let i = 0; i < demandeAchatInterneArticles.length; i++) {
            const deleteItem = await DemandeAchatInterneArticle.findOneAndDelete({ _id: demandeAchatInterneArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new DemandeAchatInterneArticle(req.body.articles[i])
            item.demandeAchatInterne = result.id
            item.date = result.date
            item.societe = result.societe
            const resul = item.save()
        }

        return res.send({ status: true, resultat: demandeAchatInterne2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }

})


/**
 * @swagger
 * /demandeAchatInternes/deleteDemandeAchatInterne/{id}:
 *   post:
 *     summary: Remove the demandeAchatInterne by id
 *     tags: [DemandeAchatInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The demandeAchatInterne id
 *
 *     responses:
 *       200:
 *         description: The demandeAchatInterne was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The demandeAchatInterne was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteDemandeAchatInterne/:id', verifytoken, async (req, res) => {

    try {
        const demandeAchatInterne = await DemandeAchatInterne.findById(req.params.id)

        var fournisseur = await Fournisseur.findById(demandeAchatInterne.fournisseur)

        if (!demandeAchatInterne) return res.status(401).send({ status: false })


        const demandeAchatInterneArticles = await DemandeAchatInterneArticle.find({ demandeAchatInterne: req.params.id })

        for (let i = 0; i < demandeAchatInterneArticles.length; i++) {

            await updateQteTheriqueQteEnStock(demandeAchatInterneArticles[i], "moin", "moin")

            const deleteItem = await DemandeAchatInterneArticle.findOneAndDelete({ _id: demandeAchatInterneArticles[i].id })

            // if(fournisseur != undefined)
            // {
            //     const deleteHisto = await HistoriqueArticleAchat.find({idArticle:demandeAchatInterneArticles[i].article,nomFournisseur:fournisseur.id})
            //     for(let item of deleteHisto)
            //     {
            //         console.log("yyyyy")
            //         await HistoriqueArticleAchat.deleteMany({})
            //    }
            // }

            if (fournisseur != undefined) {
                const deleteHisto = await HistoriqueArticleAchat.find({ idArticle: demandeAchatInterneArticles[i].article, nomFournisseur: fournisseur.id, totalHT: demandeAchatInterneArticles[i].totalHT })

                if (deleteHisto.length > 0) {
                    await HistoriqueArticleAchat.deleteOne({ idArticle: demandeAchatInterneArticles[i].id, nomFournisseur: fournisseur.id, totalHT: demandeAchatInterneArticles[i].totalHT })
                }
            }

        }

        if (await DemandeAchatInterne.findOneAndDelete({ _id: req.params.id })) {
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
 * /demandeAchatInternes/listDemandeAchatInternes:
 *   post:
 *     summary: Returns the list of all the demandeAchatInternes
 *     tags: [DemandeAchatInternes]
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
 *         description: The list of the DemandeAchatInternes
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
router.post('/listDemandeAchatInternes', verifytoken, async (req, res) => {

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
                from: 'utilisateurs',
                let: { "utilisateur": "$utilisateurDemander" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$utilisateur"] },
                            ]
                        }
                    }
                },
                ],
                as: "utilisateurdemanders"
            }
        })

        pipeline.push({
            $lookup: {
                from: 'utilisateurs',
                let: { "utilisateur": "$utilisateurAccepter" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$utilisateur"] },
                            ]
                        }
                    }
                },
                ],
                as: "utilisateuraccepters"
            }
        })

        pipeline.push({
            $lookup: {
                from: 'etatglobals',
                let: { "etat": "$etat" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$etat"] },
                            ]
                        }
                    }
                },
                ],
                as: "etats"
            }
        })

        pipeline.push({
            $lookup: {
                from: 'demandeoffreprixes',
                let: { "demandeOffrePrix": { $convert: { input: '$idDemandeOffrePrixTransfert', to: 'objectId', onError: null, onNull: null } } },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$demandeOffrePrix"] },
                            ]
                        }
                    }
                },
                ],
                as: "demandeoffreprixs"
            }
        })

        pipeline.push({
            $set: {
                demandeOffrePrix: { $arrayElemAt: ["$demandeoffreprixs.numero", 0] },
                utilisateurAccepter: { $arrayElemAt: ["$utilisateuraccepters.login", 0] },
                utilisateurDemander: { $arrayElemAt: ["$utilisateurdemanders.login", 0] },
                etat: { $arrayElemAt: ["$etats.etat", 0] },
                ordreEtat: { $arrayElemAt: ["$etats.ordre", 0] },

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

        // pipeline.push({
        //     $project: {
        //         id: 1,
        //         demandeOffrePrix: 1,
        //         utilisateurAccepter: 1,
        //         utilisateurDemander: 1,
        //         totalRemise: 1,
        //         totalHT: 1,
        //         totalTVA: 1,
        //         tFiscale: 1,
        //         totalTTC: 1,
        //         totalGain: 1,
        //         date: 1,
        //         numero: 1,
        //         isTransfert: 1,
        //         etat: 1,
        //         ordreEtat: 1
        //     }
        // })

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

        const articles = await DemandeAchatInterne.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await DemandeAchatInterne.aggregate(sommePipeline)

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
 * /demandeAchatInternes/getById/{id}:
 *   get:
 *     summary: Remove the demandeAchatInterne by id
 *     tags: [DemandeAchatInternes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DemandeAchatInterne id
 *
 *     responses:
 *       200:
 *         description: The DemandeAchatInterne was deleted
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
 *         description: The DemandeAchatInterne was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {
    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const demandeAchatInterneArticles = await DemandeAchatInterneArticle.find({ demandeAchatInterne: req.params.id })

        var demandeAchatInterne = await DemandeAchatInterne.findOne({ _id: req.params.id })

        return res.send({ status: true, resultat: demandeAchatInterne, articles: demandeAchatInterneArticles })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /demandeAchatInternes/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [DemandeAchatInternes]
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

        var etats = await EtatGlobal.find({ table: req.body.table, societeRacine: societeRacine })

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
        return res.send({ status: true, etats: etats, uniteMesures: uniteMesures, articles: articles, numeroAutomatique: numeroAutomatique.numero, societes: societes, utilisateurs: utilisateurs })

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
module.exports.routerDemandeAchatInterne = router
