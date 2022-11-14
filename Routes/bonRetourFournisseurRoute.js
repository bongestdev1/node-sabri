const { BonRetourFournisseur, getNumeroAutomatique } = require('../Models/bonRetourFournisseurModel')
const { BonRetourFournisseurArticle } = require('../Models/bonRetourFournisseurArticleModel')

const { Article, getArticlesWithQuantites, getArticlesWithQuantitesfilterBySearch, setNullForObject } = require('../Models/articleModel')
const { Fournisseur } = require('../Models/fournisseurModel')

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

const { Reglement, getReglementsByDocuments, setLiltrageBonRetourFournisseur, deleteLiltrageOfBon } = require('../Models/reglementModel')
const { Liltrage } = require('../Models/liltrageModel')
const { ModeReglement } = require('../Models/modeReglementModel')
const { BonAchat } = require('../Models/bonAchatModel')
const { SituationReglement } = require('../Models/situationReglementModel')
const { BonReception } = require('../Models/bonReceptionModel')
const { Transporteur } = require('../Models/transporteursModel')
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
 *     BonRetourFournisseur:
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
 *   name: BonRetourFournisseurs
 *   description: The BonRetourFournisseurs managing API
 */


/**
 * @swagger
 * paths:
 *   /bonRetourFournisseurs/upload:
 *     post:
 *       summary: upload image
 *       tags: [BonRetourFournisseurs]
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
 * /bonRetourFournisseurs/newBonRetourFournisseur:
 *   post:
 *     summary: Returns the list of all the BonRetourFournisseurs
 *     tags: [BonRetourFournisseurs]
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
 *         description: The list of the BonRetourFournisseurs
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


 async function valideStockArticlesAjout(articles, societe){
    var tab = []
    
    for(let i = 0; i < articles.length; i++){
      var ok = false
      for(let j = 0; j < tab.length; j++){
        if(tab[j].article === articles[i].article){
          ok = true
          tab[j].qte += articles[i].quantiteAchat
        }
      }
      if(!ok){
        tab.push({article:articles[i].article, qte:articles[i].quantiteAchat})
      } 
    }
    
    for(let i = 0; i < tab.length; i++){
      var article = await ArticleSociete.findOne({article: tab[i].article, societe:societe })    
      if(article && article.venteAvecStockNegative != 'oui' && article.qteEnStock < tab[i].qte){
        return false
      }
    }
    return true
  }

router.post('/newBonRetourFournisseur', verifytoken, async (req, res) => {

    try {
        var societe = ObjectId(req.body.societe)
        
        var isValidQuantiteEnStock = await valideStockArticlesAjout(req.body.articles, societe)
        if(!isValidQuantiteEnStock){
          return res.send({status:false, message:10})
        }
        
        var exercice = req.body.exercice
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isRetourAchatContoire)

        req.body.numero = numeroAutomatique.numero
        req.body.num = numeroAutomatique.num

        req.body = setNullForObject(req.body)

        const bonRetourFournisseur = new BonRetourFournisseur(req.body);

        if (req.body.idTypeTransfert != undefined && req.body.idTypeTransfert != null && req.body.idTypeTransfert.length > 1 && req.body.typeTransfert != "") {
            bonRetourFournisseur.transfertBonAchat = req.body.idTypeTransfert
        }
        const result = await bonRetourFournisseur.save()


        for (let i = 0; i < req.body.articles.length; i++) {
            let item = new BonRetourFournisseurArticle(req.body.articles[i])

            await updateQteTheriqueQteEnStock(req.body.articles[i], "moin", "moin")

            item.bonRetourFournisseur = result.id
            item.date = result.date
            const resul = item.save()
        }

        var somme = await setLiltrageBonRetourFournisseur(result, req.body.reglements, result.exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme

        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        await BonRetourFournisseur.findOneAndUpdate({ _id: result.id }, req.body)


        var fournisseur2 = await Fournisseur.findById(req.body.fournisseur)
        var totalCredit = fournisseur2.credit;
    
        totalCredit += Number(req.body.montantTotal);
    
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

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
 * /bonRetourFournisseurs/modifierBonRetourFournisseur/{id}:
 *   post:
 *     summary: Update the bonRetourFournisseur by id
 *     tags: [BonRetourFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonRetourFournisseur id

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
 *         description: The list of the BonRetourFournisseurs
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

 async function valideStockArticlesModifier(newArticles, encientArticles, societe){
  
    var newArticles1 = []
    for(let i = 0; i < newArticles.length; i++){
      var ok = false
      for(let j = 0; j < newArticles1.length; j++){
        if(newArticles1[j].article === newArticles[i].article){
          ok = true
          newArticles1[j].qte += newArticles[i].quantiteAchat
        }
      }
      if(!ok){
        newArticles1.push({article:newArticles[i].article, qte:newArticles[i].quantiteAchat})
      } 
    }
  
    var encientArticles1 = []
    for(let i = 0; i < encientArticles.length; i++){
      var ok = false
      for(let j = 0; j < encientArticles1.length; j++){
        if(encientArticles[i].article+"" === encientArticles1[j].article+""){
          ok = true
          encientArticles1[j].qte += encientArticles[i].quantiteAchat
        }
      }
      if(!ok){
        encientArticles1.push({article:encientArticles[i].article+"", qte:encientArticles[i].quantiteAchat})
      } 
    }
    
    newArticles1.forEach(x => {
      for(let j = 0; j < encientArticles1.length; j++){
        if(encientArticles1[j].article === x.article){
          x.qte = (x.qte - encientArticles1[j].qte)
        }
      }
    })
  
    for(let i = 0; i < newArticles1.length; i++){
      var article = await ArticleSociete.findOne({article: newArticles1[i].article, societe:societe })    
      if(newArticles1[i].qte > 0 && article && article.venteAvecStockNegative != 'oui' && article.qteEnStock < newArticles1[i].qte){
        return false
      }
    }
    return true
  }

router.post('/modifierBonRetourFournisseur/:id', verifytoken, async (req, res) => {

    try {
        const bonRetourFournisseur = await BonRetourFournisseur.findById(req.params.id)
        if (!bonRetourFournisseur) return res.status(401).send({ status: false })

        const encientArticles33 = await BonRetourFournisseurArticle.find({bonRetourFournisseur:bonRetourFournisseur.id})
        var isValidQuantiteNegative = await valideStockArticlesModifier(req.body.articles, encientArticles33, bonRetourFournisseur.societe)
        
        if(!isValidQuantiteNegative){
           return res.send({status:false, message:10})
        }

        var somme = await setLiltrageBonRetourFournisseur(bonRetourFournisseur, req.body.reglements, bonRetourFournisseur.exercice)

        req.body.montantPaye = somme
        req.body.restPayer = req.body.montantTotal - somme

        if (req.body.restPayer === 0) {
            req.body.isPayee = "oui"
        } else {
            req.body.isPayee = "non"
        }

        const result = await BonRetourFournisseur.findOneAndUpdate({ _id: req.params.id }, req.body)

        const bonRetourFournisseur2 = await BonRetourFournisseur.findById(req.params.id)

        const bonRetourFournisseurArticles = await BonRetourFournisseurArticle.find({ bonRetourFournisseur: req.params.id })

        for (let i = 0; i < bonRetourFournisseurArticles.length; i++) {
            await updateQteTheriqueQteEnStock(bonRetourFournisseurArticles[i], "plus", "plus")
            const deleteItem = await BonRetourFournisseurArticle.findOneAndDelete({ _id: bonRetourFournisseurArticles[i].id })
        }

        for (let i = 0; i < req.body.articles.length; i++) {
            await updateQteTheriqueQteEnStock(req.body.articles[i], "moin", "moin")
            let item = new BonRetourFournisseurArticle(req.body.articles[i])
            item.bonRetourFournisseur = result.id
            item.date = result.date
            const resul = item.save()
        }


        var fournisseur2 = await Fournisseur.findById(bonRetourFournisseur.fournisseur)
        var totalCredit = fournisseur2.credit;
    
        totalCredit -= Number(bonRetourFournisseur.montantTotal);
    
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

        var fournisseur3 = await Fournisseur.findById(req.body.fournisseur)
        var totalCredit = fournisseur3.credit;
    
        totalCredit += Number(req.body.montantTotal);
    
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur3.id, { credit: totalCredit } )


        return res.send({ status: true, resultat: bonRetourFournisseur2 })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonRetourFournisseurs/addExpedition/{id}:
 *   post:
 *     summary: Update the bonRetourFournisseur by id
 *     tags: [BonRetourFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The BonRetourFournisseur id
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
 *                      quantiteAchat:
 *                        type: number
 *                      quantiteALivree:
 *                        type: number
 *                      quantiteRestant:
 *                        type: number
 *                      unite:
 *                        type: string 
 *     responses:
 *       200:
 *         description: The list of the BonRetourFournisseurs
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
        const bonRetourFournisseur = await BonRetourFournisseur.findById(req.params.id)

        if (!bonRetourFournisseur) return res.status(401).send({ status: false })


        var expeditions = []

        expeditions.push(req.body)

        for (let i = 0; i < bonRetourFournisseur.expeditions.length; i++) {
            expeditions.push(bonRetourFournisseur.expeditions[i])
        }

        const result = await BonRetourFournisseur.findOneAndUpdate({ _id: req.params.id }, { expeditions: expeditions })

        const bonRetourFournisseur2 = await BonRetourFournisseur.findById(req.params.id)

        return res.send({ status: true, resultat: bonRetourFournisseur2.expeditions })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /bonRetourFournisseurs/deleteBonRetourFournisseur/{id}:
 *   post:
 *     summary: Remove the bonRetourFournisseur by id
 *     tags: [BonRetourFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonRetourFournisseur id
 *
 *     responses:
 *       200:
 *         description: The bonRetourFournisseur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The bonRetourFournisseur was not found
 *       500:
 *         description: Some error happened
 */
router.post('/deleteBonRetourFournisseur/:id', verifytoken, async (req, res) => {

    try {
        const bonRetourFournisseur = await BonRetourFournisseur.findById(req.params.id)

        if (!bonRetourFournisseur) return res.status(401).send({ status: false })


        const bonRetourFournisseurArticles = await BonRetourFournisseurArticle.find({ bonRetourFournisseur: req.params.id })

        for (let i = 0; i < bonRetourFournisseurArticles.length; i++) {
            await updateQteTheriqueQteEnStock(bonRetourFournisseurArticles[i], "plus", "plus")

            const deleteItem = await BonRetourFournisseurArticle.findOneAndDelete({ _id: bonRetourFournisseurArticles[i].id })
        }

        await deleteLiltrageOfBon(bonRetourFournisseur.id);

        var fournisseur2 = await Fournisseur.findById(bonRetourFournisseur.fournisseur)
        var totalCredit = fournisseur2.credit;
    
        totalCredit -= Number(bonRetourFournisseur.montantTotal);
    
        var fournisseur = await Fournisseur.findByIdAndUpdate(fournisseur2.id, { credit: totalCredit } )

        if (await BonRetourFournisseur.findOneAndDelete({ _id: req.params.id })) {
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
 * /bonRetourFournisseurs/listBonRetourFournisseurs:
 *   post:
 *     summary: Returns the list of all the bonRetourFournisseurs
 *     tags: [BonRetourFournisseurs]
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
 *         description: The list of the bonRetourFournisseurs
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

router.post('/listBonRetourFournisseurs', verifytoken, async (req, res) => {

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

        pipeline.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe, isRetourAchatContoire: req.body.isRetourAchatContoire } })

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
                from: 'bonreceptions',
                let: { "transfertBonReception": { $convert: { input: '$transfertBonReception', to: 'objectId', onError: null, onNull: null } } },
                pipeline: [{
                    $match:
                    {
                        $expr: {
                            "$and": [
                                { "$eq": ["$_id", "$$transfertBonReception"] },
                            ]
                        }
                    }
                },
                ],
                as: "bonreceptions"
            }
        })

        pipeline.push({
            $set: {
                bonReception: { $arrayElemAt: ["$bonreceptions.numero", 0] },
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
                bonReception: 1,
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

        const articles = await BonRetourFournisseur.aggregate(pipeline)

        sommePipeline.push({
            $count: "total"
        })

        var nbrTotal = await BonRetourFournisseur.aggregate(sommePipeline)

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
 * /bonRetourFournisseurs/getById/{id}:
 *   get:
 *     summary: Remove the bonRetourFournisseur by id
 *     tags: [BonRetourFournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The bonRetourFournisseur id
 *
 *     responses:
 *       200:
 *         description: The bonRetourFournisseur was deleted
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
 *         description: The bonRetourFournisseur was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        var bonRetourFournisseur = await BonRetourFournisseur.findOne({ _id: req.params.id })

        const bonRetourFournisseurArticles = await BonRetourFournisseurArticle.find({ bonRetourFournisseur: req.params.id })

        var reglements = await getReglementsByDocuments(req.params.id)

        var somme = 0
        for (let i = 0; i < reglements.length; i++) {
            somme += reglements[i].montantAPayer
        }

        if (somme != bonRetourFournisseur.montantPaye) {
            await BonRetourFournisseur.findByIdAndUpdate(bonRetourFournisseur.id, { montantPaye: somme, restPayer: bonRetourFournisseur.montantTotal - somme })
            bonRetourFournisseur = await BonRetourFournisseur.findOne({ _id: req.params.id })
        }

        return res.send({ status: true, resultat: bonRetourFournisseur, articles: bonRetourFournisseurArticles, reglements: reglements })

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

        var bonLivraison = await BonRetourFournisseur.findOne({ _id: req.params.id }).populate('fournisseur')

        const bonLivraisonArticles = await BonRetourFournisseurArticle.find({ bonRetourFournisseur: req.params.id }).populate('unite1').populate('article')

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
 * /bonRetourFournisseurs/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [BonRetourFournisseurs]
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
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice, req.body.isRetourAchatContoire)

        const articles = await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, { enAchat: 'oui' })
        const clients = await Fournisseur.find({ societeRacine: societeRacine })
        const uniteMesures = await UniteMesure.find({ societeRacine: societeRacine })
        const modeReglements = await ModeReglement.find({ societeRacine: societeRacine })
        const situationReglements = await SituationReglement.find({ societeRacine: societeRacine })

        const transporteurs = await Transporteur.find({
            societeRacine: societeRacine,
          });

          
        return res.send({ transporteurs:transporteurs, status: true, situationReglements: situationReglements, uniteMesures: uniteMesures, articles: articles, clients: clients, numeroAutomatique: numeroAutomatique.numero, modeReglements: modeReglements })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }

})

router.get('/getBonReceptions/:idSociete/:idFournisseur', verifytoken, async (req, res) => {

    try {
        if (!ObjectId.isValid(req.params.idSociete) || !ObjectId.isValid(req.params.idFournisseur)) {
            return res.send({
                status: false,
                documents: [],
                idFournisseur: req.params.idFournisseur
            })
        }

        var documents = await BonReception.find({ societe: ObjectId(req.params.idSociete), fournisseur: ObjectId(req.params.idFournisseur) })

        return res.send({
            status: true,
            documents: documents,
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
module.exports.routerBonRetourFournisseur = router
