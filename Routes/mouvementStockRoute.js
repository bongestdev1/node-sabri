const {
  MouvementStock,
  rechercheIndice,
  findByArticle,
  regrouperArticles,
  filter,
} = require("../Models/mouvementStockModel");
const {TypeTier, validateTypeTier, getNumeroAutomatiqueTypeTier} =require('../Models/typeTierModel')

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var multer = require("multer");
const fs = require("fs");

var dateFormat = require("dateformat");
const { User, validateDownloadData } = require("../Models/userModel");
const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");
const { BonAchat } = require("../Models/bonAchatModel");
const { BonTransfert } = require("../Models/bonTransfertModel");
const { Article } = require("../Models/articleModel");
const { ArticleSociete } = require("../Models/articleSocieteModel");
const { BonLivraison } = require("../Models/bonLivraisonModel");
const { BonLivraisonArticle } = require("../Models/bonLivraisonArticleModel");
const {
  BonRetourFournisseurArticle,
} = require("../Models/bonRetourFournisseurArticleModel");
const { BonRetourClient } = require("../Models/bonRetourClientModel");
const { BonRetourFournisseur } = require("../Models/bonRetourFournisseurModel");
const { BonCasse } = require("../Models/bonCasseModel");
const { BonCasseArticle } = require("../Models/bonCasseArticleModel");
const { BonAchatArticle } = require("../Models/bonAchatArticleModel");
const { Fournisseur } = require("../Models/fournisseurModel");
const { Client } = require("../Models/clientModel");
const {
  BonRetourClientArticle,
} = require("../Models/bonRetourClientArticleModel");
const { BonTransfertArticle } = require("../Models/bonTransfertArticleModel");
const { Parametres } = require("../Models/parametresModel");
const { FactureAchat } = require("../Models/factureAchatModel");
const { BonReception } = require("../Models/bonReceptionModel");
const { BonReceptionArticle } = require("../Models/bonReceptionArticleModel");
const { CorrectionStock } = require("../Models/correctionStockModel");
const { SousFamille } = require("../Models/sousFamilleModel");
const { Famille } = require("../Models/familleModel");
const { Categorie } = require("../Models/categorieModel");
const { isValidObjectId } = require("mongoose");
const { consolelog } = require("../Models/errorModel");
const { request } = require("http");
var ObjectId = require("mongodb").ObjectID;

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
 *     MouvementStock:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *         ordre:
 *           type: number
 *         valeurRetiree:
 *           type: number
 *         tierNecessaire:
 *           type: string
 *         plan:
 *           type: string
 *
 */

/**
 * @swagger
 * tags:
 *   name: MouvementStocks
 *   description: The MouvementStocks managing API
 */

/**
 * @swagger
 * paths:
 *   /mouvementStocks/upload:
 *     post:
 *       summary: upload image
 *       tags: [MouvementStocks]
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
      consolelog(e);

      // statements to handle any exceptions
      console.log(e);
      return res.send({ status: false }); // pass exception object to error handler
    }
  }
);

/**
 * @swagger
 * /mouvementStocks/newMouvementStock:
 *   post:
 *     summary: Returns the list of all the MouvementStocks
 *     tags: [MouvementStocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                ordre:
 *                  type: number
 *                valeurRetiree:
 *                  type: number
 *                tierNecessaire:
 *                  type: string
 *                plan:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the MouvementStocks
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
 *                    libelle:
 *                      type: string
 *                    ordre:
 *                      type: number
 *                    valeurRetiree:
 *                      type: number
 *                    tierNecessaire:
 *                      type: string
 *                    plan:
 *                      type: string
 *
 */
router.post("/newMouvementStock", verifytoken, async (req, res) => {
  try {
    //const {error}=validateMouvementStock(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    var body = req.body;

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe));

    const mouvementStock = new MouvementStock(body);

    const result = await mouvementStock.save();

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
 * /mouvementStocks/modifierMouvementStock/{id}:
 *   post:
 *     summary: Update the MouvementStock by id
 *     tags: [MouvementStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The MouvementStock id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                ordre:
 *                  type: number
 *                valeurRetiree:
 *                  type: number
 *                tierNecessaire:
 *                  type: string
 *                plan:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the MouvementStocks
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
 *
 *
 */

router.post("/modifierMouvementStock/:id", verifytoken, async (req, res) => {
  try {
    // const {error}=validateMouvementStock(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const mouvementStock = await MouvementStock.findById(req.params.id);

    if (!mouvementStock) return res.status(401).send({ status: false });

    const result = await MouvementStock.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );

    const mouvementStock2 = await MouvementStock.findById(req.params.id);

    return res.send({ status: true, resultat: mouvementStock2 });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /mouvementStocks/deleteMouvementStock/{id}:
 *   post:
 *     summary: Remove the MouvementStock by id
 *     tags: [MouvementStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The MouvementStock id
 *
 *     responses:
 *       200:
 *         description: The MouvementStock was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The MouvementStock was not found
 *       500:
 *         description: Some error happened
 */
router.post("/deleteMouvementStock/:id", verifytoken, async (req, res) => {
  try {
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const mouvementStock = await MouvementStock.findById(req.params.id);

    if (!mouvementStock) return res.status(401).send({ status: false });

    if (await MouvementStock.findOneAndDelete({ _id: req.params.id })) {
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
 * /mouvementStocks/listMouvementStocks:
 *   post:
 *     summary: Returns the list of all the MouvementStocks
 *     tags: [MouvementStocks]
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
 *         description: The list of the MouvementStocks
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
 *                            libelle:
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
router.post("/listMouvementStocks", verifytoken, async (req, res) => {
  try {
    var typeOp = req.body.typeOp;

    console.log(req.body.nomDocument);

    listGlobal = [];
    listGeneral = [];
    listEnt = [];
    listSor = [];
    if (typeOp == "entree") {
      listEnt = await remplirListEntre(req.body);
      listGlobal = listEnt;
    } else if (typeOp == "sortie") {
      listSor = await remplirListSortie(req.body);
      listGlobal = listSor;
    } else if (typeOp == "entreeSortie") {
      listEnt = await remplirListEntre(req.body);
      for (let item of listEnt) {
        listGeneral.push(item);
      }

      listSor = await remplirListSortie(req.body);
      for (let item of listSor) {
        listGeneral.push(item);
      }

      listGlobal = listGeneral;
    }

    var articleF = req.body.article;

    console.log(articleF);

    if (
      ObjectId.isValid(articleF.categorie) ||
      ObjectId.isValid(articleF.sousArticle) ||
      ObjectId.isValid(articleF.famille) ||
      ObjectId.isValid(articleF.sousFamille)
    ) {
      let listArticles = await filter(listGlobal, articleF);

      listGlobal = listArticles;
    }

    for (let item of listGlobal) {
      var categorie = null;
      var famille = null;
      var sousFamille = null;

      if (ObjectId.isValid(item.categorie))
        categorie = await Categorie.findOne({ _id: item.categorie });

      if (ObjectId.isValid(item.famille))
        famille = await Famille.findOne({ _id: item.famille });

      if (ObjectId.isValid(item.sousFamille))
        sousFamille = await SousFamille.findOne({ _id: item.sousFamille });

      item.categorie = "";
      item.famille = "";
      item.sousFamille = "";

      if (categorie) {
        item.categorie = categorie.libelle;
      }

      if (famille) {
        item.famille = famille.libelle;
      }

      if (sousFamille) {
        item.sousFamille = sousFamille.libelle;
      }
    }

    listGlobal = ordreByDate(listGlobal, req.body);

    return res.send({ status: true, listGlobal: listGlobal });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/listMouvementStocksTest", verifytoken, async (req, res) => {
  try {

    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = ObjectId(req.body.magasin);
    var societeRacine = await getSocieteRacine(societe);

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0 && key === 'date') {
        sort['dateC'] = req.body.orderBy[key];
      }else if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { dateC: -1 };
    }

    var pipelineBonLivraison = [];
    var pipelineBonRetourClient = [];
    var pipelineReception = [];
    var pipelineBonRetourFournisseur = [];
    var pipelineCorrectionStock =[]
    var pipelineBonCasse=[]
    var pipelineBonTansfert =[]
    var pipelineBonTansfert2=[]

    pipelineBonLivraison.push({
      $match:{ societe: societe}
    })

    pipelineBonLivraison.push({
      $lookup: {
        from: "bonlivraisons",
        let: { bonLivraison: "$bonLivraison" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonLivraison"] }],
              },
            },
          },
          {
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
                {
                  $project: {
                    codeTiers: "$code",
                    raisonSociale: "$raisonSociale",
                  },
                },
              ],
              as: "clientsArray",
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Sortie",
              typeDocument: "Bon Livraison",
              codeTiers: { $arrayElemAt: ["$clientsArray.codeTiers", 0] },
              raisonSociale: {
                $arrayElemAt: ["$clientsArray.raisonSociale", 0],
              },
            },
          },
        ],
        as: "BonLivraisonArray",
      },
    });

    pipelineBonLivraison.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonLivraisonArray.date", 0] },
              }
        },
        
        dateC: { $arrayElemAt: ["$BonLivraisonArray.date", 0] },
        numero: { $arrayElemAt: ["$BonLivraisonArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonLivraisonArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonLivraisonArray.typeDocument", 0] },
        codeTiers: { $arrayElemAt: ["$BonLivraisonArray.codeTiers", 0] },
        raisonSocial: { $arrayElemAt: ["$BonLivraisonArray.raisonSociale", 0] },
        reference: "$reference",
        designation: "$designation",
        qteSortie: "$quantiteVente",
      },
    });

    pipelineBonRetourClient.push({
      $match:{ societe: societe}
    })

    pipelineBonRetourClient.push({
      $lookup: {
        from: "bonretourclients",
        let: { bonretour: "$bonRetourClient" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonretour"] }],
              },
            },
          },
          {
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
                {
                  $project: {
                    codeTiers: "$code",
                    raisonSociale: "$raisonSociale",
                  },
                },
              ],
              as: "clientsArray",
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Entrée",
              typeDocument: "Bon Retour Client",
              raisonSociale: {
                $arrayElemAt: ["$clientsArray.raisonSociale", 0],
              },
              codeTiers: { $arrayElemAt: ["$clientsArray.codeTiers", 0] },
            },
          },
        ],
        as: "BonRetoursArray",
      },
    });

    pipelineBonRetourClient.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonRetoursArray.date", 0] },    
        numero: { $arrayElemAt: ["$BonRetoursArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonRetoursArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonRetoursArray.typeDocument", 0] },
        raisonSocial: { $arrayElemAt: ["$BonRetoursArray.raisonSociale", 0] },
        codeTiers: { $arrayElemAt: ["$BonRetoursArray.codeTiers", 0] },
        reference: "$reference",
        designation: "$designation",
        qteEntree: "$quantiteVente",
      },
    });

    pipelineReception.push({
      $match:{ societe: societe}
    })

    pipelineReception.push({
      $lookup: {
        from: "bonreceptions",
        let: { bonreception: "$bonReception" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonreception"] }],
              },
            },
          },
          {
            $lookup: {
              from: "fournisseurs",
              let: { fournisseur: "$fournisseur" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$fournisseur"] }],
                    },
                  },
                },
                {
                  $project: {
                    codeTiers: "$code",
                    raisonSociale: "$raisonSociale",
                  },
                },
              ],
              as: "FournisseursArray",
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Entrée",
              typeDocument: "Bon Reception",
              codeTiers: { $arrayElemAt: ["$FournisseursArray.codeTiers", 0] },
              raisonSociale: {
                $arrayElemAt: ["$FournisseursArray.raisonSociale", 0],
              },
            },
          },
        ],
        as: "BonReceptionArray",
      },
    });

    pipelineReception.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonReceptionArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonReceptionArray.date", 0] },
      
        numero: { $arrayElemAt: ["$BonReceptionArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonReceptionArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonReceptionArray.typeDocument", 0] },
        codeTiers: { $arrayElemAt: ["$BonReceptionArray.codeTiers", 0] },
        raisonSocial: { $arrayElemAt: ["$BonReceptionArray.raisonSociale", 0] },
        reference: "$reference",
        designation: "$designation",
        qteEntree: "$quantiteAchat",
      },
    });

    pipelineBonRetourFournisseur.push({
      $match:{ societe: societe}
    })
    pipelineBonRetourFournisseur.push({
      $lookup: {
        from: "bonretourfournisseurs",
        let: { bonretour: "$bonRetourFournisseur" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonretour"] }],
              },
            },
          },
          {
            $lookup: {
              from: "fournisseurs",
              let: { fournisseur: "$fournisseur" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$fournisseur"] }],
                    },
                  },
                },
                {
                  $project: {
                    codeTiers: "$code",
                    raisonSociale: "$raisonSociale",
                  },
                },
              ],
              as: "fournisseursArray",
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Sortie",
              typeDocument: "Bon Retour Fournisseur",
              raisonSociale: {
                $arrayElemAt: ["$fournisseursArray.raisonSociale", 0],
              },
              codeTiers: { $arrayElemAt: ["$fournisseursArray.codeTiers", 0] },
            },
          },
        ],
        as: "BonRetoursArray",
      },
    });

    pipelineBonRetourFournisseur.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
      
        
        numero: { $arrayElemAt: ["$BonRetoursArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonRetoursArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonRetoursArray.typeDocument", 0] },
        raisonSocial: { $arrayElemAt: ["$BonRetoursArray.raisonSociale", 0] },
        codeTiers: { $arrayElemAt: ["$BonRetoursArray.codeTiers", 0] },
        reference: "$reference",
        designation: "$designation",
        qteSortie: "$quantiteAchat",
      },
    });

    pipelineCorrectionStock.push({
      $match:{ societe: societe}
    })

    pipelineCorrectionStock.push({
      $unwind:
        {
          path: "$ligneCorrectionStocks",
        }
    })


    pipelineCorrectionStock.push({
        $project:{
            date:{
                $dateToString: {
                    format: "%d/%m/%Y",
                    date: "$date",
                  }
            },

            dateC: "$date",
      
        numero: "$numero",
        typeMVT: {            
            $cond: {
                if: {$gt:["$ligneCorrectionStocks.qteDifference", 0]}, //{$gt:["$soldeInitialCredit", null]},
                then: "Entrée",
                else: "Sortie",
              },
        },
        nomDocument: "Correction Stock",
        raisonSocial: "",
        codeTiers:"",
        article:"$ligneCorrectionStocks.article",
        reference: "$ligneCorrectionStocks.reference",
        designation: "$ligneCorrectionStocks.designation",
        qteEntree: {
            $cond: {
                if: {$gt:["$ligneCorrectionStocks.qteDifference", 0]}, //{$gt:["$soldeInitialCredit", null]},
                then: "$ligneCorrectionStocks.qteDifference",
                else: "",
              },
        },
        qteSortie: {
            $cond: {
                if: {$lt:["$ligneCorrectionStocks.qteDifference", 0]}, //{$gt:["$soldeInitialCredit", null]},
                then: "$ligneCorrectionStocks.qteDifference",
                else: "",
              },
        },
        }

    });

    pipelineBonCasse.push({
      $match:{ societe: societe}
    })

    pipelineBonCasse.push({
        $lookup: {
            from: "boncassearticles",
            let:{boncasse:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr: {
                            $and: [{ $eq: ["$bonCasse", "$$boncasse"] }],
                          }
                    }
                }
            ],
            as: "bonCasseArray",
          },
    })

    pipelineBonCasse.push({
      $unwind:
        {
          path: "$bonCasseArray",
        }
    })

    pipelineBonCasse.push({
        $project:{
            date:{
                $dateToString: {
                    format: "%d/%m/%Y",
                    date: "$date",
                  }
            },
            dateC: "$date",
       
            numero: "$numero",
            typeMVT: "Sortie",
            nomDocument: "Bon Casse",
            raisonSocial: "",
            codeTiers:"",
            reference: "$bonCasseArray.reference",
            designation: "$bonCasseArray.designation",
            qteSortie: "$bonCasseArray.quantiteVente",
            article:"$bonCasseArray.article",
           
        }
    })

    pipelineBonTansfert.push({
      $match:{ societe: societe}
    })

    pipelineBonTansfert.push({ $match : { magasinDepart: ObjectId(societe) }})
    pipelineBonTansfert.push({
        $lookup: {
            from: "bontransfertarticles",
            let:{bontransfert:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr: {
                            $and: [{ $eq: ["$bonTransfert", "$$bontransfert"] }],
                        }
                    }
                }
            ],
            as: "bonTransfertArray",
        },
    })

    pipelineBonTansfert.push({
      $unwind:
        {
          path: "$bonTransfertArray",
        }
    })

    pipelineBonTansfert.push({
        $project:{
            date: "$date",
            dateC: "$date",
            numero: "$numero",
            typeMVT: "Sortie",
            nomDocument: "Bon Transfert",
            raisonSocial: "",
            codeTiers:"",
            reference: "$bonTransfertArray.reference",
            designation: "$bonTransfertArray.designation",
            qteSortie: "$bonTransfertArray.quantiteVente",
            article: "$bonTransfertArray.article",
        }
    })

    pipelineBonTansfert2.push({
      $match:{ societe: societe}
    })

    pipelineBonTansfert2.push({ $match : { magasinArrive: ObjectId(societe) }})
   
    pipelineBonTansfert2.push({
        $lookup: {
            from: "bontransfertarticles",
            let:{bontransfert:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr: {
                            $and: [{ $eq: ["$bonTransfert", "$$bontransfert"] }],
                        }
                    }
                }
            ],
            as: "bonTransfertArray",
        },
    })

    pipelineBonTansfert2.push({
      $unwind:
        {
          path: "$bonTransfertArray",
        }
    })

    pipelineBonTansfert2.push({
        $project:{
            date: "$date",
            dateC: "$date",
            numero: "$numero",
            typeMVT: "Sortie",
            nomDocument: "Bon Transfert",
            raisonSocial: "",
            codeTiers:"",
            reference: "$bonTransfertArray.reference",
            designation: "$bonTransfertArray.designation",
            article: "$bonTransfertArray.article",
            qteEntree: "$bonTransfertArray.quantiteVente",
        }
    })

    var pipeline=pipelineBonRetourClient

    // pipeline.push({
    //     $unionWith: { coll: "bonretourclientarticles", pipeline: pipelineBonRetourClient },
    // });
    if(req.body.nomDocument.Tout || req.body.nomDocument.BonLivraison){
        pipeline.push({
            $unionWith: { coll: "bonlivraisonarticles", pipeline: pipelineBonLivraison },
        });
    }

    if(req.body.nomDocument.Tout || req.body.nomDocument.BonRetourFournisseur){
        pipeline.push({
            $unionWith: { coll: "bonretourfournisseurarticles", pipeline: pipelineBonRetourFournisseur },
        });
    }
   
    if(req.body.nomDocument.Tout || req.body.nomDocument.BonReception){
        pipeline.push({
            $unionWith: { coll: "bonreceptionarticles", pipeline: pipelineReception },
        });
    }
  
    if(req.body.nomDocument.Tout || req.body.nomDocument.CorrectionStock){
        pipeline.push({
            $unionWith: { coll: "correctionstocks", pipeline: pipelineCorrectionStock },
        });
    }

    if(req.body.nomDocument.Tout || req.body.nomDocument.BonCasse){
        pipeline.push({
            $unionWith: { coll: "boncasses", pipeline: pipelineBonCasse },
        });
    }

    if(req.body.nomDocument.Tout || req.body.nomDocument.BonTransfert){
        pipeline.push({
            $unionWith: { coll: "bontransferts", pipeline: pipelineBonTansfert },
        });
    }
    if(req.body.nomDocument.Tout || req.body.nomDocument.BonTransfert){
        pipeline.push({
            $unionWith: { coll: "bontransferts", pipeline: pipelineBonTansfert2 },
        });
    }

    if(req.body.typeOp === 'entree'){
        pipeline.push({ $match : { typeMVT: "Entrée"}})
    }else if(req.body.typeOp === 'sortie'){
        pipeline.push({ $match : { typeMVT: "Sortie"}})
    }

    pipeline.push({
      $lookup: {
        from: "articles",
        let: { article: "$article" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$article"] }],
              },
            },
          },
        ],
        as: "articles"
      }
    })

    pipeline.push({
      $set:{
        categorie:{$toString:{$arrayElemAt:["$articles.categorie",0]}},
        famille:{$toString:{$arrayElemAt:["$articles.famille",0]}},
        sousFamille:{$toString:{$arrayElemAt:["$articles.sousFamille",0]}},
        articles:"",
        article:{$toString:"$article"}
      }
    })

    if(req.body.article.sousArticle != null && isValidObjectId(req.body.article.sousArticle)){
      pipeline.push({
        $match: {
          article:req.body.article.sousArticle
        },
      })
    }else{
      if(req.body.article.sousFamille != null && isValidObjectId(req.body.article.sousFamille)){
        pipeline.push({
          $match: {
            sousFamille:req.body.article.sousFamille
          },
        })
      }else if(req.body.article.famille != null && isValidObjectId(req.body.article.famille)){
        pipeline.push({
          $match: {
            famille:req.body.article.famille
          },
        })
      }else if(req.body.article.categorie != null && isValidObjectId(req.body.article.categorie)){
        pipeline.push({
          $match: {
            categorie:req.body.article.categorie
          },
        })
      }
    }

    // const articles2 = await BonLivraison.aggregate(pipeline);

    pipeline.push({ $set : { date: "$dateC" }})
    pipeline.push({ $match : { date: { $gte: dateStart, $lte: dateEnd } }})

    // var search = req.body.search;

    // for (let key in search) {
    //   if (search[key] != "") {
    //     var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1);
    //     var word2 = search[key].toUpperCase();
    //     var word3 = search[key].toLowerCase();

    //     var objet1 = {};
    //     objet1[key] = { $regex: ".*" + word1 + ".*" };

    //     var objet2 = {};
    //     objet2[key] = { $regex: ".*" + word2 + ".*" };

    //     var objet3 = {};
    //     objet3[key] = { $regex: ".*" + word3 + ".*" };

    //     let objectMatch = { $or: [objet1, objet2, objet3] };

    //     let objectParent = { $match: objectMatch };
    //     pipeline.push(objectParent);
    //   }
    // }
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

    const articles = await BonRetourClientArticle.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await BonRetourClientArticle.aggregate(sommePipeline);

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
    return res.send({ status: false });
  }
});
function ordreByDate(list, req) {
  keyPardefaut = "date";
  ordrePardefaut = 1;
  for (let key in req.orderBy) {
    if (req.orderBy[key] != 0) {
      keyPardefaut = key;
      ordrePardefaut = req.orderBy[key];
    }
  }

  keysSearch = [];

  for (let key in req.search) {
    if (req.search[key] != "") {
      keysSearch.push(key);
    }
  }

  var newList = [];
  for (let i = 0; i < list.length; i++) {
    var isValid = true;
    for (let key of keysSearch) {
      if ((list[i][key] + "").indexOf(req.search[key]) === -1) {
        isValid = false;
      }
    }
    if (isValid) {
      newList.push(list[i]);
    }
  }

  list = newList;

  for (let i = 0; i < list.length - 1; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (
        (list[i][keyPardefaut] > list[j][keyPardefaut] &&
          ordrePardefaut === 1) ||
        (list[i][keyPardefaut] < list[j][keyPardefaut] && ordrePardefaut === -1)
      ) {
        var aux = JSON.parse(JSON.stringify(list[i]));
        list[i] = list[j];
        list[j] = aux;
      }
    }
  }
  return list;
}

async function remplirListEntre(req) {
  var dateStart = new Date();
  var dateEnd = new Date();

  if (req.dateStart) {
    dateStart = new Date(req.dateStart);
  }
  if (req.dateEnd) {
    dateEnd = new Date(req.dateEnd);
  }

  var societeRacine = await getSocieteRacine(ObjectId(req.magasin));

  var parametres = await Parametres.findOne({ societeRacine: societeRacine });

  var article = req.article;

  listGlobal = [];

  var bonAchats = [];
  if (req.nomDocument.BonReception) {
    if (parametres != null && parametres.validationStockBonAchat != "oui") {
      bonAchats = await BonReception.find({
        date: { $gte: dateStart, $lte: dateEnd },
        societe: ObjectId(req.magasin),
      });
    } else {
      const factureAchats = await FactureAchat.find({
        date: { $gte: dateStart, $lte: dateEnd },
        societe: ObjectId(req.magasin),
      });
      for (let i = 0; i < factureAchats.length; i++) {
        var bonAchats2 = await BonReception.find({
          factureAchat: factureAchats[i].id,
        });
        for (let j = 0; j < bonAchats2.length; j++) {
          bonAchats.push(bonAchats2[j]);
        }
      }
    }
  }

  var bonRetourClients = [];
  if (req.nomDocument.BonRetourClient)
    bonRetourClients = await BonRetourClient.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    });

  var bontransferts = [];
  if (req.nomDocument.BonTransfert)
    bontransferts = await BonTransfert.find({
      date: { $gte: dateStart, $lte: dateEnd },
      magasinArrive: ObjectId(req.magasin),
    });

  var correctionsStocks = [];
  if (req.nomDocument.CorrectionStock)
    correctionsStocks = await CorrectionStock.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    }).populate("ligneCorrectionStocks.article");

  for (let item of bonAchats) {
    let fournBA = await Fournisseur.findOne({ _id: item.fournisseur });

    let articleBA = await BonReceptionArticle.find({
      bonReception: item.id,
    }).populate("article");

    /*if (article.categorie.length > 0 || article.sousArticle.length > 0) {
    
            let test = await findByArticle(articleBA, article)
    
            articleBA = test
        }*/

    for (let itemA of articleBA) {
      if (itemA.article) {
        try {
          listGlobal.push({
            article: itemA.article.id,
            categorie: itemA.article.categorie,
            famille: itemA.article.famille,
            sousFamille: itemA.article.sousFamille,
            date: item.date,
            numero: item.numero,
            typeMVT: "Entree",
            nomDocument: "Bon Achat",
            codeTiers: fournBA.code,
            raisonSocial: fournBA.raisonSociale,
            reference: itemA.reference,
            designation: itemA.designation,
            qteEntree: itemA.quantiteAchat,
            qteSortie: 0,
          });
        } catch (e) {
          listGlobal.push({
            article: itemA.article.id,
            categorie: itemA.article.categorie,
            famille: itemA.article.famille,
            sousFamille: itemA.article.sousFamille,
            date: item.date,
            numero: item.numero,
            typeMVT: "Entree",
            nomDocument: "Bon Achat",
            codeTiers: "",
            raisonSocial: "",
            reference: itemA.reference,
            designation: itemA.designation,
            qteEntree: itemA.quantiteAchat,
            qteSortie: 0,
          });
        }
      }
    }
  }

  for (let item of bonRetourClients) {
    let clientBR = await Client.findById({ _id: item.client });

    let articleBR = await BonRetourClientArticle.find({
      bonRetourClient: item._id,
    }).populate("article");

    for (let itemA of articleBR) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Entree",
          nomDocument: "Bon Retour Client",
          codeTiers: clientBR.code,
          raisonSocial: clientBR.raisonSociale,
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: itemA.quantiteVente,
          qteSortie: 0,
        });
    }
  }

  for (let item of bontransferts) {
    let societeDes = await Societe.findById({ _id: item.magasinDepart });

    let articleBT = await BonTransfertArticle.find({
      bonTransfert: item._id,
    }).populate("article");

    /*        if (article.categorie.length > 0 || article.sousArticle.length > 0) {
        
                    let test = await findByArticle(articleBT, article)
        
                    articleBT = test
                }*/

    for (let itemA of articleBT) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Entree",
          nomDocument: "Bon Transfert",
          codeTiers: "",
          raisonSocial: societeDes.raisonSociale,
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: itemA.quantiteVente,
          qteSortie: 0,
        });
    }
  }

  for (let item of correctionsStocks) {
    for (let itemA of item.ligneCorrectionStocks) {
      if (itemA.article && itemA.qteDifference > 0) {
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Entree",
          nomDocument: "Correction De Stock",
          codeTiers: "",
          raisonSocial: "",
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: Math.abs(itemA.qteDifference),
          qteSortie: 0,
        });
      }
    }
  }

  return listGlobal;
}

async function remplirListSortie(req) {
  var dateStart = new Date();
  var dateEnd = new Date();

  if (req.dateStart) {
    dateStart = new Date(req.dateStart);
  }
  if (req.dateEnd) {
    dateEnd = new Date(req.dateEnd);
  }

  var societeRacine = await getSocieteRacine(ObjectId(req.magasin));

  var article = req.article;

  listGlobal = [];

  var bonLivs = [];
  if (req.nomDocument.BonLivraison)
    bonLivs = await BonLivraison.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    });

  var bonRetourFournisseurs = [];
  if (req.nomDocument.BonRetourFournisseur)
    bonRetourFournisseurs = await BonRetourFournisseur.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    });

  var bontransferts = [];
  if (req.nomDocument.BonTransfert)
    bontransferts = await BonTransfert.find({
      date: { $gte: dateStart, $lte: dateEnd },
      magasinDepart: ObjectId(req.magasin),
    });

  var bonCasses = [];
  if (req.nomDocument.BonCasse)
    bonCasses = await BonCasse.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    });

  var correctionsStocks = [];
  if (req.nomDocument.CorrectionStock)
    correctionsStocks = await CorrectionStock.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.magasin),
    }).populate("ligneCorrectionStocks.article");

  for (let item of bonLivs) {
    let clientBL = await Client.findById({ _id: item.client });

    let articleBL = await BonLivraisonArticle.find({
      bonLivraison: item._id,
    }).populate("article");

    /* if (article.categorie.length > 0 || article.sousArticle.length > 0) {
 
             let test = await findByArticle(articleBL, article)
 
             articleBL = test
         }*/

    for (let itemA of articleBL) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Sortie",
          nomDocument: "Bon Livraison",
          codeTiers: clientBL.code,
          raisonSocial: clientBL.raisonSociale,
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: 0,
          qteSortie: itemA.quantiteVente,
        });
    }
  }

  for (let item of bonRetourFournisseurs) {
    let fournBR = await Fournisseur.findById({ _id: item.fournisseur });

    let articleBR = await BonRetourFournisseurArticle.find({
      bonRetourFournisseur: item._id,
    }).populate("article");

    /*  if (article.categorie.length > 0 || article.sousArticle.length > 0) {
  
              let test = await findByArticle(articleBR, article)
  
              articleBR = test
          }*/

    for (let itemA of articleBR) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Sortie",
          nomDocument: "Bon Retour Fournisseur",
          codeTiers: fournBR.code,
          raisonSocial: fournBR.raisonSociale,
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: 0,
          qteSortie: itemA.quantiteAchat,
        });
    }
  }

  for (let item of bontransferts) {
    let societeSourc = await Societe.findById({ _id: item.magasinArrive });

    let articleBT = await BonTransfertArticle.find({
      bonTransfert: item._id,
    }).populate("article");

    /*if (article.categorie.length > 0 || article.sousArticle.length > 0) {

            let test = await findByArticle(articleBT, article)

            articleBT = test
        }*/

    for (let itemA of articleBT) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Sortie",
          nomDocument: "Bon Transfert",
          codeTiers: "",
          raisonSocial: societeSourc.raisonSociale,
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: 0,
          qteSortie: itemA.quantiteVente,
        });
    }
  }

  for (let item of bonCasses) {
    let articleBC = await BonCasseArticle.find({ bonCasse: item._id }).populate(
      "article"
    );

    /*if (article.categorie.length > 0 || article.sousArticle.length > 0) {

            let listArticles = await findByArticle(articleBC, article)

            articleBC = listArticles
        }*/

    for (let itemA of articleBC) {
      if (itemA.article)
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Sortie",
          nomDocument: "Bon Casse",
          codeTiers: "",
          raisonSocial: "",
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: 0,
          qteSortie: itemA.quantiteVente,
        });
    }
  }

  for (let item of correctionsStocks) {
    for (let itemA of item.ligneCorrectionStocks) {
      if (itemA.article && itemA.qteDifference < 0) {
        listGlobal.push({
          article: itemA.article.id,
          categorie: itemA.article.categorie,
          famille: itemA.article.famille,
          sousFamille: itemA.article.sousFamille,
          date: item.date,
          numero: item.numero,
          typeMVT: "Sortie",
          nomDocument: "Correction De Stock",
          codeTiers: "",
          raisonSocial: "",
          reference: itemA.reference,
          designation: itemA.designation,
          qteEntree: 0,
          qteSortie: Math.abs(itemA.qteDifference),
        });
      }
    }
  }

  return listGlobal;
}

/**
 * @swagger
 * /mouvementStocks/rappelStock:
 *   post:
 *     summary: Returns the list of all the MouvementStocks
 *     tags: [MouvementStocks]
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
 *         description: The list of the MouvementStocks
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
 *                            libelle:
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

function isCheckThreeDate(dateStart, dateEnd, date) {
  let format = "MM/DD/YYYY";
  let startDate = dateStart.format(format);
  let endDate = dateEnd.add(30, "days").format(format);
  let compareDate = date.format(format);
  var startDate1 = startDate.split("/");
  var startDate2 = endDate.split("/");
  var compareDate1 = compareDate.split("/");

  console.log("startDate1 =", startDate1);
  var fromDate = new Date(
    startDate1[2],
    parseInt(startDate1[1]) - 1,
    startDate1[0]
  );
  var toDate = new Date(
    startDate2[2],
    parseInt(startDate2[1]) - 1,
    startDate2[0]
  );
  var checkDate = new Date(
    compareDate1[2],
    parseInt(compareDate1[1]) - 1,
    compareDate1[0]
  );

  if (checkDate > fromDate && checkDate < toDate) {
  }
}

router.post("/rappelStock", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin));
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
   
    var societe = ObjectId(req.body.magasin)

    var pipelineBonLivraison = [];
    var pipelineBonRetourClient = [];
    var pipelineReception = [];
    var pipelineBonRetourFournisseur = [];
    var pipelineCorrectionStock =[]
    var pipelineBonCasse=[]
    var pipelineBonTansfert =[]
    var pipelineBonTansfert2=[]

    pipelineBonLivraison.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonLivraison.push({
      $lookup: {
        from: "bonlivraisons",
        let: { bonLivraison: "$bonLivraison" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonLivraison"] }],
              },
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Sortie",
              typeDocument: "Bon Livraison",
            },
          },
        ],
        as: "BonLivraisonArray",
      },
    });

    pipelineBonLivraison.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonLivraison.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonLivraisonArray.date", 0] },
              }
        },
        
        dateC: { $arrayElemAt: ["$BonLivraisonArray.date", 0] },
        numero: { $arrayElemAt: ["$BonLivraisonArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonLivraisonArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonLivraisonArray.typeDocument", 0] },
        reference: "$reference",
        designation: "$designation",
        qteSortie: "$quantiteVente",
        qteStock: {$multiply:[-1, "$quantiteVente"]},
      },
    });

    pipelineBonRetourClient.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonRetourClient.push({
      $lookup: {
        from: "bonretourclients",
        let: { bonretour: "$bonRetourClient" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonretour"] }],
              },
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Entrée",
              typeDocument: "Bon Retour Client",
            },
          },
        ],
        as: "BonRetoursArray",
      },
    });

    pipelineBonRetourClient.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
       
        numero: { $arrayElemAt: ["$BonRetoursArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonRetoursArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonRetoursArray.typeDocument", 0] },
        reference: "$reference",
        designation: "$designation",
        qteEntree: "$quantiteVente",
        qteStock: "$quantiteVente",
      },
    });

    pipelineReception.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineReception.push({
      $lookup: {
        from: "bonreceptions",
        let: { bonreception: "$bonReception" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonreception"] }],
              },
            },
          },
          {
            $set: {
              date: "$date",
              document: "$numero",
              typeMVT: "Entrée",
              typeDocument: "Bon Reception",
            },
          },
        ],
        as: "BonReceptionArray",
      },
    });

    pipelineReception.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonReceptionArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonReceptionArray.date", 0] },
      
        numero: { $arrayElemAt: ["$BonReceptionArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonReceptionArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonReceptionArray.typeDocument", 0] },
        reference: "$reference",
        designation: "$designation",
        qteEntree: "$quantiteAchat",
        qteStock: "$quantiteAchat",
      },
    });

    pipelineBonRetourFournisseur.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonRetourFournisseur.push({
      $lookup: {
        from: "bonretourfournisseurs",
        let: { bonretour: "$bonRetourFournisseur" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonretour"] }],
              },
            },
          },
          {
            $set: {
              date: "$date",
              dateC: "$date",
              document: "$numero",
              typeMVT: "Sortie",
              typeDocument: "Bon Retour Fournisseur",
              raisonSociale: {
                $arrayElemAt: ["$fournisseursArray.raisonSociale", 0],
              },
              codeTiers: { $arrayElemAt: ["$fournisseursArray.codeTiers", 0] },
            },
          },
        ],
        as: "BonRetoursArray",
      },
    });

    pipelineBonRetourFournisseur.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
      
        numero: { $arrayElemAt: ["$BonRetoursArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonRetoursArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonRetoursArray.typeDocument", 0] },
        raisonSocial: { $arrayElemAt: ["$BonRetoursArray.raisonSociale", 0] },
        codeTiers: { $arrayElemAt: ["$BonRetoursArray.codeTiers", 0] },
        reference: "$reference",
        designation: "$designation",
        qteSortie: "$quantiteAchat",
        qteStock: {$multiply:[-1, "$quantiteAchat"]},
      },
    });

    var bonfournisseurs = await BonRetourFournisseurArticle.aggregate(pipelineBonRetourFournisseur)
   
    pipelineCorrectionStock.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineCorrectionStock.push({
      $unwind:
        {
          path: "$ligneCorrectionStocks",
       }
    })

    pipelineCorrectionStock.push({
      $project:{
          date:{
              $dateToString: {
                  format: "%d/%m/%Y",
                  date: "$date",
                }
          },

          dateC: "$date",
    
      numero: "$numero",
      typeMVT: {            
          $cond: {
              if: {$gt:["$ligneCorrectionStocks.qteDifference", 0]}, //{$gt:["$soldeInitialCredit", null]},
              then: "Entrée",
              else: "Sortie",
            },
      },
      nomDocument: "Correction Stock",
      raisonSocial: "",
      codeTiers:"",
      article:"$ligneCorrectionStocks.article",
      reference: "$ligneCorrectionStocks.reference",
      designation: "$ligneCorrectionStocks.designation",
      qteCorrectionStock: "$ligneCorrectionStocks.qteDifference",
      qteStock: "$ligneCorrectionStocks.qteDifference",
      }

  });


    pipelineBonCasse.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonCasse.push({
      $lookup: {
        from: "boncasses",
        let: { bonCasse: "$bonCasse" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonCasse"] }],
              },
            },
          },
          {
            $set: {
              date: "$date",
              dateC: "$date",
              document: "$numero",
              typeMVT: "Sortie",
              typeDocument: "Bon Casse",
            },
          },
        ],
        as: "BonRetoursArray",
      },
    });

    pipelineBonCasse.push({
      $project: {
        article:"$article",
        date:{
            $dateToString: {
                format: "%d/%m/%Y",
                date: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
              }
        },
        dateC: { $arrayElemAt: ["$BonRetoursArray.date", 0] },
      
        numero: { $arrayElemAt: ["$BonRetoursArray.document", 0] },
        typeMVT: { $arrayElemAt: ["$BonRetoursArray.typeMVT", 0] },
        nomDocument: { $arrayElemAt: ["$BonRetoursArray.typeDocument", 0] },
        reference: "$reference",
        designation: "$designation",
        qteCasse: "$quantiteVente",
        qteStock:{$multiply : [ -1, "$quantiteVente"]},
      },
    });

    pipelineBonTansfert.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonTansfert.push({ $match : { magasinDepart: ObjectId(societe) }})
    pipelineBonTansfert.push({
        $lookup: {
            from: "bontransfertarticles",
            let:{bontransfert:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr: {
                            $and: [{ $eq: ["$bonTransfert", "$$bontransfert"] }],
                        }
                    }
                }
            ],
            as: "bonTransfertArray",
        },
    })

    pipelineBonTansfert.push({
      $unwind:
        {
          path: "$bonTransfertArray",
       }
    })

    pipelineBonTansfert.push({
        $project:{
            date: "$date",
            dateC: "$date",
            numero: "$numero",
            typeMVT: "Sortie",
            nomDocument: "Bon Transfert",
            reference: "$bonTransfertArray.reference",
            designation: "$bonTransfertArray.designation",
            qteSortie: "$bonTransfertArray.quantiteVente",
            article:"$bonTransfertArray.article",
            qteStock: {$multiply : [ -1, "$bonTransfertArray.quantiteVente"]},
         }
    })

    pipelineBonTansfert2.push({
      $match:{ societe: ObjectId(req.body.magasin)}
    })

    pipelineBonTansfert2.push({ $match : { magasinArrive: ObjectId(societe) }})
   
    pipelineBonTansfert2.push({
        $lookup: {
            from: "bontransfertarticles",
            let:{bontransfert:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr: {
                            $and: [{ $eq: ["$bonTransfert", "$$bontransfert"] }],
                        }
                    }
                }
            ],
            as: "bonTransfertArray",
        },
    })

    pipelineBonTansfert2.push({
      $unwind:
        {
          path: "$bonTransfertArray",
        }
    })

    pipelineBonTansfert2.push({
        $project:{
            date: "$date",
            dateC: "$date",
            numero: "$numero",
            typeMVT: "Sortie",
            nomDocument: "Bon Transfert",
            reference: "$bonTransfertArray.reference",
            designation: "$bonTransfertArray.designation",
            article:"$bonTransfertArray.article",
            qteEntree: "$bonTransfertArray.quantiteVente",
            qteStock: "$bonTransfertArray.quantiteVente",
        }
    })

  
    var pipeline=pipelineBonRetourClient

    pipeline.push({
        $unionWith: { coll: "bonlivraisonarticles", pipeline: pipelineBonLivraison },
    });
    pipeline.push({
        $unionWith: { coll: "bonretourfournisseurarticles", pipeline: pipelineBonRetourFournisseur },
    });
    
    pipeline.push({
        $unionWith: { coll: "bonreceptionarticles", pipeline: pipelineReception },
    });
    pipeline.push({
        $unionWith: { coll: "correctionstocks", pipeline: pipelineCorrectionStock },
    });
    pipeline.push({
        $unionWith: { coll: "boncassearticles", pipeline: pipelineBonCasse },
    });
    pipeline.push({
        $unionWith: { coll: "bontransferts", pipeline: pipelineBonTansfert },
    });
    pipeline.push({
        $unionWith: { coll: "bontransferts", pipeline: pipelineBonTansfert2 },
    });

    var pipelineSociete = []

    pipelineSociete.push({
      $match:{
        _id:societe
      }
    })

    pipelineSociete.push({
      $lookup: {
          from: "articlesocietes",
          let:{societe:societe},
          pipeline:[
              {
                  $match:{
                      $expr: {
                          $and: [{ $eq: ["$societe", "$$societe"] }],
                      }
                  }
              },
              {
                $project:{
                  article:"$article",
                  qteInitial:"$qteInitial"
                }
              }

          ],
          as: "articlesocietes",
      },
    })

    pipelineSociete.push({
      $unwind:
        {
          path: "$articlesocietes",
        }
    })

    pipelineSociete.push({
      $project:
        {
          dateC:"$dateLancementSystem",
          article:"$articlesocietes.article",
          qteInitial:"$articlesocietes.qteInitial",
          qteStock:"$articlesocietes.qteInitial"
        }
    })

    pipeline.push({
      $unionWith: { coll: "societes", pipeline: pipelineSociete },
    });
    
    pipeline.push({ $set : { date: "$dateC" }})
 
    pipeline.push(
         {
            $set:
              {
                isEncient:
                  {
                    $cond: [ { $and:[{ $gte: [ "$date", dateStart ]}, {$lte: [ "$date", dateEnd ]}] }, 0, 1 ]
                  }
              }
         }
    )

    // pipeline.push({ $match : { date: { $gte: dateStart, $lte: dateEnd } }})
    
    pipeline.push({
      $group:
        {
          _id: {article:"$article", isEncient:"$isEncient"},// Group key
          qteInitial: { $sum : "$qteInitial" },
          qteEntree: { $sum : "$qteEntree" },
          qteSortie: { $sum : "$qteSortie" },
          qteStock: { $sum : "$qteStock" },
          qteCasse: { $sum :  "$qteCasse" },
          qteCorrectionStock: { $sum : "$qteCorrectionStock" },
        }
     },
     { 
      "$group": {
      "_id": "$_id.article",
      qteCorrectionStock:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, 0, '$qteCorrectionStock']}},
      qteSortie:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, 0, '$qteSortie']}},
      qteCasse:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, 0, '$qteCasse']}},
      qteEntree:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, 0, '$qteEntree']}},
      qteInitial:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, '$qteStock', '$qteInitial']}},
      qteStock:{ $sum: {$cond: [{$gt: ["$_id.isEncient", 0]}, '$qteStock', '$qteStock']}},
    }},
    {
    $set:{
      article:"$_id",
    }
    }
    )
  
    pipeline.push({
      $lookup: {
        from: "articles",
        let: { article: "$article" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$article"] }],
              },
            },
          },
          {
            $lookup: {
              from: "categories",
              let: { categorie: "$categorie" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$categorie"] }],
                    },
                  },
                },
              ],
              as: "categories"
            }
          },
          {
            $lookup: {
              from: "familles",
              let: { famille: "$famille" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$famille"] }],
                    },
                  },
                },
              ],
              as: "familles"
            }
          },
          {
            $lookup: {
              from: "sousfamilles",
              let: { sousFamille: "$sousFamille" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$sousFamille"] }],
                    },
                  },
                },
              ],
              as: "sousfamilles"
            }
          },
          {
            $set:{
              categorie:{$toString:{$arrayElemAt:["$categories.libelle",0]}},
              famille:{$toString:{$arrayElemAt:["$familles.libelle",0]}},
              sousFamille:{$toString:{$arrayElemAt:["$sousfamilles.libelle",0]}},
              categorieId:{$toString:{$arrayElemAt:["$categories._id",0]}},
              familleId:{$toString:{$arrayElemAt:["$familles._id",0]}},
              sousFamilleId:{$toString:{$arrayElemAt:["$sousfamilles._id",0]}},
            }
          }
        ],
        as: "articles"
      }
    })

    pipeline.push({
      $set:{
        categorie:{$toString:{$arrayElemAt:["$articles.categorie",0]}},
        famille:{$toString:{$arrayElemAt:["$articles.famille",0]}},
        sousFamille:{$toString:{$arrayElemAt:["$articles.sousFamille",0]}},
        categorieId:{$toString:{$arrayElemAt:["$articles.categorieId",0]}},
        familleId:{$toString:{$arrayElemAt:["$articles.familleId",0]}},
        sousFamilleId:{$toString:{$arrayElemAt:["$articles.sousFamilleId",0]}},
        reference:{$toString:{$arrayElemAt:["$articles.reference",0]}},
        designation:{$toString:{$arrayElemAt:["$articles.designation",0]}},
        article:{$toString:"$article"},
        totalHTRevient:{ $round: [{$multiply:[{$arrayElemAt:["$articles.prixRevient",0]}, "$qteStock"]}, 3] },
        totalTTCRevient:{ $round: [{$multiply:[{$arrayElemAt:["$articles.prixRevientTTC",0]}, "$qteStock"]}, 3] },
        totalTTCAchat:{ $round: [{$multiply:[{$arrayElemAt:["$articles.prixAchatTTC",0]}, "$qteStock"]}, 3] },
        totalHTAchat:{ $round: [{$multiply:[{$arrayElemAt:["$articles.prixAchat",0]}, "$qteStock"]}, 3] },
       
        articles:"",
       
      }
    })

    if(req.body.article.sousArticle != null && isValidObjectId(req.body.article.sousArticle)){
      pipeline.push({
        $match: {
          article:req.body.article.sousArticle
        },
      })
    }else{
      if(req.body.article.sousFamille != null && isValidObjectId(req.body.article.sousFamille)){
        pipeline.push({
          $match: {
            sousFamilleId:req.body.article.sousFamille
          },
        })
      }else if(req.body.article.famille != null && isValidObjectId(req.body.article.famille)){
        pipeline.push({
          $match: {
            familleId:req.body.article.famille
          },
        })
      }else if(req.body.article.categorie != null && isValidObjectId(req.body.article.categorie)){
        pipeline.push({
          $match: {
            categorieId:req.body.article.categorie
          },
        })
      }
    }

    sort = { reference: -1 };

    pipeline.push({
      $sort: sort,
    });

    if(req.body.negative == 0){
      pipeline.push({
        $match: {
          qteStock:{ $gt: 0}
        },
      })
    }else if(req.body.negative == 1){
      pipeline.push({
        $match: {
          qteStock:{ $lt: 0}
        },
      })
    }

    const articles = await BonRetourClientArticle.aggregate(pipeline);

    return res.send({ status: true, listGlobal: articles, request: req.body,});
 
  } catch (e) {
    consolelog(e);
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/rappelStock2", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin));

    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }
    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
    }

    var societe = await Societe.findOne({ _id: req.body.magasin });

    var articleF = req.body.article;

    var parametres = await Parametres.findOne({ societeRacine: societeRacine });

    listGlobal = [];

    var articles = [];

    if (isValidObjectId(articleF.sousArticle)) {
      articles = await Article.find({ _id: ObjectId(articleF.sousArticle) })
        .populate("categorie")
        .populate("famille")
        .populate("sousFamille");
      console.log("filtre 11");
    } else {
      var filtre = {};
      if (isValidObjectId(articleF.categorie)) {
        filtre["categorie"] = articleF.categorie;
      } else if (isValidObjectId(articleF.famille)) {
        filtre["famille"] = articleF.famille;
      } else if (isValidObjectId(articleF.sousFamille)) {
        filtre["sousFamille"] = articleF.sousFamille;
      }
      articles = await Article.find(filtre)
        .populate("categorie")
        .populate("famille")
        .populate("sousFamille");
    }

    if (
      societe.dateLancementSystem &&
      societe.dateLancementSystem.getTime() >= dateStart.getTime() &&
      societe.dateLancementSystem.getTime() <= dateEnd.getTime()
    ) {
      for (let item of articles) {
        var articleSociete = await ArticleSociete.findOne({
          article: item.id,
          societe: societe.id,
        });
        if (articleSociete && articleSociete.qteInitial) {
          listGlobal.push({
            id: item.id,
            reference: item.reference,
            designation: item.designation,
            categorie: articleF.categorie,
            famille: articleF.famille,
            sousFamille: articleF.sousFamille,
            qteInitial: articleSociete.qteInitial,
            qteEntree: 0,
            qteSortie: 0,
            qteStock: 0,
            qteCasse: 0,
            qteCorrectionStock: 0,
          });
        }
      }
    }

    var bonAchats = [];
    if (parametres != null && parametres.validationStockBonAchat != "oui") {
      bonAchats = await BonReception.find({
        date: { $gte: dateStart, $lte: dateEnd },
        societe: ObjectId(req.body.magasin),
      });
    } else {
      const factureAchats = await FactureAchat.find({
        date: { $gte: dateStart, $lte: dateEnd },
        societe: ObjectId(req.body.magasin),
      });
      for (let i = 0; i < factureAchats.length; i++) {
        var bonAchats2 = await BonReception.find({
          factureAchat: factureAchats[i].id,
        });
        for (let j = 0; j < bonAchats2.length; j++) {
          bonAchats.push(bonAchats2[j]);
        }
      }
    }

    const bonRetourClients = await BonRetourClient.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    });

    const bontransferts = await BonTransfert.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    });

    const bonLivs = await BonLivraison.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    });

    const bonRetourFournisseurs = await BonRetourFournisseur.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    });

    const bonCasses = await BonCasse.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    });

    const correctionStocks = await CorrectionStock.find({
      date: { $gte: dateStart, $lte: dateEnd },
      societe: ObjectId(req.body.magasin),
    }).populate("ligneCorrectionStocks.article");

    for (let item of bonAchats) {
      let articleBA = await BonReceptionArticle.find({
        bonReception: item.id,
      }).populate("article");

      for (let itemA of articleBA) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: itemA.quantiteAchat,
          qteSortie: 0,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of bonRetourClients) {
      let articleBR = await BonRetourClientArticle.find({
        bonRetourClient: item._id,
      }).populate("article");

      for (let itemA of articleBR) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: itemA.quantiteVente,
          qteSortie: 0,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of bontransferts) {
      let articleBT = await BonTransfertArticle.find({
        bonTransfert: item._id,
      }).populate("article");

      for (let itemA of articleBT) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: 0,
          qteSortie: itemA.quantiteVente,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of bonLivs) {
      let articleBL = await BonLivraisonArticle.find({
        bonLivraison: item._id,
      }).populate("article");

      for (let itemA of articleBL) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: 0,
          qteSortie: itemA.quantiteVente,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of bonRetourFournisseurs) {
      let articleBR = await BonRetourFournisseurArticle.find({
        bonRetourFournisseur: item._id,
      }).populate("article");

      for (let itemA of articleBR) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: 0,
          qteSortie: itemA.quantiteAchat,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of bonCasses) {
      let articleBC = await BonCasseArticle.find({
        bonCasse: item._id,
      }).populate("article");

      for (let itemA of articleBC) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: 0,
          qteSortie: 0,
          qteStock: 0,
          qteCasse: itemA.quantiteVente,
          qteCorrectionStock: 0,
        });
      }
    }

    for (let item of correctionStocks) {
      let articleBC = item.ligneCorrectionStocks;

      for (let itemA of articleBC) {
        var categorie = "";
        var famille = "";
        var sousFamille = "";
        var article = "";

        if (itemA.article) {
          var categorie = itemA.article.categorie;
          var famille = itemA.article.famille;
          var sousFamille = itemA.article.sousFamille;
          var article = itemA.article.id;
        }

        listGlobal.push({
          id: article,
          reference: itemA.reference,
          designation: itemA.designation,
          categorie: categorie,
          famille: famille,
          sousFamille: sousFamille,
          qteInitial: 0,
          qteEntree: 0,
          qteSortie: 0,
          qteStock: 0,
          qteCasse: 0,
          qteCorrectionStock: itemA.qteDifference,
        });
      }
    }

    let listFilter = await regrouperArticles(listGlobal);

    listGlobal = listFilter;

    if (
      ObjectId.isValid(articleF.categorie) ||
      ObjectId.isValid(articleF.sousArticle) ||
      ObjectId.isValid(articleF.famille) ||
      ObjectId.isValid(articleF.sousFamille)
    ) {
      let listArticles = await filter(listGlobal, articleF);

      listGlobal = listArticles;
    }

    for (let item of listGlobal) {
      var artItem = null;

      try {
        var artItem = articles.filter((x) => x.id === item.id)[0];
      } catch (e) {
        consolelog(e);
      }

      try {
        item.categorie = artItem.categorie.libelle;
      } catch (e) {
        consolelog(e);

        item.categorie = "";
      }

      try {
        item.famille = artItem.famille.libelle;
      } catch (e) {
        consolelog(e);

        item.famille = "";
      }

      try {
        item.sousFamille = artItem.sousFamille.libelle;
      } catch (e) {
        consolelog(e);

        item.sousFamille = "";
      }

      try {
        item.totalHTAchat = artItem.prixAchat * item.qteStock;
      } catch (e) {
        consolelog(e);

        item.totalHTAchat = 0;
      }

      try {
        item.totalTTCAchat =
          (artItem.prixAchatTTC + artItem.redevance) * item.qteStock;
      } catch (e) {
        consolelog(e);

        item.totalTTCAchat = 0;
      }

      try {
        item.totalHTRevient = artItem.prixRevient * item.qteStock;
      } catch (e) {
        consolelog(e);

        item.totalHTRevient = 0;
      }

      try {
        item.totalTTCRevient = artItem.prixRevientTTC * item.qteStock;
      } catch (e) {
        consolelog(e);

        item.totalTTCRevient = 0;
      }

      var tabPrix = [
        "totalTTCRevient",
        "totalHTRevient",
        "totalTTCAchat",
        "totalHTAchat",
      ];
      var tabQuantite = [
        "qteCorrectionStock",
        "qteCasse",
        "qteStock",
        "qteInitial",
        "qteEntree",
        "qteSortie",
      ];

      for (let key of tabQuantite) {
        if (item[key] != 0) {
          try {
            item[key] = item[key].toFixed(
              parametres.nombreChiffresApresVerguleQuantite
            );
          } catch (e) {
            consolelog(e);

            item[key] = item[key].toFixed(3);
          }
        }
      }

      for (let key of tabPrix) {
        if (item[key] != 0) {
          try {
            item[key] = item[key].toFixed(
              parametres.nombreChiffresApresVerguleNormale
            );
          } catch (e) {
            consolelog(e);

            item[key] = item[key].toFixed(3);
          }
        }
      }
    }

    for (let i = 0; i < listGlobal.length - 1; i++) {
      for (let j = i + 1; j < listGlobal.length; j++) {
        if (listGlobal[i].reference > listGlobal[j].reference) {
          let aux = listGlobal[i];
          listGlobal[i] = listGlobal[j];
          listGlobal[j] = aux;
        }
      }
    }

    return res.send({ status: true, listGlobal: listGlobal });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /mouvementStocks/valeurStock:
 *   post:
 *     summary: Returns the list of all the MouvementStocks
 *     tags: [MouvementStocks]
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
 *         description: The list of the MouvementStocks
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
 *                            libelle:
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
router.post("/valeurStock", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin));

    var article = req.body.article;

    console.log(article);

    listGlobal = [];

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

    if (ObjectId.isValid(article.categorie))
      pipeline.push({ $match: { categorie: ObjectId(article.categorie) } });

    if (ObjectId.isValid(article.famille))
      pipeline.push({ $match: { famille: ObjectId(article.famille) } });

    if (ObjectId.isValid(article.sousFamille))
      pipeline.push({ $match: { sousFamille: ObjectId(article.sousFamille) } });

    if (ObjectId.isValid(article.sousArticle))
      pipeline.push({ $match: { _id: ObjectId(article.sousArticle) } });

    pipeline.push({
      $lookup: {
        from: "articlesocietes",
        let: { article: "$_id", societe: societeRacine },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$article", "$$article"] },
                  { $eq: ["$societe", "$$societe"] },
                ],
              },
            },
          },
        ],
        as: "articlesocietes",
      },
    });

    pipeline.push({
      $lookup: {
        from: "categories",
        let: { categorie: "$categorie" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$categorie"] }],
              },
            },
          },
        ],
        as: "categories",
      },
    });

    pipeline.push({
      $lookup: {
        from: "familles",
        let: { famille: "$famille" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$famille"] }],
              },
            },
          },
        ],
        as: "familles",
      },
    });

    pipeline.push({
      $lookup: {
        from: "sousfamilles",
        let: { sousFamille: "$sousFamille" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$sousFamille"] }],
              },
            },
          },
        ],
        as: "sousfamilles",
      },
    });

    pipeline.push({
      $set: {
        categorie: { $arrayElemAt: ["$categories.libelle", 0] },
        famille: { $arrayElemAt: ["$familles.libelle", 0] },
        sousFamille: { $arrayElemAt: ["$sousfamilles.libelle", 0] },
        id: "$_id",

        qteStock: { $arrayElemAt: ["$articlesocietes.qteEnStock", 0] },
      },
    });

    pipeline.push({ $match: { qteStock: { $gt: 0 } } });

    pipeline.push({
      $project: {
        id: 1,
        reference: 1,
        designation: 1,
        categorie: 1,
        famille: 1,
        sousFamille: 1,
        qteStock: 1,

        prixAchat: { $toDouble: "$prixAchat" },
        prixAchatTTC: { $toDouble: "$prixAchatTTC" },
        prixTTC: { $toDouble: "$prixTTC" },
        prixVenteHT: { $toDouble: "$prixVenteHT" },
        prixRevient: { $toDouble: "$prixRevient" },
        prixRevientTTC: { $toDouble: "$prixRevientTTC" },

        valeurAchatHT: {
          $toString: { $multiply: ["$prixAchat", "$qteStock"] },
        },
        valeurAchatTTC: {
          $toString: {
            $multiply: [{ $add: ["$prixAchatTTC", "$redevance"] }, "$qteStock"],
          },
        },
        valeurVenteTTC: { $toString: { $multiply: ["$prixTTC", "$qteStock"] } },
        valeurVenteHT: {
          $toString: { $multiply: ["$prixVenteHT", "$qteStock"] },
        },
        valeurRevientHT: {
          $toString: { $multiply: ["$prixRevient", "$qteStock"] },
        },
        valeurRevientTTC: {
          $toString: { $multiply: ["$prixRevientTTC", "$qteStock"] },
        },
      },
    });

    var sommePipeline = [];
    for (let key in pipeline) {
      sommePipeline.push(pipeline[key]);
    }

    pipeline.push({
      $sort: sort,
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

    const articles = await Article.aggregate(pipeline);

    listGlobal = articles;

    /*    if (article.categorie.length > 0 || article.sousArticle.length > 0 || article.famille.length > 0 || article.sousFamille.length > 0) {
        
                listGlobal = await filter(articles, article)
        
                for (let item in listGlobal) {
        
                    let indice = rechercheIndice(listGlobal[item].id, articles)
        
                    listGlobal[item].valeurAchatHT = articles[indice].valeurAchatHT
                    listGlobal[item].valeurAchatTTC = articles[indice].valeurAchatTTC
                    listGlobal[item].valeurVenteTTC = articles[indice].valeurVenteTTC
                    listGlobal[item].valeurVenteHT = articles[indice].valeurVenteHT
                    listGlobal[item].valeurRevientHT = articles[indice].valeurRevientHT
                    listGlobal[item].valeurRevientTTC = articles[indice].valeurRevientTTC
                }
            }*/

    return res.send({ status: true, listGlobal: listGlobal });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /mouvementStocks/getById/{id}:
 *   get:
 *     summary: Remove the mouvementStock by id
 *     tags: [MouvementStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The MouvementStock id
 *
 *     responses:
 *       200:
 *         description: The MouvementStock was deleted
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
 *         description: The MouvementStock was not found
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

    const mouvementStock = await MouvementStock.findOne({ _id: req.params.id });

    return res.send({ status: true, resultat: mouvementStock });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

/**
 * @swagger
 * /mouvementStocks/getAllParametres/{id}:
 *   get:
 *     summary: Remove the MouvementStocks by id
 *     tags: [MouvementStocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The MouvementStocks id
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
 *                  MouvementStocks:
 *                    type: array
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.get("/getAllParametres/:id", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id));
    const mouvementStocks = await MouvementStock.find({
      societeRacine: societeRacine,
    });
    return res.send({ status: true, mouvementStocks: mouvementStocks });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/journalVentes", verifytoken, async (req, res) => {
  try {
    var dateStart = new Date();
    var dateEnd = new Date();

    if (req.body.dateStart) {
      dateStart = new Date(req.body.dateStart);
    }

    if (req.body.dateEnd) {
      dateEnd = new Date(req.body.dateEnd);
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

    // Start BON Livraison
    var pipelineBonLivraison = [];

    if (ObjectId.isValid(req.body.client)) {
      pipelineBonLivraison.push({
        $match: {
          date: { $lte: dateEnd, $gte: dateStart },
          societe: ObjectId(req.body.magasin),
          client: ObjectId(req.body.client),
        },
      });
    } else {
      pipelineBonLivraison.push({
        $match: {
          date: { $lte: dateEnd, $gte: dateStart },
          societe: ObjectId(req.body.magasin),
        },
      });
    }

    pipelineBonLivraison.push({
      $lookup: {
        from: "bonlivraisonarticles",
        let: { bonLivraison: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$bonLivraison", "$bonLivraison"] }],
              },
            },
          },
        ],
        as: "articles",
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "factureventes",
        let: { factureVente: "$factureVente" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$factureVente", "$_id"] }],
              },
            },
          },
        ],
        as: "factures",
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "clients",
        let: { client: "$client" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$client", "$_id"] }],
              },
            },
          },
        ],
        as: "clients",
      },
    });

    pipelineBonLivraison.push({
      $set: {
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        facture: { $arrayElemAt: ["$factures.numero", 0] },
        dateFacture: { $arrayElemAt: ["$factures.date", 0] },
        document: "BL",
        id: "$_id",
      },
    });

    pipelineBonLivraison.push({
      $unwind: {
        path: "$articles",
      },
    });

    // End BON Livraison

    // Start BON RETOUR CLIENT

    var pipelineBonRetour = [];

    pipelineBonRetour.push({
      $match: {
        date: { $lte: dateEnd, $gte: dateStart },
        societe: ObjectId(req.body.magasin),
      },
    });

    pipelineBonRetour.push({
      $lookup: {
        from: "bonretourclientarticles",
        let: { bonRetourClient: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$bonRetourClient", "$bonRetourClient"] }],
              },
            },
          },
        ],
        as: "articles",
      },
    });

    pipelineBonRetour.push({
      $lookup: {
        from: "clients",
        let: { client: "$client" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$client", "$_id"] }],
              },
            },
          },
        ],
        as: "clients",
      },
    });

    pipelineBonRetour.push({
      $set: {
        client: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        facture: "",
        dateFacture: "",
        document: "BR",
        id: "$_id",
      },
    });

    pipelineBonRetour.push({
      $unwind: {
        path: "$articles",
      },
    });

    pipelineBonLivraison.push({
      $unionWith: { coll: "bonretourclients", pipeline: pipelineBonRetour },
    });

    pipelineBonLivraison.push({
      $set: {
        article: "$articles.article",
        reference: "$articles.reference",
        designation: "$articles.designation",
        prixAchat: { $toString: "$articles.prixAchat" },
        prixRevient: { $toString: "$articles.prixRevient" },
        quantite: { $toString: "$articles.quantiteVente" },
        prixVenteHT: { $toString: "$articles.prixVenteHTReel" },
        tauxRemise: { $toString: "$articles.tauxRemise" },
        montantRemise: { $toString: "$articles.montantRemise" },
        totalHT: { $toString: "$articles.totalHT" },
        tauxTVA: { $toString: "$articles.tauxTVA" },
        totalTVA: { $toString: "$articles.totalTVA" },
        totalTTC: { $toString: "$articles.totalTTC" },
        totalGainCommerciale: { $toString: "$articles.totalGainCommerciale" },
        totalGainReel: { $toString: "$articles.totalGainReel" },

        id: "$_id",
      },
    });

    pipelineBonLivraison.push({
      $project: {
        clients: 0,
        exercice: 0,
        num: 0,
        timbreFiscale: 0,
        montantEscompte: 0,
        totalDC: 0,
        totalRedevance: 0,
        totalFodec: 0,
        isPayee: 0,
        montantTotal: 0,
        montantPaye: 0,
        restPayer: 0,
        isTransfert: 0,
        isVenteContoire: 0,
        coutTransport: 0,
        factures: 0,
        articles: 0,
        factureVente: 0,
        transporteur: 0,
        projet: 0,
        ordreMission: 0,
        societe: 0,
        createdAt: 0,
        updatedAt: 0,
        expeditions: 0,
        __v: 0,
        _id: 0,
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "articles",
        let: { article: "$article" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$article", "$_id"] }],
              },
            },
          },
        ],
        as: "articles",
      },
    });

    pipelineBonLivraison.push({
      $set: {
        categorie: { $arrayElemAt: ["$articles.categorie", 0] },
        famille: { $arrayElemAt: ["$articles.famille", 0] },
        sousFamille: { $arrayElemAt: ["$articles.sousFamille", 0] },
        reference: { $arrayElemAt: ["$articles.reference", 0] },
        designation: { $arrayElemAt: ["$articles.designation", 0] },
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "categories",
        let: { categorie: "$categorie" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$categorie", "$_id"] }],
              },
            },
          },
        ],
        as: "categories",
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "familles",
        let: { famille: "$famille" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$famille", "$_id"] }],
              },
            },
          },
        ],
        as: "familles",
      },
    });

    pipelineBonLivraison.push({
      $lookup: {
        from: "sousfamilles",
        let: { sousFamille: "$sousFamille" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$sousFamille", "$_id"] }],
              },
            },
          },
        ],
        as: "sousfamilles",
      },
    });

    pipelineBonLivraison.push({
      $set: {
        categorieLibelle: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$categories" },
                { $gt: [{ $size: "$categories" }, 0] },
              ],
            },
            then: { $arrayElemAt: ["$categories.libelle", 0] },
            else: "",
          },
        },
        familleLibelle: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$familles" },
                { $gt: [{ $size: "$familles" }, 0] },
              ],
            },
            then: { $arrayElemAt: ["$familles.libelle", 0] },
            else: "",
          },
        },
        sousFamilleLibelle: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$sousfamilles" },
                { $gt: [{ $size: "$sousfamilles" }, 0] },
              ],
            },
            then: { $arrayElemAt: ["$sousfamilles.libelle", 0] },
            else: "",
          },
        },
        categorie: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$categories" },
                { $gt: [{ $size: "$categories" }, 0] },
              ],
            },
            then: { $toString: { $arrayElemAt: ["$categories._id", 0] } },
            else: "",
          },
        },
        famille: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$familles" },
                { $gt: [{ $size: "$familles" }, 0] },
              ],
            },
            then: { $toString: { $arrayElemAt: ["$familles._id", 0] } },
            else: "",
          },
        },
        sousFamille: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$sousfamilles" },
                { $gt: [{ $size: "$sousfamilles" }, 0] },
              ],
            },
            then: { $toString: { $arrayElemAt: ["$sousfamilles._id", 0] } },
            else: "",
          },
        },
        article: { $toString: "$article" },
      },
    });

    pipelineBonLivraison.push({
      $project: {
        categories: 0,
        familles: 0,
        sousfamilles: 0,
      },
    });

    req.body.search.categorie = req.body.article.categorie;
    req.body.search.famille = req.body.article.famille;
    req.body.search.sousFamille = req.body.article.sousFamille;
    req.body.search.article = req.body.article.sousArticle;

    var search = req.body.search;

    for (let key in search) {
      if (search[key] && search[key] != "") {
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
        pipelineBonLivraison.push(objectParent);
      }
    }

    pipelineBonLivraison.push({
      $sort: sort,
    });

    // End BON RETOUR CLIENT

    const articles = await BonLivraison.aggregate(pipelineBonLivraison);

    console.log(articles);

    return res.send({ status: true, listGlobal: articles });
  } catch (e) {
    consolelog(e);

    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getALLParametresJournalVentes", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin));

    var clients = await Client.find({ societeRacine: societeRacine });

    return res.send({ status: true, clients: clients });
  } catch (e) {
    consolelog(e);

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

module.exports.routerMouvementStock = router;
