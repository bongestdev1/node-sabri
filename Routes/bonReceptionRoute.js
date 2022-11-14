const { BonReception, getNumeroAutomatique } = require('../Models/bonReceptionModel')
const { BonReceptionArticle } = require('../Models/bonReceptionArticleModel')
const { Parametres } = require('../Models/parametresModel')
const { ChargeDirecte } = require('../Models/chargeDirecteModel')
var ObjectId = require('mongodb').ObjectID;
const { UniteMesure, validateUniteMesure } = require('../Models/uniteMesureModel')
const { Fournisseur } = require('../Models/fournisseurModel')
const { BonCommande } = require('../Models/bonCommandeModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

const { ModeReglement } = require('../Models/modeReglementModel');
const { Transporteur } = require('../Models/transporteursModel');
const { getSocieteRacine } = require('../Models/societeModel');
const { getArticlesWithQuantitesfilterBySearch, setNullForObject } = require('../Models/articleModel');
const { updateQteEnStock } = require('../Models/articleSocieteModel');
const { SituationReglement } = require('../Models/situationReglementModel');
const { setLiltrageBonAchat, getReglementsByDocuments, deleteLiltrageOfBon } = require('../Models/reglementModel');
const { FactureAchat } = require('../Models/factureAchatModel');
const { Historique } = require('../Models/historiqueModel');
const { consolelog } = require('../Models/errorModel');
const { isValidObjectId } = require('mongoose');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const mimeType = file.mimetype.split('/');
        const fileType = mimeType[1];
        const fileName = Date.now() + file.originalname;
        cb(null, fileName);
    }
})


var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     BonReception:
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
 *               prixReception:
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
 *   name: BonReceptions
 *   description: The BonReceptions managing API
 */


/**
 * @swagger
 * paths:
 *   /bonReceptions/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonReceptions]
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
 * /bonReceptions/newBonReception:
 *   post:
 *     summary: Returns the list of all the BonReceptions
 *     tags: [BonReceptions]
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
 *                      prixReception:
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
 *         description: The list of the BonReceptions
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
 *                          prixReception:
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
router.post('/newBonReception', verifytoken, async (req, res) => {

    try {
        var societeRacine = await getSocieteRacine(req.body.societe)

        if(!isValidObjectId(req.body.fournisseur)){
            return res.send({ status: false })
        }

        var societe = ObjectId(req.body.societe)
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isAchatContoire)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        if (!ObjectId.isValid(req.body.factureAchat)) {
            req.body.factureAchat = null
        }

        req.body = setNullForObject(req.body)

        req.body.idBonCommandeTransfert = req.body.idTypeTransfert

        const bonReception = new BonReception(req.body);

        const result = await bonReception.save()

        if (ObjectId.isValid(req.body.idBonCommandeTransfert)) {
            const bonCommande = await BonCommande.findOneAndUpdate({ _id: req.body.idBonCommandeTransfert }, { bonReception: result.id, isTransfert: "oui" })
        }

        var parametres = await Parametres.findOne({ societeRacine: societeRacine })
        if (!parametres || parametres.validationStockBonAchat === "non") {
            req.body.isChangeStock = true
        }else{
            req.body.isChangeStock = false
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonReceptionArticle(req.body.articles[i])
            if (!parametres || parametres.validationStockBonAchat === "non") {
                await updateQteEnStock(req.body.articles[i], "plus", "plus")
            }

            item.bonReception = result.id
            item.date = result.date
            item.quantiteRestante = item.quantiteAchat
            const resul = await item.save()
        }

        var somme = await setLiltrageBonAchat(result, req.body.reglements, result.exercice)
     
        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme
         
        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        await BonReception.findOneAndUpdate({_id:result.id}, req.body)
        

         var fournisseur2 = await Fournisseur.findById(req.body.fournisseur)
         var totalCredit = fournisseur2.credit;
        
         totalCredit -= Number(req.body.montantTotal);
        
         var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

         var societeRacine = await getSocieteRacine(result.societe)
   
         var hist = new Historique({
            idUtilisateur:req.user.user.id,
            idDocument:result.id,
            date: new Date(),
            message:req.user.user.email + ' ajoute '+result.numero,
            societeRacine:societeRacine
          })
          await hist.save()

         
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
 * /bonReceptions/modifierBonReception/{id}:
 *   post:
 *     summary: Update the bonReception by id
 *     tags: [BonReceptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonReception id

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
 *                      prixReception:
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
 *         description: The list of the BonReceptions
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
 *                          prixReception:
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

router.post('/modifierBonReception/:id', verifytoken, async (req, res) => {

    try {
        const bonReception = await BonReception.findById(req.params.id)
        var isChangeStockFacture = false
        if(bonReception.factureAchat){
            var factureAchat = await FactureAchat.findById(bonReception.factureAchat)
            if(factureAchat){
                isChangeStockFacture = factureAchat.isChangeStock
                return res.send({ status: false, message: 9 })
            }
        }

        var societeRacine = await getSocieteRacine(bonReception.societe)

        if (bonReception.societe != req.body.societe) {
            return res.send({ status: false })
        }

        if (!bonReception) return res.status(401).send({ status: false })

        var somme = await setLiltrageBonAchat(bonReception, req.body.reglements, bonReception.exercice)
    
        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme
        
        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        req.body = setNullForObject(req.body)

        var parametres = await Parametres.findOne({ societeRacine: societeRacine })
        
        const result = await BonReception.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonReception2 = await BonReception.findById(req.params.id)

        const bonReceptionArticles = await BonReceptionArticle.find({ bonReception: req.params.id })

        
        for (let i = 0; i < bonReceptionArticles.length; i++) {
            if (bonReception.isChangeStock || isChangeStockFacture) {
                await updateQteEnStock(bonReceptionArticles[i], "moin", "moin")
            }
            const deleteItem = await BonReceptionArticle.findOneAndDelete({ _id: bonReceptionArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            if (bonReception.isChangeStock || isChangeStockFacture) {
                await updateQteEnStock(req.body.articles[i], "plus", "plus")
            }
            let item = new BonReceptionArticle(req.body.articles[i])
            item.bonReception = result.id
            item.date = result.date
            item.quantiteRestante = item.quantiteAchat
            const resul = item.save()
        }

        
        var fournisseur2 = await Fournisseur.findById(bonReception.fournisseur)
        var totalCredit = fournisseur2.credit;
        totalCredit += Number(bonReception.montantTotal) - Number(req.body.montantTotal);
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

        var societeRacine = await getSocieteRacine(bonReception.societe)
   
        var hist = new Historique({
            idUtilisateur:req.user.user.id,
            idDocument:bonReception.id,
            date: new Date(),
            message:req.user.user.email + ' modifie '+bonReception.numero,
            societeRacine:societeRacine
          })
          await hist.save()

        return res.send({ status: true, resultat: bonReception2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})





/**
 * @swagger
 * /bonReceptions/deleteBonReception/{id}:
 *   post:
 *     summary: Remove the bonReception by id
 *     tags: [BonReceptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonReception id
 *
 *     responses:
 *       200:
 *         description: The bonReception was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonReception was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonReception/:id', verifytoken, async (req, res) => {

    try {
        const bonReception = await BonReception.findById(req.params.id)

        var isChangeStockFacture = false
        if(bonReception.factureAchat){
            var factureAchat = await FactureAchat.findById(bonReception.factureAchat)
            if(factureAchat){
                isChangeStockFacture = factureAchat.isChangeStock
                return res.send({ status: false, message: 9 })
            }
        }

        var societeRacine = await getSocieteRacine(bonReception.societe)

        var fournisseur = await Fournisseur.findById(bonReception.fournisseur)

        //if (!bonReception) return res.status(401).send({ status: false })

        const bonReceptionArticles = await BonReceptionArticle.find({ bonReception: req.params.id })

        var parametres = await Parametres.findOne({ societeRacine: societeRacine })

        for (let i = 0; i < bonReceptionArticles.length; i++) {

            if (bonReception.isChangeStock || isChangeStockFacture) {
                await updateQteEnStock(bonReceptionArticles[i], "moin", "moin")
            }

            const deleteItem = await BonReceptionArticle.findOneAndDelete({ _id: bonReceptionArticles[i].id })

            // if(fournisseur != undefined)
            // {
            //     const deleteHisto = await HistoriqueArticleReception.find({idArticle:bonReceptionArticles[i].article,nomFournisseur:fournisseur.id})
            //     for(let item of deleteHisto)
            //     {
            //         console.log("yyyyy")
            //         await HistoriqueArticleReception.deleteMany({})
            //    }
            // }

        }

        var fournisseur2 = await Fournisseur.findById(bonReception.fournisseur)
       try{
        var totalCredit = fournisseur2.credit;
    
        totalCredit += Number(bonReception.montantTotal);
    
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

        await deleteLiltrageOfBon(bonReception.id);
       }catch(e){
         console.log(e)
       }
        

        var societeRacine = await getSocieteRacine(bonReception.societe)
   
        var hist = new Historique({
            idUtilisateur:req.user.user.id,
            idDocument:bonReception.id,
            date: new Date(),
            message:req.user.user.email + ' supprime '+bonReception.numero,
            societeRacine:societeRacine
          })
          await hist.save()

        if (await BonReception.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonReceptions/listBonReceptions:
 *   post:
 *     summary: Returns the list of all the bonReceptions
 *     tags: [BonReceptions]
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
 *         description: The list of the BonReceptions
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
 *                                  prixReception:
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



router.post('/listBonReceptions', verifytoken, async (req, res) => {

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

        pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe, isAchatContoire: req.body.isAchatContoire } })

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
                factureAchat: { $arrayElemAt: ["$factureachats.numero", 0] },
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
                factureAchat: 1,
                id: 1,
                fournisseur: 1,
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

        const articles = await BonReception.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await BonReception.aggregate(sommePipeline)

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
 * /bonReceptions/getById/{id}:
 *   get:
 *     summary: Remove the bonReception by id
 *     tags: [BonReceptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonReception id
 *
 *     responses:
 *       200:
 *         description: The bonReception was deleted
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
 *                          prixReception:
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
 *         description: The bonReception was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var idBonReceptions = []
        var ch = req.params.id
        while (ch.length > 0) {
            var pos = ch.indexOf("&&")
            if (pos == -1) {
                var id = ch
                ch = ""
                idBonReceptions.push(id)
            } else {
                var id = ch.substring(0, pos)
                ch = ch.substring(pos + 2)
                idBonReceptions.push(id)
            }
        }

        var tabInteger = ["restPayer", "montantPaye", "montantTotal", "totalFodec", "totalRedevance", "totalDC", "montantEscompte", "totalGainReel", "totalGainCommerciale", "totalTTC", "timbreFiscale", "totalRemise", "totalHT", "totalTVA"]
        var tabLigneArticle = ["societe", "remiseParMontant", "sousProduit", "prixAchatHTReel2", "quantiteAchat2", "prixAchatHTReel", "quantiteAchat", "sansRemise", "coefficient", "unite2", "unite1", "plafondRemise", "prixTTC", "totalRedevance", "date", "quantiteLivree", "bonReception", "montantRemise", "prixSpecifique", "totalRemise", "totalHT", "tauxTVA", "totalTVA", "redevance", "totalTTC", "pVenteConseille", "marge", "article", "totalRedevance", "tauxRemise", "plafondRemise", "prixTTC", "prixTTC", "prixTTC", "prixTTC", "totalFrais", "prixDC", "tauxDC", "prixFodec", "isFodec", "prixFourn", "remiseF", "prixAchat", "designation", "reference", "numero"]
        var newBonReception = {}

        for (let k = 0; k < tabInteger.length; k++) {
            newBonReception[tabInteger[k]] = 0
        }

        var tabLigneBonReception = []
        var numero = 1

        var reglements = []

        for (let i = 0; i < idBonReceptions.length; i++) {
            if (ObjectId.isValid(idBonReceptions[i])) {
                var bonReceptionItem = {}
                var bonReceptionArticles = await BonReceptionArticle.find({ bonReception: idBonReceptions[i] })
                var bonReception = await BonReception.findOne({ _id: idBonReceptions[i] })

                if (i == 0) {
                    newBonReception = JSON.parse(JSON.stringify(bonReception))
                    reglements = await getReglementsByDocuments(req.params.id)
                } else {
                    for (let k = 0; k < tabInteger.length; k++) {
                        newBonReception[tabInteger[k]] += Number(bonReception[tabInteger[k]])
                    }
                }

                for (let j = 0; j < bonReceptionArticles.length; j++) {
                    var newItem = {}
                    for (let key of tabLigneArticle) {
                        newItem[key] = bonReceptionArticles[j][key]
                    }
                    newItem.numero = numero
                    newItem.numeroBonReception = bonReception.numero
                    tabLigneBonReception.push(newItem)
                    numero++
                }
            }
        }

        if (idBonReceptions.length > 1) {
            newBonReception.date = new Date()
        }

        //tabLigneBonReception = optimiserLigneArticles(tabLigneBonReception)

        return res.send({ status: true, resultat: newBonReception, articles: tabLigneBonReception, reglements:reglements })

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

        var bonLivraison = await BonReception.findOne({ _id: req.params.id }).populate('fournisseur')

        const bonLivraisonArticles = await BonReceptionArticle.find({ bonReception: req.params.id }).populate('unite1').populate('article')

        return res.send({ status: true, resultat: bonLivraison, articles: bonLivraisonArticles })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

function optimiserLigneArticles(lignes) {

    var newLigneBonReception = []
    var numero = 1
    for (let i = 0; i < lignes.length; i++) {

        var isExiste = false
        for (let j = 0; j < newLigneBonReception.length; j++) {
            if (lignes[i].article === newLigneBonReception[j].article) {
                isExiste = true
            }
        }


        if (!isExiste) {
            var sommeQuantite = 0
            var sommePrixAchatHT = 0

            for (let j = 0; j < lignes.length; j++) {
                if (lignes[i].article === lignes[j].article) {
                    sommeQuantite += lignes[j].quantiteAchat
                    sommePrixAchatHT += lignes[j].prixAchatHTReel
                }
            }

            var prixMoyenne = sommePrixAchatHT / sommeQuantite

            newLigneBonReception.push(lignes[i])
            newLigneBonReception[numero - 1].quantiteAchat = sommeQuantite
            newLigneBonReception[numero - 1].prixAchatHTReel = prixMoyenne
            newLigneBonReception[numero - 1].numero = numero

        }


    }

    return newLigneBonReception

}

/**
 * @swagger
 * /bonReceptions/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonReceptions]
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
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isAchatContoire)

        const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enAchat: 'oui' })
        const clients = await Fournisseur.find({ societeRacine: societeRacine })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const modeReglements = await ModeReglement.find({ societeRacine: societeRacine })
        const transporteurs = await Transporteur.find({ societeRacine: societeRacine })
      
        const situationReglements = await SituationReglement.find({
            societeRacine: societeRacine,
        });

        const charges = await ChargeDirecte.find({ societeRacine: societeRacine })
        return res.send({
            situationReglements: situationReglements,
            status: true, transporteurs: transporteurs, uniteMesures: uniteMesures, articles: articles,
            clients: clients, numeroAutomatique: numeroAutomatique.numero,
            modeReglements: modeReglements, charges: charges
        })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


router.get('/getBonCommandes/:idSociete/:idFournisseur', verifytoken, async (req, res) => {

    try {
        if (!ObjectId.isValid(req.params.idSociete) || !ObjectId.isValid(req.params.idFournisseur)) {
            return res.send({
                status: false,
                documents: [],
                idFournisseur: req.params.idFournisseur
            })
        }

        var bonCommandes = await BonCommande.find({ societe: ObjectId(req.params.idSociete), fournisseur: ObjectId(req.params.idFournisseur), isTransfert: "non" })

        return res.send({
            status: true,
            documents: bonCommandes,
            idFournisseur: req.params.idFournisseur
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
module.exports.routerBonReception = router
