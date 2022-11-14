var fs = require("fs");
// var util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/log/debug.log', {flags : 'w'});
// var log_stdout = process.stdout;

const {
  BonLivraison,
  getNumeroAutomatique,
} = require("../Models/bonLivraisonModel");

const {
  Article,
  getArticlesWithQuantites,
  getArticlesWithQuantitesfilterBySearch,
  setNullForObject,
} = require("../Models/articleModel");
const { Client } = require("../Models/clientModel");
const {
  UniteMesure,
  validateUniteMesure,
} = require("../Models/uniteMesureModel");

const {
  ArticleSociete,
  updateQteEnStock,
  updateQteTherique,
  updateQteTheriqueQteEnStock,
} = require("../Models/articleSocieteModel");
var ObjectId = require("mongodb").ObjectID;
const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var multer = require("multer");

var dateFormat = require("dateformat");
const { User, validateDownloadData } = require("../Models/userModel");
const { Commande } = require("../Models/commandeModel");

const { OrdreEmission } = require("../Models/ordreEmissionModel");
const { CommandeArticle } = require("../Models/commandeArticleModel");

const { Devis } = require("../Models/devisModel");
const { ModeReglement } = require("../Models/modeReglementModel");
const {
  Reglement,
  setLiltrageBonLivraison,
  getReglementsByDocuments,
  deleteLiltrageOfBon,
} = require("../Models/reglementModel");
const { Liltrage } = require("../Models/liltrageModel");
const {
  HistoriqueArticleVente,
} = require("../Models/historiqueArticleVenteModel");
const { Role } = require("../Models/roleModel");
const {
  Utilisateur,
  validateVerifierAccee,
} = require("../Models/utilisateurModel");
const { SituationReglement } = require("../Models/situationReglementModel");
const { Projet } = require("../Models/projetModel");
const { Transporteur } = require("../Models/transporteursModel");
const { BonReception } = require("../Models/bonReceptionModel");
const { BonReceptionArticle } = require("../Models/bonReceptionArticleModel");

const { BonLivraisonArticle } = require("../Models/bonLivraisonArticleModel");

var ObjectId = require("mongodb").ObjectID;

const router = express.Router();

var multer = require("multer");

var dateFormat = require("dateformat");

const { BonRetourClient } = require("../Models/bonRetourClientModel");
const { date, exist } = require("joi");
const { pipe } = require("pdfkit");
const { Frais } = require("../Models/fraisModel");
const { PrixSpecifiqueLigne } = require('../Models/prixSpecifiqueLigneModel');
const { PrixSpecifiqueLigneTypeTier } = require('../Models/prixSpecifiqueLigneTypeTierModel');
const { Historique } = require("../Models/historiqueModel");
const { consolelog, consolelog2 } = require("../Models/errorModel");
const { isValidObjectId } = require("mongoose");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const mimeType = file.mimetype.split("/");
    const fileType = mimeType[1];

    const fileName = Date.now() + file.originalname;
    cb(null, fileName);
  },
});

var upload = multer({ storage: storage });

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
router.post(
  "/upload",
  upload.array("myFiles"),
  verifytoken,
  async (req, res) => {
    try {
      const files = req.files;
      let arr = [];
      files.forEach((element) => {
        arr.push(element.path);
      });
      return res.send(arr);
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

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
 *                ligneblGlobals:
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
 *                    ligneblGlobals:
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

async function valideStockArticlesAjout(articles, societe){
  var tab = []
  
  for(let i = 0; i < articles.length; i++){
    var ok = false
    for(let j = 0; j < tab.length; j++){
      if(tab[j].article === articles[i].article){
        ok = true
        tab[j].qte += articles[i].quantiteVente
      }
    }
    if(!ok){
      tab.push({article:articles[i].article, qte:articles[i].quantiteVente})
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

router.post("/newBonLivraison", verifytoken, async (req, res) => {
  try {

    var client = await Client.findById(req.body.client);

    if(!isValidObjectId(req.body.client)){
      return res.send({status:false})
    }

    if (
      client.plafondCredit &&
      client.plafondCredit != 0 &&
      (client.credit - req.body.restPayer) < (-1 * client.plafondCredit)
    ) {
      return res.send({ status: false, message: 4 });
    }

    var societe = ObjectId(req.body.societe);
    
    var isValidQuantiteEnStock = await valideStockArticlesAjout(req.body.articles, societe)
    if(!isValidQuantiteEnStock){
      return res.send({status:false, message:10})
    }
    
    var exercice = req.body.exercice;
    var numeroAutomatique = await getNumeroAutomatique(
      societe,
      exercice,
      req.body.isVenteContoire
    );

    req.body.numero = numeroAutomatique.numero;
    req.body.num = numeroAutomatique.num;

    req.body = setNullForObject(req.body);

    //passer ordre de mission lors de le creation du blGlobal
    const ordreMission = new OrdreEmission();
    ordreMission.societe = societe;
    await ordreMission.save();
    req.body.ordreMission = ordreMission._id;

    const bonLivraison = new BonLivraison(req.body);

    const result = await bonLivraison.save();

    var isValideCommande = "non";
    if (
      req.body.idTypeTransfert != undefined &&
      req.body.idTypeTransfert != null &&
      req.body.idTypeTransfert.length > 1 &&
      req.body.typeTransfert.length > 1
    ) {
      if (req.body.typeTransfert == "Devis") {
        let devis = await Devis.findOneAndUpdate(
          { _id: req.body.idTypeTransfert },
          { transfertBonLivraison: result.id, isTransfert: "oui" }
        );
      } else {
        let commande = await Commande.findOneAndUpdate(
          { _id: req.body.idTypeTransfert },
          { transfertBonLivraison: result.id, isTransfert: "oui" }
        );

        const commandeArticles = await CommandeArticle.find({
          commande: req.body.idTypeTransfert,
        });

        if (commande.isValid == "non") {
          for (let i = 0; i < commandeArticles.length; i++) {
            await updateQteTherique(commandeArticles[i], "moin");
          }
        } else {
          isValideCommande = "oui";
        }
      }
    }

    for (let i = 0; i < req.body.articles.length; i++) {
      let item = new BonLivraisonArticle(req.body.articles[i]);
      if (isValideCommande == "non") {
        await updateQteTheriqueQteEnStock(req.body.articles[i], "moin", "moin");
      } else {
        await updateQteEnStock(req.body.articles[i], "moin");
      }

      if (!ObjectId.isValid(item.unite1)) {
        item.unite1 = null;
      }

      if (!ObjectId.isValid(item.unite2)) {
        item.unite2 = null;
      }

      item.bonLivraison = result.id;
      item.date = result.date;

      var quantite = item.quantiteVente;
      var compteur = 0;
      const bonReceptions = await BonReceptionArticle.find({
        societe: societe,
        article: item.article,
        quantiteRestante: { $gt: 0 },
      }).sort({ date: 1 });
      var tabBonReceptions = [];

      while (quantite > 0 && compteur < bonReceptions.length) {
        if (quantite > bonReceptions[compteur].quantiteRestante) {
          quantite -= bonReceptions[compteur].quantiteRestante;
          await BonReceptionArticle.findByIdAndUpdate(
            bonReceptions[compteur].id,
            {
              quantiteRestante: 0,
            }
          );
          tabBonReceptions.push({
            bonReception: bonReceptions[compteur].bonReception,
            quantite: bonReceptions[compteur].quantiteRestante,
          });
          compteur++;
        } else {
          await BonReceptionArticle.findByIdAndUpdate(
            bonReceptions[compteur].id,
            {
              quantiteRestante:
                bonReceptions[compteur].quantiteRestante - quantite,
            }
          );
          tabBonReceptions.push({
            bonReception: bonReceptions[compteur].bonReception,
            quantite: quantite,
          });
          quantite = 0;
        }
      }

      item.bonReceptions = tabBonReceptions;
      const resul = item.save();
    }

    var somme = await setLiltrageBonLivraison(
      result,
      req.body.reglements,
      req.body.exercice
    );

    req.body.montantPaye = somme;
    req.body.restPayer = req.body.montantTotal - somme;

    if (req.body.restPayer === 0) {
      req.body.isPayee = "oui";
    } else {
      req.body.isPayee = "non";
    }

    await BonLivraison.findOneAndUpdate({ _id: req.params.id }, req.body);

    for (let i of req.body.articles) {
      const historiqueArticleVente = new HistoriqueArticleVente();
      historiqueArticleVente.idArticle = i.article;
      historiqueArticleVente.reference = i.reference;
      historiqueArticleVente.designation = i.designation;
      historiqueArticleVente.date = req.body.date;
      historiqueArticleVente.numero = req.body.numero;
      historiqueArticleVente.nomClient = req.body.client;
      historiqueArticleVente.quantite = i.quantiteVente;
      historiqueArticleVente.prixVenteHT = i.prixVenteHT;
      historiqueArticleVente.totalHT = req.body.totalHT;
      historiqueArticleVente.prixTTC = i.prixTTC;
      historiqueArticleVente.typeDocument = "Bon Livraison";
      historiqueArticleVente.societeRacine = req.body.societe;

      await historiqueArticleVente.save();
    }

    var client2 = await Client.findById(client._id);
    var totalCredit = client2.credit;

    totalCredit -= Number(req.body.montantTotal);

    await updateSoldeClient(req.body.client, totalCredit);

    var societeRacine = await getSocieteRacine(result.societe)
   
    var hist = new Historique({
      idUtilisateur:req.user.user.id,
      idDocument:result.id,
      date: new Date(),
      message:req.user.user.email + ' ajoute '+result.numero,
      societeRacine:societeRacine
    })
    await hist.save()

    return res.send({ status: true, resultat: result });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

async function updateSoldeClient(idClient, solde) {
  var client = await Client.findByIdAndUpdate(idClient, { credit: solde });
}

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
 *                ligneblGlobals:
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
 *                     ligneblGlobals:
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
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth()
  );
}

async function valideStockArticlesModifier(newArticles, encientArticles, societe){
  
  var newArticles1 = []
  for(let i = 0; i < newArticles.length; i++){
    var ok = false
    for(let j = 0; j < newArticles1.length; j++){
      if(newArticles1[j].article === newArticles[i].article){
        ok = true
        newArticles1[j].qte += newArticles[i].quantiteVente
      }
    }
    if(!ok){
      newArticles1.push({article:newArticles[i].article, qte:newArticles[i].quantiteVente})
    } 
  }

  var encientArticles1 = []
  for(let i = 0; i < encientArticles.length; i++){
    var ok = false
    for(let j = 0; j < encientArticles1.length; j++){
      if(encientArticles[i].article+"" === encientArticles1[j].article+""){
        ok = true
        encientArticles1[j].qte += encientArticles[i].quantiteVente
      }
    }
    if(!ok){
      encientArticles1.push({article:encientArticles[i].article+"", qte:encientArticles[i].quantiteVente})
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

router.post("/modifierBonLivraison/:id", verifytoken, async (req, res) => {
  try {
    const bonLivraison = await BonLivraison.findById(req.params.id);
    if (!bonLivraison) return res.status(401).send({ status: false })

    const encientArticles33 = await BonLivraisonArticle.find({bonLivraison:bonLivraison.id})
    var isValidQuantiteNegative = await valideStockArticlesModifier(req.body.articles, encientArticles33, bonLivraison.societe)
    
    if(!isValidQuantiteNegative){
       return res.send({status:false, message:10})
    }

    var newClient = await Client.findById(req.body.client);
    var client = await Client.findById(bonLivraison.client);

    if (bonLivraison.client != req.body.client) {
      if (
        newClient.plafondCredit &&
        newClient.plafondCredit != 0 &&
        (newClient.credit - req.body.restPayer) <
          (-1 * newClient.plafondCredit)
      ) {
        return res.send({ status: false, message: 4 });
      }

      const liltrages = await Liltrage.find({document:req.params.id})
      for(let i = 0; i < liltrages.length; i++){
        const reglement = await Reglement.findById(liltrages[i].reglement)
  
        let date_1 = new Date(reglement.dateReglement);
        let date_2 = new Date();
        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  
        let date_12 = new Date(bonLivraison.date);
        let date_22 = new Date();
        let difference2 = date_12.getTime() - date_22.getTime();
        let TotalDays2 = Math.ceil(difference2 / (1000 * 3600 * 24));
  
        if(Math.abs(TotalDays) > 1 || Math.abs(TotalDays2) > 1){
          return res.send({ status: false, message: 7 });
        }

        const liltrages2 = await Liltrage.find({reglement:liltrages[i].reglement})
        if(liltrages2.length > 1){
          return res.send({ status: false, message: 8 });
        }
      }

      for(let i = 0; i < liltrages.length; i++){
        await Reglement.findByIdAndUpdate(liltrages[i].reglement, {client:req.body.client})
      }

    } else {
      var difference = req.body.restPayer - bonLivraison.restPayer;
      if (
        client.plafondCredit &&
        client.plafondCredit != 0 &&
        (client.credit - difference) < (-1 * client.plafondCredit)
      ) {
        return res.send({ status: false, message: 4 });
      }
    }

    var d1 = new Date();
    var d2 = new Date(bonLivraison.date);

    if (!isSameDay(d1, d2)) {
      var isAutorisee = await validateVerifierAccee(
        req.user.user.id,
        "modifierBonLivraisonBloquant"
      );

      if (!isAutorisee) {
        return res.send({ status: false, message: 1 });
      }
    }

    req.body = setNullForObject(req.body);

    var client2 = await Client.findById(client.id);

    await updateSoldeClient(
      client2.id,
      client2.credit + bonLivraison.montantTotal
    );

    var client3 = await Client.findById(newClient.id);

    await updateSoldeClient(
      newClient.id,
      client3.credit - req.body.montantTotal
    );

    if (!bonLivraison) return res.status(401).send({ status: false });

    var somme = await setLiltrageBonLivraison(
      bonLivraison,
      req.body.reglements,
      bonLivraison.exercice
    );

    req.body.montantPaye = somme;
    req.body.restPayer = req.body.montantTotal - somme;

    if (req.body.restPayer === 0) {
      req.body.isPayee = "oui";
    } else {
      req.body.isPayee = "non";
    }

    const result = await BonLivraison.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );

    var bonLivraison2 = await BonLivraison.findById(req.params.id);

    const bonLivraisonArticles = await BonLivraisonArticle.find({
      bonLivraison: req.params.id,
    });

    for (let i = 0; i < bonLivraisonArticles.length; i++) {
      await updateQteTheriqueQteEnStock(bonLivraisonArticles[i], "plus", "plus");
      const deleteItem = await BonLivraisonArticle.findOneAndDelete({
        _id: bonLivraisonArticles[i].id,
      });
    }

    for (let i = 0; i < req.body.articles.length; i++) {
      let item = new BonLivraisonArticle(req.body.articles[i]);
      await updateQteTheriqueQteEnStock(req.body.articles[i], "moin", "moin");

      if (!ObjectId.isValid(item.unite1)) {
        item.unite1 = null;
      }

      if (!ObjectId.isValid(item.unite2)) {
        item.unite2 = null;
      }

      item.bonLivraison = result.id;
      item.date = result.date;
      const resul = item.save();
    }

    const bonLivraisonArticles2 = await BonLivraisonArticle.find({
      bonLivraison: req.params.id,
    });

    bonLivraison2.articles = bonLivraisonArticles2;

    var societeRacine = await getSocieteRacine(bonLivraison.societe)
   
    var hist = new Historique({
      idUtilisateur:req.user.user.id,
      idDocument:bonLivraison.id,
      date: new Date(),
      message:req.user.user.email + ' modifie '+bonLivraison.numero,
      societeRacine:societeRacine
    })
    await hist.save()

    return res.send({ status: true, resultat: bonLivraison2 });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /bonLivraisons/addExpedition/{id}:
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
 *         description: The list of the BonLivraisons
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

router.post("/addExpedition/:id", verifytoken, async (req, res) => {
  try {
    const bonLivraison = await BonLivraison.findById(req.params.id);

    if (!bonLivraison) return res.status(401).send({ status: false });

    var expeditions = [];

    expeditions.push(req.body);

    for (let i = 0; i < bonLivraison.expeditions.length; i++) {
      expeditions.push(bonLivraison.expeditions[i]);
    }

    const result = await BonLivraison.findOneAndUpdate(
      { _id: req.params.id },
      { expeditions: expeditions }
    );

    const bonLivraison2 = await BonLivraison.findById(req.params.id);

    return res.send({ status: true, resultat: bonLivraison2.expeditions });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

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
router.post("/deleteBonLivraison/:id", verifytoken, async (req, res) => {
  try {
    const bonLivraison = await BonLivraison.findById(req.params.id);

    var d1 = new Date();
    var d2 = new Date(bonLivraison.date);

    if (!isSameDay(d1, d2)) {
      var isAutorisee = await validateVerifierAccee(
        req.user.user.id,
        "supprimerBonLivraisonBloquant"
      );
      if (!isAutorisee) {
        return res.send({ status: false, message: 2 });
      }
    }

    var client = await Client.findById(bonLivraison.client);

    //sousstraction le montant total de solde de bonlivraison
    await updateSoldeClient(
      client.id,
      client.credit + bonLivraison.montantTotal
    );

    if (!bonLivraison) return res.status(401).send({ status: false });

    const bonLivraisonArticles = await BonLivraisonArticle.find({
      bonLivraison: req.params.id,
    });

    for (let i = 0; i < bonLivraisonArticles.length; i++) {
      await updateQteTheriqueQteEnStock(bonLivraisonArticles[i], "plus", "plus");

      const deleteItem = await BonLivraisonArticle.findOneAndDelete({
        _id: bonLivraisonArticles[i].id,
      });

      if (client != undefined) {
        const deleteHisto = await HistoriqueArticleVente.find({
          idArticle: bonLivraisonArticles[i].article,
          nomClient: client.id,
          totalHT: bonLivraisonArticles[i].totalHT,
        });

        if (deleteHisto.length > 0) {
          await HistoriqueArticleVente.deleteOne({
            idArticle: bonLivraisonArticles[i].id,
            nomClient: client.id,
            totalHT: bonLivraisonArticles[i].totalHT,
          });
        }
      }
    }

    await deleteLiltrageOfBon(bonLivraison.id);

    await Commande.findOneAndUpdate(
      { transfertBonLivraison: bonLivraison.id + "" },
      { transfertBonLivraison: "", isTransfert: "non" }
    );

    
    var societeRacine = await getSocieteRacine(bonLivraison.societe)
   
    var hist = new Historique({
      idUtilisateur:req.user.user.id,
      idDocument:bonLivraison.id,
      date: new Date(),
      message:req.user.user.email + ' supprime '+bonLivraison.numero,
      societeRacine:societeRacine
    })
    await hist.save()

    if (await BonLivraison.findOneAndDelete({ _id: req.params.id })) {
      return res.send({ status: true });
    } else {
      return res.send({ status: false });
    }
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "itemsList",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
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
 *                            ligneblGlobals:
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

router.post("/listBonLivraisons", verifytoken, async (req, res) => {
  try {
    consolelog2("listBonLivraisons : route 1 (start)") 

    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.magasin);

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { _id: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        date: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        isVenteContoire: req.body.isVenteContoire,
      },
    });

    pipeline.push({
      $lookup: {
        from: "clients",
        let: { client: "$client" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$client"] }],
              },
            },
          },
        ],
        as: "clients",
      },
    });

    pipeline.push({
      $lookup: {
        from: "commandes",
        let: { bonLivraison: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$transfertBonLivraison", "$$bonLivraison"] }],
              },
            },
          },
        ],
        as: "commandes",
      },
    });

    pipeline.push({
      $lookup: {
        from: "factureventes",
        let: { factureVente: "$factureVente" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$factureVente"] }],
              },
            },
          },
        ],
        as: "factureventes",
      },
    });

    pipeline.push({
      $set: {
        commande: { $arrayElemAt: ["$commandes.numero", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        totalRemise: { $toString: "$totalRemise" },
        totalHT: { $toString: "$totalHT" },
        totalRedevance: { $toString: "$totalRedevance" },
        
        totalTVA: { $toString: "$totalTVA" },
        tFiscale: { $toString: "$timbrGlobaleFiscale" },
        totalTTC: { $toString: "$totalTTC" },
        totalGain: { $toString: "$totalGain" },
        factureVente: { $arrayElemAt: ["$factureventes.numero", 0] },

        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        id: "$_id",
      },
    });

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
        factureVente: 1,
        totalRedevance:1,
        date: 1,
        numero: 1,
        commande: 1,
      },
    });

    var search = req.body.search;

    for (let key in search) {
      if (search[key] != "") {
        var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1);
        var word2 = search[key].toUpperCase();
        var word3 = search[key].toLowerCase();

        var objet1 = {};
        objet1[key] = { $regex: ".*" + word1 + ".*" };

        var objet2 = {};
        objet2[key] = { $regex: ".*" + word2 + ".*" };

        var objet3 = {};
        objet3[key] = { $regex: ".*" + word3 + ".*" };

        let objectMatch = { $or: [objet1, objet2, objet3] };

        let objectParent = { $match: objectMatch };
        pipeline.push(objectParent);
      }
    }

    var sommePipeline = [];
    for (let key in pipeline) {
      sommePipeline.push(pipeline[key]);
    }

    pipeline.push({
      $sort: sort,
    });

    var skip = Number(req.body.page - 1) * Number(req.body.limit);

    pipeline.push({ $limit: skip + Number(req.body.limit) });

    pipeline.push({ $skip: skip });

    const articles = await BonLivraison.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrGlobalTotal = await BonLivraison.aggregate(sommePipeline);

    if (nbrGlobalTotal.length == 0) {
      nbrGlobalTotal = [{ total: 0 }];
    }

    const nbrGlobalTotalTrunc = Math.trunc(
      nbrGlobalTotal[0].total / req.body.limit
    );
    var pages = nbrGlobalTotal[0].total / req.body.limit;

    if (pages > nbrGlobalTotalTrunc) {
      pages = nbrGlobalTotalTrunc + 1;
    }

    consolelog2("listBonLivraisons : route 1 (end)") 

    const result = { docs: articles, pages: pages };

    return res.send({ status: true, resultat: result, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/calculClientTransactions", async (req, res) => {
  try {

    consolelog2("calculClientTransactions : route 1 (start)") 
   
    const societe = ObjectId(req.body.societe);

    const societeRacine = await getSocieteRacine(societe);

    if(!isValidObjectId(societeRacine) || !societeRacine){
      return res.send({ status: false });
    }

    var pipelineClient = [];
    var pipelineBRC = [];

    pipelineClient.push({
      $match: {
        societe: societe,
      },
    });
    pipelineBRC.push({
      $match: {
        societe: societe,
      },
    });

    pipelineBRC.push({
      $set: {
        totalTTC: { $multiply: ["$totalTTC", -1] },
      },
    });

    pipelineClient.push({
      $unionWith: { coll: "bonretourclients", pipeline: pipelineBRC },
    });

    pipelineClient.push({
      $group: {
        _id: "$client",
        chiffreAffaire: { $sum: "$totalTTC" },
      },
    });

    pipelineClient.push({
      $lookup: {
        from: "clients",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$client"] }],
              },
            },
          },
        ],
        as: "clients",
      },
    });

    pipelineClient.push({
      $set: {
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
      },
    });

    const bls = await BonLivraison.aggregate(pipelineClient);

    bls.map((e) => {
      console.log(e);
    });

    consolelog2("calculClientTransactions : route 1 (end)") 
  
    res.send({ transactionsClient: bls });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/calculChiffreAffaireParMois", async (req, res) => {
  try {

    consolelog2("calculChiffreAffaireParMois : route 1 (start)") 
 
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var client = ObjectId(req.body.client);

    if(!isValidObjectId(societe) || !societe){
      return res.send({ status: false });
    }

    var pipeCalculCiffreAffaireParMois = [];

    pipeCalculCiffreAffaireParMois.push({
      $facet: {
        bonLivraisonArray: [
          { $limit: 1 },
          {
            $lookup: {
              from: "bonlivraisons",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                    date: { $lte: dateEnd, $gte: dateStart },
                  },
                },
                {
                  $set: {
                    mois: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y-%m",
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: "$mois",
                    montantVente: { $sum: "$totalTTC" },
                  },
                },
              ],
              as: "bonLivraisonArray",
            },
          },
        ],
        bonRetourArray: [
          { $limit: 1 },
          {
            $lookup: {
              from: "bonretourclients",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                    date: { $lte: dateEnd, $gte: dateStart },
                  },
                },
                {
                  $set: {
                    mois: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y-%m",
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: "$mois",
                    montantRetour: { $sum: "$totalTTC" },
                  },
                },
                {
                  $set: {
                    montantVente: { $multiply: ["$montantRetour", -1] },
                  },
                },
              ],
              as: "bonRetourArray",
            },
          },
        ],
      },
    });

    pipeCalculCiffreAffaireParMois.push({
      $project: {
        data: {
          $concatArrays: [
            {
              $arrayElemAt: ["$bonLivraisonArray.bonLivraisonArray", 0],
            },
            {
              $arrayElemAt: ["$bonRetourArray.bonRetourArray", 0],
            },
          ],
        },
      },
    });
    pipeCalculCiffreAffaireParMois.push({
      $unwind: "$data",
    });

    pipeCalculCiffreAffaireParMois.push({
      $replaceRoot: { newRoot: "$data" },
    });

    pipeCalculCiffreAffaireParMois.push({
      $group: {
        _id: "$_id",
        chiffreAffaireParMois: { $sum: "$montantVente" },
      },
    });
    pipeCalculCiffreAffaireParMois.push({
      $sort: {
        _id: 1,
      },
    });

    var resultat = await BonLivraison.aggregate(pipeCalculCiffreAffaireParMois);

    consolelog2("calculChiffreAffaireParMois : route 1 (end)") 
 
    res.send({
      chiffreAffaireParMois: resultat,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/calculChiffreAffaireParAns", async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var pipelineLivraison = [];
    var pipelineRetour = [];
    var pipeCalculCiffreAffaireParAns = [];

    pipelineLivraison.push({
      $match: {
        societe: societe,
        date: { $lte: dateEnd, $gte: dateStart },
      },
    });

    pipelineLivraison.push({
      $set: {
        year: {
          $dateToString: {
            date: "$date",
            format: "%Y",
          },
        },
      },
    });

    pipelineLivraison.push({
      $group: {
        _id: "$year",

        montantVente: { $sum: "$totalTTC" },
      },
    });
    pipelineLivraison.push({
      $sort: { date: -1 },
    });

    pipelineRetour.push({
      $match: {
        societe: societe,
        date: { $lte: dateEnd, $gte: dateStart },
      },
    });

    pipelineRetour.push({
      $set: {
        year: {
          $dateToString: {
            date: "$date",
            format: "%Y",
          },
        },
      },
    });

    pipelineRetour.push({
      $group: {
        _id: "$year",
        montantRetour: { $sum: "$totalTTC" },
      },
    });
    pipelineRetour.push({
      $sort: { date: -1 },
    });

    pipeCalculCiffreAffaireParAns.push({
      $facet: {
        bonLivraisonArray: [
          { $limit: 1 },
          {
            $lookup: {
              from: "bonlivraisons",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                    date: { $lte: dateEnd, $gte: dateStart },
                  },
                },
                {
                  $set: {
                    year: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y",
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: "$year",
                    montantVente: { $sum: "$totalTTC" },
                  },
                },
              ],
              as: "bonLivraisonArray",
            },
          },
        ],
        bonRetourArray: [
          { $limit: 1 },
          {
            $lookup: {
              from: "bonretourclients",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                    date: { $lte: dateEnd, $gte: dateStart },
                  },
                },
                {
                  $set: {
                    year: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y",
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: "$year",
                    montantRetour: { $sum: "$totalTTC" },
                  },
                },
                {
                  $set: {
                    montantVente: { $multiply: ["$montantRetour", -1] },
                  },
                },
              ],
              as: "bonRetourArray",
            },
          },
        ],
      },
    });

    pipeCalculCiffreAffaireParAns.push({
      $project: {
        data: {
          $concatArrays: [
            {
              $arrayElemAt: ["$bonLivraisonArray.bonLivraisonArray", 0],
            },
            {
              $arrayElemAt: ["$bonRetourArray.bonRetourArray", 0],
            },
          ],
        },
      },
    });
    pipeCalculCiffreAffaireParAns.push({
      $unwind: "$data",
    });

    pipeCalculCiffreAffaireParAns.push({
      $replaceRoot: { newRoot: "$data" },
    });

    pipeCalculCiffreAffaireParAns.push({
      $group: {
        _id: "$_id",
        chiffreAffaireParAns: { $sum: "$montantVente" },
      },
    });
    pipeCalculCiffreAffaireParAns.push({
      $sort: {
        _id: -1,
      },
    });

    var reslt = await BonLivraison.aggregate(pipeCalculCiffreAffaireParAns);

    var resultLivraison = await BonLivraison.aggregate(pipelineLivraison);
    var resultRetour = await BonRetourClient.aggregate(pipelineRetour);

    if (Array.isArray(resultLivraison)) {
      var blGlobal = 0;
      resultLivraison.map((e) => {
        blGlobal += e.montantVente;
      });
    }
    if (Array.isArray(resultRetour)) {
      var brGlobal = 0;
      resultRetour.map((e) => {
        brGlobal += e.montantRetour;
      });
    }
    var chiffreAffaireGlobal = blGlobal - brGlobal;

    res.send({
      chiffreAffaire: reslt,
      chiffreAffaireGlobal: chiffreAffaireGlobal,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

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
 *                     ligneblGlobals:
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

router.get("/getById/:id", async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    var bonLivraison = await BonLivraison.findOne({ _id: req.params.id });

    var client = await Client.findOne({ _id: bonLivraison.client });

    const bonLivraisonArticles = await BonLivraisonArticle.find({
      bonLivraison: ObjectId(req.params.id),
    });

    var reglements = await getReglementsByDocuments(req.params.id);

    var somme = 0;
    for (let i = 0; i < reglements.length; i++) {
      somme += reglements[i].montantAPayer;
    }

    if (somme != bonLivraison.montantPaye) {
      await BonLivraison.findByIdAndUpdate(bonLivraison.id, {
        montantPaye: somme,
        restPayer: bonLivraison.montantTotal - somme,
      });
      bonLivraison = await BonLivraison.findOne({ _id: req.params.id });
    }

    var documentDeTransfert = await Devis.findOne({
      transfertBonLivraison: req.params.id,
    });
    if (documentDeTransfert === null) {
      documentDeTransfert = await Commande.findOne({
        transfertBonLivraison: req.params.id,
      });
    }

    return res.send({
      status: true,
      resultat: bonLivraison,
      articles: bonLivraisonArticles,
      reglements: reglements,
      documentDeTransfert: documentDeTransfert,
      client: client,
    });
  } catch (e) {
    consolelog(e) 
    
    console.log = function (e) {
      //
      log_file.write(util.format(e) + "\n");
      log_stdout.write(util.format(e) + "\n");
    };

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getByIdImpression/:id", async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    var bonLivraison = await BonLivraison.findOne({ _id: req.params.id })
      .populate("client")
      .populate("transporteur");

    const bonLivraisonArticles = await BonLivraisonArticle.find({
      bonLivraison: req.params.id,
    })
      .populate("unite1")
      .populate("article");

    return res.send({
      status: true,
      resultat: bonLivraison,
      articles: bonLivraisonArticles,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

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
 *         description: The blGlobal was deleted
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
 *         description: The blGlobal was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getAllParametres", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));
    var societe = ObjectId(req.body.societe);
    var exercice = req.body.exercice;

    var numeroAutomatique = await getNumeroAutomatique(
      societe,
      exercice,
      req.body.isVenteContoire
    );

    const articles = await getArticlesWithQuantitesfilterBySearch(
      societe,
      societeRacine,
      { enVente: "oui" }
    );
    const clients = await Client.find({ societeRacine: societeRacine });

    const uniteMesures = await UniteMesure.find({
      societeRacine: societeRacine,
    });
    const modeReglements = await ModeReglement.find({
      societeRacine: societeRacine,
    });
    const situationReglements = await SituationReglement.find({
      societeRacine: societeRacine,
    });

    const transporteurs = await Transporteur.find({
      societeRacine: societeRacine,
    });

    const frais = await Frais.find({
      societeRacine: societeRacine,
    });

    return res.send({
      transporteurs: transporteurs,
      situationReglements: situationReglements,
      status: true,
      uniteMesures: uniteMesures,
      articles: articles,
      clients: clients,
      numeroAutomatique: numeroAutomatique.numero,
      modeReglements: modeReglements,
      allFrais: frais,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /bonLivraisons/bonLivraisonsClient/{id}:
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
 *         description: The blGlobal was deleted
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
 *         description: The blGlobal was not found
 *       500:
 *         description: Some error happened
 */
router.get("/bonLivraisonsClient/:id", verifytoken, async (req, res) => {
  try {
    const bonLivraisonsClient = await BonLivraison.count({
      client: req.params.id,
      isPayee: "non",
    });

    return res.send({ status: true, bonLivraisonsClient, bonLivraisonsClient });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getCommandes/:idSociete/:idClient",
  verifytoken,
  async (req, res) => {
    try {
      if (
        !ObjectId.isValid(req.params.idSociete) ||
        !ObjectId.isValid(req.params.idClient)
      ) {
        return res.send({
          status: false,
          documents: [],
          idClient: req.params.idClient,
        });
      }

      var projetsClient = await Projet.find({
        client: ObjectId(req.params.idClient),
      });

      var documents = await Commande.find({
        societe: ObjectId(req.params.idSociete),
        client: ObjectId(req.params.idClient),
        isTransfert: "non",
      });


      var prixSpecifiqueLignes = await PrixSpecifiqueLigne.find({client:req.params.idClient, isEnable:true})
      const client = await Client.findById(req.params.idClient)
      var prixSpecifiqueLigneTypeTiers = []
      if(client.typeTiers){
          prixSpecifiqueLigneTypeTiers = await PrixSpecifiqueLigneTypeTier.find({typeTier:client.typeTiers, isEnable:true})
      }
      
      return res.send({
        status: true,
        documents: documents,
        projetsClient: projetsClient,
        idClient: req.params.idClient,
        prixSpecifiqueLignes: prixSpecifiqueLignes,
        prixSpecifiqueLigneTypeTiers: prixSpecifiqueLigneTypeTiers
      });
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

function verifytoken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "secretkey", (err, authData) => {
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
module.exports.routerBonLivraison = router;
