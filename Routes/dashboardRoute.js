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
const { Transporteur } = require("../Models/transporteursModel");
const { Liltrage } = require("../Models/liltrageModel");
const { BonAchat } = require("../Models/bonAchatModel");
const { BonReception } = require("../Models/bonReceptionModel");
const { BonLivraisonArticle } = require("../Models/bonLivraisonArticleModel");
const { SituationReglement } = require("../Models/situationReglementModel");
const { Article } = require("../Models/articleModel");
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

router.get("/calculChiffreAffaire/:idSociete", async (req, res) => {
  try {
    consolelog2("dashboard : route 1 (start)") 
   
    const societe = ObjectId(req.params.idSociete);
    const societeRacine = await getSocieteRacine(req.params.idSociete);

    if(!societeRacine){
      consolelog2("societeRacine undefined dashboard : route 1") 
      return res.send({ status: false })
    }

    var pipeChiffreAffaireMois = [];
    var pipeChiffreAffaireAns = [];

    pipeChiffreAffaireMois.push({
      $facet: {
        bonLivraison: [
          {
            $lookup: {
              from: "bonlivraisons",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                  },
                },
                {
                  $set: {
                    year: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y-%m",
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
        bonRetour: [
          {
            $lookup: {
              from: "bonretourclients",
              pipeline: [
                {
                  $match: {
                    societe: societe,
                  },
                },
                {
                  $set: {
                    year: {
                      $dateToString: {
                        date: "$date",
                        format: "%Y-%m",
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
    pipeChiffreAffaireMois.push({
      $project: {
        data: {
          $concatArrays: [
            {
              $arrayElemAt: ["$bonLivraison.bonLivraisonArray", 0],
            },
            {
              $arrayElemAt: ["$bonRetour.bonRetourArray", 0],
            },
          ],
        },
      },
    });
    pipeChiffreAffaireMois.push({
      $unwind: "$data",
    });

    pipeChiffreAffaireMois.push({
      $replaceRoot: { newRoot: "$data" },
    });
    pipeChiffreAffaireMois.push({
      $group: {
        _id: "$_id",
        chiffreAffaire: { $sum: "$montantVente" },
      },
    });

    pipeChiffreAffaireAns.push({
      $facet: {
        bonLivraison: [
          {
            $lookup: {
              from: "bonlivraisons",
              pipeline: [
                {
                  $match: {
                    societe: societe,
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
        bonRetour: [
          {
            $lookup: {
              from: "bonretourclients",
              pipeline: [
                {
                  $match: {
                    societe: societe,
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
    pipeChiffreAffaireAns.push({
      $project: {
        data: {
          $concatArrays: [
            {
              $arrayElemAt: ["$bonLivraison.bonLivraisonArray", 0],
            },
            {
              $arrayElemAt: ["$bonRetour.bonRetourArray", 0],
            },
          ],
        },
      },
    });
    pipeChiffreAffaireAns.push({
      $unwind: "$data",
    });

    pipeChiffreAffaireAns.push({
      $replaceRoot: { newRoot: "$data" },
    });
    pipeChiffreAffaireAns.push({
      $group: {
        _id: "$_id",
        chiffreAffaire: { $sum: "$montantVente" },
      },
    });

    var mois = await BonLivraison.aggregate(pipeChiffreAffaireMois);
    var ans = await BonLivraison.aggregate(pipeChiffreAffaireAns);

    consolelog2("dashboard : route 1 (end)") 

    res.send({ mois: mois, ans: ans });
  } catch (error) {
    console.log(error);
    return res.send({ status: false });
  }
});

router.get("/getDLMsClients/:idSociete", async (req, res) => {
  try {

    consolelog2("dashboard : route 2 (start)") 
    
    // const societe = ObjectId(req.params.idSociete);
    // const societeRacine = await getSocieteRacine(req.params.idSociete);

    // if(!societeRacine) return res.send({status:false})
    
    // var dateStart = new Date();
    // var dateEnd = new Date();

    // dateStart.setFullYear(dateStart.getFullYear() - 1);

    // var clientsDlm = await getDlmClients(
    //   societe,
    //   societeRacine,
    //   dateStart,
    //   dateEnd
    // );
    // var fournisseursDlm = await getDlmFournisseurs(
    //   societe,
    //   societeRacine,
    //   dateStart,
    //   dateEnd
    // );

    // var dmsArticles = await getDmsArticles(
    //   societe,
    //   societeRacine,
    //   dateStart,
    //   dateEnd
    // );

    // var fournisseursDlmMoyenne = 0;
    // fournisseursDlm.forEach((element) => {
    //   fournisseursDlmMoyenne += element.dlm;
    // });

    // fournisseursDlmMoyenne = fournisseursDlmMoyenne / fournisseursDlm.length;

    // consolelog2("dashboard : route 2 (end)") 

    // return res.send({
    //   dmsArticles: dmsArticles,
    //   status: true,
    //   listGlobal: clientsDlm,
    //   fournisseursDlm: fournisseursDlmMoyenne,
    //   request: req.body,
    // });

     return res.send({
      dmsArticles: 0,
      status: true,
      listGlobal: [],
      fournisseursDlm: 0,
      request: req.body,
    });

   
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    return res.send({ status: false }); // pass exception object to error handler
  }
});

router.post("/getAllParametres", async (req, res) => {
  try {
    var societe =await getSocieteRacine(req.body.societe);
    
    
  } catch (e) {
    consolelog(e) 
    
    console.log(e);
    return res.send({ status: false });
  }
});

async function getDmsArticles(societe, societeRacine, dateStart, dateEnd) {
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
          cond: { $eq: ["$$item.article", "$$article"] },
        },
      },
    },
  });

  pipelineCorrectionStock.push({
    $project: {
      date: 1,
      id: { $arrayElemAt: ["$ligneCorrectionStocks._id", 0] },
      designation: { $arrayElemAt: ["$ligneCorrectionStocks.designation", 0] },
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
      let: { article: "$$article", bonCasse: "$_id" },
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

  var pipelineBonLivraison = [];

  pipelineBonLivraison.push({
    $match: { date: { $lte: dateEnd, $gte: dateStart }, societe: societe },
  });

  pipelineBonLivraison.push({
    $lookup: {
      from: "bonlivraisonarticles",
      let: { article: "$$article", bonLivraison: "$_id" },
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

  pipelineBonLivraison.push({
    $project: {
      date: 1,
      id: "$bonlivraisonarticles._id",
      designation: "$bonlivraisonarticles.designation",
      quantiteVente: { $sum: "$bonlivraisonarticles.quantiteVente" },
      article: "$bonlivraisonarticles.article",
    },
  });

  pipelineBonLivraison.push({
    $unionWith: { coll: "boncasses", pipeline: pipelineBonCasse },
  });

  pipelineBonLivraison.push({
    $unionWith: { coll: "correctionstocks", pipeline: pipelineCorrectionStock },
  });

  pipelineBonLivraison.push({
    $sort: { date: 1 },
  });

  pipelineBonLivraison.push({ $match: { quantiteVente: { $ne: 0 } } });

  var pipelineBonReceptions = [];

  pipelineBonReceptions.push({
    $match: {
      $expr: {
        $and: [
          { $eq: ["$$societe", "$societe"] },
          { $lte: ["$date", "$$dateEnd"] },
          { $gte: ["$date", "$$dateStart"] },
        ],
      },
    },
  });

  pipelineBonReceptions.push({
    $lookup: {
      from: "bonreceptionarticles",
      let: { article: "$$article", bonReception: "$_id" },
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

  pipelineBonReceptions.push({
    $unwind: {
      path: "$bonreceptionarticles",
    },
  });

  pipelineBonReceptions.push({
    $project: {
      date: 1,
      id: "$bonreceptionarticles._id",
      designation: "$bonreceptionarticles.designation",
      quantiteAchat: { $sum: "$bonreceptionarticles.quantiteAchat" },
      article: "$bonreceptionarticles.article",
    },
  });

  pipelineBonReceptions.push({
    $sort: { date: 1 },
  });

  var pipelineBonReceptionsEncien = [];

  pipelineBonReceptionsEncien.push({
    $match: {
      $expr: {
        $and: [
          { $eq: ["$$societe", "$societe"] },
          { $lt: ["$date", "$$dateStart"] },
        ],
      },
    },
  });

  pipelineBonReceptionsEncien.push({
    $lookup: {
      from: "bonreceptionarticles",
      let: { article: "$$article", bonReception: "$_id" },
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

  pipelineBonReceptionsEncien.push({
    $unwind: {
      path: "$bonreceptionarticles",
    },
  });

  pipelineBonReceptionsEncien.push({
    $project: {
      _id: 1,
      date: 1,
      id: "$bonreceptionarticles._id",
      designation: "$bonreceptionarticles.designation",
      quantiteAchat: { $sum: "$bonreceptionarticles.quantiteAchat" },
      article: "$bonreceptionarticles.article",
    },
  });

  pipelineBonReceptionsEncien.push({
    $sort: { date: -1 },
  });

  pipelineBonReceptionsEncien.push({ $limit: 1 });

  var pipeline = [];

  pipeline.push({ $match: { societeRacine: ObjectId(societeRacine) } });

  pipeline.push({
    $lookup: {
      from: "bonlivraisons",
      let: {
        article: "$_id",
        dateStart: dateStart,
        dateEnd: dateEnd,
        societe: ObjectId(societe),
      },
      pipeline: pipelineBonLivraison,
      as: "bonLivraisons",
    },
  });

  pipeline.push({
    $lookup: {
      from: "bonreceptions",
      let: {
        article: "$_id",
        dateStart: dateStart,
        dateEnd: dateEnd,
        societe: ObjectId(societe),
      },
      pipeline: pipelineBonReceptions,
      as: "bonReceptions",
    },
  });

  pipeline.push({
    $lookup: {
      from: "bonreceptions",
      let: {
        article: "$_id",
        dateStart: dateStart,
        dateEnd: dateEnd,
        societe: ObjectId(societe),
      },
      pipeline: pipelineBonReceptionsEncien,
      as: "bonReceptionsEncien",
    },
  });

  const articles1 = await Article.aggregate(pipeline);

  var articles = JSON.parse(JSON.stringify(articles1));

  var newDms = [];

  for (let p = 0; p < articles.length; p++) {
    var bonLivraisons = articles[p].bonLivraisons;
    var bonReceptionsEncien = articles[p].bonReceptions;
    var bonReceptions = articles[p].bonReceptionsEncien;

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

    //newDms.
  }

  return bonLivraisons;
}

async function getDlmFournisseurs(societe, societeRacine, dateStart, dateEnd) {
  try {
    var pipeline = [];

    pipeline.push({ $match: { societeRacine: ObjectId(societeRacine) } });

    pipeline.push({
      $lookup: {
        from: "bonreceptions",
        let: {
          fournisseur: "$_id",
          dateStart: dateStart,
          dateEnd: dateEnd,
          societe: ObjectId(societe),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$fournisseur", "$$fournisseur"] },
                  { $eq: ["$societe", "$$societe"] },
                  { $lte: ["$date", "$$dateEnd"] },
                  { $gte: ["$date", "$$dateStart"] },
                ],
              },
            },
          },
          {
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
                    numeroReglement: {
                      $arrayElemAt: ["$reglements.numero", 0],
                    },
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
          },
          {
            $set: {
              nbj: { $sum: "$liltrages.nbj" },
              aaa: {
                $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"],
              },
              id: "$_id",
            },
          },
          {
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
          },
        ],
        as: "bonLivraisons",
      },
    });

    pipeline.push({
      $set: {
        dlm: {
          $cond: [
            { $eq: [{ $sum: "$bonLivraisons.montantTotal" }, 0] },
            0,
            {
              $divide: [
                { $sum: "$bonLivraisons.montantAfterMultiply" },
                { $sum: "$bonLivraisons.montantTotal" },
              ],
            },
          ],
        },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        dlm: 1,
        raisonSociale: 1,
      },
    });

    const articles = await Fournisseur.aggregate(pipeline);

    return articles;
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
    // return res.send({ status: false }) // pass exception object to error handler
  }
}

async function getDlmClients(societe, societeRacine, dateStart, dateEnd) {
  try {
    var pipeline = [];

    pipeline.push({ $match: { societeRacine: ObjectId(societeRacine) } });

    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: {
          client: "$_id",
          dateStart: dateStart,
          dateEnd: dateEnd,
          societe: ObjectId(societe),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$client", "$$client"] },
                  { $eq: ["$societe", "$$societe"] },
                  { $lte: ["$date", "$$dateEnd"] },
                  { $gte: ["$date", "$$dateStart"] },
                ],
              },
            },
          },
          {
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
                    numeroReglement: {
                      $arrayElemAt: ["$reglements.numero", 0],
                    },
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
          },
          {
            $set: {
              nbj: { $sum: "$liltrages.nbj" },
              aaa: {
                $divide: [{ $sum: "$liltrages.montantNbj" }, "$montantTotal"],
              },
              id: "$_id",
            },
          },
          {
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
          },
        ],
        as: "bonLivraisons",
      },
    });

    pipeline.push({
      $set: {
        dlm: {
          $cond: [
            { $eq: [{ $sum: "$bonLivraisons.montantTotal" }, 0] },
            0,
            {
              $divide: [
                { $sum: "$bonLivraisons.montantAfterMultiply" },
                { $sum: "$bonLivraisons.montantTotal" },
              ],
            },
          ],
        },
        id: "$_id",
      },
    });

    pipeline.push({
      $project: {
        id: 1,
        dlm: 1,
        raisonSociale: 1,
      },
    });

    const articles = await Client.aggregate(pipeline);

    return articles;
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e);
  }
}

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

module.exports.routerDashboard = router;
