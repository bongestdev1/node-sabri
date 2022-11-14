const {
  Client,
  getNumeroAutomatique,
  validateClient,
  validateCodeRaisonSocialeMatriculeFiscale,
  validateCodeRaisonSocialeMatriculeFiscaleModifier,
  calculeEnCours,
} = require("../Models/clientModel");
const { ModeReglement } = require("../Models/modeReglementModel");
const {
  ConditionReglement,
  validateConditionReglement,
} = require("../Models/conditionReglementModel");

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Secteur } = require("../Models/secteurModel");
const { TypeTier } = require("../Models/typeTierModel");
const { TypeContact } = require("../Models/typeContactModel");

const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");
const { Personnel } = require("../Models/personnelModel");
const { Reglement, calculerSoldeClient } = require("../Models/reglementModel");
const { BonLivraison } = require("../Models/bonLivraisonModel");
const { BonRetourClient } = require("../Models/bonRetourClientModel");
const { isValidObjectId } = require("mongoose");
const { consolelog } = require("../Models/errorModel");
var ObjectId = require("mongodb").ObjectID;

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *        - nom
 *        - email
 *        - telephone
 *        - code
 *        - raisonSociale
 *        - matriculeFiscale
 *        - classement
 *        - plafondCredit
 *        - mobiles
 *        - siteWeb
 *        - conditionReglement
 *        - typeTiers
 *        - delegationLivraison
 *        - localiteLivraison
 *        - codePostaleLivraison
 *        - adresseLivraison
 *        - autresAdresse
 *        - contacts
 *        - complements
 *        - observation
 *       properties:
 *         nom:
 *           type: string
 *         email:
 *           type: string
 *         telephone:
 *           type: string
 *         credit:
 *           type: number
 *         fax:
 *           type: string
 *         statusProspection:
 *           type: string
 *         modeReglement:
 *           type: string
 *           type: string
 *         autresAdresse:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               pays:
 *                 type: string
 *               gouvernorat:
 *                 type: string
 *               delegation:
 *                 type: string
 *               localite:
 *                 type: string
 *               codePostale:
 *                 type: string
 *               adresse:
 *                 type: string
 *         contacts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                  type: string
 *               titre:
 *                  type: string
 *               civilite:
 *                  type: string
 *         complements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                  type: string
 *               valeur:
 *                  type: string
 *               imprimable:
 *                  type: string
 *         observation:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: The clients managing API
 */

/**
 * @swagger
 * /clients/newClient:
 *   post:
 *     summary: Returns the list of all the clients
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               code:
 *                 type: string
 *               raisonSociale:
 *                 type: string
 *               matriculeFiscale:
 *                 type: string
 *               secteur:
 *                 type: string
 *               paysFacturation:
 *                 type: string
 *               gouvernoratFacturation:
 *                 type: string
 *               codePostaleLivraison:
 *                 type: string
 *               adresseLivraison:
 *                 type: string
 *               autresAdresse:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     titre:
 *                       type: string
 *                     pays:
 *                       type: string
 *                     gouvernorat:
 *                       type: string
 *                     delegation:
 *                       type: string
 *                     localite:
 *                       type: string
 *                     codePostale:
 *                       type: string
 *                     adresse:
 *                       type: string
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                        type: string
 *                     titre:
 *                        type: string
 *                     civilite:
 *                        type: string
 *               complements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                        type: string
 *                     valeur:
 *                        type: string
 *                     imprimable:
 *                        type: string
 *               observation:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: The client was deleted
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
 *                       nom:
 *                         type: string
 *                       email:
 *                         type: string
 *                       telephone:
 *                         type: string
 *                       code:
 *                         type: string
 *                       raisonSociale:
 *                         type: string
 *                       matriculeFiscale:
 *                         type: string
 *                       fax:
 *                         type: string
 *                       statusProspection:
 *                         type: string
 *                       codePostaleFacturation:
 *                         type: string
 *                       adresseFacturation:
 *                         type: string
 *                       paysLivraison:
 *                         type: string
 *                       adresseLivraison:
 *                         type: string
 *                       autresAdresse:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             titre:
 *                               type: string
 *                             pays:
 *                               type: string
 *                             gouvernorat:
 *                               type: string
 *                             delegation:
 *                               type: string
 *                             localite:
 *                               type: string
 *                             codePostale:
 *                               type: string
 *                             adresse:
 *                               type: string
 *                       contacts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                                type: string
 *                             titre:
 *                                type: string
 *                             civilite:
 *                                type: string
 *                       complements:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                                type: string
 *                             valeur:
 *                                type: string
 *                             imprimable:
 *                                type: string
 *                       observation:
 *                         type: string
 *       404:
 *         description: The client was not found
 *       500:
 *         description: Some error happened
 */

router.post("/newClient", verifytoken, async (req, res) => {
  try {
    /*const {error}=validateClient(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
    */

    var tabChampsNonOblig = [
      "secteur",
      "modeReglement",
      "typeTiers",
      "agentPremierContact",
      "agentCommercial",
      "agentRecouvrement",
    ];
    for (let i = 0; i < tabChampsNonOblig.length; i++) {
      if (!isValidObjectId(req.body[tabChampsNonOblig[i]])) {
        req.body[tabChampsNonOblig[i]] = null;
      }
    }

    req.body.credit = req.body.soldeInitialCredit - req.body.soldeInitialDebit;

    var body = req.body;
    body.societeRacine = await getSocieteRacine(ObjectId(body.societe));

    var messageErreur = await validateCodeRaisonSocialeMatriculeFiscale(
      body,
      body.societeRacine
    );

    if (messageErreur != "") {
      return res.send({ status: false, message: messageErreur });
    }

    var chiffres = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    var number = "";
    for (let i = 0; i < body.code.length; i++) {
      if (chiffres.includes(body.code[i])) {
        number += body.code[i];
      } else {
        number = "";
      }
    }

    body.num = Number(number);

    const client = new Client(body);

    const result = await client.save();
    return res.send({ status: true, resultat: result });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /clients/modifierClient/{id}:
 *   post:
 *     summary: Remove the client by id
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               code:
 *                 type: string
 *               raisonSociale:
 *                 type: string
 *               matriculeFiscale:
 *                 type: string
 *               classement:
 *                 type: string
 *               plafondCredit:
 *                 type: number
 *               mobiles:
 *                 type: string
 *               siteWeb:
 *                 type: string
 *               conditionReglement:
 *                 type: string
 *               typeTiers:
 *                 type: string
 *               credit:
 *                 type: number
 *               fax:
 *                 type: string
 *               statusProspection:
 *                 type: string
 *               modeReglement:
 *                 type: string
 *               secteur:
 *                 type: string
 *               paysFacturation:
 *                 type: string
 *               gouvernoratFacturation:
 *                 type: string
 *               delegationFacturation:
 *                 type: string
 *               localiteFacturation:
 *                 type: string
 *               codePostaleFacturation:
 *                 type: string
 *               adresseFacturation:
 *                 type: string
 *               paysLivraison:
 *                 type: string
 *               gouvernoratLivraison:
 *                 type: string
 *               delegationLivraison:
 *                 type: string
 *               localiteLivraison:
 *                 type: string
 *               codePostaleLivraison:
 *                 type: string
 *               adresseLivraison:
 *                 type: string
 *               autresAdresse:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     titre:
 *                       type: string
 *                     pays:
 *                       type: string
 *                     gouvernorat:
 *                       type: string
 *                     delegation:
 *                       type: string
 *                     localite:
 *                       type: string
 *                     codePostale:
 *                       type: string
 *                     adresse:
 *                       type: string
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                        type: string
 *                     titre:
 *                        type: string
 *                     civilite:
 *                        type: string
 *               complements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                        type: string
 *                     valeur:
 *                        type: string
 *                     imprimable:
 *                        type: string
 *               observation:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: The client is updated
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
 *                       nom:
 *                         type: string
 *                       email:
 *                         type: string
 *                       telephone:
 *                         type: string
 *                       code:
 *                         type: string
 *                       raisonSociale:
 *                         type: string
 *                       matriculeFiscale:
 *                         type: string
 *                       classement:
 *                         type: string
 *                       plafondCredit:
 *                         type: number
 *                       mobiles:
 *                         type: string
 *                       siteWeb:
 *                         type: string
 *                       conditionReglement:
 *                         type: string
 *                       typeTiers:
 *                         type: string
 *                       credit:
 *                         type: number
 *                       fax:
 *                         type: string
 *                       statusProspection:
 *                         type: string
 *                       modeReglement:
 *                         type: string
 *                       secteur:
 *                         type: string
 *                       paysFacturation:
 *                         type: string
 *                       gouvernoratFacturation:
 *                         type: string
 *                       delegationFacturation:
 *                         type: string
 *                       localiteFacturation:
 *                         type: string
 *                       codePostaleFacturation:
 *                         type: string
 *                       adresseFacturation:
 *                         type: string
 *                       paysLivraison:
 *                         type: string
 *                       gouvernoratLivraison:
 *                         type: string
 *                       delegationLivraison:
 *                         type: string
 *                       localiteLivraison:
 *                         type: string
 *                       codePostaleLivraison:
 *                         type: string
 *                       adresseLivraison:
 *                         type: string
 *                       autresAdresse:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             titre:
 *                               type: string
 *                             pays:
 *                               type: string
 *                             gouvernorat:
 *                               type: string
 *                             delegation:
 *                               type: string
 *                             localite:
 *                               type: string
 *                             codePostale:
 *                               type: string
 *                             adresse:
 *                               type: string
 *                       contacts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                                type: string
 *                             titre:
 *                                type: string
 *                             civilite:
 *                                type: string
 *                       complements:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                                type: string
 *                             valeur:
 *                                type: string
 *                             imprimable:
 *                                type: string
 *                       observation:
 *                         type: string
 *       404:
 *         description: The client was not found
 *       500:
 *         description: Some error happened
 */

router.post("/modifierClient/:id", verifytoken, async (req, res) => {
  try {
    var tabChampsNonOblig = [
      "secteur",
      "modeReglement",
      "typeTiers",
      "agentPremierContact",
      "agentCommercial",
      "agentRecouvrement",
    ];
    for (let i = 0; i < tabChampsNonOblig.length; i++) {
      if (!isValidObjectId(req.body[tabChampsNonOblig[i]])) {
        req.body[tabChampsNonOblig[i]] = null;
      }
    }

    const client = await Client.findById(req.params.id);

    var credit = Number(
      client.credit +
        client.soldeInitialDebit -
        client.soldeInitialCredit -
        req.body.soldeInitialDebit +
        req.body.soldeInitialCredit
    );

    if (!client) return res.status(401).send({ status: false });

    var body = req.body;

    body.credit = credit;

    body.societeRacine = client.societeRacine;
    //body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    var messageErreur = await validateCodeRaisonSocialeMatriculeFiscaleModifier(
      body,
      body.societeRacine,
      client.id
    );

    if (messageErreur != "") {
      return res.send({ status: false, message: messageErreur });
    }

    var chiffres = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    var number = "";
    for (let i = 0; i < body.code.length; i++) {
      if (chiffres.includes(body.code[i])) {
        number += body.code[i];
      } else {
        number = "";
      }
    }

    body.num = Number(number);

    const result = await Client.findOneAndUpdate({ _id: req.params.id }, body);

    const client2 = await Client.findById(req.params.id);

    return res.send({ status: true, resultat: client2 });
  } catch (e) {
    consolelog(e);

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
 * /clients/listClients:
 *   post:
 *     summary: Returns the list of all the clients
 *     tags: [Clients]
 *     requestBody:
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
 *         description: The list of the clients
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
 *                            nom:
 *                              type: string
 *                            email:
 *                              type: string
 *                            telephone:
 *                              type: string
 *                            code:
 *                              type: string
 *                            raisonSociale:
 *                              type: string
 *                            matriculeFiscale:
 *                              type: string
 *                            classement:
 *                              type: string
 *                            plafondCredit:
 *                              type: number
 *                            mobiles:
 *                              type: string
 *                            siteWeb:
 *                              type: string
 *                            conditionReglement:
 *                              type: string
 *                            typeTiers:
 *                              type: string
 *                            credit:
 *                              type: number
 *                            fax:
 *                              type: string
 *                            statusProspection:
 *                              type: string
 *                            modeReglement:
 *                              type: string
 *                            secteur:
 *                              type: string
 *                            paysFacturation:
 *                              type: string
 *                            gouvernoratFacturation:
 *                              type: string
 *                            delegationFacturation:
 *                              type: string
 *                            localiteFacturation:
 *                              type: string
 *                            codePostaleFacturation:
 *                              type: string
 *                            adresseFacturation:
 *                              type: string
 *                            paysLivraison:
 *                              type: string
 *                            gouvernoratLivraison:
 *                              type: string
 *                            delegationLivraison:
 *                              type: string
 *                            localiteLivraison:
 *                              type: string
 *                            codePostaleLivraison:
 *                              type: string
 *                            adresseLivraison:
 *                              type: string
 *                            autresAdresse:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  titre:
 *                                    type: string
 *                                  pays:
 *                                    type: string
 *                                  gouvernorat:
 *                                    type: string
 *                                  delegation:
 *                                    type: string
 *                                  localite:
 *                                    type: string
 *                                  codePostale:
 *                                    type: string
 *                                  adresse:
 *                                    type: string
 *                            contacts:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  type:
 *                                     type: string
 *                                  titre:
 *                                     type: string
 *                                  civilite:
 *                                     type: string
 *                            complements:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  type:
 *                                     type: string
 *                                  valeur:
 *                                     type: string
 *                                  imprimable:
 *                                     type: string
 *                            observation:
 *                              type: string
 *
 */
router.post("/listClients", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));

    if (req.body.limit == 0) {
      var clients = await Client.find({ societeRacine: societeRacine });
      const result = { docs: clients };
      return res.send({ status: true, resultat: result, request: req.body });
    }

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

    pipeline.push({ $match: { societeRacine: societeRacine } });

    pipeline.push({
      $lookup: {
        from: "secteurs",
        let: { secteur: "$secteur" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$secteur"] }],
              },
            },
          },
        ],
        as: "secteur",
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
        from: "typetiers",
        let: { typeTiers: "$typeTiers" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$typeTiers"] }],
              },
            },
          },
        ],
        as: "typetiers",
      },
    });

    pipeline.push({
      $lookup: {
        from: "personnels",
        let: { agentPremierContact: "$agentPremierContact" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$agentPremierContact"] }],
              },
            },
          },
        ],
        as: "agentpremiercontacts",
      },
    });

    pipeline.push({
      $lookup: {
        from: "personnels",
        let: { agentCommercial: "$agentCommercial" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$agentCommercial"] }],
              },
            },
          },
        ],
        as: "agentcommercials",
      },
    });

    pipeline.push({
      $lookup: {
        from: "personnels",
        let: { agentRecouvrement: "$agentRecouvrement" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$agentRecouvrement"] }],
              },
            },
          },
        ],
        as: "agentrecouvrements",
      },
    });

    pipeline.push({
      $set: {
        secteur: { $arrayElemAt: ["$secteur.typeS", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },
        agentPremierContact: { $arrayElemAt: ["$agentpremiercontacts.nom", 0] },
        agentCommercial: { $arrayElemAt: ["$agentcommercials.nom", 0] },
        agentRecouvrement: { $arrayElemAt: ["$agentrecouvrements.nom", 0] },
        plafondCredit: { $toString: "$plafondCredit" },
        credit: { $toString: "$credit" },
        remise: { $toString: "$remise" },
        nbFactureNonPaye: { $toString: "$nbFactureNonPaye" },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
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

    const articles = await Client.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Client.aggregate(sommePipeline);

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
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /clients/deleteClient/{id}:
 *   post:
 *     summary: Remove the client by id
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *
 *     responses:
 *       200:
 *         description: The client was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The client was not found
 *       500:
 *         description: Some error happened
 */

router.post("/deleteClient/:id", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const client = await Client.findById(req.params.id);

    if (!client) return res.status(401).send({ status: false });

    if (await Client.findOneAndDelete({ _id: req.params.id })) {
      return res.send({ status: true });
    } else {
      return res.send({ status: false });
    }
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /clients/getAllParametres:
 *   get:
 *     summary:
 *     tags: [Clients]
 *
 *     responses:
 *       200:
 *         description: The Client was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  secteur:
 *                    type: array
 *       404:
 *         description: The Client was not found
 *       500:
 *         description: Some error happened
 */
router.get("/getAllParametres/:id", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id));

    const secteurs = await Secteur.find({ societeRacine: societeRacine });

    const modereglements = await ModeReglement.find({
      societeRacine: societeRacine,
    });

    const typeTiers = await TypeTier.find({ societeRacine: societeRacine });

    const typeContacts = await TypeContact.find({
      societeRacine: societeRacine,
    });

    const clients = await Client.find({ societeRacine: societeRacine }).select({
      id: 1,
      code: 1,
      raisonSociale: 1,
      matriculeFiscale: 1,
    });

    const conditionReglements = await ConditionReglement.find({
      societeRacine: societeRacine,
    });

    const personnels = await Personnel.find({ societeRacine: societeRacine });

    const numero = await getNumeroAutomatique(societeRacine);

    return res.send({
      status: true,
      numero: numero,
      secteurs: secteurs,
      modereglements: modereglements,
      typeTiers: typeTiers,
      clients: clients,
      conditionReglements: conditionReglements,
      typeContacts: typeContacts,
      personnels: personnels,
    });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /clients/getById/{id}:
 *   get:
 *     summary: Remove the client by id
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *
 *     responses:
 *       200:
 *         description: The client was deleted
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
 *                     conditionReglement:
 *                       type: string
 *                     typeTiers:
 *                       type: string
 *                     credit:
 *                       type: number
 *                     fax:
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
 *                              type: string
 *                           titre:
 *                              type: string
 *                           civilite:
 *                              type: string
 *                     complements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                              type: string
 *                           valeur:
 *                              type: string
 *                           imprimable:
 *                              type: string
 *                     observation:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Client was not found
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

    const client = await Client.findOne({ _id: req.params.id });

    return res.send({ status: true, resultat: client });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get(
  "/getByIdWithTypeTiersModeReglementSecteur/:id",
  verifytoken,
  async (req, res) => {
    try {
      if (
        req.params.id == undefined ||
        req.params.id == null ||
        req.params.id == ""
      )
        return res.status(400).send({ status: false });

      const client = await Client.findOne({ _id: req.params.id })
        .populate("typeTiers")
        .populate("secteur")
        .populate("modeReglement");

      var newClient = {
        num: "",
        email: "",
        telephone: "",
        code: "",
        raisonSociale: "",
        matriculeFiscale: "",
        classement: "",
        mobiles: "",
        siteWeb: "",
        conditionReglement: "",
        typeTiers: "",
        credit: 0,
        plafondCredit: 0,
        fax: "",
        statusProspection: "",
        modeReglement: "",
        secteur: "",
        exemptTimbreFiscale: "",
        exemptTVA: "",
        agentPremierContact: "",
        agentCommercial: "",
        agentRecouvrement: "",
        remise: 0,
        active: "",
        facture: "",
        paysFacturation: "",
        gouvernoratFacturation: "",
        delegationFacturation: "",
        localiteFacturation: "",
        codePostaleFacturation: "",
        adresseFacturation: "",
        paysLivraison: "",
        gouvernoratLivraison: "",
        delegationLivraison: "",
        localiteLivraison: "",
        codePostaleLivraison: "",
        adresseLivraison: "",
        autresAdresse: [],
        contacts: [],
        complements: [],
        observation: "",
      };

      for (let key in newClient) {
        if (["secteur", "typeTiers", "modeReglement"].includes(key) == false) {
          newClient[key] = client[key];
        } else {
          if (
            ["typeTiers", "modeReglement"].includes(key) == true &&
            client[key] != null
          ) {
            newClient[key] = client[key].libelle;
          } else if (key == "secteur" && client[key] != null) {
            newClient[key] = client[key].typeS;
          } else {
            newClient[key] = null;
          }
        }
      }

      return res.send({ status: true, resultat: newClient });
    } catch (e) {
      consolelog(e);

      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

// router.post("/classementClient", verifytoken, async (req, res) => {
//   try {
//     var dateStart = new Date(req.body.dateStart);
//     var dateEnd = new Date(req.body.dateEnd);
//     var societe = ObjectId(req.body.societe);
//     var societeRacine = await getSocieteRacine(req.body.societe);

//     let clients = [];
//     if (ObjectId.isValid(req.body.client)) {
//       var client = ObjectId(req.body.client);

//       let clientById = await Client.findById({ _id: client })
//         .populate("typeTiers")
//         .populate("modeReglement");

//       clients.push(clientById);
//     } else {
//       clients = await Client.find({ societeRacine: societeRacine })
//         .populate("typeTiers")
//         .populate("modeReglement");
//     }

//     console.log(this.clients);

//     let listGL = [];
//     for (let item of clients) {
//       let type = "";
//       let tab;
//       if (item.typeTiers != null) {
//         type = item.typeTiers.libelle;
//       }

//       const reglements = await Reglement.find({
//         client: item.id,
//         dateReglement: { $gte: dateStart, $lte: dateEnd },
//       })
//         .populate("modeReglement")
//         .populate("situationReglement");
//       const bonLivraisons = await BonLivraison.find({
//         client: item.id,
//         dateReglement: { $gte: dateStart, $lte: dateEnd },
//       }).select({ montantTotal: 1 });
//       const bonRetourClient = await BonRetourClient.find({
//         client: item.id,
//         dateReglement: { $gte: dateStart, $lte: dateEnd },
//       }).select({ montantTotal: 1 });

//       var solde = 0;
//       for (let i = 0; i < reglements.length; i++) {
//         if (reglements[i].typeReglement === "bonLivraison") {
//           solde -= reglements[i].montant;
//         } else {
//           solde += reglements[i].montant;
//         }
//       }

//       for (let i = 0; i < bonLivraisons.length; i++) {
//         solde += bonLivraisons[i].montantTotal;
//       }

//       for (let i = 0; i < bonRetourClient.length; i++) {
//         solde -= bonRetourClient[i].montantTotal;
//       }

//       solde = await calculerSoldeClient(dateStart, dateEnd, item.id);

//       tab = calculeEnCours(reglements, item.modeReglement);

//       listGL.push({
//         client: item.code,
//         nom: item.raisonSociale,
//         solde: solde,
//         enCours: tab[0].montant,
//         impaye: tab[0].impaye,
//         credit: item.credit,
//         delai: item.conditionReglement,
//         type: type,
//         nature: item.classement,
//         telephone: item.mobiles,
//       });
//     }

//     return res.send({ status: true, listGL: listGL });
//   } catch (e) {
//     consolelog(e)

//     // statements to handle any exceptions
//     console.log(e);
//     return res.send({ status: false }); // pass exception object to error handler
//   }
// });

router.post("/classement", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);

    var societeRacine = await getSocieteRacine(societe);

    var pipeFournisseur = [];

    var pipeSolde = [];

    if (ObjectId.isValid(req.body.client)) {
      pipeSolde.push({
        $facet: {
          montantReglementAchats: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                      },
                    },
                  },
                ],
                as: "reglementAchatsArray",
              },
            },
            {
              $set: {
                reglementAchats: {
                  $map: {
                    input: "$reglementAchatsArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementAchat: {
                  $multiply: [{ $sum: "$reglementAchats.montant" }, -1],
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$reglementAchat",
              },
            },
          ],
          montantReglementRetour: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonRetourClient",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                      },
                    },
                  },
                ],
                as: "reglementRetourArray",
              },
            },
            {
              $set: {
                reglementRetours: {
                  $map: {
                    input: "$reglementRetourArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementRetour: {
                  $sum: "$reglementRetours.montant",
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$reglementRetour",
              },
            },
          ],
          sommeAchats: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonlivraisons",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montantTotal",
                      },
                    },
                  },
                ],
                as: "bonReceptionArray",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonReceptionArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                achats: { $sum: "$retours.montant" }, //{ $multiply: [{  }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$achats",
              },
            },
          ],
          sommeRetour: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourfournisseurs",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montantTotal",
                      },
                    },
                  },
                ],
                as: "bonRetourClient",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourClient",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                Retour: { $multiply: [{ $sum: "$retours.montant" }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$Retour",
              },
            },
          ],
        },
      });
      pipeSolde.push({
        $project: {
          items: {
            $concatArrays: [
              "$montantReglementAchats",
              "$montantReglementRetour",
              "$sommeAchats",
              "$sommeRetour",
            ],
          },
        },
      });

      pipeSolde.push({
        $unwind: "$items",
      });
      pipeSolde.push({
        $set: {
          _id: "$items._id",
          numero: "$items.numero",
          client: "$items.client",
          nom: "$items.nom",
          credit: "$items.credit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          enCours: "$items.enCours",
          impaye: "$items.impaye",
          type: "$items.type",
        },
      });

      pipeSolde.push({
        $group: {
          _id: "$_id",
          numero: { $first: "$numero" },
          client: { $first: "$client" },
          nom: { $first: "$nom" },
          credit: { $first: "$credit" },
          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
          solde: { $sum: "$somme" },
          enCours: { $first: "$enCours" },
          impaye: { $first: "$impaye" },
          type: { $first: "$type" },
        },
      });

      var solde = await Client.aggregate(pipeSolde);
      console.log(solde);

      return res.send({ status: true, listGL: solde });
    } else {
      pipeSolde.push({
        $facet: {
          montantReglementAchats: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                      },
                    },
                  },
                ],
                as: "reglementAchatsArray",
              },
            },
            {
              $set: {
                reglementAchats: {
                  $map: {
                    input: "$reglementAchatsArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementAchat: {
                  $multiply: [{ $sum: "$reglementAchats.montant" }, -1],
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$reglementAchat",
              },
            },
          ],
          montantReglementRetour: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonRetourClient",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                      },
                    },
                  },
                ],
                as: "reglementRetourArray",
              },
            },
            {
              $set: {
                reglementRetours: {
                  $map: {
                    input: "$reglementRetourArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementRetour: {
                  $sum: "$reglementRetours.montant",
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$reglementRetour",
              },
            },
          ],
          sommeAchats: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonlivraisons",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montantTotal",
                      },
                    },
                  },
                ],
                as: "bonReceptionArray",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonReceptionArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                achats: { $sum: "$retours.montant" }, //{ $multiply: [{  }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$achats",
              },
            },
          ],
          sommeRetour: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourfournisseurs",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montantTotal",
                      },
                    },
                  },
                ],
                as: "bonRetourClient",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourClient",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                Retour: { $multiply: [{ $sum: "$retours.montant" }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                credit: "$credit",
                delai: "$conditionReglement",
                type: "$type",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$Retour",
              },
            },
          ],
        },
      });

      pipeSolde.push({
        $project: {
          items: {
            $concatArrays: [
              "$montantReglementAchats",
              "$montantReglementRetour",
              "$sommeAchats",
              "$sommeRetour",
            ],
          },
        },
      });

      pipeSolde.push({
        $unwind: "$items",
      });

      pipeSolde.push({
        $set: {
          _id: "$items._id",
          numero: "$items.numero",
          client: "$items.client",
          nom: "$items.nom",
          credit: "$items.credit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          enCours: "$items.enCours",
          impaye: "$items.impaye",
          type: "$items.type",
        },
      });

      pipeSolde.push({
        $group: {
          _id: "$_id",
          numero: { $first: "$numero" },
          client: { $first: "$client" },
          nom: { $first: "$nom" },
          credit: { $first: "$credit" },
          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
          solde: { $sum: "$somme" },
          enCours: { $first: "$enCours" },
          impaye: { $first: "$impaye" },
          type: { $first: "$type" },
        },
      });

      var result = await Client.aggregate(pipeSolde);
      console.log("result>>>>>>>>>", result);
      return res.send({ status: true, listGL: result });
    }
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/classementClientTable", async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var dateNow = new Date();

    var societeRacine = societe; //await getSocieteRacine(societe);
    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { _id: -1 };
    }

    var pipe = [];
    if (ObjectId.isValid(req.body.client)) {
      pipe.push({
        $facet: {
          sommeAchats: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonlivraisons",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$totalTTC",
                      },
                    },
                  },
                ],
                as: "bonReceptionArray",
              },
            },
            {
              $set: {
                ventes: {
                  $map: {
                    input: "$bonReceptionArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                achats: { $sum: "$ventes.montant" }, //{ $multiply: [{  }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$achats",
              },
            },
          ],
          sommeRetour: [
            {
              $match: {
                _id: ObjectId(req.body.client),

                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourclients",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      client: ObjectId(req.body.client),

                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$totalTTC",
                      },
                    },
                  },
                ],
                as: "bonRetourClient",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourClient",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                Retour: { $multiply: [{ $sum: "$retours.montant" }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$Retour",
              },
            },
          ],
          montantReglementAchats: [
            {
              $match: {
                _id: ObjectId(req.body.client),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateEcheance: { $gte: dateNow },
                      //modeReglement : encours=true
                      //typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
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
                            enCours: "oui",
                            $expr: {
                              $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                            },
                          },
                        },
                        {
                          $lookup: {
                            from: "situationreglements",
                            pipeline: [
                              {
                                $match: { libelle: "impaye" },
                              },
                            ],
                            as: "libelleReglement",
                          },
                        },
                        {
                          $set: {
                            reglementSituationLibelle: {
                              $arrayElemAt: ["$libelleReglement.libelle", 0],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: {
                              _id: "$_id",
                              reglementSituationLibelle:
                                "$reglementSituationLibelle",
                            },
                          },
                        },
                      ],
                      as: "modeReglements",
                    },
                  },

                  {
                    $set: {
                      reglementSituation: {
                        $arrayElemAt: ["$modeReglements.libelleReglement", 0],
                      },
                      reglementLibelle: {
                        $arrayElemAt: ["$modeReglements.libelle", 0],
                      },
                      reglementEnCours: {
                        $arrayElemAt: ["$modeReglements.enCours", 0],
                      },
                      reglementSituationLibelle: {
                        $arrayElemAt: [
                          "$modeReglements.reglementSituationLibelle",
                          0,
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                        libelle: "$reglementLibelle",
                        enCours: "$reglementEnCours",
                      },
                    },
                  },
                ],
                as: "reglementAchatsArray",
              },
            },
            // {
            //   $set: {
            //     reglementLibelle: {
            //       $map: {
            //         input: "$reglementAchatsArray",
            //         as: "i",
            //         in: {
            //           libelle: "$$i._id.libelle",
            //         },
            //       },
            //     },
            //   },
            // },
            {
              $set: {
                reglementAchats: {
                  $map: {
                    input: "$reglementAchatsArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementAchat: {
                  $sum: "$reglementAchats.montant",
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                sommeReg: "$reglementAchat",
                reglementLibell: "$reglementLibelle.libelle",
              },
            },
          ],
        },
      });

      pipe.push({
        $project: {
          items: {
            $concatArrays: [
              "$montantReglementAchats",
              "$sommeAchats",
              "$sommeRetour",
            ],
          },
        },
      });
      pipe.push({
        $unwind: "$items",
      });

      pipe.push({
        $set: {
          _id: "$items._id",
          //numero : "$items.numero",
          client: "$items.client",
          nom: "$items.nom",
          credit: "$items.credit",
          debit: "$items.debit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          typeTiers: "$items.typeTiers",
          sommeReg: "$items.sommeReg",

          impaye: "$items.impaye",
        },
      });

      pipe.push({
        $group: {
          _id: "$_id",
          //numero: { $first: "$numero" },
          codeClient: { $first: "$client" },
          raisonSociale: { $first: "$nom" },
          typeTiers: { $first: "$typeTiers" },

          chiffreAffaire: { $sum: "$somme" },
          sdebit: { $first: "$debit" },

          scredit: { $first: "$credit" },
          enCours: { $sum: "$sommeReg" },
          impaye: { $first: "$impaye" },
          soldeEnCours: {
            $first: {
              $cond: {
                if: { $gte: ["$credit", 0] },
                then: { $add: ["$debit", { $sum: "$sommeReg" }] },
                else: { $add: ["$credit", { $sum: "$sommeReg" }] },
              },
            },
          },
          soldeImpaye: {
            $first: {
              $cond: {
                if: { $gte: ["$credit", 0] },
                then: {
                  $cond: {
                    if: { $gte: ["$impaye", 0] },
                    then: { $add: ["$impaye", "$debit"] },
                    else: { $add: ["$debit", 0] },
                  },
                },
                else: {
                  $cond: {
                    if: { $gte: ["$impaye", 0] },
                    then: { $add: ["$impaye", "$credit"] },
                    else: { $add: ["$credit", 0] },
                  },
                },
              },
            },
          },
          soldeGlobal: {
            $first: {
              $cond: {
                if: { $gte: ["$credit", 0] },
                then: {
                  $add: ["$debit", { $add: [0, { $sum: "$sommeReg" }] }],
                },
                else: {
                  $add: ["$credit", { $add: [0, { $sum: "$sommeReg" }] }],
                },
              },
            },
          },

          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
        },
      });
      var rslt = await Client.aggregate(pipe);
      res.send({ status: true, listGL: rslt });
    } else {
      pipe.push({
        $facet: {
          sommeAchats: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonlivraisons",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$totalTTC",
                      },
                    },
                  },
                ],
                as: "bonReceptionArray",
              },
            },
            {
              $set: {
                ventes: {
                  $map: {
                    input: "$bonReceptionArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                achats: { $sum: "$ventes.montant" }, //{ $multiply: [{  }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$achats",
              },
            },
          ],
          sommeRetour: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourclients",
                let: { client: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$totalTTC",
                      },
                    },
                  },
                ],
                as: "bonRetourClient",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourClient",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                Retour: { $multiply: [{ $sum: "$retours.montant" }, -1] },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                enCours: "$montant",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                somme: "$Retour",
              },
            },
          ],
          montantReglementAchats: [
            {
              $match: {
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { client: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateEcheance: { $gte: dateNow },
                      //modeReglement : encours=true
                      //typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$client"] }],
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
                            enCours: "oui",
                            $expr: {
                              $and: [{ $eq: ["$_id", "$$modeReglement"] }],
                            },
                          },
                        },
                        {
                          $lookup: {
                            from: "situationreglements",
                            pipeline: [
                              {
                                $match: { libelle: "impaye" },
                              },
                            ],
                            as: "libelleReglement",
                          },
                        },
                        {
                          $set: {
                            reglementSituationLibelle: {
                              $arrayElemAt: ["$libelleReglement.libelle", 0],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: {
                              _id: "$_id",
                              reglementSituationLibelle:
                                "$reglementSituationLibelle",
                            },
                          },
                        },
                      ],
                      as: "modeReglements",
                    },
                  },

                  {
                    $set: {
                      reglementSituation: {
                        $arrayElemAt: ["$modeReglements.libelleReglement", 0],
                      },
                      reglementLibelle: {
                        $arrayElemAt: ["$modeReglements.libelle", 0],
                      },
                      reglementEnCours: {
                        $arrayElemAt: ["$modeReglements.enCours", 0],
                      },
                      reglementSituationLibelle: {
                        $arrayElemAt: [
                          "$modeReglements.reglementSituationLibelle",
                          0,
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: {
                        _id: "$_id",
                        montant: "$montant",
                        libelle: "$reglementLibelle",
                        enCours: "$reglementEnCours",
                      },
                    },
                  },
                ],
                as: "reglementAchatsArray",
              },
            },
            // {
            //   $set: {
            //     reglementLibelle: {
            //       $map: {
            //         input: "$reglementAchatsArray",
            //         as: "i",
            //         in: {
            //           libelle: "$$i._id.libelle",
            //         },
            //       },
            //     },
            //   },
            // },
            {
              $set: {
                reglementAchats: {
                  $map: {
                    input: "$reglementAchatsArray",
                    as: "i",
                    in: {
                      montant: { $sum: "$$i._id.montant" },
                    },
                  },
                },
              },
            },
            {
              $set: {
                reglementAchat: {
                  $sum: "$reglementAchats.montant",
                },
              },
            },
            {
              $project: {
                _id: "$_id",
                numero: "$num",
                client: "$code",
                nom: "$raisonSociale",
                impaye: "$impaye",
                debit: {
                  $cond: {
                    if: { $lte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                credit: {
                  $cond: {
                    if: { $gte: ["$credit", 0] },
                    then: "$credit",
                    else: 0,
                  },
                },
                delai: "$conditionReglement",
                typeTiers: "$typeTiers",
                nature: "$classement",
                telephone: "$mobiles",
                sommeReg: "$reglementAchat",
                reglementLibell: "$reglementLibelle.libelle",
              },
            },
          ],
        },
      });

      pipe.push({
        $project: {
          items: {
            $concatArrays: [
              "$montantReglementAchats",
              "$sommeAchats",
              "$sommeRetour",
            ],
          },
        },
      });
      pipe.push({
        $unwind: "$items",
      });

      pipe.push({
        $set: {
          _id: "$items._id",
          //numero : "$items.numero",
          client: "$items.client",
          nom: "$items.nom",
          credit: "$items.credit",
          debit: "$items.debit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          typeTiers: "$items.typeTiers",
          sommeReg: "$items.sommeReg",
          impaye: "$items.impaye",
        },
      });

      pipe.push({
        $group: {
          _id: "$_id",
          //numero: { $first: "$numero" },
          codeClient: { $first: "$client" },
          raisonSociale: { $first: "$nom" },
          typeTiers: { $first: "$typeTiers" },
          chiffreAffaire: { $sum: "$somme" },
          sdebit: { $first: "$debit" },
          scredit: { $first: "$credit" },
          enCours: { $sum: "$sommeReg" },
          impaye: { $first: "$impaye" },
          soldeEnCours: {
            $first: {
              $cond: {
                if: { $lte: ["$credit", 0] },
                then: {
                  $add: [{ $multiply: ["$debit", -1] }, { $sum: "$sommeReg" }],
                },
                else: {
                  $add: [{ $multiply: ["$credit", -1] }, { $sum: "$sommeReg" }],
                },
              },
            },
          },
          soldeImpaye: {
            $first: {
              $cond: {
                if: { $gte: ["$credit", 0] },
                then: {
                  $cond: {
                    if: { $gte: ["$impaye", 0] },
                    then: { $add: ["$impaye", { $multiply: ["$debit", -1] }] },
                    else: { $add: [{ $multiply: ["$debit", -1] }, 0] },
                  },
                },
                else: {
                  $cond: {
                    if: { $gte: ["$impaye", 0] },
                    then: { $add: ["$impaye", { $multiply: ["$credit", -1] }] },
                    else: { $add: [{ $multiply: ["$credit", -1] }, 0] },
                  },
                },
              },
            },
          },
          soldeGlobal: {
            $first: {
              $cond: {
                if: { $lte: ["$credit", 0] },
                then: {
                  $add: [{ $multiply: ["$debit", -1] }, { $sum: "$sommeReg" }],
                },
                else: {
                  $add: [{ $multiply: ["$credit", -1] }, { $sum: "$sommeReg" }],
                },
              },
            },
          },
          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
        },
      });
    }
    var rslt = await Client.aggregate(pipe);

    res.send({ status: true, listGL: rslt });
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/classementClient", verifytoken, async (req, res) => {
  try {
    console.log(req.body);
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var dateNow = new Date();

    var societeRacine = await getSocieteRacine(societe);

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
          societeRacine: ObjectId(societeRacine),
          _id: ObjectId(req.body.client),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }
    if (ObjectId.isValid(req.body.typeTiers)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          typeTiers: ObjectId(req.body.typeTiers),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }
    // pipeline.push({
    //   $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
    // });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              isTransfert: "non",
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonReceptions",
      },
    });

    pipeline.push({
      $set: {
        sommeBonReception: {
          $map: {
            input: "$sommeBonReceptions",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_RECP: { $sum: "$sommeBonReception.montant" }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "factureventes",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeFacturesAchats",
      },
    });

    pipeline.push({
      $set: {
        sommeFacturesAchats: {
          $map: {
            input: "$sommeFacturesAchats",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        FACTURE: { $sum: "$sommeFacturesAchats.montant" }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $set: {
        SUM_RECP_FACT: { $add: ["$FACTURE", "$B_RECP"] }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "bonretourclients",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonRetourClients",
      },
    });
    pipeline.push({
      $set: {
        sommeBonRetourClients: {
          $map: {
            input: "$sommeBonRetourClients",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_RETOUR: { $sum: "$sommeBonRetourClients.montant" }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $set: {
        vente: { $subtract: ["$SUM_RECP_FACT", "$B_RETOUR"] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "reglements",
        let: { client: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              // dateEcheance: { $gte: dateNow },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeReglements",
      },
    });
    pipeline.push({
      $set: {
        sommeRegelements: {
          $map: {
            input: "$sommeReglements",
            as: "i",
            in: {
              montant: { $sum: "$$i.montant" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        reglement: { $sum: "$sommeRegelements.montant" }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "reglements",
        let: { client: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              dateEcheance: { $gte: dateNow },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeReglements",
      },
    });
    pipeline.push({
      $set: {
        sommeRegelements: {
          $map: {
            input: "$sommeReglements",
            as: "i",
            in: {
              montant: { $sum: "$$i.montant" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        reglementEnCours: { $sum: "$sommeRegelements.montant" }, //{ $multiply: [{  }, -1] },
      },
    });

    pipeline.push({
      $set: {
        solde: {
          $cond: {
            if: { $gt: ["$soldeInitialDebit", 0] },
            then: {
              $add: [
                "$soldeInitialDebit",
                { $subtract: ["$vente", "$reglement"] },
              ],
            },
            else: {
              $add: [
                "$soldeInitialCredit",
                { $subtract: ["$vente", "$reglement"] },
              ],
            },
          },
        },
      },
    });
    pipeline.push({
      $lookup: {
        from: "typetiers",
        let: { typeTier: "$typeTiers" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$typeTier"] }],
              },
            },
          },
        ],
        as: "typetiers",
      },
    });
    pipeline.push({
      $set: {
        type: { $arrayElemAt: ["$typetiers.libelle", 0] },
      },
    });

    pipeline.push({
      $set: {
        enCours: "$reglementEnCours",
        sdebit: {
          $cond: {
            if: { $gte: ["$solde", 0] },
            then: "$solde",
            else: 0,
          },
        },
        impaye: {
          $add: [0, 0],
        },
        scredit: {
          $cond: {
            if: { $lte: ["$solde", 0] },
            then: { $multiply: ["$solde", -1] },
            else: 0,
          },
        },
        soldeEnCours: {
          $add: ["$solde", "$reglementEnCours"],
        },
        soldeImpaye: {
          $add: ["$solde", 0],
        },
        soldeGlobal: {
          $add: [{ $add: ["$solde", "$reglementEnCours"] }, 0],
        },
        typeTiers: "$type",
      },
    });

    pipeline.push({
      $project: {
        num: 1,
        code: 1,
        raisonSociale: 1,
        enCours: 1,
        sdebit: "$sdebit",
        impaye: "$impaye",
        scredit: "$scredit",
        soldeEnCours: "$soldeEnCours",
        soldeImpaye: "$soldeImpaye",
        soldeGlobal: "$soldeGlobal",
        delai: 1,
        typeTiers: "$typeTiers",
        nature: 1,
        telephone: 1,
      },
    });

    var search = req.body.search;

    for (let key in search) {
      console.log(key);
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

    const articles = await Client.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Client.aggregate(sommePipeline);

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
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/listReleveClient", async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var societeRacine = await getSocieteRacine(societe);

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
    if (ObjectId.isValid(req.body.typeTiers)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          typeTiers: ObjectId(req.body.typeTiers),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }
    if (ObjectId.isValid(req.body.client)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          _id: ObjectId(req.body.client),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }

    /*******************************Get TypeTiers */

    pipeline.push({
      $lookup: {
        from: "typetiers",
        let: { typeTier: "$typeTiers" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$typeTier"] }],
              },
            },
          },
        ],
        as: "typetiers",
      },
    });

    pipeline.push({
      $set: {
        type: { $arrayElemAt: ["$typetiers.libelle", 0] },
      },
    });

    /**************************** Somme de Bon Livraison pour solde Initiale */
    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              isTransfert: "non",
              date: { $lt: dateStart },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonLivraisons",
      },
    });
    pipeline.push({
      $set: {
        sommeBonLivraisons: {
          $map: {
            input: "$sommeBonLivraisons",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
              date: "$$i.date",
              isTransfert: "$$i.isTransfert",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_LIV: { $sum: "$sommeBonLivraisons.montant" },
      },
    });

    /**************************** Somme de Facture  pour solde Initiale */
    pipeline.push({
      $lookup: {
        from: "factureventes",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              date: { $lt: dateStart },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeFactures",
      },
    });
    pipeline.push({
      $set: {
        sommeFacturesVar: {
          $map: {
            input: "$sommeFactures",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        FACTURE: { $sum: "$sommeFacturesVar.montant" },
      },
    });
    /*****************************Somme de Bon Retour pour solde Initiale*/

    pipeline.push({
      $lookup: {
        from: "bonretourclients",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              date: { $lt: dateStart },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonRetours",
      },
    });
    pipeline.push({
      $set: {
        sommeBonRetours: {
          $map: {
            input: "$sommeBonRetours",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
              date: "$$i.date",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_RET: { $sum: "$sommeBonRetours.montant" },
      },
    });

    /**************************Calcul Chifffre Afffffaire(Somme des bonlivraison - sommes de bon retour) pour solde Initiale*/
    pipeline.push({
      $set: {
        chiffreAffaire: {
          $subtract: [{ $add: ["$B_LIV", "$FACTURE"] }, "$B_RET"],
        },
      },
    });

    /***********************************Somme de reglements pour solde Initiale*/

    pipeline.push({
      $lookup: {
        from: "reglements",
        let: { client: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              dateReglement: { $lt: dateStart },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeReglements",
      },
    });
    pipeline.push({
      $set: {
        sommeReglements: {
          $map: {
            input: "$sommeReglements",
            as: "i",
            in: {
              montant: { $sum: "$$i.montant" },
              dateReglement: "$$i.dateReglement",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_REG: { $sum: "$sommeReglements.montant" },
      },
    });

    /******************************************* calcul de Vente (chiffffre afffaire - somme de reeglement) pour solde Initiale*/

    pipeline.push({
      $set: {
        VENTE: { $subtract: ["$chiffreAffaire", "$B_REG"] },
      },
    });

    /*****************************Solde Initiale */

    pipeline.push({
      $set: {
        SoldeInitialeBalance: {
          $add: [
            { $subtract: ["$soldeInitialDebit", "$soldeInitialCredit"] },
            "$VENTE",
          ],
        },
      },
    });

    // pipeline.push({
    //   $set: {
    //     SoldeInitialeBalance: {
    //       $cond: {
    //         if: { $and:[{$gt:["$soldeInitialCredit", null]},{$gt:["$soldeInitialCredit", 0]}]}, //{$gt:["$soldeInitialCredit", null]},
    //         then: { $add: ["$VENTE", "$soldeInitialCredit"] },
    //         else: { $add: ["$VENTE", "$soldeInitialDebit"] },
    //       },
    //     },
    //   },
    // });

    // var rslt = await Client.aggregate(pipeline);
    // console.log(rslt);

    /**************************** Somme de Bon Livraison pour solde Periode */
    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              isTransfert: "non",
              date: { $gte: dateStart, $lte: dateEnd },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonLivraisonsPERIODE",
      },
    });
    pipeline.push({
      $set: {
        sommeBonLivraisonsPERIODE: {
          $map: {
            input: "$sommeBonLivraisonsPERIODE",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
              date: "$$i.date",
              isTransfert: "$$i.isTransfert",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_LIV_PERIODE: { $sum: "$sommeBonLivraisonsPERIODE.montant" },
      },
    });

    /***********************************Somme de reglements pour solde PERIODE*/

    pipeline.push({
      $lookup: {
        from: "reglements",
        let: { client: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              dateReglement: { $gte: dateStart, $lte: dateEnd },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeReglementsPERIODES",
      },
    });
    pipeline.push({
      $set: {
        sommeReglementsPeriode: {
          $map: {
            input: "$sommeReglementsPERIODES",
            as: "i",
            in: {
              montant: { $sum: "$$i.montant" },
              dateReglement: "$$i.dateReglement",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_REG_PERIODE: { $sum: "$sommeReglementsPeriode.montant" },
      },
    });
    /**************************** Somme de Facture  pour solde PERIODE */
    pipeline.push({
      $lookup: {
        from: "factureventes",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              date: { $gte: dateStart, $lte: dateEnd },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeFacturesPERIODE",
      },
    });
    pipeline.push({
      $set: {
        sommeFacturesVarPERIODE: {
          $map: {
            input: "$sommeFacturesPERIODE",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        FACTURE_PERIODE: { $sum: "$sommeFacturesVarPERIODE.montant" },
      },
    });

    /******************************SOMME BON RETOUR POUR PERIODE */
    pipeline.push({
      $lookup: {
        from: "bonretourclients",
        let: { client: "$_id" },
        pipeline: [
          {
            $match: {
              date: { $gte: dateStart, $lte: dateEnd },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonRetoursPERIODES",
      },
    });
    pipeline.push({
      $set: {
        sommeBonRetoursPeriode: {
          $map: {
            input: "$sommeBonRetoursPERIODES",
            as: "i",
            in: {
              montant: { $sum: "$$i.montantTotal" },
              date: "$$i.date",
            },
          },
        },
      },
    });
    pipeline.push({
      $set: {
        B_RET_PERIODE: { $sum: "$sommeBonRetoursPeriode.montant" },
      },
    });

    /**************************Calcul Chifffre Afffffaire(Somme des bonlivraison - sommes de bon retour) pour PERIODE*/
    pipeline.push({
      $set: {
        chiffreAffairePERIODE: {
          $subtract: [
            { $add: ["$B_LIV_PERIODE", "$FACTURE_PERIODE"] },
            "$B_RET_PERIODE",
          ],
        },
      },
    });

    /******************************************* calcul de Vente (chiffffre afffaire - somme de reeglement) pour solde PERIODE*/

    pipeline.push({
      $set: {
        VENTE_PERIODE: {
          $subtract: ["$chiffreAffairePERIODE", "$B_REG_PERIODE"],
        },
      },
    });

    /***********************************CALCUL SOLDE FINALE */
    pipeline.push({
      $set: {
        SOLDE_FINAL: { $add: ["$VENTE_PERIODE", "$SoldeInitialeBalance"] },
      },
    });

    /***********************************Data Return */

    pipeline.push({
      $project: {
        typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },
        code: "$code",
        raisonSociale: "$raisonSociale",
        telephone: "$telephone",
        soldeInitialDebit: {
          $cond: {
            if: { $gt: ["$SoldeInitialeBalance", 0] },
            then: { $abs: "$SoldeInitialeBalance" },
            else: 0,
          },
        },

        soldeInitialCredit: {
          $cond: {
            if: { $lt: ["$SoldeInitialeBalance", 0] },
            then: { $abs: "$SoldeInitialeBalance" },
            else: 0,
          },
        },

        sPeriodeD: {
          $cond: {
            if: { $gte: ["$VENTE_PERIODE", 0] },
            then: { $abs: "$VENTE_PERIODE" },
            else: 0,
          },
        },
        sPeriodeC: {
          $cond: {
            if: { $lt: ["$VENTE_PERIODE", 0] },
            then: { $abs: "$VENTE_PERIODE" },
            else: 0,
          },
        },

        sFinaleD: {
          $cond: {
            if: { $gt: ["$SOLDE_FINAL", 0] },
            then: { $abs: "$SOLDE_FINAL" },
            else: 0,
          },
        },
        sFinaleC: {
          $cond: {
            if: { $lt: ["$SOLDE_FINAL", 0] },
            then: { $abs: "$SOLDE_FINAL" },
            else: 0,
          },
        },

        //enCours: "$enCours",
        //impaye: "$impaye",
      },
    });

    var search = req.body.search;

    for (let key in search) {
      console.log(key);
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

    const articles = await Client.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Client.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }

    // var rslt = await Client.aggregate(pipeline)
    // res.send({rslt:rslt})

    const result = { docs: articles, pages: pages };
    return res.send({ status: true, resultat: result, request: req.body });
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/suiveDocumentClient", async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var societeRacine = await getSocieteRacine(societe);

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
    if (ObjectId.isValid(req.body.typeTiers)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          typeTiers: ObjectId(req.body.typeTiers),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }
    if (ObjectId.isValid(req.body.client)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          _id: ObjectId(req.body.client),
        },
      });
    } else {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
        },
      });
    }

    /*******************************Get TypeTiers */

    pipeline.push({
      $lookup: {
        from: "typetiers",
        let: { typeTier: "$typeTiers" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$typeTier"] }],
              },
            },
          },
        ],
        as: "typetiers",
      },
    });

    pipeline.push({
      $set: {
        type: { $arrayElemAt: ["$typetiers.libelle", 0] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: { client: "$_id" },
        pipeline: [
          {
            $set: {
              id: { $toString: "$_id" },
            },
          },
          {
            $lookup: {
              from: "bonretourclients",
              let: { bonlivraison: "$id" },
              pipeline: [
                {
                  $set: {
                    id: { $toString: "$_id" },
                  },
                },
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$transfertBonLivraison", "$$bonlivraison"] },
                      ],
                    },
                    date: { $gte: dateStart, $lte: dateEnd },
                  },
                },
                {
                  $lookup: {
                    from: "liltrages",
                    let: { doc: "$id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ["$document", "$$doc"] }],
                          },
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
                              $set: {
                                montant: "$montant",
                              },
                            },
                          ],
                          as: "reglements",
                        },
                      },
                    ],
                    as: "liltrages",
                  },
                },
                {
                  $set: {
                    reglement: {
                      $map: {
                        input: "$liltrages",
                        as: "i",
                        in: {
                          montant: { $sum: ["$$i.reglements.montant"] },
                        },
                      },
                    },
                  },
                },
                {
                  $set: {
                    sommeReglementsRET: { $sum: "$reglement.montant" },
                    sommeRet: "$montantTotal",
                  },
                },
              ],
              as: "lesBonRetoursDansLaBl",
            },
          },
          {
            $lookup: {
              from: "factureventes",
              let: { facture: "$factureVente" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$facture"] }],
                    },
                    date: { $gte: dateStart, $lte: dateEnd },
                  },
                },
              ],
              as: "lesFacturesDansLaBl",
            },
          },
          {
            $set: {
              facture: {
                $map: {
                  input: "$lesFacturesDansLaBl",
                  as: "i",
                  in: {
                    montant: { $sum: ["$$i.montantTotal"] },
                  },
                },
              },
            },
          },
          {
            $set: {
              sommeFactures: { $sum: "$facture.montant" },
            },
          },
          {
            $lookup: {
              from: "liltrages",
              let: { doc: "$id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$document", "$$doc"] }],
                    },
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
                        $set: {
                          montant: "$montant",
                        },
                      },
                    ],
                    as: "reglements",
                  },
                },
              ],
              as: "liltrages",
            },
          },
          {
            $set: {
              reglementBL: {
                $map: {
                  input: "$liltrages",
                  as: "i",
                  in: {
                    montant: { $sum: ["$$i.reglements.montant"] },
                  },
                },
              },
            },
          },
          {
            $set: {
              sommeReglementsBL: { $sum: "$reglementBL.montant" },
            },
          },
          {
            $set: {
              montantLittré: {
                $subtract: [
                  {
                    $add: [
                      "$sommeReglementsBL",
                      { $arrayElemAt: ["$lesBonRetoursDansLaBl.sommeRet", 0] },
                    ],
                  },
                  {
                    $arrayElemAt: [
                      "$lesBonRetoursDansLaBl.sommeReglementsRET",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          {
            $match: {
              isTransfert: "non",
              date: { $gte: dateStart, $lte: dateEnd },
              $expr: {
                $and: [{ $eq: ["$client", "$$client"] }],
              },
            },
          },
        ],
        as: "sommeBonLivraisonsPERIODE",
      },
    });

    pipeline.push({
      $set: {
        bonLivraison: {
          $map: {
            input: "$sommeBonLivraisonsPERIODE",
            as: "i",
            in: {
              numero: "$$i.numero",
              date: "$$i.date",
              retours: "$$i.lesBonRetoursDansLaBl",
              facture: "$$i.lesFacturesDansLaBl",
              reglement: "$$i.regBL_regRET",
              montantBL: "$$i.montantTotal",
              montantLittré: "$$i.montantLittré",
              montantNonLittré: {
                $subtract: ["$$i.montantTotal", "$$i.montantLittré"],
              },
            },
          },
        },
      },
    });
    pipeline.push({
      $project: {
        date: "$bonLivraison.date",
        num: "$bonLivraison.numero",
        typeTiers: "$type",
        code: "$code",
        raisonSociale: "$raisonSociale",
        montant: "$bonLivraison.montantBL",

        montantLettre: "$bonLivraison.montantLittré",
        montantNonLettre: "$bonLivraison.montantNonLittré",
      },
    });
    // var rslt = await Client.aggregate(pipeline);
    // res.send({ rslt: rslt });

    var search = req.body.search;

    for (let key in search) {
      console.log(key);
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

    const articles = await Client.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Client.aggregate(sommePipeline);

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
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
});

router.post("/suiveDocumentBonLivraison", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var societeRacine = await getSocieteRacine(societe);

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
      $lookup: {
        from: "clients",
        let: {
          client: "$client",
          bonLivraison: "$_id",
          facture: "$factureVente",
          montantBl: "$montantTotal",
          numBL: "$numero",
          dateBL: "$date",
        },
        pipeline: [
          {
            $lookup: {
              from: "bonretourclients",
              let: { bonlivraison: { $toString: "$$bonLivraison" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$transfertBonLivraison", "$$bonlivraison"] },
                      ],
                    },
                    date: { $gte: dateStart, $lte: dateEnd },
                  },
                },
                {
                  $set: {
                    id: { $toString: "$_id" },
                  },
                },
                {
                  $lookup: {
                    from: "liltrages",
                    let: { doc: "$id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ["$document", "$$doc"] }],
                          },
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
                              $set: {
                                montant: "$montant",
                              },
                            },
                          ],
                          as: "reglements",
                        },
                      },
                    ],
                    as: "liltrages",
                  },
                },
                {
                  $set: {
                    reglement: {
                      $map: {
                        input: "$liltrages",
                        as: "i",
                        in: {
                          montant: { $sum: ["$$i.reglements.montant"] },
                        },
                      },
                    },
                  },
                },
                {
                  $set: {
                    sommeReglementsRETOUR: { $sum: "$reglement.montant" },
                    montantTotalBonRetour: "$montantTotal",
                  },
                },
              ],
              as: "lesBonRetoursDansLaBl",
            },
          },
          {
            $lookup: {
              from: "factureventes",
              let: { facture: "$$facture" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$facture"] }],
                    },
                    date: { $gte: dateStart, $lte: dateEnd },
                  },
                },
              ],
              as: "lesFacturesDansLaBl",
            },
          },
          {
            $set: {
              facture: {
                $map: {
                  input: "$lesFacturesDansLaBl",
                  as: "i",
                  in: {
                    montant: { $sum: ["$$i.montantTotal"] },
                  },
                },
              },
            },
          },
          {
            $set: {
              sommeFactures: { $sum: "$facture.montant" },
            },
          },
          {
            $lookup: {
              from: "liltrages",
              let: { bonlivraison: { $toString: "$$bonLivraison" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$document", "$$bonlivraison"] }],
                    },
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
                          from: "situationreglements",
                          let: { situationReg: "$situationReglement" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [{ $eq: ["$_id", "$$situationReg"] }],
                                },
                              },
                            },
                          ],
                          as: "situations",
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
                            {
                              $set:{
                                modeReglement:"$libelle"
                              }
                            }
                          ],
                          as: "modeReglement",
                        },
                      },
                      {
                        $project: {
                          montant: "$montant",
                          date: {
                            $dateToString: {
                              format: "%d/%m/%Y",
                              date: "$dateReglement",
                            },
                          },
                          type: "$typeReglement",
                          num: "$numero",
                          typeSituation: {
                            $arrayElemAt: ["$situations.type", 0],
                          },
                          situationReglement: {
                            $arrayElemAt: ["$situations.libelle", 0],
                          },
                          modeReglement: {
                            $arrayElemAt: ["$modeReglement.modeReglement", 0],
                          },
                          numCheque: "$numCheque",
                          dateEcheance: {
                            $dateToString: {
                              format: "%d/%m/%Y",
                              date: "$dateEcheance",
                            },
                          },
                        },
                      },
                    ],
                    as: "reglements",
                  },
                },
                {
                  $project: {
                    montant: { $arrayElemAt: ["$reglements.montant", 0] },
                    date: { $arrayElemAt: ["$reglements.date", 0] },
                    type: { $arrayElemAt: ["$reglements.type", 0] },
                    num: { $arrayElemAt: ["$reglements.num", 0] },
                    modeReglement: {
                      $arrayElemAt: ["$reglements.modeReglement", 0],
                    },
                    typeSituation: {
                      $arrayElemAt: ["$reglements.typeSituation", 0],
                    },
                    situationReglement: {
                      $arrayElemAt: ["$reglements.situationReglement", 0],
                    },
                    numCheque: { $arrayElemAt: ["$reglements.numCheque", 0] },
                    dateEcheance: {
                      $arrayElemAt: ["$reglements.dateEcheance", 0],
                    },
                  },
                },
              ],
              as: "liltrages",
            },
          },
          {
            $set: {
              sommeReglementsBL: { $sum: ["$liltrages.montant"] },
            },
          },
          {
            $lookup: {
              from: "typetiers",
              let: { typeTier: "$typeTiers" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$typeTier"] }],
                    },
                  },
                },
              ],
              as: "typetiers",
            },
          },
          {
            $set: {
              type: { $arrayElemAt: ["$typetiers.libelle", 0] },
              idTypeTiers: { $arrayElemAt: ["$typetiers._id", 0] },
            },
          },
          {
            $set: {
              // dateBL: {
              //   $dateToString: {
              //     format: "%d/%m/%Y",
              //     date: "",
              //   },
              // },
              dateBL: "$$dateBL",
              numBL: "$$numBL",
              codeSET: "$code",
              raisonSocialeSET: "$raisonSociale",
              montantBl: "$$montantBl",
              sommeReglementRetour: {
                $arrayElemAt: [
                  "$lesBonRetoursDansLaBl.sommeReglementsRETOUR",
                  0,
                ],
              },
              montantBonretour: {
                $arrayElemAt: [
                  "$lesBonRetoursDansLaBl.montantTotalBonRetour",
                  0,
                ],
              },
            },
          },
          {
            $set: {
              montantLittré: {
                $subtract: [
                  { $add: ["$sommeReglementsBL", "$montantBonretour"] },
                  "$sommeReglementRetour",
                ],
              },
            },
          },
          {
            $set: {
              montantNonLittré: {
                $subtract: ["$$montantBl", "$montantLittré"],
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$client"] }],
              },
            },
          },
          {
            $set: {
              idClient: "$_id",
            },
          },
        ],
        as: "BonLivraisonsPERIODE",
      },
    });
    // var rslt = await BonLivraison.aggregate(pipeline);
    // res.send({ rslt: rslt });
    pipeline.push({
      $set:{
        tabtest:{
          $concatArrays:["$BonLivraisonsPERIODE.lesBonRetoursDansLaBl","$BonLivraisonsPERIODE.liltrages"]
        }
      }
    })
    pipeline.push({
      $set: {
        isExpanded: false,
      },
    });
    pipeline.push({
      $project: {
        idTypeTiers: { $arrayElemAt: ["$BonLivraisonsPERIODE.idTypeTiers", 0] },
        idClient: { $arrayElemAt: ["$BonLivraisonsPERIODE.idClient", 0] },
        date: { $arrayElemAt: ["$BonLivraisonsPERIODE.dateBL", 0] },
        type: "Bon Livraison",
        // reglementTab: {
        //   $arrayElemAt: ["$BonLivraisonsPERIODE.liltrages", 0],
        // },
        reglementTab:"$tabtest",
        num: { $arrayElemAt: ["$BonLivraisonsPERIODE.numBL", 0] },
        typeTiers: { $arrayElemAt: ["$BonLivraisonsPERIODE.type", 0] },
        code: { $arrayElemAt: ["$BonLivraisonsPERIODE.codeSET", 0] },

        raisonSociale: {
          $arrayElemAt: ["$BonLivraisonsPERIODE.raisonSocialeSET", 0],
        },
        montant: { $arrayElemAt: ["$BonLivraisonsPERIODE.montantBl", 0] },

        montantLettre: {
          $arrayElemAt: ["$BonLivraisonsPERIODE.montantLittré", 0],
        },
        montantNonLettre: {
          $arrayElemAt: ["$BonLivraisonsPERIODE.montantNonLittré", 0],
        },
        isExpanded: "$isExpanded",
      },
    });

    if (ObjectId.isValid(req.body.client)) {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
          idClient: ObjectId(req.body.client),
        },
      });
    } else {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
        },
      });
    }
    if (ObjectId.isValid(req.body.typeTiers)) {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
          idTypeTiers: ObjectId(req.body.typeTiers),
        },
      });
    } else {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
        },
      });
    }

    var search = req.body.search;

    for (let key in search) {
      console.log(key);
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

    var nbrTotal = await BonLivraison.aggregate(sommePipeline);

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
  } catch (error) {
    console.log(error);
    res.send({ error });
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
    res.sendStatus(401);
  }
}

module.exports.routerClient = router;
