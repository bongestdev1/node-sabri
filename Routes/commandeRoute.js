const { Commande, getNumeroAutomatique } = require("../Models/commandeModel");
const { CommandeArticle } = require("../Models/commandeArticleModel");

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

const {
  Article,
  getArticlesWithQuantites,
  getArticlesWithQuantitesfilterBySearch,
} = require("../Models/articleModel");
const { Client } = require("../Models/clientModel");
const { Devis } = require("../Models/devisModel");
const { ConditionReglement } = require("../Models/conditionReglementModel");
const {
  UniteMesure,
  validateUniteMesure,
} = require("../Models/uniteMesureModel");
const {
  HistoriqueArticleVente,
} = require("../Models/historiqueArticleVenteModel");

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var multer = require("multer");
const fs = require("fs");

var dateFormat = require("dateformat");
const { User, validateDownloadData } = require("../Models/userModel");
const { Frais } = require("../Models/fraisModel");
const {
  PrixSpecifiqueLigneTypeTier,
} = require("../Models/prixSpecifiqueLigneTypeTierModel");
const { PrixSpecifiqueLigne } = require("../Models/prixSpecifiqueLigneModel");
const { Historique } = require("../Models/historiqueModel");
const { consolelog } = require("../Models/errorModel");
const { isValidObjectId } = require("mongoose");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now());
  },
});

var upload = multer({ storage: storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Commande:
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
 *   name: Commandes
 *   description: The Commandes managing API
 */

/**
 * @swagger
 * paths:
 *   /commandes/upload:
 *     post:
 *       summary: upload image
 *       tags: [Commandes]
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
 * /commandes/newCommande:
 *   post:
 *     summary: Returns the list of all the Commandes
 *     tags: [Commandes]
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
 *     responses:
 *       200:
 *         description: The list of the Commandes
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
router.post("/newCommande", verifytoken, async (req, res) => {
  try {

    if(!isValidObjectId(req.body.client)){
      return res.send({ status: false })
    }

    var client = await Client.findById(req.body.client);

    if (
      client.plafondCredit &&
      client.plafondCredit != 0 &&
      client.credit - req.body.restPayer < -1 * client.plafondCredit
    ) {
      return res.send({ status: false, message: 4 });
    }

    var societe = ObjectId(req.body.societe);
    var exercice = req.body.exercice;
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice);

    req.body.numero = numeroAutomatique.numero;
    req.body.num = numeroAutomatique.num;

    const commande = new Commande(req.body);
    const result = await commande.save();

    if (
      req.body.idTypeTransfert != "" &&
      req.body.typeTransfert != "" &&
      req.body.idTypeTransfert != undefined
    ) {
      const devi = await Devis.findById(req.body.idTypeTransfert);
      await Devis.findByIdAndUpdate(devi.id, { isTransfert: "oui" });
      const devis = await Devis.findOneAndUpdate(
        { _id: req.body.idTypeTransfert },
        { transfertCommande: result.id }
      );
    }

    for (let i = 0; i < req.body.articles.length; i++) {
      let item = new CommandeArticle(req.body.articles[i]);
      if (commande.isValid == "oui") {
        await updateQteTherique(req.body.articles[i], "moin");
      }
      item.commande = result.id;
      item.date = result.date;
      const resul = item.save();
    }

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
      historiqueArticleVente.typeDocument = "Commande";
      historiqueArticleVente.societeRacine = req.body.societe;

      await historiqueArticleVente.save();
    }

    var societeRacine = await getSocieteRacine(result.societe);

    var hist = new Historique({
      idUtilisateur: req.user.user.id,
      idDocument: result.id,
      date: new Date(),
      message: req.user.user.email + " ajoute " + result.numero,
      societeRacine: societeRacine,
    });
    await hist.save();

    return res.send({ status: true, resultat: result });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /commandes/modifierCommande/{id}:
 *   post:
 *     summary: Update the commande by id
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Commande id

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
 *         description: The list of the Commandes
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

router.post("/modifierCommande/:id", verifytoken, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);

    if (!commande) return res.status(401).send({ status: false });

    var newClient = await Client.findById(req.body.client);
    var client = await Client.findById(commande.client);

    if (commande.client + "" != req.body.client + "") {
      if (
        newClient.plafondCredit &&
        newClient.plafondCredit != 0 &&
        newClient.credit - req.body.restPayer < -1 * newClient.plafondCredit
      ) {
        return res.send({ status: false, message: 4 });
      }
    } else {
      var difference = req.body.montantTotal - commande.montantTotal;
      if (
        client.plafondCredit &&
        client.plafondCredit != 0 &&
        client.credit - difference < -1 * client.plafondCredit
      ) {
        return res.send({ status: false, message: 4 });
      }
    }

    const result = await Commande.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );

    const commande2 = await Commande.findById(req.params.id);

    const commandeArticles = await CommandeArticle.find({
      commande: req.params.id,
    });

    for (let i = 0; i < commandeArticles.length; i++) {
      if (commande.isValid == "oui") {
        await updateQteTherique(commandeArticles[i], "plus");
      }

      const deleteItem = await CommandeArticle.findOneAndDelete({
        _id: commandeArticles[i].id,
      });
    }

    for (let i = 0; i < req.body.articles.length; i++) {
      if (req.body.isValid == "oui") {
        await updateQteTherique(req.body.articles[i], "moin");
      }

      let item = new CommandeArticle(req.body.articles[i]);
      item.commande = result.id;
      item.date = result.date;
      const resul = item.save();
    }

    var societeRacine = await getSocieteRacine(commande2.societe);
    var hist = new Historique({
      idUtilisateur: req.user.user.id,
      idDocument: commande2.id,
      date: new Date(),
      message: req.user.user.email + " modifie " + commande2.numero,
      societeRacine: societeRacine,
    });
    await hist.save();

    return res.send({ status: true, resultat: commande2 });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /commandes/addExpedition/{id}:
 *   post:
 *     summary: Update the commande by id
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Commande id
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
 *         description: The list of the Commandes
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
    const commande = await Commande.findById(req.params.id);

    if (!commande) return res.status(401).send({ status: false });

    var expeditions = [];

    expeditions.push(req.body);

    for (let i = 0; i < commande.expeditions.length; i++) {
      expeditions.push(commande.expeditions[i]);
    }

    const result = await Commande.findOneAndUpdate(
      { _id: req.params.id },
      { expeditions: expeditions }
    );

    const commande2 = await Commande.findById(req.params.id);

    return res.send({ status: true, resultat: commande2.expeditions });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /commandes/deleteCommande/{id}:
 *   post:
 *     summary: Remove the commande by id
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The commande id
 *
 *     responses:
 *       200:
 *         description: The commande was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The commande was not found
 *       500:
 *         description: Some error happened
 */
router.post("/deleteCommande/:id", verifytoken, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);

    if (!commande) return res.status(401).send({ status: false });

    var client = await Client.findById(commande.client);

    const commandeArticles = await CommandeArticle.find({
      commande: req.params.id,
    });

    for (let i = 0; i < commandeArticles.length; i++) {
      if (commande.isValid == "oui") {
        await updateQteTherique(commandeArticles[i], "plus");
      }
      const deleteItem = await CommandeArticle.findOneAndDelete({
        _id: commandeArticles[i].id,
      });

      //const deleteHisto = await HistoriqueArticleVente.find({idArticle:commandeArticles[i].article,nomClient:client.id})
      // for(let item of deleteHisto)
      // {
      //     await HistoriqueArticleVente.deleteMany({})
      // }

      if (client != undefined) {
        const deleteHisto = await HistoriqueArticleVente.find({
          idArticle: commandeArticles[i].article,
          nomClient: client.id,
          totalHT: commandeArticles[i].totalHT,
        });

        if (deleteHisto.length > 0) {
          await HistoriqueArticleVente.deleteOne({
            idArticle: commandeArticles[i].id,
            nomClient: client.id,
            totalHT: commandeArticles[i].totalHT,
          });
        }
      }
    }

    var societeRacine = await getSocieteRacine(commande.societe);
    var hist = new Historique({
      idUtilisateur: req.user.user.id,
      idDocument: commande.id,
      date: new Date(),
      message: req.user.user.email + " supprime " + commande.numero,
      societeRacine: societeRacine,
    });
    await hist.save();

    if (await Commande.findOneAndDelete({ _id: req.params.id })) {
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
 * /commandes/listCommandes:
 *   post:
 *     summary: Returns the list of all the commandes
 *     tags: [Commandes]
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
 *         description: The list of the commandes
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

router.post("/listCommandes", verifytoken, async (req, res) => {
  console.log(req.body);
  try {
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
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: {
          bonLivraison: {
            $convert: {
              input: "$transfertBonLivraison",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonLivraison"] }],
              },
            },
          },
        ],
        as: "bonlivraisons",
      },
    });

    pipeline.push({
      $lookup: {
        from: "devis",
        let: { commande: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$transfertCommande", "$$commande"] }],
              },
            },
          },
        ],
        as: "devis",
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
      $set: {
        bonLivraison: { $arrayElemAt: ["$bonlivraisons.numero", 0] },
        devis: { $arrayElemAt: ["$devis.numero", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        totalRemise: { $toString: "$totalRemise" },
        totalHT: { $toString: "$totalHT" },
        totalTVA: { $toString: "$totalTVA" },
        tFiscale: { $toString: "$timbreFiscale" },
        totalTTC: { $toString: "$totalTTC" },
        totalGain: { $toString: "$totalGain" },

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
        date: 1,
        numero: 1,
        bonLivraison: 1,
        isTransfert: 1,
        devis: 1,
        transfertBonLivraison: 1,
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

    const articles = await Commande.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Commande.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }

    const result = { docs: articles, pages: pages };

    return res.send({ status: true, resultat: result, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /commandes/getById/{id}:
 *   get:
 *     summary: Remove the commande by id
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The commande id
 *
 *     responses:
 *       200:
 *         description: The commande was deleted
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
 *         description: The commande was not found
 *       500:
 *         description: Some error happened
 */
router.get("/getById/:id", verifytoken, async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    var commande = await Commande.findOne({ _id: req.params.id });

    var documentDeTransfert = await Devis.findOne({
      transfertCommande: req.params.id,
    });

    const commandeArticles = await CommandeArticle.find({
      commande: req.params.id,
    });

    return res.send({
      status: true,
      resultat: commande,
      articles: commandeArticles,
      documentDeTransfert: documentDeTransfert,
    });
  } catch (e) {
    consolelog(e) 
    
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

    var bonLivraison = await Commande.findOne({ _id: req.params.id })
      .populate("client")
      .populate("transporteur");

    const bonLivraisonArticles = await CommandeArticle.find({
      commande: req.params.id,
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
 * /commandes/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [Commandes]
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
router.post("/getAllParametres", verifytoken, async (req, res) => {
  try {
    console.log(req.body);

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));

    var societe = ObjectId(req.body.societe);
    var exercice = req.body.exercice;
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice);

    const articles = await getArticlesWithQuantitesfilterBySearch(
      societe,
      societeRacine,
      { enVente: "oui" }
    );

    const clients = await Client.find({ societeRacine: societeRacine });
    const uniteMesures = await UniteMesure.find({
      societeRacine: societeRacine,
    });

    const frais = await Frais.find({
      societeRacine: societeRacine,
    });

    return res.send({
      allFrais: frais,
      status: true,
      uniteMesures: uniteMesures,
      articles: articles,
      clients: clients,
      numeroAutomatique: numeroAutomatique.numero,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getDevis/:idSociete/:idClient", verifytoken, async (req, res) => {
  try {
    console.log("getDevis");

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

    var documents = await Devis.find({
      societe: ObjectId(req.params.idSociete),
      client: ObjectId(req.params.idClient),
      isTransfert: "non",
    });

    const client = await Client.findById(req.params.idClient);

    var prixSpecifiqueLignes = await PrixSpecifiqueLigne.find({
      client: req.params.idClient,
      isEnable: true,
    });
    var prixSpecifiqueLigneTypeTiers = [];
    if (client.typeTiers) {
      prixSpecifiqueLigneTypeTiers = await PrixSpecifiqueLigneTypeTier.find({
        typeTier: client.typeTiers,
        isEnable: true,
      });
    }

    return res.send({
      status: true,
      documents: documents,
      idClient: req.params.idClient,
      prixSpecifiqueLignes: prixSpecifiqueLignes,
      prixSpecifiqueLigneTypeTiers: prixSpecifiqueLigneTypeTiers,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/journalCommandesByClient", verifytoken, async (req, res) => {
  console.log(req.body);
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.magasin);
    var client = req.body.client;

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
        client: ObjectId(client),
      },
    });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: {
          bonLivraison: {
            $convert: {
              input: "$transfertBonLivraison",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonLivraison"] }],
              },
            },
          },
        ],
        as: "bonlivraisons",
      },
    });

    pipeline.push({
      $lookup: {
        from: "devis",
        let: { commande: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$transfertCommande", "$$commande"] }],
              },
            },
          },
        ],
        as: "devis",
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
      $set: {
        bonLivraison: { $arrayElemAt: ["$bonlivraisons.numero", 0] },
        devis: { $arrayElemAt: ["$devis.numero", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        totalRemise: { $toString: "$totalRemise" },
        totalHT: { $toString: "$totalHT" },
        totalTVA: { $toString: "$totalTVA" },
        tFiscale: { $toString: "$timbreFiscale" },
        totalTTC: { $toString: "$totalTTC" },
        totalGain: { $toString: "$totalGain" },

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
        date: 1,
        numero: 1,
        bonLivraison: 1,
        isTransfert: 1,
        devis: 1,
        transfertBonLivraison: 1,
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

    const articles = await Commande.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Commande.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }

    const result = { docs: articles, pages: pages };

    return res.send({ status: true, resultat: result, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});
router.post("/journalCommandes", verifytoken, async (req, res) => {
  console.log(req.body);
  try {
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

    if (ObjectId.isValid(req.body.client)) {
      pipeline.push({
        $match: {
          date: { $lte: dateEnd, $gte: dateStart },
          societe: ObjectId(req.body.magasin),
          client: ObjectId(req.body.client),
        },
      });
    } else {
      pipeline.push({
        $match: {
          date: { $lte: dateEnd, $gte: dateStart },
          societe: ObjectId(req.body.magasin),
        },
      });
    }
    pipeline.push({
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: {
          bonLivraison: {
            $convert: {
              input: "$transfertBonLivraison",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonLivraison"] }],
              },
            },
          },
        ],
        as: "bonlivraisons",
      },
    });

    pipeline.push({
      $lookup: {
        from: "devis",
        let: { commande: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$transfertCommande", "$$commande"] }],
              },
            },
          },
        ],
        as: "devis",
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
      $set: {
        bonLivraison: { $arrayElemAt: ["$bonlivraisons.numero", 0] },
        devis: { $arrayElemAt: ["$devis.numero", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        totalRemise: { $toString: "$totalRemise" },
        totalHT: { $toString: "$totalHT" },
        totalTVA: { $toString: "$totalTVA" },
        tFiscale: { $toString: "$timbreFiscale" },
        totalTTC: { $toString: "$totalTTC" },
        totalGain: { $toString: "$totalGain" },

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
        date: 1,
        numero: 1,
        bonLivraison: 1,
        isTransfert: 1,
        devis: 1,
        transfertBonLivraison: 1,
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

    const articles = await Commande.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Commande.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }

    const result = { docs: articles, pages: pages };

    return res.send({ status: true, resultat: result, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getDevis/:idSociete/:idClient",
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

      var documents = await Devis.find({
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
module.exports.routerCommande = router;
