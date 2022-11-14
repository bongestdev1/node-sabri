const {Variante} =require('../Models/varianteModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { Parametres } = require('../Models/parametresModel');
const { FactureAchat } = require('../Models/factureAchatModel');
const { Article } = require('../Models/articleModel');
const { ArticleSociete } = require('../Models/articleSocieteModel');
const { BonReception } = require('../Models/bonReceptionModel');
const { BonRetourClient } = require('../Models/bonRetourClientModel');
const { BonTransfert } = require('../Models/bonTransfertModel');
const { BonLivraison } = require('../Models/bonLivraisonModel');
const { BonRetourFournisseur } = require('../Models/bonRetourFournisseurModel');
const { BonCasse } = require('../Models/bonCasseModel');
const { CorrectionStock } = require('../Models/correctionStockModel');
const { BonReceptionArticle } = require('../Models/bonReceptionArticleModel');
const { BonRetourClientArticle } = require('../Models/bonRetourClientArticleModel');
const { BonTransfertArticle } = require('../Models/bonTransfertArticleModel');
const { BonLivraisonArticle } = require('../Models/bonLivraisonArticleModel');
const { BonRetourFournisseurArticle } = require('../Models/bonRetourFournisseurArticleModel');
const { BonCasseArticle } = require('../Models/bonCasseArticleModel');
const { regrouperArticles } = require('../Models/mouvementStockModel');
const { isValidObjectId } = require('mongoose');
const { Client } = require('../Models/clientModel');
const { calculerSoldeClient, Reglement } = require('../Models/reglementModel');
const { Fournisseur } = require('../Models/fournisseurModel');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  file.originalname + Date.now())
    }
})


var upload = multer({ storage: storage })

router.get('/InialiserSoldeFournisseur/:idSociete', verifytoken, async (req, res) => {
    try {
        var societeRacine = await getSocieteRacine(req.params.idSociete)
   
        const fournisseurs = await Fournisseur.find({societeRacine : societeRacine})

        for(let item of fournisseurs){

            const reglements = await Reglement.find({ client: item.id }).populate({ path: "fournisseur", select: "_id, raisonSociale" }).populate({ path: "modeReglement" })

            const receptions = await BonReception.find({ fournisseur: item.id }).populate({ path: "fournisseur", select: "_id, raisonSociale" })
          
            const bonRetours = await BonRetourFournisseur.find({ fournisseur: item.id }).populate({ path: "fournisseur", select: "_id, raisonSociale" })
          
            var soldeCurrente = 0
          
            for (let item2 of reglements) {
              if (item2.typeReglement == "bonAchat") {
                soldeCurrente += item2.montant
              }else{
                soldeCurrente -= item2.montant
              }
            }
          
            for (let itemRetour of bonRetours) {
              soldeCurrente += itemRetour.montantTotal
            }
          
            for (let itemReception of receptions) {
              soldeCurrente -= itemReception.montantTotal
            }

            console.log(item.raisonSociale, soldeCurrente)

            await Fournisseur.findOneAndUpdate({_id: item.id},{credit: soldeCurrente})
        }

        console.log("etap2")
        return res.send({ status:true })
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e)
      return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/InialiserSoldeClient/:idSociete', verifytoken, async (req, res) => {
    try {
        console.log("etap1")

        var societeRacine = await getSocieteRacine(req.params.idSociete)
   
        var clients = await Client.find({societeRacine : societeRacine})

    
        for(let item of clients){
           var solde = await calculerSoldeClient(null, null, item.id)
           await Client.findOneAndUpdate({_id: item.id},{credit:-1 * solde})
        }

      console.log("etap2")
      return res.send({ status:true })
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e)
      return res.send({ status: false }) // pass exception object to error handler
    }
})

router.get('/InialiserQte/:idSociete', verifytoken, async (req, res) => {
     try {
        console.log("etape 1")
      var societeRacine = await getSocieteRacine(ObjectId(req.params.idSociete))
    
      var societe = await Societe.findOne({ _id: ObjectId(req.params.idSociete) })

      var parametres = await Parametres.findOne({ societeRacine: societeRacine })
      console.log("etape 2")
    
      listGlobal = []
      
      
      var articles = [] 
      
      articles = await Article.find({societeRacine:societeRacine})
      
      for (let item of articles) {
          var articleSociete = await ArticleSociete.findOne({article: item.id, societe: societe.id})
          if(articleSociete){
              listGlobal.push({ id: item.id, reference: item.reference, designation: item.designation, qteInitial: articleSociete.qteInitial, qteEntree: 0, qteSortie: 0, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })
          }
      }
          
      var bonAchats = []
      if (parametres != null && parametres.validationStockBonAchat != "oui") {
          bonAchats = await BonReception.find({societe: ObjectId(societe.id) })
      } else {
          const factureAchats = await FactureAchat.find({ societe: ObjectId(societe.id) })
          for (let i = 0; i < factureAchats.length; i++) {
              var bonAchats2 = await BonReception.find({ factureAchat: factureAchats[i].id })
              for (let j = 0; j < bonAchats2.length; j++) {
                  bonAchats.push(bonAchats2[j])
              }
          }
      }
      console.log("etape 3")
    
      const bonRetourClients = await BonRetourClient.find({ societe: ObjectId(societe.id) })

      const bontransferts = await BonTransfert.find({ societe: ObjectId(societe.id) })

      const bonLivs = await BonLivraison.find({ societe: ObjectId(societe.id) })

      const bonRetourFournisseurs = await BonRetourFournisseur.find({ societe: ObjectId(societe.id) })

      const bonCasses = await BonCasse.find({ societe: ObjectId(societe.id) })

      const correctionStocks = await CorrectionStock.find({ societe: ObjectId(societe.id) }).populate('ligneCorrectionStocks.article')

      
      console.log("etape 4")
    
      for (let item of bonAchats) {

          let articleBA = await BonReceptionArticle.find({ bonReception: item.id }).populate('article')

          for (let itemA of articleBA) {
              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: itemA.quantiteAchat, qteSortie: 0, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })

          }
      }
      console.log("etape 5")
    
      for (let item of bonRetourClients) {

          let articleBR = await BonRetourClientArticle.find({ bonRetourClient: item._id }).populate('article')

          for (let itemA of articleBR) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: itemA.quantiteVente, qteSortie: 0, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })

          }
      }
      console.log("etape 6")
    
      for (let item of bontransferts) {

          let articleBT = await BonTransfertArticle.find({ bonTransfert: item._id }).populate('article')

          for (let itemA of articleBT) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: 0, qteSortie: itemA.quantiteVente, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })

          }
      }
      console.log("etape 7")
    
      for (let item of bonLivs) {

          let articleBL = await BonLivraisonArticle.find({ bonLivraison: item._id }).populate('article')

          for (let itemA of articleBL) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: 0, qteSortie: itemA.quantiteVente, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })

          }
      }

      console.log("etape 8")
 
      for (let item of bonRetourFournisseurs) {

          let articleBR = await BonRetourFournisseurArticle.find({ bonRetourFournisseur: item._id }).populate('article')

          for (let itemA of articleBR) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: 0, qteSortie: itemA.quantiteAchat, qteStock: 0, qteCasse: 0, qteCorrectionStock: 0 })

          }
      }

      console.log("etape 9")
 
      for (let item of bonCasses) {

          let articleBC = await BonCasseArticle.find({ bonCasse: item._id }).populate('article')

          for (let itemA of articleBC) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }

              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: 0, qteSortie: 0, qteStock: 0, qteCasse: itemA.quantiteVente, qteCorrectionStock: 0 })
          }

      }

      console.log("etape 10")
 
      for (let item of correctionStocks) {

          let articleBC = item.ligneCorrectionStocks

          for (let itemA of articleBC) {

              var categorie = ""
              var famille = ""
              var sousFamille = ""
              var article = ""

              if (itemA.article) {
                  var categorie = itemA.article.categorie
                  var famille = itemA.article.famille
                  var sousFamille = itemA.article.sousFamille
                  var article = itemA.article.id
              }


              listGlobal.push({ id: article, reference: itemA.reference, designation: itemA.designation, categorie: categorie, famille: famille, sousFamille: sousFamille, qteInitial: 0, qteEntree: 0, qteSortie: 0, qteStock: 0, qteCasse: 0, qteCorrectionStock: itemA.qteDifference })
          }

      }

      console.log("etape 11")
 
      let listFilter = await regrouperArticles(listGlobal)

      listGlobal = listFilter

      for(let item of listGlobal){
        if(isValidObjectId(item.id)){
            console.log(item.id, item.qteStock)
            await ArticleSociete.findOneAndUpdate({article: Object(item.id), societe:societe.id}, {qteEnStock: item.qteStock,qteTheorique:item.qteStock})
        }
      }

      return res.send({ status: true})

    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e)
      return res.send({ status: false }) // pass exception object to error handler
    }
})

function verifytoken(req, res, next){
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'secretkey', (err, authData) => {
            if(err){
                res.sendStatus(403);
            }else{
                req.user = authData;
                next();
            }
        });

    }else{
        console.log("etape100");
        res.sendStatus(401);
    }

}

module.exports.routerInitialiserSoldeQuantite=router