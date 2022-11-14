
const {
  MouvementStock,
  rechercheIndice,
  findByArticle,
  regrouperArticles,
  filter,
} = require("../Models/mouvementStockModel");
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
const { Transporteur } = require("../Models/transporteursModel");
const { consolelog } = require("../Models/errorModel");
var ObjectId = require("mongodb").ObjectID;

router.post('/getTransportInformation', verifytoken, async (req, res) => {
  try {

    var societe = req.body.magasin;
    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societeRacine = await getSocieteRacine(societe);

    var search = req.body.search;

    var itemMatch = {
      date: { $lte: dateEnd, $gte: dateStart },
      societe: ObjectId(societe),
      coutTransport: { $gt: 0 },
    }

    var primarykeys = ["client", "fournisseur", "transporteur"]
    for (let key of primarykeys) {
      if (req.body[key] && isValidObjectId(req.body[key])) {
        itemMatch[key] = ObjectId(req.body[key])
      }
    }

    var filterMatch = {
      $match: itemMatch,
    }

    var filterTransporteur = {
      $lookup: {
        from: "transporteurs",
        let: { transporteur: "$transporteur" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$transporteur"] }],
              },
            },
          },
        ],
        as: "transporteurs",
      },
    }

    var filterProject = {
      $project: {
        codeTiers: 1,
        tiers: 1,
        typeTiers: 1,
        transporteur: 1,
        num_doc: 1,
        type_doc: 1,
        coutTransport: 1,
        date_doc: 1,
        id: 1,
        numVehicule: 1
      },
    }

    var filterClient = {
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
            $lookup: {
              from: "typetiers",
              let: { typetiers: "$typeTiers" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$typetiers"] }],
                    },
                  },
                },
              ],
              as: "typetiers",
            },
          },
          {
            $set: {
              typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },
            },
          }
        ],

        as: "clients",
      },
    }

    var filterFournisseur = {
      $lookup: {
        from: "fournisseurs",
        let: { client: "$fournisseur" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$client"] }],
              },
            },
          },
          {
            $lookup: {
              from: "typetiers",
              let: { typetiers: "$typeTiers" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$typetiers"] }],
                    },
                  },
                },
              ],
              as: "typetiers",
            },
          },
          {
            $set: {
              typeTiers: { $arrayElemAt: ["$typetiers.libelle", 0] },
            },
          }
        ],

        as: "clients",
      },
    }

    var filterSetBonLivraison = {
      $set: {
        codeTiers: { $arrayElemAt: ["$clients.code", 0] },
        tiers: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        typeTiers: { $arrayElemAt: ["$clients.typeTiers", 0] },
        transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
        numVehicule: { $arrayElemAt: ["$transporteurs.numVehicule", 0] },
        num_doc: "$numero",
        type_doc: "Bon Livraison",
        coutTransport: "$coutTransport",
        date_doc: "$date",
        id: "$_id",
      },
    }

    var filterSetBonRetourClient = {
      $set: {
        codeTiers: { $arrayElemAt: ["$clients.code", 0] },
        tiers: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        typeTiers: { $arrayElemAt: ["$clients.typeTiers", 0] },
        transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
        numVehicule: { $arrayElemAt: ["$transporteurs.numVehicule", 0] },
        num_doc: "$numero",
        type_doc: "Bon Retour Client",
        coutTransport: "$coutTransport",
        date_doc: "$date",
        id: "$_id",
      },
    }

    var filterSetBonReception = {
      $set: {
        codeTiers: { $arrayElemAt: ["$clients.code", 0] },
        tiers: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        typeTiers: { $arrayElemAt: ["$clients.typeTiers", 0] },
        transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
        numVehicule: { $arrayElemAt: ["$transporteurs.numVehicule", 0] },
        num_doc: "$numero",
        type_doc: "Bon Reception",
        coutTransport: "$coutTransport",
        date_doc: "$date",
        id: "$_id",
      },
    }

    var filterSetBonRetourFournisseur = {
      $set: {
        codeTiers: { $arrayElemAt: ["$clients.code", 0] },
        tiers: { $arrayElemAt: ["$clients.raisonSociale", 0] },
        typeTiers: { $arrayElemAt: ["$clients.typeTiers", 0] },
        transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
        numVehicule: { $arrayElemAt: ["$transporteurs.numVehicule", 0] },
        num_doc: "$numero",
        type_doc: "Bon Retour Fournisseur",
        coutTransport: "$coutTransport",
        date_doc: "$date",
        id: "$_id",
      },
    }

    var pipelineBL = [];
    pipelineBL.push(filterMatch);
    pipelineBL.push(filterClient);
    pipelineBL.push(filterTransporteur);
    pipelineBL.push(filterSetBonLivraison);
    pipelineBL.push(filterProject);

    var pipelineBRC = []
    pipelineBRC.push(filterMatch);
    pipelineBRC.push(filterClient);
    pipelineBRC.push(filterTransporteur);
    pipelineBRC.push(filterSetBonRetourClient);
    pipelineBRC.push(filterProject);

    var pipelineBR = [];
    pipelineBR.push(filterMatch);
    pipelineBR.push(filterFournisseur);
    pipelineBR.push(filterTransporteur);
    pipelineBR.push(filterSetBonReception);
    pipelineBR.push(filterProject);

    var pipelineBRF = [];
    pipelineBRF.push(filterMatch);
    pipelineBRF.push(filterFournisseur);
    pipelineBRF.push(filterTransporteur);
    pipelineBRF.push(filterSetBonRetourFournisseur);
    pipelineBRF.push(filterProject);

    if(req.body.selectType === 0){
      pipelineBL.push({
        $unionWith: { coll: "bonretourclients", pipeline: pipelineBRC },
      });
    
      pipelineBL.push({
        $unionWith: { coll: "bonreceptions", pipeline: pipelineBR },
      });
  
      pipelineBL.push({
        $unionWith: { coll: "bonretourfournisseurs", pipeline: pipelineBRF },
      });
    }else if(req.body.selectType === 1){
      pipelineBL.push({
        $unionWith: { coll: "bonretourclients", pipeline: pipelineBRC },
      });
    } else if(req.body.selectType === 2){
    
      pipelineBL = pipelineBR
  
      pipelineBL.push({
        $unionWith: { coll: "bonretourfournisseurs", pipeline: pipelineBRF },
      });
    }
   
   
    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    
    if (Object.keys(sort).length == 0) {
      sort = { date_doc: -1 };
    }

    pipelineBL.push({
      $sort: sort,
    });
    
    pipelineBL.push({
      $set: {
        date_doc: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$date_doc",
          },
        },
      },
    })

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
        pipelineBL.push(objectParent);
      }
    }

    var pipelineBL2 = []

    for (let key in pipelineBL) {
      pipelineBL2.push(pipelineBL[key]);
    }

    var skip = Number(req.body.page - 1) * Number(req.body.limit);

    pipelineBL.push({ $limit: skip + Number(req.body.limit) });

    pipelineBL.push({ $skip: skip });

    var articles = []

    if(req.body.selectType === 2){
      articles = await BonReception.aggregate(pipelineBL);
    }else{
      articles = await BonLivraison.aggregate(pipelineBL);
    }
    
    var parameters = await Parametres.findOne({societeRacine:societeRacine})
    if(parameters){
      for(let item of articles){
        item.coutTransport = item.coutTransport.toFixed(parameters.nombreChiffresApresVerguleNormale)
      }
    }

    pipelineBL2.push({
      $count: "total",
    });

    var nbrGlobalTotal = 0
    if(req.body.selectType === 2){
      nbrGlobalTotal = await BonReception.aggregate(pipelineBL2);
    }else{
      nbrGlobalTotal = await BonLivraison.aggregate(pipelineBL2);
    }

  
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

    const result = { docs: articles, pages: pages };


    
    // var bonLivraisons = await BonLivraison.aggregate(pipelineBL);

    /*var societesFiltree = []
    for(let item of societes){
        if(item.id != societe){
            societesFiltree.push(item)
        }
    }*/

    return res.send({ status: true, result: result, request:req.body })
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})



router.post('/getALLParametresEtatTransport', verifytoken, async (req, res) => {

  try {

    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin))
    var clients = await Client.find({ societeRacine: societeRacine }).select('id raisonSociale')
    var fournisseurs = await Fournisseur.find({ societeRacine: societeRacine }).select('id raisonSociale')
    var transporteurs = await Transporteur.find({ societeRacine: societeRacine })

    return res.send({ status: true, clients: clients, fournisseurs: fournisseurs, transporteurs: transporteurs })

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
    // console.log("etape100");
    res.sendStatus(401);
  }
}

module.exports.routerEtatTransport = router;
