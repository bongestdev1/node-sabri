const { DemandeOffrePrix, getNumeroAutomatique } = require('../Models/demandeOffrePrixModel')
const { DemandeOffrePrixArticle } = require('../Models/demandeOffrePrixArticleModel')
const { DemandeAchatInterne } = require('../Models/demandeAchatInterneModel')

const { Parametres } = require('../Models/parametresModel')

const { envoyerEmail } = require('./serverMail.js')
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

var PDFDocument = require('pdfkit');
const pdf = require('html-pdf');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Liltrage } = require('../Models/liltrageModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { HistoriqueArticleAchat } = require('../Models/historiqueArticleAchatModel')
const { Transporteur } = require('../Models/transporteursModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { Utilisateur } = require('../Models/utilisateurModel')
const { EtatGlobal } = require('../Models/etatGlobalModel')

// const Pdfmake = require('pdfmake')



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const mimeType = file.mimetype.split('/');
        const fileType = mimeType[1];

        const fileName = Date.now() + file.originalname + "." + fileType;
        cb(null, fileName);
    }
})

var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     DemandeOffrePrix:
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
 *   name: DemandeOffrePrixs
 *   description: The DemandeOffrePrixs managing API
 */


/**
 * @swagger
 * paths:
 *   /demandeOffrePrixs/upload:
 *     post:
 *       summary: upload image
 *       tags: [demandeOffrePrixs]
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
    const files = req.files
    let arr = [];
    files.forEach(element => {

        arr.push(element.path)

    })
    return res.send(arr)
})





/**
 * @swagger
 * /demandeOffrePrixs/newDemandeOffrePrix:
 *   post:
 *     summary: Returns the list of all the DemandeOffrePrixs
 *     tags: [DemandeOffrePrixs]
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
 *         description: The list of the DemandeOffrePrixs
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

// async function createPdf(html) {

//     doc = new PDFDocument;
//     doc.pipe(fs.createWriteStream('uploads/devis_2.pdf'));

//     const options1 = { format: 'Letter' }

//     return new Promise((resolve, reject) => {
//         pdf.create(html, options1).toFile('uploads/devis_2.pdf', (err, res) => {
//             if (err) {
//                 resolve(false);
//             } else {
//                 resolve(true);
//             }
//         })
//     })
// }

function checkFournisseur(fournisseurs, fournisseur) {
    for (let i = 0; i < fournisseurs.length; i++) {
        if (fournisseurs[i] + "" === fournisseur + "") {
            return true
        }
    }
    return false
}

router.post('/envoyerEmails/:id', upload.array('myFiles'), verifytoken, async (req, res) => {
    try {
        const files = req.files
        let arr = [];
        files.forEach(element => {

            arr.push(element.path)

        })

        req.body.listEmailsCochee = JSON.parse(req.body.listEmailsCochee)

        var demandeOffrePrix = await DemandeOffrePrix.findById(req.params.id)
        var fournisseurs = []
        var newFournisseurs = []
        fournisseurs = demandeOffrePrix.fournisseurs
        for (let i = 0; i < fournisseurs.length; i++) {
            if (checkFournisseur(req.body.listEmailsCochee, fournisseurs[i].fournisseur)) {
                var isSended = await envoyerEmail(fournisseurs[i].email, "./" + arr[0])
                if (isSended) {
                    fournisseurs[i].nbrEnvoyer++
                }
                newFournisseurs.push({ email: fournisseurs[i].email, nbrEnvoyer: fournisseurs[i].nbrEnvoyer, isSended: isSended, fournisseur: fournisseurs[i].fournisseur })
                fournisseurs[i].isSended = isSended
                const result = await DemandeOffrePrix.findOneAndUpdate({ _id: req.params.id }, { fournisseurs: fournisseurs })
            }
        }

        return res.send({ status: true, newFournisseurs: newFournisseurs, fournisseurs: fournisseurs })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


router.post('/newDemandeOffrePrix', verifytoken, async (req, res) => {
    try {
        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

        if (!ObjectId.isValid(req.body.demandeAchatInterne)) {
            req.body.demandeAchatInterne = null
        }

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        const demandeOffrePrix = new DemandeOffrePrix(req.body);

        const result = await demandeOffrePrix.save()

        if (ObjectId.isValid(req.body.demandeAchatInterne)) {
            const demandeAchatInterne = await DemandeAchatInterne.findOneAndUpdate({ _id: req.body.demandeAchatInterne }, { idDemandeOffrePrixTransfert: result.id, isTransfert: "oui" })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new DemandeOffrePrixArticle(req.body.articles[i])

            item.demandeOffrePrix = result.id
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

router.get('/getByIdImpression/:id', async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonLivraison = await DemandeOffrePrix.findOne({ _id: req.params.id }).populate('client').populate('transporteur')

        const bonLivraisonArticles = await DemandeOffrePrixArticle.find({ demandeOffrePrix: req.params.id }).populate('unite1').populate('article')

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
 * /demandeOffrePrixs/modifierDemandeOffrePrix/{id}:
 *   post:
 *     summary: Update the DemandeOffrePrix by id
 *     tags: [DemandeOffrePrixs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DemandeOffrePrix id

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
 *         description: The list of the DemandeOffrePrixs
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
router.post('/modifierDemandeOffrePrix/:id', verifytoken, async (req, res) => {
    try {
        if (req.body.demandeAchatInterne === "") {
            req.body.demandeAchatInterne = null
        }

        const demandeOffrePrix = await DemandeOffrePrix.findById(req.params.id)

        if (!demandeOffrePrix) return res.status(401).send({ status: false })

        const result = await DemandeOffrePrix.findOneAndUpdate({ _id: req.params.id }, req.body)

        const demandeOffrePrix2 = await DemandeOffrePrix.findById(req.params.id)

        const demandeOffrePrixArticles = await DemandeOffrePrixArticle.find({ demandeOffrePrix: req.params.id })

        for (let i = 0; i < demandeOffrePrixArticles.length; i++) {
            const deleteItem = await DemandeOffrePrixArticle.findOneAndDelete({ _id: demandeOffrePrixArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new DemandeOffrePrixArticle(req.body.articles[i])
            item.demandeOffrePrix = result.id
            item.date = result.date
            item.societe = result.societe
            const resul = item.save()
        }

        return res.send({ status: true, resultat: demandeOffrePrix2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }

})





/**
 * @swagger
 * /demandeOffrePrixs/deleteDemandeOffrePrix/{id}:
 *   post:
 *     summary: Remove the demandeOffrePrix by id
 *     tags: [DemandeOffrePrixs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The demandeOffrePrix id
 *
 *     responses:
 *       200:
 *         description: The demandeOffrePrix was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The demandeOffrePrix was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteDemandeOffrePrix/:id', verifytoken, async (req, res) => {
    try {
        const demandeOffrePrix = await DemandeOffrePrix.findById(req.params.id)

        var fournisseur = await Fournisseur.findById(demandeOffrePrix.fournisseur)

        if (!demandeOffrePrix) return res.status(401).send({ status: false })


        const demandeOffrePrixArticles = await DemandeOffrePrixArticle.find({ demandeOffrePrix: req.params.id })

        for (let i = 0; i < demandeOffrePrixArticles.length; i++) {

            await updateQteTheriqueQteEnStock(demandeOffrePrixArticles[i], "moin", "moin")

            const deleteItem = await DemandeOffrePrixArticle.findOneAndDelete({ _id: demandeOffrePrixArticles[i].id })

            // if(fournisseur != undefined)
            // {
            //     const deleteHisto = await HistoriqueArticleAchat.find({idArticle:demandeOffrePrixArticles[i].article,nomFournisseur:fournisseur.id})
            //     for(let item of deleteHisto)
            //     {
            //         console.log("yyyyy")
            //         await HistoriqueArticleAchat.deleteMany({})
            //    }
            // }

            if (fournisseur != undefined) {
                const deleteHisto = await HistoriqueArticleAchat.find({ idArticle: demandeOffrePrixArticles[i].article, nomFournisseur: fournisseur.id, totalHT: demandeOffrePrixArticles[i].totalHT })

                if (deleteHisto.length > 0) {
                    await HistoriqueArticleAchat.deleteOne({ idArticle: demandeOffrePrixArticles[i].id, nomFournisseur: fournisseur.id, totalHT: demandeOffrePrixArticles[i].totalHT })
                }
            }

        }


        if (await DemandeOffrePrix.findOneAndDelete({ _id: req.params.id })) {
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
 * /demandeOffrePrixs/listDemandeOffrePrixs:
 *   post:
 *     summary: Returns the list of all the demandeOffrePrixs
 *     tags: [DemandeOffrePrixs]
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
 *         description: The list of the DemandeOffrePrixs
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
router.post('/listDemandeOffrePrixs', verifytoken, async (req, res) => {
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
                from: 'demandeachatinternes',
                let: { "demandeAchatInterne": { $convert: { input: '$demandeAchatInterne', to: 'objectId', onError: null, onNull: null } } },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$demandeAchatInterne"] },
                            ]
                        }
                    }
                },
                ],
                as: "demandeachatinternes"
            }
        })

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
            $set: {
                demandeAchatInterne: { $arrayElemAt: ["$demandeachatinternes.numero", 0] },
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

        pipeline.push({
            $project: {
                id: 1,
                demandeAchatInterne: 1,
                utilisateurAccepter: 1,
                utilisateurDemander: 1,
                totalRemise: 1,
                totalHT: 1,
                totalTVA: 1,
                tFiscale: 1,
                totalTTC: 1,
                totalGain: 1,
                date: 1,
                numero: 1,
                etat: 1,
                ordreEtat: 1
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

        const articles = await DemandeOffrePrix.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await DemandeOffrePrix.aggregate(sommePipeline)

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
 * /demandeOffrePrixs/getById/{id}:
 *   get:
 *     summary: Remove the demandeOffrePrix by id
 *     tags: [DemandeOffrePrixs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The DemandeOffrePrix id
 *
 *     responses:
 *       200:
 *         description: The DemandeOffrePrix was deleted
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
 *         description: The DemandeOffrePrix was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {
    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const demandeOffrePrixArticles = await DemandeOffrePrixArticle.find({ demandeOffrePrix: req.params.id })

        var demandeOffrePrix = await DemandeOffrePrix.findOne({ _id: req.params.id })

        return res.send({ status: true, resultat: demandeOffrePrix, articles: demandeOffrePrixArticles })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /demandeOffrePrixs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [DemandeOffrePrixs]
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

        var etats = await EtatGlobal.find({ table: req.body.table })

        const articles = await getArticlesWithQuantites(societe, societeRacine)
        const demandeAchatInternes = await DemandeAchatInterne.find({ societe: societe })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const societes = await getSocietesBySocieteParent(societeRacine)
        const utilisateurs = await Utilisateur.find({ societeRacine: societeRacine }).select({ id: 1, nom: 1, prenom: 1, email: 1 })
        var fournisseurs = await Fournisseur.find({ societeRacine: societeRacine })

        /*var societesFiltree = []
        for(let item of societes){
            if(item.id != societe){
                societesFiltree.push(item)
            }
        }*/
        return res.send({ status: true, demandeAchatInternes: demandeAchatInternes, fournisseurs: fournisseurs, etats: etats, uniteMesures: uniteMesures, articles: articles, numeroAutomatique: numeroAutomatique.numero, societes: societes, utilisateurs: utilisateurs })
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
module.exports.routerDemandeOffrePrix = router
