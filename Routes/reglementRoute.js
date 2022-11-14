  const {
  Reglement,
  getReglementsByDocuments,
  getNumeroAutomatique,
  deleteLiltrageOfReglementBonLivraison,
  setLiltrageReglementBonLivraison,
  deleteLiltrageOfReglementBonRetourClient,
  setLiltrageReglementBonRetourClient,
  deleteLiltrageOfReglementBonAchat,
  setLiltrageReglementBonAchat,
  deleteLiltrageOfReglementBonRetourFournisseur,
  setLiltrageReglementBonRetourFournisseur,
  calculerSoldeClient,
} = require("../Models/reglementModel");
const { FactureAchat } = require("../Models/factureAchatModel");

const {
  Utilisateur,
  validateVerifierAccee,
} = require("../Models/utilisateurModel");

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var multer = require("multer");
const fs = require("fs");

var dateFormat = require("dateformat");
const { User, validateDownloadData } = require("../Models/userModel");
const { Client } = require("../Models/clientModel");
const { Fournisseur } = require("../Models/fournisseurModel");
const { ModeReglement } = require("../Models/modeReglementModel");
var ObjectId = require("mongodb").ObjectID;

const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");
const { BonRetourFournisseur } = require("../Models/bonRetourFournisseurModel");
const { BonRetourClient } = require("../Models/bonRetourClientModel");
const { BonLivraison } = require("../Models/bonLivraisonModel");
const { Liltrage } = require("../Models/liltrageModel");
const { BonAchat } = require("../Models/bonAchatModel");
const { BonReception } = require("../Models/bonReceptionModel");
const { BonLivraisonArticle } = require("../Models/bonLivraisonArticleModel");
const { SituationReglement } = require("../Models/situationReglementModel");
const { BonReceptionArticle } = require("../Models/bonReceptionArticleModel");
const { CorrectionStock } = require("../Models/correctionStockModel");
const { BonCasse } = require("../Models/bonCasseModel");
const { isValidObjectId } = require("mongoose");
const { SessionCaisse } = require("../Models/sessionCaisseModel");
const { consolelog, consolelog2 } = require("../Models/errorModel");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

var upload = multer({ storage: storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     reglement:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         client:
 *           type: string
 *         modeReglement:
 *           type: string
 *         tresorerie:
 *           type: string
 *         montant:
 *           type: number
 *         dateReglement:
 *           type: date
 *         numCheque:
 *           type: number
 *         dateEcheance:
 *           type: date
 *         notes:
 *           type: string
 *
 */

/**
 * @swagger
 * tags:
 *   name: Reglements
 *   description: The Reglements managing API
 */

/**
 * @swagger
 * paths:
 *   /reglements/upload:
 *     post:
 *       summary: upload image
 *       tags: [Reglements]
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
    const files = req.files;
    let arr = [];
    files.forEach((element) => {
      arr.push(element.path);
    });
    return res.send(arr);
  }
);

/**
 * @swagger
 * /reglements/newReglement:
 *   post:
 *     summary: Returns the list of all the Reglements
 *     tags: [Reglements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                client:
 *                  type: string
 *                fournisseur:
 *                  type: string
 *                modeReglement:
 *                  type: string
 *                tresorerie:
 *                  type: string
 *                montant:
 *                  type: number
 *                dateReglement:
 *                  type: date
 *                numCheque:
 *                  type: number
 *                dateEcheance:
 *                  type: date
 *                notes:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the reglements
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
 *                    client:
 *                      type: string
 *                    fournisseur:
 *                      type: string
 *                    modeReglement:
 *                      type: string
 *                    tresorerie:
 *                      type: string
 *                    montant:
 *                      type: number
 *                    dateReglement:
 *                      type: date
 *                    numCheque:
 *                      type: number
 *                    dateEcheance:
 *                      type: date
 *                    notes:
 *                      type: string
 *
 */

async function updateSoldeClient(idClient, solde) {
  var client = await Client.findByIdAndUpdate(idClient, { credit: solde });
}

router.post("/newReglement", verifytoken, async (req, res) => {
  try {
    //const {error}=validateReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    var numeroAutomatique = await getNumeroAutomatique(
      ObjectId(req.body.societe),
      req.body.typeReglement,
      req.body.exercice
    );

    req.body.numero = numeroAutomatique.numero;
    req.body.num = numeroAutomatique.num;

    // if (!ObjectId.isValid(req.body.sessionCaisse)) {
    //   req.body.sessionCaisse = null
    // }

    if (!ObjectId.isValid(req.body.sessionCaisse)) {
      req.body.sessionCaisse = null;
    } else {
      const session = await SessionCaisse.findById(req.body.sessionCaisse);
      if (!session || (session && session.cloture === "oui")) {
        req.body.sessionCaisse = null;
      }
    }

    var totalLiltrage = 0;
    for (let i = 0; i < req.body.bonLivraisons.length; i++) {
      totalLiltrage += req.body.bonLivraisons[i].montantAPayer;
    }

    req.body.reste = req.body.montant - totalLiltrage;
    const reglement = new Reglement(req.body);
    const result = await reglement.save();

    if (req.body.typeReglement == "bonLivraison") {
      const client = await Client.findById(req.body.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: req.body.client },
        { credit: Number(client.credit) + Number(req.body.montant) }
      );
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonLivraison(
          req.body.bonLivraisons,
          result.id
        );
      }
      await updateSoldeClient(
        client.id,
        Number(client.credit + req.body.montant)
      );
    } else if (req.body.typeReglement == "bonRetourClient") {
      const client = await Client.findById(req.body.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: req.body.client },
        { credit: Number(client.credit) - Number(req.body.montant) }
      );
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonRetourClient(
          req.body.bonLivraisons,
          result.id
        );
      }
      await updateSoldeClient(
        client.id,
        Number(client.credit - req.body.montant)
      );
    } else if (req.body.typeReglement == "bonAchat") {
      const fournisseur = await Fournisseur.findById(req.body.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: req.body.client },
        { credit: Number(fournisseur.credit) + Number(req.body.montant) }
      );
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonAchat(req.body.bonLivraisons, result.id);
      }
    } else {
      const fournisseur = await Fournisseur.findById(req.body.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: req.body.client },
        { credit: Number(fournisseur.credit) - Number(req.body.montant) }
      );
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonRetourFournisseur(
          req.body.bonLivraisons,
          result.id
        );
      }
    }

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
 * /reglements/modifierReglement/{id}:
 *   post:
 *     summary: Update the reglement by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglement id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                client:
 *                  type: string
 *                modeReglement:
 *                  type: string
 *                tresorerie:
 *                  type: string
 *                montant:
 *                  type: number
 *                dateReglement:
 *                  type: date
 *                numCheque:
 *                  type: number
 *                dateEcheance:
 *                  type: date
 *                notes:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the reglements
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
 *                     client:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     tresorerie:
 *                       type: string
 *                     montant:
 *                       type: number
 *                     dateReglement:
 *                       type: date
 *                     numCheque:
 *                       type: number
 *                     dateEcheance:
 *                       type: date
 *                     notes:
 *                       type: string
 *
 *
 */

router.post("/modifierReglement/:id", verifytoken, async (req, res) => {
  try {
    // const {error}=validateReglement(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    const reglement = await Reglement.findById(req.params.id);

    var d1 = new Date();
    var d2 = new Date(reglement.dateReglement);

    if (!isSameDay(d1, d2)) {
      var isAutorisee = await validateVerifierAccee(
        req.user.user.id,
        "modifierReglementBloquant"
      );
      if (!isAutorisee) {
        return res.send({ status: false, message: 1 });
      }
    }

    if (!reglement) return res.status(401).send({ status: false });

    var totalLiltrage = 0;
    for (let i = 0; i < req.body.bonLivraisons.length; i++) {
      totalLiltrage += req.body.bonLivraisons[i].montantAPayer;
    }

    req.body.reste = req.body.montant - totalLiltrage;

    const result = await Reglement.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );

    if (req.body.typeReglement == "bonLivraison") {
      const client = await Client.findById(req.body.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: req.body.client },
        {
          credit:
            Number(client.credit) -
            Number(reglement.montant) +
            Number(req.body.montant),
        }
      );
      await deleteLiltrageOfReglementBonLivraison(req.params.id);
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonLivraison(
          req.body.bonLivraisons,
          req.params.id
        );
      }

      await updateSoldeClient(
        client.id,
        Number(client.credit + req.body.montant)
      );
      var oldClient = await Client.findById(reglement.client);
      await updateSoldeClient(
        oldClient.id,
        Number(oldClient.credit - reglement.montant)
      );
    } else if (req.body.typeReglement == "bonRetourClient") {
      const client = await Client.findById(req.body.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: req.body.client },
        {
          credit:
            Number(client.credit) +
            Number(reglement.montant) -
            Number(req.body.montant),
        }
      );
      await deleteLiltrageOfReglementBonRetourClient(req.params.id);
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonRetourClient(
          req.body.bonLivraisons,
          req.params.id
        );
      }

      await updateSoldeClient(
        client.id,
        Number(client.credit - req.body.montant)
      );
      var oldClient = await Client.findById(reglement.client);
      await updateSoldeClient(
        oldClient.id,
        Number(oldClient.credit + reglement.montant)
      );
    } else if (req.body.typeReglement == "bonAchat") {
      const fournisseur = await Fournisseur.findById(req.body.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: req.body.client },
        {
          credit:
            Number(fournisseur.credit) -
            Number(reglement.montant) +
            Number(req.body.montant),
        }
      );
      await deleteLiltrageOfReglementBonAchat(req.params.id);
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonAchat(
          req.body.bonLivraisons,
          req.params.id
        );
      }
    } else if (req.body.typeReglement == "bonRetourFournisseur") {
      const fournisseur = await Fournisseur.findById(req.body.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: req.body.client },
        {
          credit:
            Number(fournisseur.credit) +
            Number(reglement.montant) -
            Number(req.body.montant),
        }
      );
      await deleteLiltrageOfReglementBonRetourFournisseur(req.params.id);
      if (req.body.bonLivraisons.length > 0) {
        await setLiltrageReglementBonRetourFournisseur(
          req.body.bonLivraisons,
          req.params.id
        );
      }
    }

    const reglement2 = await Reglement.findById(req.params.id);

    return res.send({ status: true, resultat: reglement2 });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /reglements/deleteReglement/{id}:
 *   post:
 *     summary: Remove the reglement by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglement id
 *
 *     responses:
 *       200:
 *         description: The reglement was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The reglement was not found
 *       500:
 *         description: Some error happened
 */

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth()
  );
}

router.post("/deleteReglement/:id", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const reglement = await Reglement.findById(req.params.id);

    var d1 = new Date();
    var d2 = new Date(reglement.dateReglement);

    if (!isSameDay(d1, d2)) {
      var isAutorisee = await validateVerifierAccee(
        req.user.user.id,
        "supprimerReglementBloquant"
      );
      if (!isAutorisee) {
        return res.send({ status: false, message: 2 });
      }
    }

    if (!reglement) return res.status(401).send({ status: false });

    if (reglement.typeReglement == "bonLivraison") {
      const client = await Client.findById(reglement.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: client.id },
        { credit: Number(client.credit) - Number(reglement.montant) }
      );
      await deleteLiltrageOfReglementBonLivraison(req.params.id);
    } else if (reglement.typeReglement == "bonRetourClient") {
      const client = await Client.findById(reglement.client);
      if (!client) return res.status(401).send({ status: false });
      const result2 = await Client.findOneAndUpdate(
        { _id: client.id },
        { credit: Number(client.credit) + Number(reglement.montant) }
      );
      await deleteLiltrageOfReglementBonRetourClient(req.params.id);
    } else if (reglement.typeReglement == "bonAchat") {
      const fournisseur = await Fournisseur.findById(reglement.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: fournisseur.id },
        { credit: Number(fournisseur.credit) - Number(reglement.montant) }
      );
      await deleteLiltrageOfReglementBonAchat(req.params.id);
    } else {
      const fournisseur = await Fournisseur.findById(reglement.client);
      if (!fournisseur) return res.status(401).send({ status: false });
      const result2 = await Fournisseur.findOneAndUpdate(
        { _id: fournisseur.id },
        { credit: Number(fournisseur.credit) + Number(reglement.montant) }
      );
      await deleteLiltrageOfReglementBonRetourFournisseur(req.params.id);
    }

    if (await Reglement.findOneAndDelete({ _id: req.params.id })) {
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

router.post("/deleteLiltrageOfReglement/:id", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    if (req.body.typeReglement == "bonLivraison") {
      await deleteLiltrageOfReglementBonLivraison(req.params.id);
    } else if (req.body.typeReglement == "bonRetourClient") {
      await deleteLiltrageOfReglementBonRetourClient(req.params.id);
    } else if (req.body.typeReglement == "bonAchat") {
      await deleteLiltrageOfReglementBonAchat(req.params.id);
    } else {
      await deleteLiltrageOfReglementBonRetourFournisseur(req.params.id);
    }

    var result = await Reglement.findById(req.params.id);

    const result2 = await Reglement.findOneAndUpdate(
      { _id: req.params.id },
      { reste: result.montant }
    );

    result = await Reglement.findById(req.params.id);

    return res.send({ status: true, result: result });
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
 * /reglements/listReglements:
 *   post:
 *     summary: Returns the list of all the reglements
 *     tags: [Reglements]
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
 *         description: The list of the reglements
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
 *                            client:
 *                              type: string
 *                            ordre:
 *                              type: number
 *                            valeurRetiree:
 *                              type: number
 *                            tierNecessaire:
 *                              type: string
 *                            plan:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */
router.post("/listReglementsClient", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    dateStart.setHours(0, 0, 0, 0);

    var dateEnd = new Date(req.body.dateEnd);
    dateEnd.setHours(23, 59, 59, 999);

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
        dateReglement: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        typeReglement: req.body.typeReglement,
      },
    });

    pipeline.push({
      $lookup: {
        from: "modereglements",
        let: { modeReglement: "$modeReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
              },
            },
          },
        ],
        as: "modereglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "sessioncaisses",
        let: { sessionCaisse: "$sessionCaisse" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$sessionCaisse"] }],
              },
            },
          },
        ],
        as: "sessioncaisses",
      },
    });

    pipeline.push({
      $lookup: {
        from: "situationReglements",
        let: { situationReglement: "$situationReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$situationReglement"] }],
              },
            },
          },
        ],
        as: "situationReglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "clients",
        let: {
          client: {
            $convert: {
              input: "$client",
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
        sessionCaisse: { $arrayElemAt: ["$sessioncaisses.numero", 0] },
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        situationReglement: {
          $arrayElemAt: ["$situationReglements.libelle", 0],
        },

        montant: { $toString: "$montant" },
        numCheque: { $toString: "$numCheque" },
        reste: { $toString: "$reste" },

        dateReglement: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$dateReglement",
          },
        },

        dateEcheance: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$dateEcheance",
          },
        },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        client: 1,
        modeReglement: 1,
        tresorerie: 1,
        montant: 1,
        dateReglement: 1,
        numCheque: 1,
        dateEcheance: 1,
        situationReglement: 1,
        notes: 1,
        reste: 1,
        numero: 1,
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
      $set:{
        reste: { $toDouble: "$reste" },
        montant: { $toDouble: "$montant"},
      }
    })

    pipeline.push({
      $sort: sort,
    });

    var skip = Number(req.body.page - 1) * Number(req.body.limit);

    pipeline.push({ $limit: skip + Number(req.body.limit) });

    pipeline.push({ $skip: skip });

    const articles = await Reglement.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Reglement.aggregate(sommePipeline);

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

router.post("/listReglementsFournisseur", verifytoken, async (req, res) => {
  try {
      var dateStart = new Date(req.body.dateStart);
      dateStart.setHours(0, 0, 0, 0);
  
      var dateEnd = new Date(req.body.dateEnd);
      dateEnd.setHours(23, 59, 59, 999);
  
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
          dateReglement: { $lte: dateEnd, $gte: dateStart },
          societe: societe,
          typeReglement: req.body.typeReglement,
        },
      });

      pipeline.push({
        $lookup: {
          from: "sessioncaisses",
          let: { sessionCaisse: "$sessionCaisse" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$sessionCaisse"] }],
                },
              },
            },
          ],
          as: "sessioncaisses",
        },
      });
  
      pipeline.push({
        $lookup: {
          from: "modereglements",
          let: { modeReglement: "$modeReglement" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                },
              },
            },
          ],
          as: "modereglements",
        },
      });
  
      pipeline.push({
        $lookup: {
          from: "situationReglements",
          let: { situationReglement: "$situationReglement" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$situationReglement"] }],
                },
              },
            },
          ],
          as: "situationReglements",
        },
      });
  
      pipeline.push({
        $lookup: {
          from: "fournisseurs",
          let: {
            client: {
              $convert: {
                input: "$client",
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
          sessionCaisse: { $arrayElemAt: ["$sessioncaisses.numero", 0] },
          fournisseur: { $arrayElemAt: ["$clients.raisonSociale", 0] },
          modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
          situationReglement: {
            $arrayElemAt: ["$situationReglements.libelle", 0],
          },
  
          montant: { $toString: "$montant" },
          numCheque: { $toString: "$numCheque" },
          reste: { $toString: "$reste" },
  
          dateReglement: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$dateReglement",
            },
          },
  
          dateEcheance: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$dateEcheance",
            },
          },
          id: "$_id",
        },
      });
  
      pipeline.push({
        $project: {
          id: 1,
          fournisseur: 1,
          modeReglement: 1,
          tresorerie: 1,
          montant: 1,
          dateReglement: 1,
          numCheque: 1,
          dateEcheance: 1,
          situationReglement: 1,
          notes: 1,
          reste: 1,
          numero: 1,
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
  
      const articles = await Reglement.aggregate(pipeline);
  
      sommePipeline.push({
        $count: "total",
      });
  
      var nbrTotal = await Reglement.aggregate(sommePipeline);
  
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
 * /reglements/listEcheances:
 *   post:
 *     summary: Returns the list of all the reglements
 *     tags: [Reglements]
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
 *         description: The list of the reglements
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
 *                            client:
 *                              type: string
 *                            ordre:
 *                              type: number
 *                            valeurRetiree:
 *                              type: number
 *                            tierNecessaire:
 *                              type: string
 *                            plan:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */
router.post("/listEcheances", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { createdAt: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        numCheque: { $ne: "" },
        dateEcheance: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        typeReglement: req.body.typeReglement,
      },
    });

    pipeline.push({
      $lookup: {
        from: "modereglements",
        let: { modeReglement: "$modeReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
              },
            },
          },
        ],
        as: "modereglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "situationReglements",
        let: { situationReglement: "$situationReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$situationReglement"] }],
              },
            },
          },
        ],
        as: "situationReglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "clients",
        let: { client: { $toObjectId: "$client" } },
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
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        situationReglement: {
          $arrayElemAt: ["$situationReglements.libelle", 0],
        },

        montant: { $toString: "$montant" },
        numCheque: { $toString: "$numCheque" },
        reste: { $toString: "$reste" },

        dateReglement: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$dateReglement",
          },
        },

        dateEcheance: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$dateEcheance",
          },
        },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        client: 1,
        modeReglement: 1,
        tresorerie: 1,
        montant: 1,
        dateReglement: 1,
        situationReglement: 1,
        numCheque: 1,
        dateEcheance: 1,
        notes: 1,
        reste: 1,
        numero: 1,
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

    const articles = await Reglement.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Reglement.aggregate(sommePipeline);

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

router.post("/listEcheancesFournisseur", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { createdAt: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        numCheque: { $ne: "" },
        dateEcheance: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        typeReglement: req.body.typeReglement,
      },
    });

    pipeline.push({
      $lookup: {
        from: "modereglements",
        let: { modeReglement: "$modeReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
              },
            },
          },
        ],
        as: "modereglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "situationReglements",
        let: { situationReglement: "$situationReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$situationReglement"] }],
              },
            },
          },
        ],
        as: "situationReglements",
      },
    });

    pipeline.push({
      $lookup: {
        from: "fournisseurs",
        let: { fournisseur: { $toObjectId: "$client" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$fournisseur"] }],
              },
            },
          },
        ],
        as: "fournisseurs",
      },
    });

    pipeline.push({
      $set: {
        fournisseur: { $arrayElemAt: ["$fournisseurs.raisonSociale", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        situationReglement: {
          $arrayElemAt: ["$situationReglements.libelle", 0],
        },

        montant: { $toString: "$montant" },
        numCheque: { $toString: "$numCheque" },
        reste: { $toString: "$reste" },

        dateReglement: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$dateReglement",
          },
        },

        dateEcheance: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$dateEcheance",
          },
        },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        fournisseur: 1,
        modeReglement: 1,
        tresorerie: 1,
        montant: 1,
        situationReglement: 1,
        dateReglement: 1,
        numCheque: 1,
        dateEcheance: 1,
        notes: 1,
        reste: 1,
        numero: 1,
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

    const articles = await Reglement.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Reglement.aggregate(sommePipeline);

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
 * /reglements/getById/{id}:
 *   get:
 *     summary: Remove the reglement by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reglement id
 *
 *     responses:
 *       200:
 *         description: The reglement was deleted
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
 *                     libelle:
 *                       type: string
 *                     ordre:
 *                       type: number
 *                     valeurRetiree:
 *                       type: number
 *                     tierNecessaire:
 *                       type: string
 *                     plan:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The reglement was not found
 *       500:
 *         description: Some error happened
 */
router.get("/getByIdBonLivraison/:id", verifytoken, async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const reglement = await Reglement.findOne({ _id: req.params.id });

    var liltrages = await Liltrage.find({ reglement: req.params.id });

    var bonLivraisons = [];
    for (let i = 0; i < liltrages.length; i++) {
      var bonLivraison = {};
      bonLivraison = await BonLivraison.findById(liltrages[i].document);
      var newBonLivraison = {
        montantAPayer: liltrages[i].montantAPayer,
        montantTotal: bonLivraison.montantTotal,
        isPayee: bonLivraison.isPayee,
        montantPaye: bonLivraison.montantPaye,
        restPayer: bonLivraison.restPayer,
        date: bonLivraison.date,
        numero: bonLivraison.numero,
        id: bonLivraison.id,
      };
      bonLivraisons.push(newBonLivraison);
    }

    const bonLivs = await BonLivraison.find({
      client: reglement.client,
      isPayee: { $ne: "oui" },
    }).sort({ _id: -1 });

    for (let i = 0; i < bonLivs.length; i++) {
      if (liltrages.filter((x) => x.document == bonLivs[i].id).length == 0) {
        var newBonLivraison = {
          montantAPayer: 0,
          montantTotal: bonLivs[i].montantTotal,
          isPayee: bonLivs[i].isPayee,
          montantPaye: bonLivs[i].montantPaye,
          restPayer: bonLivs[i].restPayer,
          date: bonLivs[i].date,
          numero: bonLivs[i].numero,
          id: bonLivs[i].id,
        };
        bonLivraisons.push(newBonLivraison);
      }
    }

    return res.send({
      status: true,
      resultat: reglement,
      bonLivraisons: bonLivraisons,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getByIdBonRetourClient/:id", verifytoken, async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const reglement = await Reglement.findOne({ _id: req.params.id });

    var liltrages = await Liltrage.find({ reglement: req.params.id });

    var bonLivraisons = [];
    for (let i = 0; i < liltrages.length; i++) {
      var bonLivraison = {};
      bonLivraison = await BonRetourClient.findById(liltrages[i].document);
      var newBonLivraison = {
        montantAPayer: liltrages[i].montantAPayer,
        montantTotal: bonLivraison.montantTotal,
        isPayee: bonLivraison.isPayee,
        montantPaye: bonLivraison.montantPaye,
        restPayer: bonLivraison.restPayer,
        date: bonLivraison.date,
        numero: bonLivraison.numero,
        id: bonLivraison.id,
      };
      bonLivraisons.push(newBonLivraison);
    }

    const bonLivs = await BonRetourClient.find({
      client: reglement.client,
      isPayee: { $ne: "oui" },
    }).sort({ _id: -1 });

    for (let i = 0; i < bonLivs.length; i++) {
      if (liltrages.filter((x) => x.document == bonLivs[i].id).length == 0) {
        var newBonLivraison = {
          montantAPayer: 0,
          montantTotal: bonLivs[i].montantTotal,
          isPayee: bonLivs[i].isPayee,
          montantPaye: bonLivs[i].montantPaye,
          restPayer: bonLivs[i].restPayer,
          date: bonLivs[i].date,
          numero: bonLivs[i].numero,
          id: bonLivs[i].id,
        };
        bonLivraisons.push(newBonLivraison);
      }
    }

    return res.send({
      status: true,
      resultat: reglement,
      bonLivraisons: bonLivraisons,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getByIdBonAchat/:id", verifytoken, async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const reglement = await Reglement.findOne({ _id: req.params.id });

    var liltrages = await Liltrage.find({ reglement: req.params.id });

    var bonLivraisons = [];
    for (let i = 0; i < liltrages.length; i++) {
      var bonLivraison = {};
      bonLivraison = await BonReception.findById(liltrages[i].document);
      if (bonLivraison) {
        var newBonLivraison = {
          montantAPayer: liltrages[i].montantAPayer,
          montantTotal: bonLivraison.montantTotal,
          isPayee: bonLivraison.isPayee,
          montantPaye: bonLivraison.montantPaye,
          restPayer: bonLivraison.restPayer,
          date: bonLivraison.date,
          numero: bonLivraison.numero,
          id: bonLivraison.id,
        };
        bonLivraisons.push(newBonLivraison);
      }
    }

    const bonLivs = await BonReception.find({
      fournisseur: reglement.client,
      isPayee: { $ne: "oui" },
    }).sort({ _id: -1 });

    for (let i = 0; i < bonLivs.length; i++) {
      if (liltrages.filter((x) => x.document == bonLivs[i].id).length == 0) {
        var newBonLivraison = {
          montantAPayer: 0,
          montantTotal: bonLivs[i].montantTotal,
          isPayee: bonLivs[i].isPayee,
          montantPaye: bonLivs[i].montantPaye,
          restPayer: bonLivs[i].restPayer,
          date: bonLivs[i].date,
          numero: bonLivs[i].numero,
          id: bonLivs[i].id,
        };
        bonLivraisons.push(newBonLivraison);
      }
    }

    return res.send({
      status: true,
      resultat: reglement,
      bonLivraisons: bonLivraisons,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getByIdBonRetourFournisseur/:id",
  verifytoken,
  async (req, res) => {
    try {
      if (
        req.params.id == undefined ||
        req.params.id == null ||
        req.params.id == ""
      )
        return res.status(400).send({ status: false });

      const reglement = await Reglement.findOne({ _id: req.params.id });

      var liltrages = await Liltrage.find({ reglement: req.params.id });

      var bonLivraisons = [];
      for (let i = 0; i < liltrages.length; i++) {
        var bonLivraison = {};
        bonLivraison = await BonRetourFournisseur.findById(
          liltrages[i].document
        );
        var newBonLivraison = {
          montantAPayer: liltrages[i].montantAPayer,
          montantTotal: bonLivraison.montantTotal,
          isPayee: bonLivraison.isPayee,
          montantPaye: bonLivraison.montantPaye,
          restPayer: bonLivraison.restPayer,
          date: bonLivraison.date,
          numero: bonLivraison.numero,
          id: bonLivraison.id,
        };
        bonLivraisons.push(newBonLivraison);
      }

      const bonLivs = await BonRetourFournisseur.find({
        fournisseur: reglement.client,
        isPayee: { $ne: "oui" },
      }).sort({ _id: -1 });

      for (let i = 0; i < bonLivs.length; i++) {
        if (liltrages.filter((x) => x.document == bonLivs[i].id).length == 0) {
          var newBonLivraison = {
            montantAPayer: 0,
            montantTotal: bonLivs[i].montantTotal,
            isPayee: bonLivs[i].isPayee,
            montantPaye: bonLivs[i].montantPaye,
            restPayer: bonLivs[i].restPayer,
            date: bonLivs[i].date,
            numero: bonLivs[i].numero,
            id: bonLivs[i].id,
          };
          bonLivraisons.push(newBonLivraison);
        }
      }

      return res.send({
        status: true,
        resultat: reglement,
        bonLivraisons: bonLivraisons,
      });
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
 * /reglements/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [Reglements]
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
 *                  clients:
 *                    type: array
 *                  fournisseurs:
 *                    type: array
 *                  modeLivraisons:
 *                    type: array
 *
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getAllParametres/:id", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id));

    var numeroAutomatique = await getNumeroAutomatique(
      ObjectId(req.params.id),
      req.body.typeReglement,
      req.body.exercice
    );

    var clients = [];
    if (
      ["bonLivraison", "bonRetourClient"].includes(req.body.typeReglement) ==
      true
    ) {
      clients = await Client.find({ societeRacine: societeRacine });
    } else {
      clients = await Fournisseur.find({ societeRacine: societeRacine });
    }

    const modeReglements = await ModeReglement.find({
      societeRacine: societeRacine,
    });

    const situationReglements = await SituationReglement.find({
      societeRacine: societeRacine,
    });

    const sessionCaisses = await SessionCaisse.find({
      societe: req.params.id
    }).select('numero id')

    return res.send({
      status: true,
      clients: clients,
      modeReglements: modeReglements,
      numeroAutomatique: numeroAutomatique.numero,
      situationReglements: situationReglements,
      sessionCaisses:sessionCaisses
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
 * /reglements/getByIdClient/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     raisonSociale:
 *                       type: string
 *                     matriculeFiscale:
 *                       type: string
 *                     classement:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     statusProspection:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     paysFacturation:
 *                       type: string
 *                     gouvernoratFacturation:
 *                       type: string
 *                     delegationFacturation:
 *                       type: string
 *                     localiteFacturation:
 *                       type: string
 *                     codePostaleFacturation:
 *                       type: string
 *                     adresseFacturation:
 *                       type: string
 *                     paysLivraison:
 *                       type: string
 *                     gouvernoratLivraison:
 *                       type: string
 *                     delegationLivraison:
 *                       type: string
 *                     localiteLivraison:
 *                       type: string
 *                     codePostaleLivraison:
 *                       type: string
 *                     adresseLivraison:
 *                       type: string
 *                     autresAdresse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           pays:
 *                             type: string
 *                           gouvernorat:
 *                             type: string
 *                           delegation:
 *                             type: string
 *                           localite:
 *                             type: string
 *                           codePostale:
 *                             type: string
 *                           adresse:
 *                             type: string
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           civilite:
 *                             type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           valeur:
 *                             type: string
 *                           imprimable:
 *                             type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdClient/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.id });

    const reglements = await Reglement.find({
      client: req.params.id,
      dateReglement: { $gte: dateStart, $lte: dateEnd },
    }).populate("modeReglement");

    const bonRetours = await BonRetourClient.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    const bonLivs = await BonLivraison.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    var soldeCurrente = 0;

    var tabReleveClients = [];

    for (let item of reglements) {
      if (item.typeReglement == "bonLivraison") {
        soldeCurrente -= item.montant;
        tabReleveClients.push({
          client: client.raisonSociale,
          type: "Reglement.BL",
          dateOperation: item.dateReglement,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: 0,
          credit: item.montant,
          solde: 0,
        });
      } else {
        soldeCurrente += item.montant;
        tabReleveClients.push({
          client: client.raisonSociale,
          type: "Reglement.BR",
          dateOperation: item.dateReglement,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: 0,
          credit: -1 * item.montant,
          solde: 0,
        });
      }
    }

    for (let item of bonRetours) {
      soldeCurrente -= item.montantTotal;
      tabReleveClients.push({
        client: client.raisonSociale,
        type: "Bon Retour",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: item.montantTotal,
        solde: 0,
      });
    }

    for (let item of bonLivs) {
      soldeCurrente += item.montantTotal;
      tabReleveClients.push({
        client: client.raisonSociale,
        type: "Bon Livraison",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: item.montantTotal,
        credit: 0,
        solde: 0,
      });
    }

    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);

    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });

    const bonRetoursBefore = await BonRetourClient.find({
      client: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    const bonLivsBefore = await BonLivraison.find({
      client: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    var soldeBefore = 0;

    for (let item of reglementsBefore) {
      if (item.typeReglement == "bonLivraison") {
        soldeBefore -= item.montant;
      } else {
        soldeBefore += item.montant;
      }
    }

    for (let item of bonRetoursBefore) {
      soldeBefore -= item.montantTotal;
    }

    for (let item of bonLivsBefore) {
      soldeBefore += item.montantTotal;
    }

    for (let i = 0; i < tabReleveClients.length; i++) {
      for (let j = i; j < tabReleveClients.length; j++) {
        if (
          tabReleveClients[i].dateOperation < tabReleveClients[j].dateOperation
        ) {
          var aux = tabReleveClients[i];
          tabReleveClients[i] = tabReleveClients[j];
          tabReleveClients[j] = aux;
        }
      }
    }

    if (tabReleveClients.length == 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveClients[i].solde =
          soldeBefore - tabReleveClients[i].debit + tabReleveClients[i].credit;
      }
    } else if (tabReleveClients.length > 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveClients[i].solde =
          soldeBefore - tabReleveClients[i].debit + tabReleveClients[i].credit;
      }
      for (let i = 1; i < tabReleveClients.length; i++) {
        tabReleveClients[i].solde =
          tabReleveClients[i - 1].solde -
          tabReleveClients[i].debit +
          tabReleveClients[i].credit;
      }
    }
    return res.send({
      status: true,
      tabReleveClients: tabReleveClients,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdClientF/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    console.log(req.body)

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.id });

    const bonLivs = await BonLivraison.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    var soldeCurrente = 0;
    listGlobal = [];
    for (let item of bonLivs) {
      // soldeCurrente -= item.montantTotal
      listGlobal.push({
        client: client.raisonSociale,
        type: "Vente",
        dateOperation: item.date,
        dateEcheance: "",
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: item.montantTotal,
        credit: 0,
        solde: 0,
      });

      //chercher pour une BL LES reglements
      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        //soldeCurrente += itemLiltrage.montantAPayer
        listGlobal.push({
          client: client.raisonSociale,
          type: "R.Vente",
          dateOperation: reglement.dateReglement,
          dateEcheance: reglement.dateEcheance,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: 0,
          credit: itemLiltrage.montantAPayer,
          solde: 0,
        });
      }

      //chercher pour une BL LES BON Retours
      var bonRetours = await BonRetourClient.find({
        client: req.params.id,
        transfertBonLivraison: item.id,
      });

      for (let itemR of bonRetours) {
        //soldeCurrente += item.montantTotal
        listGlobal.push({
          client: client.raisonSociale,
          type: "Retour",
          dateOperation: itemR.date,
          dateEcheance: "",
          numero: itemR.numero,
          modeReglement: "",
          numCheque: "",
          numBonLivraison: item.numero,
          debit: -1 * itemR.montantTotal,
          credit: 0,
          solde: 0,
        });

        let liltrages = await Liltrage.find({ document: itemR.id });
        for (let itemLiltrage of liltrages) {
          let reglement = await Reglement.findOne({
            _id: itemLiltrage.reglement,
          }).populate("modeReglement");
          //soldeCurrente -= itemLiltrage.montantAPayer
          listGlobal.push({
            client: client.raisonSociale,
            type: "R.Retour",
            dateOperation: reglement.dateReglement,
            dateEcheance: reglement.dateEcheance,
            numero: reglement.numero,
            modeReglement: reglement.modeReglement.libelle,
            numCheque: reglement.numCheque,
            debit: 0,
            credit: -1 * itemLiltrage.montantAPayer,
            solde: 0,
          });
        }
      }
    }

    var bonRetours2 = await BonRetourClient.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
      transfertBonLivraison: "",
    });

    for (let itemR of bonRetours2) {
      //soldeCurrente += item.montantTotal
      var numero = "";
      if (isValidObjectId(itemR.transfertBonLivraison)) {
        const bonL = await BonLivraison.findById(
          ObjectId(itemR.transfertBonLivraison)
        );
        if (bonL) {
          numero = bonL.numero;
        }
      }

      listGlobal.push({
        client: client.raisonSociale,
        type: "Retour",
        dateOperation: itemR.date,
        dateEcheance: "",
        numero: itemR.numero,
        modeReglement: "",
        numCheque: "",
        numBonLivraison: numero,
        debit: -1 * itemR.montantTotal,
        credit: 0,
        solde: 0,
      });

      let liltrages2 = await Liltrage.find({ document: itemR.id });
      for (let itemLiltrage of liltrages2) {
        let reglement2 = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        //soldeCurrente -= itemLiltrage.montantAPayer
        listGlobal.push({
          client: client.raisonSociale,
          type: "R.Retour",
          dateOperation: reglement2.dateReglement,
          dateEcheance: reglement2.dateEcheance,
          numero: reglement2.numero,
          modeReglement: reglement2.modeReglement.libelle,
          numCheque: reglement2.numCheque,
          debit: 0,
          credit: -1 * itemLiltrage.montantAPayer,
          solde: 0,
        });
      }
    }

    const reglementsRestant = await Reglement.find({
      client: req.params.id,
      dateReglement: { $gte: dateStart, $lte: dateEnd },
      reste: { $ne: 0 },
    }).populate("modeReglement");

    for (let reglement of reglementsRestant) {
      if (reglement.typeReglement == "bonLivraison") {
        listGlobal.push({
          client: client.raisonSociale,
          type: "Reste.R.V",
          dateOperation: reglement.dateReglement,
          dateEcheance: reglement.dateEcheance,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: 0,
          credit: reglement.reste,
          solde: 0,
        });
      } else {
        listGlobal.push({
          client: client.raisonSociale,
          type: "Reste.R.R.V",
          dateOperation: reglement.dateReglement,
          dateEcheance: reglement.dateEcheance,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: 0,
          credit: -1 * reglement.reste,
          solde: 0,
        });
      }
    }

    //pour calculer solde avant la recherche
    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);

    var soldeBefore = await calculerSoldeClient(
      null,
      dayBeforeDateStart,
      req.params.id
    );

    console.log(soldeBefore);

    soldeCurrente = await calculerSoldeClient(
      dateStart,
      dateEnd,
      req.params.id
    );

    //pour calculer solde de releve client
    if (listGlobal.length == 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore + listGlobal[i].debit - listGlobal[i].credit;
      }
    } else if (listGlobal.length > 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore + listGlobal[i].debit - listGlobal[i].credit;
      }
      for (let i = 1; i < listGlobal.length; i++) {
        listGlobal[i].solde =
          listGlobal[i - 1].solde + listGlobal[i].debit - listGlobal[i].credit;
      }
    }

    for (let i = 0; i < listGlobal.length; i++) {
      listGlobal[i].soldeDebit = 0;
      listGlobal[i].soldeCredit = 0;
      if (listGlobal[i].solde > 0) {
        listGlobal[i].soldeDebit = Math.abs(listGlobal[i].solde);
      } else {
        listGlobal[i].soldeCredit = Math.abs(listGlobal[i].solde);
      }
    }

    try {
      var soldeBefore2 =
        soldeBefore -
        (listGlobal[listGlobal.length - 1].solde - soldeBefore - soldeCurrente);
      var soldeCurrente2 =
        listGlobal[listGlobal.length - 1].solde - soldeBefore;
      return res.send({
        status: true,
        listGlobal: listGlobal,
        request: req.body,
        soldeCurrente: soldeCurrente2,
        soldeBefore: soldeBefore2,
      });
    } catch (e) {
      consolelog(e) 
    
      return res.send({
        status: true,
        listGlobal: listGlobal,
        request: req.body,
        soldeCurrente: soldeCurrente,
        soldeBefore: soldeBefore,
      });
    }
  } catch (e) {
    consolelog(e) 
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdClientF2/:id", verifytoken, async (req, res) => {
  try {

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if(req.params.id === null || !isValidObjectId(req.params.id)){
      return res.send({ status: false })
    }

    var pipeline = []

    pipeline.push({ $match: { _id: ObjectId(req.params.id) } })

    var pipelinePeriode = []

    pipelinePeriode.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, client: ObjectId(req.params.id)} })
    pipelinePeriode.push({
      $set:{
        client:"$raisonSociale",
        type: "Fac-Vente",
        dateOperation: "$date",
        dateEcheance: "",
        numero: "$numero",
        modeReglement: "",
        numCheque: "",
        debit: "$montantTotal",
        credit: 0,
        solde: 0,
      }
    })

    pipelinePeriode.push(
      {
        $lookup: {
          from: "bonlivraisons",
          let: { factureVente: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$factureVente", "$$factureVente"] }],
                },
              },
            },
            {
              $set:{
                type: "Retour",
                dateOperation: "$date",
                dateEcheance: "",
                numero: "$numero",
                modeReglement: "",
                numCheque: "",
                debit: { $multiply:[ -1 ,"$montantTotal"]},
                credit: 0,
                solde: 0,
              }
            },
            {
              $lookup: {
                from: 'liltrages',
                let: { "bonlivraison": { "$toString":"$_id"} },
                pipeline: [{
                  $match:
                  {
                    $expr: {
                      "$and": [
                        { "$eq": ["$document", "$$bonlivraison"] },
                      ]
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'reglements',
                    let: { "reglementId":{
                      $convert:
                         {
                            input: "$reglement",
                            to: "objectId",
                            onError: null,
                            onNull: null 
                         }
                   } },
                    pipeline: [{
                      $match:
                      {
                        $expr: {
                          "$and": [
                            { "$eq": ["$_id", "$$reglementId"] },
                          ]
                        }
                      }
                    },
                    {
                      $lookup: {
                        from: "modereglements",
                        let: { modeReglement: "$modeReglement" },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                              },
                            },
                          },
                        ],
                        as: "modereglements",
                      },
                    },
                    {
                      "$set":{
                        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                        modereglements: ""
                      }
                    }
                    ],
                    as: "reglements"
                  }
                },
                {
                  "$set":{
                    dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
                    dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
                    numero: { $arrayElemAt: ["$reglements.numero", 0] },
                    modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
                    type: "R.Facture",
                    debit: 0,
                    credit: "$montantAPayer",
                    reglements: "",
                    solde: 0
                  }
                }
                ],
                as: "liltrages"
              }
            },
  
          ],
          as: "bonLivraisons",
        },
      }
    )
    var pipelineBL = []

    pipelineBL.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, client: ObjectId(req.params.id), factureVente:null } })
   
    pipelineBL.push({
      $set:{
        client:"$$raisonSociale",
        type: "Vente",
        dateOperation: "$date",
        dateEcheance: "",
        numero: "$numero",
        modeReglement: "",
        numCheque: "",
        debit: "$montantTotal",
        credit: 0,
        solde: 0,
      }
    })

    pipelineBL.push({
      $lookup: {
        from: 'liltrages',
        let: { "bonlivraison": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$document", "$$bonlivraison"] },
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'reglements',
            let: { "reglementId":{
              $convert:
                 {
                    input: "$reglement",
                    to: "objectId",
                    onError: null,
                    onNull: null 
                 }
           } },
            pipeline: [{
              $match:
              {
                $expr: {
                  "$and": [
                    { "$eq": ["$_id", "$$reglementId"] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "modereglements",
                let: { modeReglement: "$modeReglement" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                      },
                    },
                  },
                ],
                as: "modereglements",
              },
            },
            {
              "$set":{
                modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                modereglements: ""
              }
            }
            ],
            as: "reglements"
          }
        },
        {
          "$set":{
            dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
            dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
            numero: { $arrayElemAt: ["$reglements.numero", 0] },
            modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
            type: "R.Vente",
            debit: 0,
            credit: "$montantAPayer",
            reglements: "",
            solde: 0
          }
        }
        ],
        as: "liltrages"
      }
    })

    pipelineBL.push({
      $lookup: {
        from: "bonretourclients",
        let: { bonLivraison: {"$toString":"$_id"} },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$transfertBonLivraison", "$$bonLivraison"] }],
              },
            },
          },

          {
            $set:{
              type: "Retour",
              dateOperation: "$date",
              dateEcheance: "",
              numero: "$numero",
              modeReglement: "",
              numCheque: "",
              debit: { $multiply:[ -1 ,"$montantTotal"]},
              credit: 0,
              solde: 0,
            }
          },
          {
            $lookup: {
              from: 'liltrages',
              let: { "bonlivraison": { "$toString":"$_id"} },
              pipeline: [{
                $match:
                {
                  $expr: {
                    "$and": [
                      { "$eq": ["$document", "$$bonlivraison"] },
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: 'reglements',
                  let: { "reglementId":{
                    $convert:
                       {
                          input: "$reglement",
                          to: "objectId",
                          onError: null,
                          onNull: null 
                       }
                 } },
                  pipeline: [{
                    $match:
                    {
                      $expr: {
                        "$and": [
                          { "$eq": ["$_id", "$$reglementId"] },
                        ]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "modereglements",
                      let: { modeReglement: "$modeReglement" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                            },
                          },
                        },
                      ],
                      as: "modereglements",
                    },
                  },
                  {
                    "$set":{
                      modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                      modereglements: ""
                    }
                  }
                  ],
                  as: "reglements"
                }
              },
              {
                "$set":{
                  dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
                  dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
                  numero: { $arrayElemAt: ["$reglements.numero", 0] },
                  modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
                  type: "R.Retour",
                  debit: 0,
                  credit: {$multiply: [-1, "$montantAPayer"]},
                  reglements: "",
                  solde: 0
                }
              }
              ],
              as: "liltrages"
            }
          },

        ],
        as: "bonretourclients",
      },
    })

    pipelinePeriode.push({
      $unionWith: { coll: "bonlivraisons", pipeline: pipelineBL },
    });

    var pipelineBR = []

    pipelineBR.push({ $match: { date: { $lte: dateEnd, $gte: dateStart }, client: ObjectId(req.params.id)} })
  
    pipelineBR.push({
      $lookup: {
        from: 'liltrages',
        let: { "bonlivraison": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$document", "$$bonlivraison"] },
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'reglements',
            let: { "reglementId":{
              $convert:
                 {
                    input: "$reglement",
                    to: "objectId",
                    onError: null,
                    onNull: null 
                 }
           } },
            pipeline: [{
              $match:
              {
                $expr: {
                  "$and": [
                    { "$eq": ["$_id", "$$reglementId"] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "modereglements",
                let: { modeReglement: "$modeReglement" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                      },
                    },
                  },
                ],
                as: "modereglements",
              },
            },
            {
              "$set":{
                modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                modereglements: ""
              }
            }
            ],
            as: "reglements"
          }
        },
        {
          "$set":{
            dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
            dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
            numero: { $arrayElemAt: ["$reglements.numero", 0] },
            modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
            type: "R.Retour",
            debit: 0,
            credit: {$multiply: [-1, "$montantAPayer"]},
            reglements: "",
            solde: 0
          }
        }
        ],
        as: "liltrages"
      }
    })

    pipelineBR.push(
      {
        $set:{
          type: "Retour",
          dateOperation: "$date",
          dateEcheance: "",
          numero: "$numero",
          modeReglement: "",
          numCheque: "",
          debit: { $multiply:[ -1 ,"$montantTotal"]},
          credit: 0,
          solde: 0,
        }
      },
    )

    pipelinePeriode.push({
      $unionWith: { coll: "bonretourclients", pipeline: pipelineBR },
    });

    //liltrage reglement bon livraison
    
    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lte: dateEnd, $gte: dateStart }, client: req.params.id, typeReglement: "bonLivraison" } })
    
    pipelineReg.push({
      $lookup: {
        from: 'liltrages',
        let: { "reglement": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$reglement", "$$reglement"] },
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'reglements',
            let: { "reglementId":{
              $convert:
                 {
                    input: "$reglement",
                    to: "objectId",
                    onError: null,
                    onNull: null 
                 }
           } },
            pipeline: [{
              $match:
              {
                $expr: {
                  "$and": [
                    { "$eq": ["$_id", "$$reglementId"] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "modereglements",
                let: { modeReglement: "$modeReglement" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                      },
                    },
                  },
                ],
                as: "modereglements",
              },
            },
            {
              "$set":{
                modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                modereglements: ""
              }
            }
            ],
            as: "reglements"
          }
        },
        {
          "$set":{
            dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
            dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
            numero: { $arrayElemAt: ["$reglements.numero", 0] },
            modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
            type: "R.Facture",
            debit: 0,
            credit: "$montantAPayer",
            reglements: "",
            solde: 0
          }
        }
        ],
        as: "liltrages"
      }
    })

    pipelineReg.push({
      $unwind:
        {
          path: "$liltrages",
        }
    })

    pipelineReg.push({
      $set:{
        dateOperation: "$liltrages.dateOperation",
        dateEcheance: "$liltrages.dateEcheance",
        numero: "$liltrages.numero",
        modeReglement: "$liltrages.modeReglement",
        type: "R.L.Vente",
        debit: 0,
        credit: "$liltrages.montantAPayer",
        reglements: "",
        solde: 0,
        _id:"$liltrages._id"
      }
    })

    pipelineReg.push({
      $project:{
        liltrages:0
      }
    })

    pipelinePeriode.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    //liltrage reglement bon retour client

    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lte: dateEnd, $gte: dateStart }, client: req.params.id, typeReglement: "bonRetourClient" } })
    
    pipelineReg.push({
      $lookup: {
        from: 'liltrages',
        let: { "reglement": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$reglement", "$$reglement"] },
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'reglements',
            let: { "reglementId":{
              $convert:
                 {
                    input: "$reglement",
                    to: "objectId",
                    onError: null,
                    onNull: null 
                 }
           } },
            pipeline: [{
              $match:
              {
                $expr: {
                  "$and": [
                    { "$eq": ["$_id", "$$reglementId"] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "modereglements",
                let: { modeReglement: "$modeReglement" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                      },
                    },
                  },
                ],
                as: "modereglements",
              },
            },
            {
              "$set":{
                modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
                modereglements: ""
              }
            }
            ],
            as: "reglements"
          }
        },
        {
          "$set":{
            dateOperation: { $arrayElemAt: ["$reglements.dateReglement", 0] },
            dateEcheance: { $arrayElemAt: ["$reglements.dateEcheance", 0] },
            numero: { $arrayElemAt: ["$reglements.numero", 0] },
            modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
            type: "R.Facture",
            debit: 0,
            credit: "$montantAPayer",
            reglements: "",
            solde: 0
          }
        }
        ],
        as: "liltrages"
      }
    })
    
    pipelineReg.push({
      $unwind:
        {
          path: "$liltrages",
        }
    })

    pipelineReg.push({
      $set:{
        dateOperation: "$liltrages.dateReglement",
        dateEcheance: "$liltrages.dateEcheance",
        numero: "$liltrages.numero",
        modeReglement: "$liltrages.modeReglement",
        type: "R.L.Retour",
        debit: 0,
        credit:  {$multiply: [-1, "$liltrages.montantAPayer"]},
        solde: 0,
        _id:"$liltrages._id"
      }
    })
   
    pipelineReg.push({
      $project:{
        liltrages:0
      }
    })

    pipelinePeriode.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    // reste reglements
    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lte: dateEnd, $gte: dateStart }, client: req.params.id, reste:{$ne:0}, typeReglement: "bonLivraison" } })

    pipelineReg.push({
      $lookup: {
        from: "modereglements",
        let: { modeReglement: "$modeReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
              },
            },
          },
        ],
        as: "modereglements",
      },
    })
    
    pipelineReg.push({
      "$set":{
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        modereglements: "",
        type: "Reste.R.V",
        dateOperation: "$dateReglement",
        dateEcheance: "$dateEcheance",
        numero: "$numero",
        numCheque: "$numCheque",
        debit: 0,
        credit: "$reste",
        solde: 0,
      }
    })

    pipelinePeriode.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lte: dateEnd, $gte: dateStart }, client: req.params.id, reste:{$ne:0}, typeReglement: "bonRetourClient" } })

    pipelineReg.push({
      $lookup: {
        from: "modereglements",
        let: { modeReglement: "$modeReglement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$modeReglement"] }],
              },
            },
          },
        ],
        as: "modereglements",
      },
    })
    
    pipelineReg.push({
      "$set":{
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        modereglements: "",
        type: "Reste.R.R.V",
        dateOperation: "$dateReglement",
        dateEcheance: "$dateEcheance",
        numero: "$numero",
        numCheque: "$numCheque",
        debit: 0,
        credit: { $multiply:[-1,"$reste"]},
        solde: 0,
      }
    })

    pipelinePeriode.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    var pipelineEnsient = []
    pipelineEnsient.push({ $match: { date: { $lt: dateStart}, client: ObjectId(req.params.id) } })
    
    pipelineEnsient.push({
      $set:{
        debit: "$montantTotal",
        credit: 0,
        solde: 0,
      }
    })

    pipelineBL = []

    pipelineBL.push({ $match: { date: { $lt: dateStart}, client: ObjectId(req.params.id), factureVente:null } })
    
    pipelineBL.push({
      $set:{
        debit: "$montantTotal",
        credit: 0,
        solde: 0,
      }
    })

    pipelineEnsient.push({
      $unionWith: { coll: "bonlivraisons", pipeline: pipelineBL },
    });

    //documents bon retour client
    var pipelineBR = []

    pipelineBR.push({ $match: { date: { $lt: dateStart }, client: ObjectId(req.params.id) } })
  
    pipelineBR.push(
      {
        $set:{
          debit: { $multiply:[ -1 ,"$montantTotal"]},
          credit: 0,
          solde: 0,
        }
      },
    )

    pipelineEnsient.push({
      $unionWith: { coll: "bonretourclients", pipeline: pipelineBR },
    });

    //liltrage reglement bon livraison
    
    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lt: dateStart }, client: req.params.id, typeReglement: "bonLivraison" } })
    
    pipelineReg.push({
      $lookup: {
        from: 'liltrages',
        let: { "reglement": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$reglement", "$$reglement"] },
              ]
            }
          }
        }
        ],
        as: "liltrages"
      }
    })
    
    pipelineReg.push({
      $unwind:
        {
          path: "$liltrages",
        }
    })

    pipelineReg.push({
      $set:{
        debit: 0,
        credit: "$liltrages.montantAPayer",
        reglements: "",
        solde: 0,
        _id:"$liltrages._id"
      }
    })
    
    pipelineEnsient.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    //liltrage reglement bon retour client

    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lt: dateStart }, client: req.params.id, typeReglement: "bonRetourClient" } })
    
    pipelineReg.push({
      $lookup: {
        from: 'liltrages',
        let: { "reglement": { "$toString":"$_id"} },
        pipeline: [{
          $match:
          {
            $expr: {
              "$and": [
                { "$eq": ["$reglement", "$$reglement"] },
              ]
            }
          }
        }
        ],
        as: "liltrages"
      }
    })
    
    pipelineReg.push({
      $unwind:
        {
          path: "$liltrages",
        }
    })

    pipelineReg.push({
      $set:{
        debit: 0,
        credit:  {$multiply: [-1, "$liltrages.montantAPayer"]},
        solde: 0,
        _id:"$liltrages._id"
      }
    })
    
    pipelineEnsient.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    //reste reglement bon livraison
    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lt: dateStart }, client: req.params.id, reste:{$ne:0}, typeReglement: "bonLivraison" } })
    
    pipelineReg.push({
      "$set":{
        debit: 0,
        credit: "$reste",
        solde: 0,
      }
    })

    pipelineEnsient.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    //reste reglement bon retour client
    
    var pipelineReg = []
    pipelineReg.push({ $match: { dateReglement: { $lt: dateStart}, client: req.params.id, reste:{$ne:0}, typeReglement: "bonRetourClient" } })

    pipelineReg.push({
      "$set":{
        debit: 0,
        credit: { $multiply:[-1,"$reste"]},
        solde: 0,
      }
    })

    pipelineEnsient.push({
      $unionWith: { coll: "reglements", pipeline: pipelineReg },
    });

    pipeline.push(
      {
        $lookup: {
          from: "factureventes",
          let: { client: "$_id", raisonSociale:"$raisonSociale" },
          pipeline: pipelinePeriode,
          as: "soldeperiode",
        },
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "factureventes",
          let: { client: "$_id", raisonSociale:"$raisonSociale" },
          pipeline: pipelineEnsient,
          as: "soldeencient",
        },
      }
    )

    var fichiers = await Client.aggregate(pipeline)
    
    var newFichiers = JSON.parse(JSON.stringify(fichiers)) 
    
    var listRelevePeriode = []
    var soldePeriode = 0
    var listReleveEncient = []
    var soldeEncient = 0

    var keys = {
      _id:"",
      client:"",
      type: "",
      dateOperation: "",
      dateEcheance: "",
      numero: "",
      modeReglement: "",
      numCheque: "",
      numBonLivraison: "",
      debit: "",
      credit: "",
      solde: "",
    }

    for(let client of newFichiers){
      soldeEncient += (client.soldeInitialDebit - client.soldeInitialCredit)

      for(let itemSoldeperiode of client.soldeperiode){
        if(listRelevePeriode.filter( x => x._id === itemSoldeperiode._id).length === 0){
          item = {}
          for(let key in keys){
            item[key] = itemSoldeperiode[key] 
          }

          if(itemSoldeperiode.bonLivraisons){
            item.bonLivraisons = itemSoldeperiode.bonLivraisons
          }
        
          item.client = client.raisonSociale
          listRelevePeriode.push(item)
        
          if(itemSoldeperiode.bonLivraisons){
            for(let bonL of itemSoldeperiode.bonLivraisons){
              if(bonL.liltrages){
                for(let liltrage of bonL.liltrages){
                  if(listRelevePeriode.filter( x => x._id === liltrage._id).length === 0){
                    item2 = {}
                    for(let key in keys){
                      item2[key] = liltrage[key] 
                    }
                    item2.client = client.raisonSociale
                    listRelevePeriode.push(item2)
                  }
                }
              }
            }
          }
        }
      
        if(itemSoldeperiode.liltrages){
          for(let liltrage of itemSoldeperiode.liltrages){
            if(listRelevePeriode.filter( x => x._id === liltrage._id).length === 0){
              item = {}
              for(let key in keys){
                item[key] = liltrage[key] 
              }
              item.client = client.raisonSociale
              listRelevePeriode.push(item)
            }
          }
        }

        if(itemSoldeperiode.bonretourclients){
          for(let bonRetourClient of itemSoldeperiode.bonretourclients){
            if(listRelevePeriode.filter( x => x._id === bonRetourClient._id).length === 0){
              item = {}
              for(let key in keys){
                item[key] = bonRetourClient[key] 
              }
              item.client = client.raisonSociale
              listRelevePeriode.push(item)
            }
           
            for(let liltrage of bonRetourClient.liltrages){
              if(listRelevePeriode.filter( x => x._id === liltrage._id).length === 0){
                item = {}
                for(let key in keys){
                  item[key] = liltrage[key] 
                }
                item.client = client.raisonSociale
                listRelevePeriode.push(item)
              }
            }
          }
        }
      
      }

      for(let itemSoldeencient of client.soldeencient){
        if(listRelevePeriode.filter( x => x._id === itemSoldeencient._id).length === 0){
          var itemE = {}
          for(let key in keys){
            itemE[key] = itemSoldeencient[key] 
          }
          
          soldeEncient += (itemE.debit - itemE.credit)
          listReleveEncient.push(itemE)
        }
      }

    }

    //soldePeriode = soldeEncient
    for(let item of listRelevePeriode){
      soldePeriode += (item.debit - item.credit)
      item.soldeDebit = 0;
      item.soldeCredit = 0;
      if (soldePeriode > 0) {
        item.soldeDebit = Math.abs(soldePeriode);
      } else {
        item.soldeCredit = Math.abs(soldePeriode);
      }
    }

    return res.send({
      status: true,
      listGlobal: listRelevePeriode,
      request: req.body,
      soldeCurrente: soldePeriode,
      soldeBefore: soldeEncient,
    });

  } catch (e) {
    consolelog(e) 
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});




router.post("/getDMS/:idArticle", verifytoken, async (req, res) => {
  try {
    const societe = ObjectId(req.body.societe);

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (!ObjectId.isValid(req.params.idArticle))
      return res.status(400).send({ status: false });

    var pipelineCorrectionStock = [];

    pipelineCorrectionStock.push({
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipelineCorrectionStock.push({
      $project: {
        date: 1,
        ligneCorrectionStocks: {
          $filter: {
            input: "$ligneCorrectionStocks",
            as: "item",
            cond: { $eq: ["$$item.article", ObjectId(req.params.idArticle)] },
          },
        },
      },
    });

    pipelineCorrectionStock.push({
      $project: {
        date: 1,
        id: { $arrayElemAt: ["$ligneCorrectionStocks._id", 0] },
        designation: {
          $arrayElemAt: ["$ligneCorrectionStocks.designation", 0],
        },
        quantiteVente: { $sum: "$ligneCorrectionStocks.qteDifference" },
        article: { $arrayElemAt: ["$ligneCorrectionStocks.article", 0] },
      },
    });

    pipelineCorrectionStock.push({
      $set: {
        quantiteVente: { $multiply: ["$quantiteVente", -1] },
      },
    });

    var pipelineBonCasse = [];

    pipelineBonCasse.push({
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipelineBonCasse.push({
      $lookup: {
        from: "boncassearticles",
        let: { article: ObjectId(req.params.idArticle), bonCasse: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$article", "$article"] },
                  { $eq: ["$$bonCasse", "$bonCasse"] },
                ],
              },
            },
          },
        ],
        as: "boncassearticles",
      },
    });

    pipelineBonCasse.push({
      $project: {
        date: 1,
        id: "$boncassearticles._id",
        designation: "$boncassearticles.designation",
        quantiteVente: { $sum: "$boncassearticles.quantiteVente" },
        article: "$boncassearticles.article",
      },
    });

    var pipeline = [];

    pipeline.push({
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipeline.push({
      $lookup: {
        from: "bonlivraisonarticles",
        let: { article: ObjectId(req.params.idArticle), bonLivraison: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$article", "$article"] },
                  { $eq: ["$$bonLivraison", "$bonLivraison"] },
                ],
              },
            },
          },
        ],
        as: "bonlivraisonarticles",
      },
    });

    pipeline.push({
      $project: {
        date: 1,
        id: "$bonlivraisonarticles._id",
        designation: "$bonlivraisonarticles.designation",
        quantiteVente: { $sum: "$bonlivraisonarticles.quantiteVente" },
        article: "$bonlivraisonarticles.article",
      },
    });

    pipeline.push({
      $unionWith: { coll: "boncasses", pipeline: pipelineBonCasse },
    });

    pipeline.push({
      $unionWith: {
        coll: "correctionstocks",
        pipeline: pipelineCorrectionStock,
      },
    });

    pipeline.push({
      $sort: { date: 1 },
    });

    pipeline.push({ $match: { quantiteVente: { $ne: 0 } } });

    const bonLivraisons1 = await BonLivraison.aggregate(pipeline);

    var bonLivraisons = JSON.parse(JSON.stringify(bonLivraisons1));

    pipeline = [];

    pipeline.push({
      $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    });

    pipeline.push({
      $lookup: {
        from: "bonreceptionarticles",
        let: { article: ObjectId(req.params.idArticle), bonReception: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$article", "$article"] },
                  { $eq: ["$$bonReception", "$bonReception"] },
                ],
              },
            },
          },
        ],
        as: "bonreceptionarticles",
      },
    });

    pipeline.push({
      $project: {
        date: 1,
        id: "$bonreceptionarticles._id",
        designation: "$bonreceptionarticles.designation",
        quantiteAchat: { $sum: "$bonreceptionarticles.quantiteAchat" },
        article: "$bonreceptionarticles.article",
      },
    });

    pipeline.push({
      $sort: { date: 1 },
    });

    const bonReceptions = await BonReception.aggregate(pipeline);

    pipeline = [];

    pipeline.push({ $match: { date: { $lt: dateStart }, societe: societe } });

    pipeline.push({
      $lookup: {
        from: "bonreceptionarticles",
        let: { article: ObjectId(req.params.idArticle), bonReception: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$article", "$article"] },
                  { $eq: ["$$bonReception", "$bonReception"] },
                ],
              },
            },
          },
        ],
        as: "bonreceptionarticles",
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        id: "$bonreceptionarticles._id",
        designation: "$bonreceptionarticles.designation",
        quantiteAchat: { $sum: "$bonreceptionarticles.quantiteAchat" },
        article: "$bonreceptionarticles.article",
      },
    });

    pipeline.push({
      $sort: { date: -1 },
    });

    pipeline.push({ $limit: 1 });

    const bonReceptionsEncien = await BonReception.aggregate(pipeline);

    for (let i = 0; i < bonLivraisons.length - 1; i++) {
      for (let j = i + 1; j < bonLivraisons.length; j++) {
        if (bonLivraisons[i].date > bonLivraisons[j].date) {
          var aux = bonLivraisons[i];
          bonLivraisons[i] = bonLivraisons[j];
          bonLivraisons[j] = aux;
        }
      }
    }

    var newBonReceptions = [];

    bonReceptionsEncien.forEach((e) => {
      newBonReceptions.push(JSON.parse(JSON.stringify(e)));
    });

    bonReceptions.forEach((e) => {
      newBonReceptions.push(JSON.parse(JSON.stringify(e)));
    });

    if (newBonReceptions.length === 0 || bonLivraisons.length === 0) {
      return res.send({ status: true, listGlobal: [], request: req.body });
    }

    var qteStock = 0;
    var posBonReception = -1;

    var listDMS = [];

    for (let i = 0; i < bonLivraisons.length; i++) {
      var item = {
        date: bonLivraisons[i].date,
        qteEntree: 0,
        qteSortie: 0,
        dms: 0,
        qteStock: 0,
        dmsGlobale: 0,
        h: 0,
      };

      while (
        qteStock < bonLivraisons[i].quantiteVente &&
        posBonReception < newBonReceptions.length
      ) {
        posBonReception++;
        if (newBonReceptions[posBonReception]) {
          qteStock += newBonReceptions[posBonReception].quantiteAchat;
          item.qteEntree += newBonReceptions[posBonReception].quantiteAchat;
        }
      }

      item.qteSortie = bonLivraisons[i].quantiteVente;
      qteStock -= item.qteSortie;
      item.qteStock = qteStock;

      var sommeDMS = 0;
      var quantiteVente = bonLivraisons[i].quantiteVente;
      for (let j = 0; j < newBonReceptions.length; j++) {
        if (newBonReceptions[j].quantiteAchat != 0 && quantiteVente != 0) {
          if (newBonReceptions[j].quantiteAchat > quantiteVente) {
            newBonReceptions[j].quantiteAchat -= quantiteVente;
            var date1 = new Date(newBonReceptions[j].date);
            var date2 = new Date(bonLivraisons[i].date);
            var Time = date2.getTime() - date1.getTime();
            var days = Time / (1000 * 3600 * 24);
            sommeDMS += days * quantiteVente;
            quantiteVente = 0;
          } else {
            quantiteVente -= newBonReceptions[j].quantiteAchat;
            var date1 = new Date(newBonReceptions[j].date);
            var date2 = new Date(bonLivraisons[i].date);
            var Time = date2.getTime() - date1.getTime();
            var days = Time / (1000 * 3600 * 24);
            sommeDMS += days * newBonReceptions[j].quantiteAchat;
            newBonReceptions[j].quantiteAchat = 0;
          }
        }
      }

      if (bonLivraisons[i].quantiteVente != 0) {
        item.dms = sommeDMS / bonLivraisons[i].quantiteVente;
      }

      item.dmsGlobale = bonLivraisons[i].quantiteVente * item.dms;

      listDMS.push(item);
    }

    var sommeBL = 0;
    var sommeDMSGlobal = 0;
    var diviseDMSGlobalBL = 0;

    listDMS.forEach((x) => {
      sommeBL += x.qteSortie;
      sommeDMSGlobal += x.dmsGlobale;
    });

    diviseDMSGlobalBL = sommeDMSGlobal / sommeBL;

    listDMS.forEach((x) => {
      x.h = x.dms - diviseDMSGlobalBL;
    });

    return res.send({
      status: true,
      listGlobal: listDMS,
      request: req.body,
      bonReceptionsEncien: bonReceptionsEncien,
      bonReceptions: bonReceptions,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdClientDLM/:idClient", verifytoken, async (req, res) => {
  try {
    const societe = ObjectId(req.body.societe);

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (!ObjectId.isValid(req.params.idClient))
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.idClient });

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { createdAt: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        date: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        client: ObjectId(req.params.idClient),
      },
    });

    pipeline.push({
      $lookup: {
        from: "liltrages",
        let: { document: { $toString: "$_id" }, dateDocument: "$date" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$document", "$$document"] }],
              },

              montantAPayer: { $ne: 0 },
            },
          },
          {
            $lookup: {
              from: "reglements",
              let: {
                reglement: {
                  $convert: {
                    input: "$reglement",
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
                      $and: [{ $eq: ["$_id", "$$reglement"] }],
                    },
                  },
                },

                {
                  $lookup: {
                    from: "modereglements",
                    let: { modeReglement: "$modeReglement" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                          },
                        },
                      },
                    ],
                    as: "modereglements",
                  },
                },

                {
                  $set: {
                    modeReglement: {
                      $arrayElemAt: ["$modereglements.libelle", 0],
                    },
                  },
                },
                {
                  $project: {
                    id: 1,
                    modeReglement: 1,
                    tresorerie: 1,
                    montant: 1,
                    dateReglement: 1,
                    numCheque: 1,
                    dateEcheance: 1,
                    situationReglement: 1,
                    notes: 1,
                    reste: 1,
                    numero: 1,
                  },
                },
              ],
              as: "reglements",
            },
          },
          {
            $set: {
              numeroReglement: { $arrayElemAt: ["$reglements.numero", 0] },
              dateReglement: { $arrayElemAt: ["$reglements.dateReglement", 0] },
              modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
              dateDocument: "$$dateDocument",
              id: "$_id",
            },
          },
          {
            $project: {
              numeroReglement: 1,
              dateReglement: 1,
              modeReglement: 1,
              montantAPayer: 1,
              dateDocument: 1,
              nbj: {
                $dateDiff: {
                  startDate: "$dateDocument",
                  endDate: "$dateReglement",
                  unit: "day",
                },
              },
              montantNbj: {
                $multiply: [
                  {
                    $dateDiff: {
                      startDate: "$dateDocument",
                      endDate: "$dateReglement",
                      unit: "day",
                    },
                  },
                  "$montantAPayer",
                ],
              },
              id: 1,
              _id: 0,
            },
          },
        ],
        as: "liltrages",
      },
    });

    pipeline.push({
      $set: {
        nbj: { $sum: "$liltrages.nbj" },
        aaa: { $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"] },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        aaa: 1,
        nbj: 1,
        date: 1,
        numero: 1,
        montantTotal: 1,
        restPayer: 1,
        liltrages: 1,
        montantAfterMultiply: { $multiply: ["$aaa", "$montantTotal"] },
      },
    });

    const articles = await BonLivraison.aggregate(pipeline);

    return res.send({ status: true, listGlobal: articles, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdClientDMC/:idClient", verifytoken, async (req, res) => {
  try {
    const societe = ObjectId(req.body.societe);

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (!ObjectId.isValid(req.params.idClient))
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.idClient });

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { createdAt: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        date: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        client: ObjectId(req.params.idClient),
      },
    });

    pipeline.push({
      $lookup: {
        from: "liltrages",
        let: { document: { $toString: "$_id" }, dateDocument: "$date" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$document", "$$document"] }],
              },

              montantAPayer: { $ne: 0 },
            },
          },
          {
            $lookup: {
              from: "reglements",
              let: {
                reglement: {
                  $convert: {
                    input: "$reglement",
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
                      $and: [{ $eq: ["$_id", "$$reglement"] }],
                    },
                  },
                },

                {
                  $lookup: {
                    from: "modereglements",
                    let: { modeReglement: "$modeReglement" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                          },
                        },
                      },
                    ],
                    as: "modereglements",
                  },
                },

                {
                  $set: {
                    modeReglement: {
                      $arrayElemAt: ["$modereglements.libelle", 0],
                    },
                  },
                },
                {
                  $project: {
                    id: 1,
                    modeReglement: 1,
                    tresorerie: 1,
                    montant: 1,
                    dateReglement: 1,
                    numCheque: 1,
                    dateEcheance: 1,
                    situationReglement: 1,
                    notes: 1,
                    reste: 1,
                    numero: 1,
                  },
                },
              ],
              as: "reglements",
            },
          },
          {
            $set: {
              numeroReglement: { $arrayElemAt: ["$reglements.numero", 0] },
              dateReglement: { $arrayElemAt: ["$reglements.dateReglement", 0] },
              modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
              dateDocument: "$$dateDocument",
              id: "$_id",
            },
          },
          {
            $set: {
              nbj: {
                $dateDiff: {
                  startDate: "$dateDocument",
                  endDate: "$dateReglement",
                  unit: "day",
                },
              },
            },
          },

          {
            $set: {
              nbj: {
                $cond: { if: { $gte: ["$nbj", 0] }, then: "$nbj", else: 0 },
              },
            },
          },

          {
            $project: {
              numeroReglement: 1,
              dateReglement: 1,
              modeReglement: 1,
              montantAPayer: 1,
              dateDocument: 1,
              nbj: 1,
              montantNbj: { $multiply: ["$nbj", "$montantAPayer"] },
              id: 1,
              _id: 0,
            },
          },
        ],
        as: "liltrages",
      },
    });

    pipeline.push({
      $set: {
        aaa: { $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"] },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        aaa: 1,
        date: 1,
        numero: 1,
        montantTotal: 1,
        restPayer: 1,
        liltrages: 1,
        montantAfterMultiply: { $multiply: ["$aaa", "$montantTotal"] },
      },
    });

    const articles = await BonLivraison.aggregate(pipeline);

    return res.send({ status: true, listGlobal: articles, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdClientDLC/:idClient", verifytoken, async (req, res) => {
  try {
    // await Reglement.findByIdAndUpdate("6304e97b28805d40bc8898e1", {dateReglement: new Date("2021-11-01")})
    //
    // const reglements2 = await Reglement.find({client:"6304e1b328805d40bc889719"})
    // console.log(reglements2)

    const societe = ObjectId(req.body.societe);

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (!ObjectId.isValid(req.params.idClient))
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.idClient });

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { createdAt: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        date: { $lte: dateEnd, $gte: dateStart },
        societe: societe,
        client: ObjectId(req.params.idClient),
      },
    });

    pipeline.push({
      $lookup: {
        from: "liltrages",
        let: { document: { $toString: "$_id" }, dateDocument: "$date" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$document", "$$document"] }],
              },

              montantAPayer: { $ne: 0 },
            },
          },
          {
            $lookup: {
              from: "reglements",
              let: {
                reglement: {
                  $convert: {
                    input: "$reglement",
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
                      $and: [{ $eq: ["$_id", "$$reglement"] }],
                    },
                  },
                },

                {
                  $lookup: {
                    from: "modereglements",
                    let: { modeReglement: "$modeReglement" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                          },
                        },
                      },
                    ],
                    as: "modereglements",
                  },
                },

                {
                  $set: {
                    modeReglement: {
                      $arrayElemAt: ["$modereglements.libelle", 0],
                    },
                  },
                },
                {
                  $project: {
                    id: 1,
                    modeReglement: 1,
                    tresorerie: 1,
                    montant: 1,
                    dateReglement: 1,
                    numCheque: 1,
                    dateEcheance: 1,
                    situationReglement: 1,
                    notes: 1,
                    reste: 1,
                    numero: 1,
                  },
                },
              ],
              as: "reglements",
            },
          },
          {
            $set: {
              numeroReglement: { $arrayElemAt: ["$reglements.numero", 0] },
              dateReglement: { $arrayElemAt: ["$reglements.dateReglement", 0] },
              modeReglement: { $arrayElemAt: ["$reglements.modeReglement", 0] },
              dateDocument: "$$dateDocument",
              id: "$_id",
            },
          },
          {
            $project: {
              numeroReglement: 1,
              dateReglement: 1,
              modeReglement: 1,
              montantAPayer: 1,
              dateDocument: 1,
              nbj: {
                $dateDiff: {
                  startDate: "$dateDocument",
                  endDate: "$dateReglement",
                  unit: "day",
                },
              },
              montantNbj: {
                $multiply: [
                  {
                    $dateDiff: {
                      startDate: "$dateDocument",
                      endDate: "$dateReglement",
                      unit: "day",
                    },
                  },
                  "$montantAPayer",
                ],
              },
              id: 1,
              _id: 0,
            },
          },
        ],
        as: "liltrages",
      },
    });

    pipeline.push({
      $set: {
        nbj: { $sum: "$liltrages.nbj" },
        aaa: { $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"] },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        aaa: 1,
        nbj: 1,
        date: 1,
        numero: 1,
        montantTotal: 1,
        restPayer: 1,
        liltrages: 1,
        montantAfterMultiply: { $multiply: ["$aaa", "$montantTotal"] },
      },
    });

    const articles = await BonLivraison.aggregate(pipeline);

    var articles2 = JSON.parse(JSON.stringify(articles));

    if (articles2.length > 0) {
      for (let i = 0; i < reglements.length; i++) {
        let modeReglement = "";
        if (reglements[i].modeReglement) {
          let modeReglement = reglements[i].modeReglement.libelle;
        }

        let date_1 = new Date(reglements[i].dateReglement);
        let date_2 = new Date(articles2[articles2.length - 1].date);

        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));

        let item = {
          dateReglement: reglements[i].dateReglement,
          id: reglements[i].id + "e",
          modeReglement: modeReglement,
          montantAPayer: reglements[i].reste,
          montantNbj: TotalDays * reglements[i].reste,
          nbj: TotalDays,
          numeroReglement: reglements[i].numero,
        };
        articles2[articles2.length - 1].liltrages.push(item);
      }

      let somme = 0;
      let sommeNbj = 0;
      for (
        let i = 0;
        i < articles2[articles2.length - 1].liltrages.length;
        i++
      ) {
        somme += articles2[articles2.length - 1].liltrages[i].montantNbj;
        sommeNbj += articles2[articles2.length - 1].liltrages[i].nbj;
      }

      articles2[articles2.length - 1].aaa =
        somme / articles2[articles2.length - 1].montantTotal;
      articles2[articles2.length - 1].montantAfterMultiply =
        articles2[articles2.length - 1].aaa *
        articles2[articles2.length - 1].montantTotal;
      articles2[articles2.length - 1].nbj = sommeNbj;
    }

    return res.send({ status: true, listGlobal: articles2, request: req.body });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post(
  "/getByIdFournisseurDMF/:idFournisseur",
  verifytoken,
  async (req, res) => {
    try {
      const societe = ObjectId(req.body.societe);

      var dateStart = new Date();
      var dateEnd = new Date();

      if (req.body.dateStart) {
        dateStart = new Date(req.body.dateStart);
      }

      if (req.body.dateEnd) {
        dateEnd = new Date(req.body.dateEnd);
      }

      if (!ObjectId.isValid(req.params.idFournisseur))
        return res.status(400).send({ status: false });

      const fournisseur = await Fournisseur.findOne({
        _id: req.params.idFournisseur,
      });

      var sort = {};
      for (let key in req.body.orderBy) {
        if (Number(req.body.orderBy[key]) != 0) {
          sort[key] = req.body.orderBy[key];
        }
      }

      if (Object.keys(sort).length == 0) {
        sort = { createdAt: -1 };
      }

      var pipeline = [];

      pipeline.push({
        $match: {
          date: { $lte: dateEnd, $gte: dateStart },
          societe: societe,
          fournisseur: ObjectId(req.params.idFournisseur),
        },
      });

      pipeline.push({
        $lookup: {
          from: "liltrages",
          let: { document: { $toString: "$_id" }, dateDocument: "$date" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$document", "$$document"] }],
                },

                montantAPayer: { $ne: 0 },
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: {
                  reglement: {
                    $convert: {
                      input: "$reglement",
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
                        $and: [{ $eq: ["$_id", "$$reglement"] }],
                      },
                    },
                  },

                  {
                    $lookup: {
                      from: "modereglements",
                      let: { modeReglement: "$modeReglement" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                            },
                          },
                        },
                      ],
                      as: "modereglements",
                    },
                  },

                  {
                    $set: {
                      modeReglement: {
                        $arrayElemAt: ["$modereglements.libelle", 0],
                      },
                    },
                  },
                  {
                    $project: {
                      id: 1,
                      modeReglement: 1,
                      tresorerie: 1,
                      montant: 1,
                      dateReglement: 1,
                      numCheque: 1,
                      dateEcheance: 1,
                      situationReglement: 1,
                      notes: 1,
                      reste: 1,
                      numero: 1,
                    },
                  },
                ],
                as: "reglements",
              },
            },
            {
              $set: {
                numeroReglement: { $arrayElemAt: ["$reglements.numero", 0] },
                dateReglement: {
                  $arrayElemAt: ["$reglements.dateReglement", 0],
                },
                modeReglement: {
                  $arrayElemAt: ["$reglements.modeReglement", 0],
                },
                dateDocument: "$$dateDocument",
                id: "$_id",
              },
            },
            {
              $set: {
                nbj: {
                  $dateDiff: {
                    startDate: "$dateDocument",
                    endDate: "$dateReglement",
                    unit: "day",
                  },
                },
              },
            },

            {
              $set: {
                nbj: {
                  $cond: { if: { $gte: ["$nbj", 0] }, then: "$nbj", else: 0 },
                },
              },
            },

            {
              $project: {
                numeroReglement: 1,
                dateReglement: 1,
                modeReglement: 1,
                montantAPayer: 1,
                dateDocument: 1,
                nbj: 1,
                montantNbj: { $multiply: ["$nbj", "$montantAPayer"] },
                id: 1,
                _id: 0,
              },
            },
          ],
          as: "liltrages",
        },
      });

      pipeline.push({
        $set: {
          aaa: {
            $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"],
          },
          id: "$_id",
        },
      });

      pipeline.push({
        $project: {
          id: 1,
          aaa: 1,
          date: 1,
          numero: 1,
          montantTotal: 1,
          restPayer: 1,
          liltrages: 1,
          montantAfterMultiply: { $multiply: ["$aaa", "$montantTotal"] },
        },
      });

      const articles = await BonReception.aggregate(pipeline);

      return res.send({
        status: true,
        listGlobal: articles,
        request: req.body,
      });
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
 * /reglements/getByIdClientBL/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdClientBL/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.id });

    const bonLivs = await BonLivraison.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    const bonRetours = await BonRetourClient.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    var soldeCurrente = 0;
    listGlobal = [];
    for (let item of bonLivs) {
      soldeCurrente += item.montantTotal;
      listGlobal.push({
        client: client.raisonSociale,
        type: "Bon Livraison",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: item.montantTotal,
        credit: 0,
        solde: 0,
      });
      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        soldeCurrente -= itemLiltrage.montant;
        listGlobal.push({
          client: client.raisonSociale,
          type: "Reglement.BL",
          dateOperation: reglement.dateReglement,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: 0,
          credit: reglement.montant,
          solde: 0,
        });
      }
    }

    for (let item of bonRetours) {
      soldeCurrente -= item.montantTotal;
      listGlobal.push({
        client: client.raisonSociale,
        type: "Bon Retour",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: item.montantTotal,
        solde: 0,
      });

      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        soldeCurrente += itemLiltrage.montant;
        listGlobal.push({
          client: client.raisonSociale,
          type: "Reglement.BR",
          dateOperation: reglement.dateReglement,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: reglement.montant,
          credit: 0,
          solde: 0,
        });
      }
    }

    //pour calculer solde avant la recherche
    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);
    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });
    const bonRetoursBefore = await BonRetourClient.find({
      client: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });
    const bonLivsBefore = await BonLivraison.find({
      client: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });
    var soldeBefore = 0;
    for (let item of reglementsBefore) {
      if (item.typeReglement == "bonLivraison") {
        soldeBefore -= item.montant;
      } else {
        soldeBefore += item.montant;
      }
    }

    for (let item of bonRetoursBefore) {
      soldeBefore -= item.montantTotal;
    }

    for (let item of bonLivsBefore) {
      soldeBefore += item.montantTotal;
    }

    //pour calculer solde de releve client
    if (listGlobal.length == 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore - listGlobal[i].debit + listGlobal[i].credit;
      }
    } else if (listGlobal.length > 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore - listGlobal[i].debit + listGlobal[i].credit;
      }
      for (let i = 1; i < listGlobal.length; i++) {
        listGlobal[i].solde =
          listGlobal[i - 1].solde - listGlobal[i].debit + listGlobal[i].credit;
      }
    }
    return res.send({
      status: true,
      listGlobal: listGlobal,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
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
 * /reglements/getByIdFournisseurBL/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdFournisseurBA/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(new Date(req.body.dateEnd).setHours(24, 59, 59, 999));
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const fournisseur = await Fournisseur.findOne({ _id: req.params.id });

    const bonAchats = await BonAchat.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    const bonRetours = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    var soldeCurrente = 0;
    listGlobal = [];
    for (let item of bonAchats) {
      soldeCurrente += item.montantTotal;
      listGlobal.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Bon Achat",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: item.montantTotal,
        credit: 0,
        solde: 0,
      });

      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        soldeCurrente -= reglement.montant;
        listGlobal.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BA",
          dateOperation: reglement.dateReglement,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: 0,
          credit: reglement.montant,
          solde: 0,
        });
        if (reglement.reste > 0) {
          listGlobal.push({
            fournisseur: fournisseur.raisonSociale,
            type: "Reste.RA",
            dateOperation: reglement.dateReglement,
            numero: reglement.numero,
            modeReglement: reglement.modeReglement.libelle,
            numCheque: reglement.numCheque,
            debit: 0,
            credit: reglement.reste,
            solde: 0,
          });
        }
      }
    }

    for (let item of bonRetours) {
      soldeCurrente -= item.montantTotal;
      listGlobal.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Bon Retour",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: item.montantTotal,
        solde: 0,
      });

      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");
        soldeCurrente += reglement.montant;
        listGlobal.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BR",
          dateOperation: reglement.dateReglement,
          numero: reglement.numero,
          modeReglement: reglement.modeReglement.libelle,
          numCheque: reglement.numCheque,
          debit: reglement.montant,
          credit: 0,
          solde: 0,
        });
      }
    }

    //pour calculer solde avant la recherche
    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);
    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });
    const bonRetoursBefore = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });
    const bonAchatsBefore = await BonAchat.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });
    var soldeBefore = 0;
    for (let item of reglementsBefore) {
      if (item.typeReglement == "bonAchat") {
        soldeBefore -= item.montant;
      } else {
        soldeBefore += item.montant;
      }
    }

    for (let item of bonRetoursBefore) {
      soldeBefore -= item.montantTotal;
    }

    for (let item of bonAchatsBefore) {
      soldeBefore += item.montantTotal;
    }

    //pour calculer solde de releve Fournisseur
    if (listGlobal.length == 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore - listGlobal[i].debit + listGlobal[i].credit;
      }
    } else if (listGlobal.length > 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore - listGlobal[i].debit + listGlobal[i].credit;
      }
      for (let i = 1; i < listGlobal.length; i++) {
        listGlobal[i].solde =
          listGlobal[i - 1].solde - listGlobal[i].debit + listGlobal[i].credit;
      }
    }
    return res.send({
      status: true,
      listGlobal: listGlobal,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
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
 * /reglements/getByIdClientBLArticle/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdClientBLArticle/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const client = await Client.findOne({ _id: req.params.id });

    const bonLivs = await BonLivraison.find({
      client: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    var soldeCurrente = 0;
    listGlobal = [];
    sommeDebit = 0;
    sommeCredit = 0;
    for (let item of bonLivs) {
      let bonLivraisonArticles = await BonLivraisonArticle.find({
        bonLivraison: item.id,
      });

      for (let itemA of bonLivraisonArticles) {
        let libelle = itemA.reference + " - " + itemA.designation;
        listGlobal.push({
          client: client.raisonSociale,
          dateOperation: itemA.date,
          dateEcheance: "",
          numero: item.numero,
          libelle: libelle,
          debit: itemA.totalTTC,
          credit: 0,
          solde: 0,
        });
        sommeDebit += itemA.totalTTC;
      }

      let liltrages = await Liltrage.find({ document: item.id });
      for (let itemLiltrage of liltrages) {
        let reglement = await Reglement.findOne({
          _id: itemLiltrage.reglement,
        }).populate("modeReglement");

        listGlobal.push({
          client: client.raisonSociale,
          dateOperation: reglement.dateReglement,
          dateEcheance: reglement.dateEcheance,
          numero: reglement.numero,
          libelle: "Reglement.BL",
          modeReglement: reglement.modeReglement.libelle,
          debit: 0,
          credit: reglement.montant,
          solde: 0,
        });

        sommeCredit += reglement.montant;
      }
    }

    //pour calculer solde avant la recherche
    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);
    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });
    const bonLivsBefore = await BonLivraison.find({
      client: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });
    var sommeTTC = 0;
    for (let item of bonLivsBefore) {
      let bonLivraisonArticles = await BonLivraisonArticle.find({
        bonLivraison: item.id,
      });
      for (let itemA of bonLivraisonArticles) {
        sommeTTC += itemA.totalTTC;
      }
    }
    let sommeReg = 0;
    for (let item of reglementsBefore) {
      sommeReg += item.montant;
    }
    soldeBefore = sommeReg - sommeTTC;

    //pour calculer solde de releve client
    if (listGlobal.length == 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde = soldeBefore;
      }
    } else if (listGlobal.length > 1) {
      for (let i = 0; i < 1; i++) {
        listGlobal[i].solde =
          soldeBefore - listGlobal[i].debit + listGlobal[i].credit;
      }
      for (let i = 1; i < listGlobal.length; i++) {
        listGlobal[i].solde =
          listGlobal[i - 1].solde - listGlobal[i].debit + listGlobal[i].credit;
      }
    }
    soldeCurrente = sommeDebit - sommeCredit;

    return res.send({
      status: true,
      listGlobal: listGlobal,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getBonLivraisonsByClient/:id", verifytoken, async (req, res) => {
  try {
    const bonLivs = await BonLivraison.find({
      client: req.params.id,
      isPayee: { $ne: "oui" },
    }).sort({ _id: -1 });

    return res.send({ status: true, bonLivs: bonLivs, client: req.params.id });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getBonRetourClientsByClient/:id",
  verifytoken,
  async (req, res) => {
    try {
      console.log(req.params.id);
      const bonLivs = await BonRetourClient.find({
        client: req.params.id,
        isPayee: { $ne: "oui" },
      }).sort({ _id: -1 });

      console.log(bonLivs);

      return res.send({
        status: true,
        bonLivs: bonLivs,
        client: req.params.id,
      });
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

router.get("/getBonAchatsByFournisseur/:id", verifytoken, async (req, res) => {
  try {
    const bonLivs = await BonReception.find({
      fournisseur: req.params.id,
      isPayee: { $ne: "oui" },
    }).sort({ _id: -1 });

    return res.send({ status: true, bonLivs: bonLivs, client: req.params.id });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getBonRetourFournisseursByFournisseur/:id",
  verifytoken,
  async (req, res) => {
    try {
      const bonLivs = await BonRetourFournisseur.find({
        fournisseur: req.params.id,
        isPayee: { $ne: "oui" },
      }).sort({ _id: -1 });

      return res.send({
        status: true,
        bonLivs: bonLivs,
        client: req.params.id,
      });
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
 * /reglements/getByIdFournisseur/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     raisonSociale:
 *                       type: string
 *                     matriculeFiscale:
 *                       type: string
 *                     classement:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     statusProspection:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     paysFacturation:
 *                       type: string
 *                     gouvernoratFacturation:
 *                       type: string
 *                     delegationFacturation:
 *                       type: string
 *                     localiteFacturation:
 *                       type: string
 *                     codePostaleFacturation:
 *                       type: string
 *                     adresseFacturation:
 *                       type: string
 *                     paysLivraison:
 *                       type: string
 *                     gouvernoratLivraison:
 *                       type: string
 *                     delegationLivraison:
 *                       type: string
 *                     localiteLivraison:
 *                       type: string
 *                     codePostaleLivraison:
 *                       type: string
 *                     adresseLivraison:
 *                       type: string
 *                     autresAdresse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           pays:
 *                             type: string
 *                           gouvernorat:
 *                             type: string
 *                           delegation:
 *                             type: string
 *                           localite:
 *                             type: string
 *                           codePostale:
 *                             type: string
 *                           adresse:
 *                             type: string
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           civilite:
 *                             type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           valeur:
 *                             type: string
 *                           imprimable:
 *                             type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdFournisseur/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(new Date(req.body.dateEnd).setHours(24, 59, 59, 999));
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const fournisseur = await Fournisseur.findOne({ _id: req.params.id });

    const reglements = await Reglement.find({
      client: req.params.id,
      dateReglement: { $gte: dateStart, $lte: dateEnd },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    const bonRetours = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    const bonAchats = await FactureAchat.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    var soldeCurrente = 0;

    var tabReleveFournisseurs = [];

    for (let item of reglements) {
      if (item.typeReglement == "bonAchat") {
        soldeCurrente += item.montant;
        tabReleveFournisseurs.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BA",
          dateOperation: item.dateReglement,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: item.montant,
          credit: 0,
          solde: 0,
        });
      } else {
        soldeCurrente -= item.montant;
        tabReleveFournisseurs.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BR",
          dateOperation: item.dateReglement,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: -1 * item.montant,
          credit: 0,
          solde: 0,
        });
      }
    }

    for (let item of bonRetours) {
      soldeCurrente += item.montantTotal;
      tabReleveFournisseurs.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Bon Retour",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: -1 * item.montantTotal,
        solde: 0,
      });
    }

    for (let item of bonAchats) {
      soldeCurrente -= item.montantTotal;
      tabReleveFournisseurs.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Facture Achat",
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: item.montantTotal,
        solde: 0,
      });
    }

    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);

    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });

    const bonRetoursBefore = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    const bonAchatsBefore = await FactureAchat.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    var soldeBefore = 0;
    soldeBefore =
      fournisseur.soldeInitialDebit - fournisseur.soldeInitialCredit;

    for (let item of reglementsBefore) {
      if (item.typeReglement == "bonAchat") {
        soldeBefore += item.montant;
      } else {
        soldeBefore -= item.montant;
      }
    }

    for (let item of bonRetoursBefore) {
      soldeBefore += item.montantTotal;
    }

    for (let item of bonAchatsBefore) {
      soldeBefore -= item.montantTotal;
    }

    for (let i = 0; i < tabReleveFournisseurs.length; i++) {
      for (let j = i; j < tabReleveFournisseurs.length; j++) {
        if (
          tabReleveFournisseurs[i].dateOperation <
          tabReleveFournisseurs[j].dateOperation
        ) {
          var aux = tabReleveFournisseurs[i];
          tabReleveFournisseurs[i] = tabReleveFournisseurs[j];
          tabReleveFournisseurs[j] = aux;
        }
      }
    }

    if (tabReleveFournisseurs.length == 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveFournisseurs[i].solde =
          soldeBefore -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
    } else if (tabReleveFournisseurs.length > 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveFournisseurs[i].solde =
          soldeBefore -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
      for (let i = 1; i < tabReleveFournisseurs.length; i++) {
        tabReleveFournisseurs[i].solde =
          tabReleveFournisseurs[i - 1].solde -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
    }
    return res.send({
      status: true,
      tabReleveFournisseurs: tabReleveFournisseurs,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getByIdFournisseurRe/:id", async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(new Date(req.body.dateEnd).setHours(24, 59, 59, 999));
    }

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const fournisseur = await Fournisseur.findOne({ _id: req.params.id });

    const reglements = await Reglement.find({
      client: req.params.id,
      dateReglement: { $gte: dateStart, $lte: dateEnd },
    })
      .populate({ path: "fournisseur", select: "_id, raisonSociale" })
      .populate({ path: "modeReglement" });

    const receptions = await BonReception.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    const bonRetours = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $gte: dateStart, $lte: dateEnd },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    var soldeCurrente = 0;

    var tabReleveFournisseurs = [];

    for (let item of reglements) {
      if (item.typeReglement == "bonAchat") {
        soldeCurrente += item.montant;
        tabReleveFournisseurs.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BA",
          soldeCredit: item.soldeCredit,
          soldeDebit: item.soldeDebit,
          dateOperation: item.dateReglement,
          dateEcheance: item.dateEcheance,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: item.montant,
          credit: 0,
          solde: 0,
        });
      } else {
        soldeCurrente -= item.montant;
        tabReleveFournisseurs.push({
          fournisseur: fournisseur.raisonSociale,
          type: "Reglement.BRA",
          soldeCredit: item.soldeCredit,
          soldeDebit: item.soldeDebit,
          dateOperation: item.dateReglement,
          dateEcheance: item.dateEcheance,
          numero: item.numero,
          modeReglement: item.modeReglement.libelle,
          numCheque: item.numCheque,
          debit: -1 * item.montant,
          credit: 0,
          solde: 0,
        });
      }
    }

    for (let item of bonRetours) {
      soldeCurrente += item.montantTotal;
      var numRecep = "";
      if (isValidObjectId(item.transfertBonReception)) {
        var bonRecep = await BonReception.findById(
          ObjectId(item.transfertBonReception)
        );
        if (bonRecep != null) {
          numRecep = bonRecep.numero;
        }
      }
      tabReleveFournisseurs.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Bon Retour",
        soldeCredit: item.soldeCredit,
        soldeDebit: item.soldeDebit,
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: numRecep,
        debit: 0,
        credit: -1 * item.montantTotal,
        solde: 0,
      });
    }

    for (let item of receptions) {
      soldeCurrente -= item.montantTotal;
      tabReleveFournisseurs.push({
        fournisseur: fournisseur.raisonSociale,
        type: "Bon Reception",
        soldeCredit: item.soldeCredit,
        soldeDebit: item.soldeDebit,
        dateOperation: item.date,
        numero: item.numero,
        modeReglement: "",
        numCheque: "",
        debit: 0,
        credit: item.montantTotal,
        solde: 0,
      });
    }

    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);

    const reglementsBefore = await Reglement.find({
      client: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    });

    const receptionsBefore = await BonReception.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    const bonRetoursBefore = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    });

    var soldeBefore = 0;
    soldeBefore =
      fournisseur.soldeInitialDebit - fournisseur.soldeInitialCredit;

    for (let item of reglementsBefore) {
      if (item.typeReglement == "bonAchat") {
        soldeBefore += item.montant;
      } else {
        soldeBefore -= item.montant;
      }
    }

    for (let item of bonRetoursBefore) {
      soldeBefore += item.montantTotal;
    }

    for (let item of receptionsBefore) {
      soldeBefore -= item.montantTotal;
    }

    for (let i = 0; i < tabReleveFournisseurs.length; i++) {
      for (let j = i; j < tabReleveFournisseurs.length; j++) {
        if (
          tabReleveFournisseurs[i].dateOperation <
          tabReleveFournisseurs[j].dateOperation
        ) {
          var aux = tabReleveFournisseurs[i];
          tabReleveFournisseurs[i] = tabReleveFournisseurs[j];
          tabReleveFournisseurs[j] = aux;
        }
      }
    }

    if (tabReleveFournisseurs.length == 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveFournisseurs[i].solde =
          soldeBefore -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
    } else if (tabReleveFournisseurs.length > 1) {
      for (let i = 0; i < 1; i++) {
        tabReleveFournisseurs[i].solde =
          soldeBefore -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
      for (let i = 1; i < tabReleveFournisseurs.length; i++) {
        tabReleveFournisseurs[i].solde =
          tabReleveFournisseurs[i - 1].solde -
          tabReleveFournisseurs[i].debit +
          tabReleveFournisseurs[i].credit;
      }
    }

    for (let i = 0; i < tabReleveFournisseurs.length; i++) {
      tabReleveFournisseurs[i].soldeDebit = 0;
      tabReleveFournisseurs[i].soldeCredit = 0;
      if (tabReleveFournisseurs[i].solde > 0) {
        tabReleveFournisseurs[i].soldeDebit = Math.abs(
          tabReleveFournisseurs[i].solde
        );
      } else {
        tabReleveFournisseurs[i].soldeCredit = Math.abs(
          tabReleveFournisseurs[i].solde
        );
      }
    }
    return res.send({
      status: true,
      tabReleveFournisseurs: tabReleveFournisseurs,
      request: req.body,
      soldeCurrente: soldeCurrente,
      soldeBefore: soldeBefore,
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
 * /reglements/getByIdFournisseurCredit/{id}:
 *   post:
 *     summary: Remove the reglements by id
 *     tags: [Reglements]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Reglements id
 *
 *     responses:
 *       200:
 *         description: The Reglements was deleted
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
 *                     nom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     num:
 *                       type:Number
 *                     code:
 *                       type: string
 *                     raisonSociale:
 *                       type: string
 *                     matriculeFiscale:
 *                       type: string
 *                     classement:
 *                       type: string
 *                     plafondCredit:
 *                       type: number
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     statusProspection:
 *                       type: string
 *                     modeReglement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     paysFacturation:
 *                       type: string
 *                     gouvernoratFacturation:
 *                       type: string
 *                     delegationFacturation:
 *                       type: string
 *                     localiteFacturation:
 *                       type: string
 *                     codePostaleFacturation:
 *                       type: string
 *                     adresseFacturation:
 *                       type: string
 *                     paysLivraison:
 *                       type: string
 *                     gouvernoratLivraison:
 *                       type: string
 *                     delegationLivraison:
 *                       type: string
 *                     localiteLivraison:
 *                       type: string
 *                     codePostaleLivraison:
 *                       type: string
 *                     adresseLivraison:
 *                       type: string
 *                     autresAdresse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           pays:
 *                             type: string
 *                           gouvernorat:
 *                             type: string
 *                           delegation:
 *                             type: string
 *                           localite:
 *                             type: string
 *                           codePostale:
 *                             type: string
 *                           adresse:
 *                             type: string
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           civilite:
 *                             type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           valeur:
 *                             type: string
 *                           imprimable:
 *                             type: string
 *                     observations:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The article was not found
 *       500:
 *         description: Some error happened
 */
router.post("/getByIdFournisseurCredit/:id", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);

    var dayBeforeDateStart = new Date(dateStart - 24 * 60 * 60 * 1000);

    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const fournisseur = await Fournisseur.findOne({ _id: req.params.id });

    const reglements = await Reglement.find({
      fournisseur: req.params.id,
      dateReglement: { $lte: dayBeforeDateStart },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    const bonRetours = await BonRetourFournisseur.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    const bonLivs = await BonLivraison.find({
      fournisseur: req.params.id,
      date: { $lte: dayBeforeDateStart },
    }).populate({ path: "fournisseur", select: "_id, raisonSociale" });

    return res.send({
      status: true,
      reglements: reglements,
      bonRetours: bonRetours,
      bonLivs: bonLivs,
      request: req.body,
    });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

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

module.exports.routerReglement = router;
