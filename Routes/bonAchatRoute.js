const { BonAchat, getNumeroAutomatique } = require('../Models/bonAchatModel')
const { BonAchatArticle } = require('../Models/bonAchatArticleModel')
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

const { Reglement, setLiltrageBonAchat, getReglementsByDocuments } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { HistoriqueArticleAchat } = require('../Models/historiqueArticleAchatModel')
const { Transporteur } = require('../Models/transporteursModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { OrdreEmission } = require('../Models/ordreEmissionModel')
const { SituationReglement } = require('../Models/situationReglementModel')
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
 *     BonAchat:
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
 *   name: BonAchats
 *   description: The BonAchats managing API
 */


/**
 * @swagger
 * paths:
 *   /bonAchats/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonAchats]
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
 * /bonAchats/newBonAchat:
 *   post:
 *     summary: Returns the list of all the BonAchats
 *     tags: [BonAchats]
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
 *         description: The list of the BonAchats
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
router.post('/newBonAchat', verifytoken, async (req, res) => {

    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        var clesEtranger = ["factureAchat", "ordreMission"]
        for (let key of clesEtranger) {
            if (req.body[key] === "" || req.body[key] === undefined) {
                req.body[key] = null
            }
        }

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        const bonAchat = new BonAchat(req.body);

        const result = await bonAchat.save()

        if (req.body.idTypeTransfert != "" && req.body.typeTransfert != "") {

            const bonCommande = await BonCommande.findOneAndUpdate({ _id: req.body.idTypeTransfert }, { transfertBonAchat: result.id, isTransfert: 'oui' })

            const bonCommandeArticles = await BonCommandeArticle.find({ bonCommande: req.body.idTypeTransfert })

            for (let i = 0; i < bonCommandeArticles.length; i++) {
                await updateQteTherique(bonCommandeArticles[i], "moin")
            }
        }


        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonAchatArticle(req.body.articles[i])
            if (bonAchat.validationStockBonAchat == 'oui') {
                await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")
            }

            item.bonAchat = result.id
            item.date = result.date
            item.societe = result.societe
            const resul = await item.save()
        }

        var somme = await setLiltrageBonAchat(result, req.body.reglements, req.body.exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme

        await BonAchat.findOneAndUpdate({ _id: req.params.id }, req.body)

        for (let i of req.body.articles) {
            const historiqueArticleAchat = new HistoriqueArticleAchat()
            historiqueArticleAchat.idArticle = i.article
            historiqueArticleAchat.reference = i.reference
            historiqueArticleAchat.designation = i.designation
            historiqueArticleAchat.date = req.body.date
            historiqueArticleAchat.numero = req.body.numero
            historiqueArticleAchat.nomFournisseur = req.body.fournisseur

            historiqueArticleAchat.quantite = i.quantiteVente
            historiqueArticleAchat.prixVenteHT = i.prixVenteHT

            historiqueArticleAchat.totalTTC = req.body.totalTTC
            historiqueArticleAchat.typeDocument = "Bon Achat"
            historiqueArticleAchat.societeRacine = req.body.societe

            await historiqueArticleAchat.save()
        }

        //Start Modification prix-Achat
        var societeRacine = await getSocieteRacine(societe)
        const parametres = await Parametres.findOne({ societeRacine: societeRacine })
        if (parametres) {
            if (parametres.validationUpdatePrixAchatFromBonAchat == "oui") {
                for (let item of req.body.articles) {
                    var article = await Article.findById(item.article)
                    var prixVenteHT = item.prixAchatHTReel + item.prixAchatHTReel * article.marge / 100
                    if (article.margeAppliqueeSur == "Revient") {
                        var prixRevient = item.prixAchatHTReel + item.totalFrais
                        prixVenteHT = prixRevient + prixRevient * article.marge / 100
                    }
                    var prixVenteTTC = prixVenteHT + prixVenteHT * article.tauxTVA / 100

                    await Article.findByIdAndUpdate(item.article, {
                        prixAchat: item.prixAchatHTReel,
                        remiseF: item.remiseF,
                        prixFourn: item.prixFourn,
                        prixFodec: item.prixFodec,
                        prixDC: item.prixDC,
                        prixVenteHT: prixVenteHT,
                        prixTTC: prixVenteTTC,
                        prixAchatTTC: item.prixTTC,
                    })
                }
            }
        }
        //End Modification prix-Achat

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
 * /bonAchats/modifierBonAchat/{id}:
 *   post:
 *     summary: Update the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonAchat id

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
 *         description: The list of the BonAchats
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

router.post('/modifierBonAchat/:id', verifytoken, async (req, res) => {

    try {
        const bonAchat = await BonAchat.findById(req.params.id)

        var clesEtranger = ["factureAchat", "ordreMission"]
        for (let key of clesEtranger) {
            if (req.body[key] === "" || req.body[key] === undefined) {
                req.body[key] = null
            }
        }

        if (bonAchat.societe != req.body.societe) {
            return res.send({ status: false })
        }

        if (!bonAchat) return res.status(401).send({ status: false })

        var somme = await setLiltrageBonAchat(bonAchat, req.body.reglements, bonAchat.exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme

        const result = await BonAchat.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonAchat2 = await BonAchat.findById(req.params.id)

        const bonAchatArticles = await BonAchatArticle.find({ bonAchat: req.params.id })

        for (let i = 0; i < bonAchatArticles.length; i++) {
            if (bonAchat2.validationStockBonAchat == 'non') {
                await updateQteTheriqueQteEnStock(bonAchatArticles[i], "moin", "moin")
            }

            const deleteItem = await BonAchatArticle.findOneAndDelete({ _id: bonAchatArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            if (bonAchat2.validationStockBonAchat == 'non') {
                await updateQteTheriqueQteEnStock(req.body.articles[i], "plus", "plus")
            }
            let item = new BonAchatArticle(req.body.articles[i])
            item.bonAchat = result.id
            item.date = result.date
            const resul = item.save()
        }

        //Start Modification prix-Achat
        var societeRacine = await getSocieteRacine(req.body.societe)
        const parametres = await Parametres.findOne({ societeRacine: societeRacine })
        if (parametres) {
            if (parametres.validationUpdatePrixAchatFromBonAchat == "oui") {
                for (let item of req.body.articles) {
                    var article = await Article.findById(item.article)
                    var prixVenteHT = item.prixAchatHTReel + item.prixAchatHTReel * article.marge / 100
                    if (article.margeAppliqueeSur == "Revient") {
                        var prixRevient = item.prixAchatHTReel + item.totalFrais
                        prixVenteHT = prixRevient + prixRevient * article.marge / 100
                    }
                    var prixVenteTTC = prixVenteHT + prixVenteHT * article.tauxTVA / 100

                    await Article.findByIdAndUpdate(item.article, {
                        prixAchat: item.prixAchatHTReel,
                        remiseF: item.remiseF,
                        prixFourn: item.prixFourn,
                        prixFodec: item.prixFodec,
                        prixDC: item.prixDC,
                        prixVenteHT: prixVenteHT,
                        prixTTC: prixVenteTTC,
                        prixAchatTTC: item.prixTTC,
                    })
                }
            }
        }
        //End Modification prix-Achat

        return res.send({ status: true, resultat: bonAchat2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})





/**
 * @swagger
 * /bonAchats/deleteBonAchat/{id}:
 *   post:
 *     summary: Remove the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAchat id
 *
 *     responses:
 *       200:
 *         description: The bonAchat was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonAchat was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonAchat/:id', verifytoken, async (req, res) => {

    try {
        const bonAchat = await BonAchat.findById(req.params.id)

        var fournisseur = await Fournisseur.findById(bonAchat.fournisseur)

        if (!bonAchat) return res.status(401).send({ status: false })


        const bonAchatArticles = await BonAchatArticle.find({ bonAchat: req.params.id })

        for (let i = 0; i < bonAchatArticles.length; i++) {

            await updateQteTheriqueQteEnStock(bonAchatArticles[i], "moin", "moin")

            const deleteItem = await BonAchatArticle.findOneAndDelete({ _id: bonAchatArticles[i].id })

            // if(fournisseur != undefined)
            // {
            //     const deleteHisto = await HistoriqueArticleAchat.find({idArticle:bonAchatArticles[i].article,nomFournisseur:fournisseur.id})
            //     for(let item of deleteHisto)
            //     {
            //         console.log("yyyyy")
            //         await HistoriqueArticleAchat.deleteMany({})
            //    }
            // }

            if (fournisseur != undefined) {
                const deleteHisto = await HistoriqueArticleAchat.find({ idArticle: bonAchatArticles[i].article, nomFournisseur: fournisseur.id, totalHT: bonAchatArticles[i].totalHT })

                if (deleteHisto.length > 0) {
                    await HistoriqueArticleAchat.deleteOne({ idArticle: bonAchatArticles[i].id, nomFournisseur: fournisseur.id, totalHT: bonAchatArticles[i].totalHT })
                }
            }

        }

        await setLiltrageBonAchat(bonAchat, [], bonAchat.exercice)

        if (await BonAchat.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonAchats/listBonAchats:
 *   post:
 *     summary: Returns the list of all the bonAchats
 *     tags: [BonAchats]
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
 *         description: The list of the BonAchats
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



router.post('/listBonAchats', verifytoken, async (req, res) => {

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
            $lookup: {
                from: 'factureachats',
                let: { "factureAchat": "$factureAchat" },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$factureAchat"] },
                            ]
                        }
                    }
                },
                ],
                as: "factureachats"
            }
        })

        pipeline.push({
            $set: {
                fournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
                totalRemise: { $toString: "$totalRemise" },
                totalHT: { $toString: "$totalHT" },
                totalTVA: { $toString: "$totalTVA" },
                tFiscale: { $toString: "$timbreFiscale" },
                totalTTC: { $toString: "$totalTTC" },
                totalGain: { $toString: "$totalGain" },
                factureAchat: { $arrayElemAt: ["$factureachats.numero", 0] },

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
                factureAchat: 1,
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

        const articles = await BonAchat.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await BonAchat.aggregate(sommePipeline)

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
 * /bonAchats/getById/{id}:
 *   get:
 *     summary: Remove the bonAchat by id
 *     tags: [BonAchats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonAchat id
 *
 *     responses:
 *       200:
 *         description: The bonAchat was deleted
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
 *         description: The bonAchat was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const bonAchatArticles = await BonAchatArticle.find({ bonAchat: req.params.id })
        var tabLigneArticle = ["societe", "remiseParMontant", "bonReception", "sousProduit", "prixAchatHTReel2", "quantiteAchat2", "prixAchatHTReel", "quantiteAchat", "sansRemise", "coefficient", "unite2", "unite1", "plafondRemise", "prixTTC", "totalRedevance", "date", "quantiteLivree", "bonReception", "montantRemise", "prixSpecifique", "totalRemise", "totalHT", "tauxTVA", "totalTVA", "redevance", "totalTTC", "pVenteConseille", "marge", "article", "totalRedevance", "tauxRemise", "plafondRemise", "prixTTC", "prixTTC", "prixTTC", "prixTTC", "totalFrais", "prixDC", "tauxDC", "prixFodec", "isFodec", "prixFourn", "remiseF", "prixAchat", "designation", "reference", "numero"]

        var newArticles = []
        for (let i = 0; i < bonAchatArticles.length; i++) {
            var item = {}
            for (let key of tabLigneArticle) {
                item[key] = bonAchatArticles[i][key]
            }

            if (bonAchatArticles[i].bonReception != "") {
                var bonReception = await BonReception.findOne({ _id: bonAchatArticles[i].bonReception })
                item['numeroBonReception'] = bonReception.numero
            }
            newArticles.push(item)
        }

        var bonAchat = await BonAchat.findOne({ _id: req.params.id })

        var reglements = await getReglementsByDocuments(req.params.id)

        var somme = 0
        for (let i = 0; i < reglements.length; i++) {
            somme += reglements[i].montantAPayer
        }

        if (somme != bonAchat.montantPaye) {
            await BonAchat.findByIdAndUpdate(bonAchat.id, { montantPaye: somme, restPayer: Number(bonAchat.montantTotal) - somme })
            bonAchat = await BonAchat.findOne({ _id: req.params.id })
        }

        const receptions = await Reception.find({ document: bonAchat.id })

        return res.send({ status: true, resultat: bonAchat, articles: newArticles, reglements: reglements, receptions: receptions })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonAchats/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonAchats]
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

        const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enAchat: 'oui' })
        const clients = await Fournisseur.find({ societeRacine: societeRacine })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const modeReglements = await ModeReglement.find({ societeRacine: societeRacine })
        const transporteurs = await Transporteur.find({ societeRacine: societeRacine })
        const charges = await ChargeDirecte.find({ societeRacine: societeRacine })
        const ordreEmissions = await OrdreEmission.find({ societe: societeRacine })
        const situationReglements = await SituationReglement.find({ societeRacine: societeRacine })

        return res.send({
            situationReglements: situationReglements,
            status: true, transporteurs: transporteurs, uniteMesures: uniteMesures, articles: articles,
            clients: clients, numeroAutomatique: numeroAutomatique.numero,
            modeReglements: modeReglements, charges: charges, ordreEmissions: ordreEmissions
        })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

router.post('/getBAArticles', verifytoken, async (req, res) => {
    try {
        var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
        var bonAchat = ObjectId(req.body.bonAchat)

        const articles = await BonAchatArticle.find({ bonAchat: bonAchat, societe: societeRacine })

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
module.exports.routerBonAchat = router
