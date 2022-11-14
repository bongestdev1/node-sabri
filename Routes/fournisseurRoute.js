const {
  Fournisseur,
  getNumeroAutomatique,
  validateFournisseur,
  validateCodeRaisonSocialeMatriculeFiscale,
  validateCodeRaisonSocialeMatriculeFiscaleModifier,
  calculeEnCours,
} = require("../Models/fournisseurModel");
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
  Reglement,
  calculerSoldeFournisseur,
} = require("../Models/reglementModel");
const { BonLivraison } = require("../Models/bonLivraisonModel");
const { BonRetourClient } = require("../Models/bonRetourClientModel");

const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");
const { isValidObjectId } = require("mongoose");
const { consolelog } = require("../Models/errorModel");
var ObjectId = require("mongodb").ObjectID;

/**
 * @swagger
 * components:
 *   schemas:
 *     Fournisseur:
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
 *        - credit
 *        - fax
 *        - statusProspection
 *        - modeReglement
 *        - secteur
 *        - paysFacturation
 *        - gouvernoratFacturation
 *        - delegationFacturation
 *        - localiteFacturation
 *        - codePostaleFacturation
 *        - adresseFacturation
 *        - paysLivraison
 *        - gouvernoratLivraison
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
 *         num:
 *           type:Number
 *         code:
 *           type: string
 *         raisonSociale:
 *           type: string
 *         matriculeFiscale:
 *           type: string
 *         classement:
 *           type: string
 *         plafondCredit:
 *           type: string
 *         mobiles:
 *           type: string
 *         siteWeb:
 *           type: string
 *         conditionReglement:
 *           type: string
 *         typeTiers:
 *           type: string
 *         credit:
 *           type: string
 *         fax:
 *           type: string
 *         statusProspection:
 *           type: string
 *         modeReglement:
 *           type: string
 *         secteur:
 *           type: string
 *         paysFacturation:
 *           type: string
 *         gouvernoratFacturation:
 *           type: string
 *         delegationFacturation:
 *           type: string
 *         localiteFacturation:
 *           type: string
 *         codePostaleFacturation:
 *           type: string
 *         adresseFacturation:
 *           type: string
 *         paysLivraison:
 *           type: string
 *         gouvernoratLivraison:
 *           type: string
 *         delegationLivraison:
 *           type: string
 *         localiteLivraison:
 *           type: string
 *         codePostaleLivraison:
 *           type: string
 *         adresseLivraison:
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
 *   name: Fournisseurs
 *   description: The fournisseurs managing API
 */

/**
 * @swagger
 * /fournisseurs/newFournisseur:
 *   post:
 *     summary: Returns the list of all the fournisseurs
 *     tags: [Fournisseurs]
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
 *                 type: string
 *               mobiles:
 *                 type: string
 *               siteWeb:
 *                 type: string
 *               conditionReglement:
 *                 type: string
 *               typeTiers:
 *                 type: string
 *               credit:
 *                 type: string
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
 *         description: The Fournisseur was deleted
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
 *                         type: string
 *                       mobiles:
 *                         type: string
 *                       siteWeb:
 *                         type: string
 *                       conditionReglement:
 *                         type: string
 *                       typeTiers:
 *                         type: string
 *                       credit:
 *                         type: string
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
 *         description: The Fournisseur was not found
 *       500:
 *         description: Some error happened
 */

router.post("/newFournisseur", verifytoken, async (req, res) => {
  try {
    /*const {error}=validateFournisseur(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
    */

    var tabIntegers = ["secteur", "modeReglement", "typeTiers"];
    for (let i = 0; i < tabIntegers.length; i++) {
      if (!isValidObjectId(req.body[tabIntegers[i]])) {
        req.body[tabIntegers[i]] = null;
      }
    }

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

    body.credit = body.soldeInitialCredit - body.soldeInitialDebit;

    const fournisseur = new Fournisseur(body);

    const result = await fournisseur.save();

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
 * /fournisseurs/modifierFournisseur/{id}:
 *   post:
 *     summary: Remove the fournisseur by id
 *     tags: [Fournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The fournisseur id
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
 *                 type: string
 *               mobiles:
 *                 type: string
 *               siteWeb:
 *                 type: string
 *               conditionReglement:
 *                 type: string
 *               typeTiers:
 *                 type: string
 *               credit:
 *                 type: string
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
 *         description: The Fournisseur is updated
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
 *                         type: string
 *                       mobiles:
 *                         type: string
 *                       siteWeb:
 *                         type: string
 *                       conditionReglement:
 *                         type: string
 *                       typeTiers:
 *                         type: string
 *                       credit:
 *                         type: string
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
 *         description: The Fournisseur was not found
 *       500:
 *         description: Some error happened
 */

router.post("/modifierFournisseur/:id", verifytoken, async (req, res) => {
  try {
    /*const {error}=validateFournisseur(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
    */
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    if (req.params.id) {
      console.log(req.params.id);
    }

    var tabIntegers = ["secteur", "modeReglement", "typeTiers"];
    for (let i = 0; i < tabIntegers.length; i++) {
      if (!isValidObjectId(req.body[tabIntegers[i]])) {
        req.body[tabIntegers[i]] = null;
      }
    }

    const fournisseur = await Fournisseur.findById(req.params.id);

    if (!fournisseur) return res.status(401).send({ status: false });

    var body = req.body;

    body.societeRacine = fournisseur.societeRacine;
    //body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    var messageErreur = await validateCodeRaisonSocialeMatriculeFiscaleModifier(
      body,
      body.societeRacine,
      fournisseur.id
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

    var credit = Number(
      fournisseur.credit +
        fournisseur.soldeInitialDebit -
        fournisseur.soldeInitialCredit -
        req.body.soldeInitialDebit +
        req.body.soldeInitialCredit
    );

    body.credit = credit;

    const result = await Fournisseur.findOneAndUpdate(
      { _id: req.params.id },
      body
    );

    const fournisseur2 = await Fournisseur.findById(req.params.id);

    return res.send({ status: true, resultat: fournisseur2 });
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
 * /fournisseurs/listFournisseurs:
 *   post:
 *     summary: Returns the list of all the fournisseurs
 *     tags: [Fournisseurs]
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
 *         description: The list of the fournisseurs
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
 *                              type: string
 *                            mobiles:
 *                              type: string
 *                            siteWeb:
 *                              type: string
 *                            conditionReglement:
 *                              type: string
 *                            typeTiers:
 *                              type: string
 *                            credit:
 *                              type: string
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
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 */
router.post("/listFournisseurs", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));

    if (req.body.limit == 0) {
      var clients = await Fournisseur.find({ societeRacine: societeRacine });
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
      $set: {
        secteur: { $arrayElemAt: ["$secteur.typeS", 0] },
        modeReglement: { $arrayElemAt: ["$modereglements.libelle", 0] },
        typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },

        plafondCredit: { $toString: "$plafondCredit" },
        credit: { $toString: "$credit" },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        email: 1,
        telephone: 1,
        code: 1,
        raisonSociale: 1,
        matriculeFiscale: 1,
        classement: 1,
        mobiles: 1,
        siteWeb: 1,
        conditionReglement: 1,
        typeTiers: 1,
        credit: 1,
        plafondCredit: 1,
        fax: 1,
        statusProspection: 1,
        modeReglement: 1,
        secteur: 1,

        paysFacturation: 1,
        gouvernoratFacturation: 1,
        delegationFacturation: 1,
        localiteFacturation: 1,
        codePostaleFacturation: 1,
        adresseFacturation: 1,

        paysLivraison: 1,
        gouvernoratLivraison: 1,
        delegationLivraison: 1,
        localiteLivraison: 1,
        codePostaleLivraison: 1,
        adresseLivraison: 1,
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

    const articles = await Fournisseur.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Fournisseur.aggregate(sommePipeline);

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
 * /fournisseurs/deleteFournisseur/{id}:
 *   post:
 *     summary: Remove the fournisseur by id
 *     tags: [Fournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The fournisseur id
 *
 *     responses:
 *       200:
 *         description: The fournisseur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The fournisseur was not found
 *       500:
 *         description: Some error happened
 */

router.post("/deleteFournisseur/:id", verifytoken, async (req, res) => {
  //if(req.user.user.role != "admin") return res.status(401).send({status:false})
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);

    if (!fournisseur) return res.status(401).send({ status: false });

    if (await Fournisseur.findOneAndDelete({ _id: req.params.id })) {
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

/**
 * @swagger
 * /fournisseurs/getAllParametres:
 *   get:
 *     summary:
 *     tags: [Fournisseurs]
 *
 *     responses:
 *       200:
 *         description: The Fournisseur was deleted
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

    const clients = await Fournisseur.find({
      societeRacine: societeRacine,
    }).select({ id: 1, code: 1, raisonSociale: 1, matriculeFiscale: 1 });
    const conditionReglements = await ConditionReglement.find({
      societeRacine: societeRacine,
    });

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
 * /fournisseurs/getById/{id}:
 *   get:
 *     summary: Remove the fournisseur by id
 *     tags: [Fournisseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The fournisseur id
 *
 *     responses:
 *       200:
 *         description: The fournisseur was deleted
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
 *                       type: string
 *                     mobiles:
 *                       type: string
 *                     siteWeb:
 *                       type: string
 *                     conditionReglement:
 *                       type: string
 *                     typeTiers:
 *                       type: string
 *                     credit:
 *                       type: string
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
 *         description: The Fournisseur was not found
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

    const client = await Fournisseur.findOne({ _id: req.params.id });

    return res.send({ status: true, resultat: client });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.get("/getEmails/:id", verifytoken, async (req, res) => {
  try {
    if (
      req.params.id == undefined ||
      req.params.id == null ||
      req.params.id == ""
    )
      return res.status(400).send({ status: false });

    const client = await Fournisseur.findOne({ _id: req.params.id });

    emails = [];
    if (client.email.indexOf("@") > -1) {
      emails.push({ email: client.email, nomPrenom: client.raisonSociale });
    }

    for (let i = 0; i < client.contacts.length; i++) {
      if (client.contacts[i].email.indexOf("@") > -1) {
        emails.push({
          email: client.contacts[i].email,
          nomPrenom: client.contacts[i].nomPrenom,
        });
      }
    }

    return res.send({ status: true, emails: emails, fournisseur: client });
  } catch (e) {
    consolelog(e) 
    
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

      const client = await Fournisseur.findOne({ _id: req.params.id })
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
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

router.post("/classementFournisseur", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var societeRacine = await getSocieteRacine(req.body.societe);

    let fournisseurs = [];
    if (req.body.fournisseur != "") {
      var fournisseur = ObjectId(req.body.fournisseur);

      let fournisseurById = await Fournisseur.findById({ _id: fournisseur })
        .populate("typeTiers")
        .populate("modeReglement");

      fournisseurs.push(fournisseurById);
    } else {
      fournisseurs = await Fournisseur.find({ societeRacine: societeRacine })
        .populate("typeTiers")
        .populate("modeReglement");
    }

    console.log(this.fournisseurs);

    let listGL = [];
    for (let item of fournisseurs) {
      let type = "";
      let tab;
      if (item.typeTiers != null) {
        type = item.typeTiers.libelle;
      }

      const reglements = await Reglement.find({
        fournisseur: item.id,
        dateReglement: { $gte: dateStart, $lte: dateEnd },
      })
        .populate("modeReglement")
        .populate("situationReglement");
      const bonLivraisons = await BonLivraison.find({
        fournisseur: item.id,
        dateReglement: { $gte: dateStart, $lte: dateEnd },
      }).select({ montantTotal: 1 });
      const bonRetourClient = await BonRetourClient.find({
        fournisseur: item.id,
        dateReglement: { $gte: dateStart, $lte: dateEnd },
      }).select({ montantTotal: 1 });

      var solde = 0;
      for (let i = 0; i < reglements.length; i++) {
        if (reglements[i].typeReglement === "bonLivraison") {
          solde -= reglements[i].montant;
        } else {
          solde += reglements[i].montant;
        }
      }

      for (let i = 0; i < bonLivraisons.length; i++) {
        solde += bonLivraisons[i].montantTotal;
      }

      for (let i = 0; i < bonRetourClient.length; i++) {
        solde -= bonRetourClient[i].montantTotal;
      }

      solde = await calculerSoldeFournisseur(dateStart, dateEnd, item.id);

      tab = calculeEnCours(reglements, item.modeReglement);

      listGL.push({
        codeFournisseur: item.code,
        raisonSociale: item.raisonSociale,
        solde: solde,
        enCours: tab[0].montant,
        impaye: tab[0].impaye,
        scredit: item.credit < 0 ? item.credit : 0,
        sdebit: item.credit > 0 ? item.credit : 0,
        delai: item.conditionReglement,
        typeTiers: type,
        nature: item.classement,
        soldeEnCours: item.credit + tab[0].montant,
        soldeImpaye: item.credit + tab[0].impaye,
        soldeGlobal: item.credit + tab[0].impaye + tab[0].montant,
        telephone: item.mobiles,
      });
    }

    return res.send({ status: true, listGL: listGL });
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/classement", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);

    var societeRacine = await getSocieteRacine(societe);

    var pipeFournisseur = [];

    var pipeSolde = [];

    if (ObjectId.isValid(req.body.fournisseur)) {
      pipeSolde.push({
        $facet: {
          montantReglementAchats: [
            {
              $match: {
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      client: req.body.fournisseur,
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonAchat",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      client: req.body.fournisseur,
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonRetourFournisseur",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonreceptions",
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      fournisseur: ObjectId(req.body.fournisseur),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourfournisseurs",
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      fournisseur: ObjectId(req.body.fournisseur),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                as: "bonRetourFournisseur",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourFournisseur",
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
                fournisseur: "$code",
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
          fournisseur: "$items.fournisseur",
          nom: "$items.nom",
          credit: "$items.credit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          enCours: "$items.enCours",
          impaye: "$items.impaye",
        },
      });

      pipeSolde.push({
        $group: {
          _id: "$_id",
          numero: { $first: "$numero" },
          fournisseur: { $first: "$fournisseur" },
          nom: { $first: "$nom" },
          credit: { $first: "$credit" },
          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
          enCours: { $first: "$enCours" },
          impaye: { $first: "$impaye" },
          solde: { $sum: "$somme" },
        },
      });

      var result = await Fournisseur.aggregate(pipeSolde);
      console.log("result>>>>>>>>>", result);
      return res.send({ status: true, listGL: result });
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
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonAchat",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateReglement: { $gte: dateStart, $lte: dateEnd },
                      typeReglement: "bonRetourFournisseur",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                from: "bonreceptions",
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                as: "bonRetourFournisseur",
              },
            },
            {
              $set: {
                retours: {
                  $map: {
                    input: "$bonRetourFournisseur",
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
                fournisseur: "$code",
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
          fournisseur: "$items.fournisseur",
          nom: "$items.nom",
          credit: "$items.credit",
          delai: "$items.delai",
          nature: "$items.nature",
          telephone: "$items.telephone",
          somme: "$items.somme",
          enCours: "$items.enCours",
          impaye: "$items.impaye",
        },
      });

      pipeSolde.push({
        $group: {
          _id: "$_id",
          numero: { $first: "$numero" },
          fournisseur: { $first: "$fournisseur" },
          nom: { $first: "$nom" },
          credit: { $first: "$credit" },
          delai: { $first: "$delai" },
          nature: { $first: "$nature" },
          telephone: { $first: "$telephone" },
          enCours: { $first: "$enCours" },
          impaye: { $first: "$impaye" },
          solde: { $sum: "$somme" },
        },
      });

      var result = await Fournisseur.aggregate(pipeSolde);
      console.log("result>>>>>>>>>", result);
      return res.send({ status: true, listGL: result });
    }
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/ClassementFour", verifytoken, async (req, res) => {
  try {
    console.log(req.body);
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var dateNow= new Date()

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

    if (ObjectId.isValid(req.body.fournisseur)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          _id: ObjectId(req.body.fournisseur),
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
        from: "bonreceptions",
        let: { fournisseur: "$_id" },
        pipeline: [
          {
            $match: {
              isTransfert : "non",
              $expr: {
                $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
        from: "factureachats",
        let: { fournisseur: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
        SUM_RECP_FACT: { $add: ["$FACTURE","$B_RECP" ] }, //{ $multiply: [{  }, -1] },
      },
    });



    pipeline.push({
      $lookup: {
        from: "bonretourfournisseurs",
        let: { fournisseur: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
              },
            },
          },
        ],
        as: "sommeBonRetourFournisseurs",
      },
    });
    pipeline.push({
      $set: {
        sommeBonRetourFournisseur: {
          $map: {
            input: "$sommeBonRetourFournisseurs",
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
        B_RETOUR: { $sum: "$sommeBonRetourFournisseur.montant" }, //{ $multiply: [{  }, -1] },
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
        let: { fournisseur: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              // dateEcheance: { $gte: dateNow },
              $expr: {
                $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
        let: { fournisseur: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
             dateEcheance: { $gte: dateNow },
              $expr: {
                $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
            then: {$add:["$soldeInitialDebit",{$subtract: ["$vente", "$reglement"] }]},
            else: {$add:["$soldeInitialCredit",{$subtract: ["$vente", "$reglement"] }]},
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
    })
    pipeline.push({
      $set:{
        type : {$arrayElemAt:["$typetiers.libelle",0]}
      }
    })
    
    pipeline.push({
      $set: {
          enCours: "$reglementEnCours",
          sdebit: {
            $cond: {
              if: { $lte: ["$solde", 0] },
              then: {$multiply:["$solde",-1]},
              else: 0,
            },
          },
          impaye:{
            $add:[0,0]
          },
          scredit: {
            $cond: {
              if: { $gte: ["$solde", 0] },
              then: "$solde",
              else: 0,
            },
          },
          soldeEnCours: {          
            $add: ["$solde", "$reglementEnCours"]    
          },
          soldeImpaye:{
            $add:["$solde", 0]
          },
          soldeGlobal:{
            $add:[{$add:["$solde", "$reglementEnCours"]},0]
          }, 
          typeTiers:"$type"       
      },
    });

    pipeline.push({
      $project:{
        num: 1,
        code: 1,
        raisonSociale: 1,
        enCours: 1,
        sdebit: "$sdebit",
        impaye:"$impaye",
        scredit: "$scredit",
        soldeEnCours: "$soldeEnCours",
        soldeImpaye:"$soldeImpaye",
        soldeGlobal:"$soldeGlobal",
        delai: 1,
        typeTiers: "$typeTiers",
        nature: 1,
        telephone:1,
      }
    })
    
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

    const articles = await Fournisseur.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Fournisseur.aggregate(sommePipeline);

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

router.post("/classementFournisseurTable", verifytoken, async (req, res) => {
  try {
    console.log(req.body);
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
    if (ObjectId.isValid(req.body.fournisseur)) {
      pipe.push({
        $facet: {
          sommeAchats: [
            {
              $match: {
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonlivraisons",
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      fournisseur: ObjectId(req.body.fournisseur),
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                _id: ObjectId(req.body.fournisseur),

                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "bonretourclients",
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      fournisseur: ObjectId(req.body.fournisseur),

                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
                _id: ObjectId(req.body.fournisseur),
                societeRacine: ObjectId(societeRacine),
              },
            },
            {
              $lookup: {
                from: "reglements",
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateEcheance: { $gte: dateNow },
                      //modeReglement : encours=true
                      //typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                fournisseur: "$code",
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
          fournisseur: "$items.fournisseur",
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
          codeFournisseur: { $first: "$fournisseur" },
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
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                let: { fournisseur: "$_id" },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      date: { $gte: dateStart, $lte: dateEnd },
                      $expr: {
                        $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                let: { fournisseur: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      societe: ObjectId(societeRacine),
                      dateEcheance: { $gte: dateNow },
                      //modeReglement : encours=true
                      //typeReglement: "bonLivraison",
                      $expr: {
                        $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
          fournisseur: "$items.client",
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
          codeFournisseur: { $first: "$fournisseur" },
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
      var rslt = await Fournisseur.aggregate(pipe);
      res.send({ status: true, listGL: rslt });
    }
  } catch (error) {
    console.log(error);
    return res.send({ status: "false" });
  }
});

router.post("/listReleveFournisseur", verifytoken, async (req, res) => {
  try {
    console.log(req.body);
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.societe);
    var dateNow= new Date()

    var societeRacine = await getSocieteRacine(societe);

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { code:1 };
    }

    var pipeline = [];

    if (ObjectId.isValid(req.body.fournisseur)) {
      pipeline.push({
        $match: {
          societeRacine: ObjectId(societeRacine),
          _id: ObjectId(req.body.fournisseur),
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
            from: "bonreceptions",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  isTransfert: "non",
                  date: { $lt: dateStart },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
            from: "factureachats",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  date: { $lt: dateStart },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
            from: "bonretourfournisseurs",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  date: { $lt: dateStart },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
            let: { fournisseur: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  dateReglement: { $lt: dateStart },
                  typeReglement:"bonAchat",
                  $expr: {
                    $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
          $lookup: {
            from: "reglements",
            let: { fournisseur: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  typeReglement:"bonRetourFournisseur",
                  dateReglement: { $lt: dateStart },
                  $expr: {
                    $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
            B_REG_Retour: { $sum: "$sommeReglements.montant" },
          },
        });
        pipeline.push({
          $set: {
            VENTE: { $add:[{$subtract: ["$chiffreAffaire", "$B_REG"]},"$B_REG_Retour"] },
          },
        });
    
        /*****************************Solde Initiale */
    
        pipeline.push({
          $set: {
            SoldeInitialeBalance: {
              $add: [
                { $subtract: ["$soldeInitialCredit", "$soldeInitialDebit"] },
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
            from: "bonreceptions",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  isTransfert: "non",
                  date: { $gte: dateStart, $lte: dateEnd },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
                  num:"$$i.numero",
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
            let: { fournisseur: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  dateReglement: { $gte: dateStart, $lte: dateEnd },
                  typeReglement:"bonAchat",
                  $expr: {
                    $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
                  num:"$$i.numero",
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
            from: "factureachats",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  date: { $gte: dateStart, $lte: dateEnd },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
            from: "bonretourfournisseurs",
            let: { fournisseur: "$_id" },
            pipeline: [
              {
                $match: {
                  date: { $gte: dateStart, $lte: dateEnd },
                  $expr: {
                    $and: [{ $eq: ["$fournisseur", "$$fournisseur"] }],
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
        // pipeline.push({
        //   $set: {
        //     chiffreAffairePERIODE: {
        //       $subtract: [
        //         { $add: ["$B_LIV_PERIODE", "$FACTURE_PERIODE"] },
        //         "$B_RET_PERIODE",
        //       ],
        //     },
        //   },
        // });
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
          $lookup: {
            from: "reglements",
            let: { fournisseur: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  typeReglement:"bonRetourFournisseur",                  
                  date: { $gte: dateStart, $lte: dateEnd },
                  $expr: {
                    $and: [{ $eq: ["$client", "$$fournisseur"] }],
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
            B_REG_Retour_PERIODE: { $sum: "$sommeReglements.montant" },
          },
        });
        
        pipeline.push({
          $set: {
            VENTE_PERIODE: { $add:[{$subtract: ["$chiffreAffairePERIODE", "$B_REG_PERIODE"]},"$B_REG_Retour_PERIODE"] }
          },
        });
    
        /***********************************CALCUL SOLDE FINALE */
        pipeline.push({
          $set: {
            SOLDE_FINAL: { $add: ["$VENTE_PERIODE", "$SoldeInitialeBalance"] },
          },
        });
    
        // var data = await Fournisseur.aggregate(pipeline)
        // res.send({data:data})
        /***********************************Data Return */
  
        
        pipeline.push({
          $project: {
            typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },
            code: "$code",
            raisonSociale: "$raisonSociale",
            telephone: "$telephone",
            soldeInitialDebit: {
              $cond: {
                if: { $lt: ["$SoldeInitialeBalance", 0] },
                then: { $abs: "$SoldeInitialeBalance" },
                else: 0,
              },
            },
    
            soldeInitialCredit: {
              $cond: {
                if: { $gt: ["$SoldeInitialeBalance", 0] },
                then: { $abs: "$SoldeInitialeBalance" },
                else: 0,
              },
            },
    
            sPeriodeD: {
              $cond: {
                if: { $lt: ["$VENTE_PERIODE", 0] },
                then: {$abs:"$VENTE_PERIODE"},
                else: 0,
              },
            },
            sPeriodeC: {
              $cond: {
                if: { $gte: ["$VENTE_PERIODE", 0] },
                then: {$abs:"$VENTE_PERIODE"},
                else: 0,
              },
            },
    
            sFinaleD: {
              $cond: {
                if: { $lt: ["$SOLDE_FINAL", 0] },
                then: {$abs:"$SOLDE_FINAL"},
                else: 0,
              },
            },
            sFinaleC: {
              $cond: {
                if: { $gt: ["$SOLDE_FINAL", 0] },
                then: {$abs:"$SOLDE_FINAL"},
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

    const articles = await Fournisseur.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await Fournisseur.aggregate(sommePipeline);

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

module.exports.routerFournisseur = router;
