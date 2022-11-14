const { DevisAchat } = require('../Models/devisAchatModel')
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

const { BonCommande, getNumeroAutomatique } = require('../Models/bonCommandeModel')
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
const { DemandeOffrePrixArticle } = require('../Models/demandeOffrePrixArticleModel')




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
   
    const demandeOffrePrix = await DemandeOffrePrix.find({societe:societe})
    const fournisseurs = await Fournisseur.find({societeRacine:societeRacine})
    const uniteMesures = await UniteMesure.find({societeRacine:societeRacine})

    return res.send({
        uniteMesures:uniteMesures,
        demandeOffrePrix:demandeOffrePrix,
        fournisseurs:fournisseurs,
        status: true,
    })

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
 router.get('/comparer/:idDemandeOffrePrix',verifytoken, async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
   
    var devisAchats = await getDevisAchatWithLigne(ObjectId(req.params.idDemandeOffrePrix))
    
    var demandeOffrePrixArticles = await DemandeOffrePrixArticle.find({demandeOffrePrix:req.params.idDemandeOffrePrix})
    
    var tabMinDevisAchats = {}

    /*for(let i = 0; i < demandeOffrePrixArticles.length; i++){
        var min = 0
        for(let j = 0; j < devisAchats.length; j++){
            for(let k = 0; k < devisAchats[j].articles.length; k++){
                if(demandeOffrePrixArticles[i].article+"" === devisAchats[j].articles[k].article+"" && (devisAchats[j].articles[k].prixAchatHTReel < min || min === 0)){
                    min = devisAchats[j].articles[k].prixAchatHTReel            
                    tabMinDevisAchats[demandeOffrePrixArticles[i].article] = devisAchats[j]
                }             
            }      
        }    
    }*/

    var bonCommandes = await BonCommande.find({demandeOffrePrix:req.params.idDemandeOffrePrix}).sort([['_id', -1]])
    bonCommandes = JSON.parse(JSON.stringify(bonCommandes)) 
    var newBoncommandes = []
    
    for (let j = 0; j < bonCommandes.length; j++) {
        var articles = await BonCommandeArticle.find({bonCommande:bonCommandes[j].id})
        newBoncommandes.push({bonCommande:bonCommandes[j], articles:articles})
    }

    return res.send({
        bonCommandes:newBoncommandes,
        status: true,
        devisAchats: devisAchats,
        demandeOffrePrixArticles: demandeOffrePrixArticles,
        idDemandeOffrePrix: req.params.idDemandeOffrePrix
    })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

router.post('/sendBonCommandes/:idDemandeOffrePrix',verifytoken, async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice
   
    var bonCommandes = req.body.bonCommandes

    for(let i = 0; i < bonCommandes.length; i++){
        var numeroAutomatique = await getNumeroAutomatique(societe, exercice)
        bonCommandes[i].numero = numeroAutomatique.numero
        bonCommandes[i].num = numeroAutomatique.num
        bonCommandes[i].bonReception = null
        var bonCommande = new BonCommande(bonCommandes[i]);
        var result = await bonCommande.save()
 
        for (let j = 0; j < bonCommandes[i].articles.length; j++) {
            let item = new BonCommandeArticle(bonCommandes[i].articles[j])
            await updateQteTherique(bonCommandes[i].articles[j], "plus")
            item.bonCommande = result.id
            item.date = result.date
            var ligne = await item.save()
        }
    }

    var bonCommandes = await BonCommande.find({demandeOffrePrix:req.params.idDemandeOffrePrix}).sort([['_id', -1]])
    bonCommandes = JSON.parse(JSON.stringify(bonCommandes)) 
    var newBoncommandes = []
    
    for (let j = 0; j < bonCommandes.length; j++) {
        var articles = await BonCommandeArticle.find({bonCommande:bonCommandes[j].id})
        newBoncommandes.push({bonCommande:bonCommandes[j], articles:articles})
    }
   
    return res.send({
        status: true,
        newBoncommandes:newBoncommandes
    })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

async function getDevisAchatWithLigne(idDemandeOffrePrix){
   
    var pipeline = []
    pipeline.push({ $match: { demandeOffrePrix:idDemandeOffrePrix } })

    pipeline.push({
        $lookup: {
            from: 'devisachatarticles',
            let: { "devisAchat": "$_id" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$devisAchat", "$$devisAchat"] },
                        ]
                    }
                }
            },],
            as: "articles"
        }
    })

    pipeline.push({
        $set: {
            id: "$_id"
        }
    })

    pipeline.push({
        $project: {
            id: 1,
            fournisseur: 1,
            numero: 1,
            totalHT: 1,
            date: 1,
            articles:1
        }
    })

    const devisAchats = await DevisAchat.aggregate(pipeline)

    return devisAchats
}

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
module.exports.routerComparaisonOffrePrix = router
