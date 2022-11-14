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
const { consolelog, consolelog2 } = require("../Models/errorModel");
var ObjectId = require("mongodb").ObjectID;

router.post("/journalVentes", verifytoken, async (req, res) => {
  try {

    consolelog2("journalVentes : route 1 (start)") 

    var dateStart = new Date(req.body.dateStart);
    var dateEnd = new Date(req.body.dateEnd);
    var societe = req.body.magasin;
    var societeRacine = await getSocieteRacine(societe);

    var pipeline = [];
    var pipelineRetour = [];

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { date: -1 , numero:-1};
    }

    pipelineRetour.push({
      $lookup: {
        from: "bonretourclients",
        let: { bonRetour: "$bonRetourClient" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonRetour"] }],
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
              ],
              as: "client",
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
                  },
                },
              ],
              as: "factureVente",
            },
          },
          {
            $match: {
              societe: ObjectId(societe),
              date: { $lte: dateEnd, $gte: dateStart },
            },
          },
          {
            $project: {
              date: "$date",
              numero: "$numero",
              totalGainCommerciale: "$totalGainCommerciale",
              totalGainReel: "$totalGainReel",
              idClient: { $arrayElemAt: ["$client._id", 0] },
              code_cl: { $arrayElemAt: ["$client.code", 0] },
              client: { $arrayElemAt: ["$client.raisonSociale", 0] },
              facture: { $arrayElemAt: ["$factureVente.numero", 0] },
              dateFacture: { $arrayElemAt: ["$factureVente.date", 0] },
            },
          },
        ],
        as: "bonRetourArray",
      },
    });
    pipelineRetour.push({
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
              let: { cat: "$categorie" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$cat"] }],
                    },
                  },
                },
                {
                  $set: {
                    id: "$_id",
                    categorie: "$libelle",
                  },
                },
              ],
              as: "categories",
            },
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
                {
                  $set: {
                    id: "$_id",
                    famille: "$libelle",
                  },
                },
              ],
              as: "familles",
            },
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
                {
                  $set: {
                    id: "$_id",
                    sousfamille: "$libelle",
                  },
                },
              ],
              as: "sousfamilles",
            },
          },
          {
            $set: {
              id: "$_id",
              categorieArticle: {
                $arrayElemAt: ["$categories.categorie", 0],
              },
              familleArticle: { $arrayElemAt: ["$familles.famille", 0] },
              sousfamilleArticle: {
                $arrayElemAt: ["$sousfamilles.sousfamille", 0],
              },
              categorieArticleID: {
                $arrayElemAt: ["$categories.id", 0],
              },
              familleArticleID: { $arrayElemAt: ["$familles.id", 0] },
              sousfamilleArticleID: {
                $arrayElemAt: ["$sousfamilles.id", 0],
              },
            },
          },
        ],
        as: "articles",
      },
    });
    pipelineRetour.push({
      $set: {
        date: { $arrayElemAt: ["$bonRetourArray.date", 0] },
        numero: { $arrayElemAt: ["$bonRetourArray.numero", 0] },
        code_cl: { $arrayElemAt: ["$bonRetourArray.code_cl", 0] },
        client: { $arrayElemAt: ["$bonRetourArray.client", 0] },
        idClient: { $arrayElemAt: ["$bonRetourArray.idClient", 0] },

        facture: { $arrayElemAt: ["$bonRetourArray.facture", 0] },
        dateFacture: { $arrayElemAt: ["$bonRetourArray.dateFacture", 0] },

        idArticle: { $arrayElemAt: ["$articles.id", 0] },
        categorieArticleID: {
          $arrayElemAt: ["$articles.categorieArticleID", 0],
        },

        familleArticleID: { $arrayElemAt: ["$articles.familleArticleID", 0] },
        sousfamilleArticleID: {
          $arrayElemAt: ["$articles.sousfamilleArticleID", 0],
        },

        categorie: { $arrayElemAt: ["$articlesRetour.categorieArticle", 0] },
        famille: { $arrayElemAt: ["$articlesRetour.familleArticle", 0] },
        sousfamille: {
          $arrayElemAt: ["$articlesRetour.sousfamilleArticle", 0],
        },

        totalGainCommerciale: {
          $arrayElemAt: ["$bonRetourArray.totalGainCommerciale", 0],
        },
        totalGainReel: { $arrayElemAt: ["$bonRetourArray.totalGainReel", 0] },
      },
    });
    pipelineRetour.push({
      $project: {
        societe:"$societe",
        date: "$date",
        numero: "$numero",
        code_cl: "$code_cl",
        client: "$client",
        idClient: "$idClient",
        facture: "$facture",
        dateFacture: "$dateFacture",

        quantite: {$multiply:["$quantiteVente",-1]},
        reference: "$reference",
        designation: "$designation",

        article: "$idArticle",

        categorieArticleID: "$categorieArticleID",

        familleArticleID: "$familleArticleID",
        sousfamilleArticleID: "$sousfamilleArticleID",

        categorieLibelle: "$categorie",
        familleLibelle: "$famille",
        sousFamilleLibelle: "$sousfamille",

        prixAchat: "$prixAchat",
        prixRevient: "$prixRevient",
        margeVar: { $subtract: ["$prixVenteHT", "$prixRevient"] },

        prixVenteHT: "$prixVenteHT",
        tauxRemise: "$tauxRemise",

        montantRemise: "$remiseParMontant",
        totalRemise: {$multiply:[{
          $add: [
            {
              $divide: [
                {
                  $multiply: [
                    { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                    "$tauxRemise",
                  ],
                },
                100,
              ],
            },
            { $multiply: ["$remiseParMontant", "$quantiteVente"] },
          ],
        },-1]},

        totalHT: { $multiply: ["$prixVenteHT", {$multiply:["$quantiteVente",-1]}] },
        totalNetHT: {$multiply:[{
          $subtract: [
            { $multiply: ["$prixVenteHT", "$quantiteVente"] },
            {
              $add: [
                {
                  $divide: [
                    {
                      $multiply: [
                        { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                        "$tauxRemise",
                      ],
                    },
                    100,
                  ],
                },
                { $multiply: ["$remiseParMontant", "$quantiteVente"] },
              ],
            },
          ],
        },-1]},
        tauxTVA: "$tauxTVA",

        totalTVA: {
          $divide: [
            {
              $multiply: [
                {
                  $subtract: [
                    { $multiply: ["$prixVenteHT", {$multiply:["$quantiteVente",-1]}] },
                    {
                      $add: [
                        {
                          $divide: [
                            {
                              $multiply: [
                                {
                                  $multiply: ["$prixVenteHT", {$multiply:["$quantiteVente",-1]}],
                                },
                                "$tauxRemise",
                              ],
                            },
                            100,
                          ],
                        },
                        { $multiply: ["$remiseParMontant", {$multiply:["$quantiteVente",-1]}] },
                      ],
                    },
                  ],
                },
                "$tauxTVA",
              ],
            },
            100,
          ],
        },
        totalTTC: {
          $add: [
            {
              $add: [
                {
                  $subtract: [
                    { $multiply: ["$prixVenteHT", {$multiply:["$quantiteVente",-1]}] },
                    {
                      $add: [
                        {
                          $divide: [
                            {
                              $multiply: [
                                {
                                  $multiply: ["$prixVenteHT",{$multiply:["$quantiteVente",-1]}],
                                },
                                "$tauxRemise",
                              ],
                            },
                            100,
                          ],
                        },
                        { $multiply: ["$remiseParMontant",{$multiply:["$quantiteVente",-1]}] },
                      ],
                    },
                  ],
                },
                { $multiply: ["$redevance",{$multiply:["$quantiteVente",-1]}] },
              ],
            },
            {
              $divide: [
                {
                  $multiply: [
                    {
                      $subtract: [
                        { $multiply: ["$prixVenteHT",{$multiply:["$quantiteVente",-1]}] },
                        {
                          $add: [
                            {
                              $divide: [
                                {
                                  $multiply: [
                                    {
                                      $multiply: [
                                        "$prixVenteHT",
                                        {$multiply:["$quantiteVente",-1]},
                                      ],
                                    },
                                    "$tauxRemise",
                                  ],
                                },
                                100,
                              ],
                            },
                            {
                              $multiply: [
                                "$remiseParMontant",
                                {$multiply:["$quantiteVente",-1]},
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    "$tauxTVA",
                  ],
                },
                100,
              ],
            },
          ],
        },
        redevance: { $multiply: ["$redevance", {$multiply:["$quantiteVente",-1]}] },
        PTTC: {
          $add: [
            {
              $multiply: [
                {
                  $subtract: [
                    "$prixVenteHT",
                    {
                      $add: [
                        "$remiseParMontant",
                        {
                          $divide: [
                            { $multiply: ["$prixVenteHT", "$tauxRemise"] },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $divide: [{ $add: [100, "$tauxTVA"] }, 100] },
              ],
            },
            "$redevance",
          ],
        },
        totalGainCommerciale: {$multiply:["$totalGainCommerciale",-1]},
        totalGainReel:{$multiply:["$totalGainReel",-1]},
      },
    });
    pipeline.push({
      $lookup: {
        from: "bonlivraisons",
        let: { bonlivraison: "$bonLivraison" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonlivraison"] }],
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
              ],
              as: "client",
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
                  },
                },
              ],
              as: "factureVente",
            },
          },
          {
            $match: {
              societe: ObjectId(societe),
              date: { $lte: dateEnd, $gte: dateStart },
            },
          },
          {
            $project: {
              date: "$date",
              numero: "$numero",
              totalGainCommerciale: "$totalGainCommerciale",
              totalGainReel: "$totalGainReel",
              idClient: { $arrayElemAt: ["$client._id", 0] },
              code_cl: { $arrayElemAt: ["$client.code", 0] },
              client: { $arrayElemAt: ["$client.raisonSociale", 0] },
              facture: { $arrayElemAt: ["$factureVente.numero", 0] },
              dateFacture: { $arrayElemAt: ["$factureVente.date", 0] },
            },
          },
        ],
        as: "bonLivraisonArray",
      },
    });

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
              let: { cat: "$categorie" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$cat"] }],
                    },
                  },
                },
                {
                  $set: {
                    id: "$_id",
                    categorie: "$libelle",
                  },
                },
              ],
              as: "categories",
            },
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
                {
                  $set: {
                    id: "$_id",
                    famille: "$libelle",
                  },
                },
              ],
              as: "familles",
            },
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
                {
                  $set: {
                    id: "$_id",
                    sousfamille: "$libelle",
                  },
                },
              ],
              as: "sousfamilles",
            },
          },
          {
            $set: {
              id: "$_id",
              categorieArticle: {
                $arrayElemAt: ["$categories.categorie", 0],
              },
              familleArticle: { $arrayElemAt: ["$familles.famille", 0] },
              sousfamilleArticle: {
                $arrayElemAt: ["$sousfamilles.sousfamille", 0],
              },
              categorieArticleID: {
                $arrayElemAt: ["$categories.id", 0],
              },
              familleArticleID: { $arrayElemAt: ["$familles.id", 0] },
              sousfamilleArticleID: {
                $arrayElemAt: ["$sousfamilles.id", 0],
              },
            },
          },
        ],
        as: "articles",
      },
    });

    pipeline.push({
      $set: {
        date: { $arrayElemAt: ["$bonLivraisonArray.date", 0] },
        numero: { $arrayElemAt: ["$bonLivraisonArray.numero", 0] },
        code_cl: { $arrayElemAt: ["$bonLivraisonArray.code_cl", 0] },
        client: { $arrayElemAt: ["$bonLivraisonArray.client", 0] },
        idClient: { $arrayElemAt: ["$bonLivraisonArray.idClient", 0] },

        facture: { $arrayElemAt: ["$bonLivraisonArray.facture", 0] },
        dateFacture: { $arrayElemAt: ["$bonLivraisonArray.dateFacture", 0] },

        categorie: { $arrayElemAt: ["$articles.categorieArticle", 0] },
        famille: { $arrayElemAt: ["$articles.familleArticle", 0] },
        sousfamille: { $arrayElemAt: ["$articles.sousfamilleArticle", 0] },
        idArticle: { $arrayElemAt: ["$articles.id", 0] },
        categorieArticleID: {
          $arrayElemAt: ["$articles.categorieArticleID", 0],
        },

        familleArticleID: { $arrayElemAt: ["$articles.familleArticleID", 0] },
        sousfamilleArticleID: {
          $arrayElemAt: ["$articles.sousfamilleArticleID", 0],
        },

        totalGainCommerciale: {
          $arrayElemAt: ["$bonLivraisonArray.totalGainCommerciale", 0],
        },
        totalGainReel: {
          $arrayElemAt: ["$bonLivraisonArray.totalGainReel", 0],
        },
      },
    });

    pipeline.push({
      $project: {
        societe:"$societe",
        date: "$date",
        numero: "$numero",
        code_cl: "$code_cl",
        client: "$client",
        idClient: "$idClient",
        facture: "$facture",
        dateFacture: "$dateFacture",

        quantite: "$quantiteVente",
        reference: "$reference",
        designation: "$designation",

        article: "$idArticle",

        categorieArticleID: "$categorieArticleID",

        familleArticleID: "$familleArticleID",
        sousfamilleArticleID: "$sousfamilleArticleID",

        categorieLibelle: "$categorie",
        familleLibelle: "$famille",
        sousFamilleLibelle: "$sousfamille",

        prixAchat: "$prixAchat",
        prixRevient: "$prixRevient",
        margeVar: { $subtract: ["$prixVenteHT", "$prixRevient"] },

        prixVenteHT: "$prixVenteHT",
        tauxRemise: "$tauxRemise",

        montantRemise: "$remiseParMontant",
        totalRemise: {
          $add: [
            {
              $divide: [
                {
                  $multiply: [
                    { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                    "$tauxRemise",
                  ],
                },
                100,
              ],
            },
            { $multiply: ["$remiseParMontant", "$quantiteVente"] },
          ],
        },

        totalHT: { $multiply: ["$prixVenteHT", "$quantiteVente"] },
        totalNetHT: {
          $subtract: [
            { $multiply: ["$prixVenteHT", "$quantiteVente"] },
            {
              $add: [
                {
                  $divide: [
                    {
                      $multiply: [
                        { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                        "$tauxRemise",
                      ],
                    },
                    100,
                  ],
                },
                { $multiply: ["$remiseParMontant", "$quantiteVente"] },
              ],
            },
          ],
        },
        tauxTVA: "$tauxTVA",

        totalTVA: {
          $divide: [
            {
              $multiply: [
                {
                  $subtract: [
                    { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                    {
                      $add: [
                        {
                          $divide: [
                            {
                              $multiply: [
                                {
                                  $multiply: ["$prixVenteHT", "$quantiteVente"],
                                },
                                "$tauxRemise",
                              ],
                            },
                            100,
                          ],
                        },
                        { $multiply: ["$remiseParMontant", "$quantiteVente"] },
                      ],
                    },
                  ],
                },
                "$tauxTVA",
              ],
            },
            100,
          ],
        },
        totalTTC: {
          $add: [
            {
              $add: [
                {
                  $subtract: [
                    { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                    {
                      $add: [
                        {
                          $divide: [
                            {
                              $multiply: [
                                {
                                  $multiply: ["$prixVenteHT", "$quantiteVente"],
                                },
                                "$tauxRemise",
                              ],
                            },
                            100,
                          ],
                        },
                        { $multiply: ["$remiseParMontant", "$quantiteVente"] },
                      ],
                    },
                  ],
                },
                { $multiply: ["$redevance", "$quantiteVente"] },
              ],
            },
            {
              $divide: [
                {
                  $multiply: [
                    {
                      $subtract: [
                        { $multiply: ["$prixVenteHT", "$quantiteVente"] },
                        {
                          $add: [
                            {
                              $divide: [
                                {
                                  $multiply: [
                                    {
                                      $multiply: [
                                        "$prixVenteHT",
                                        "$quantiteVente",
                                      ],
                                    },
                                    "$tauxRemise",
                                  ],
                                },
                                100,
                              ],
                            },
                            {
                              $multiply: [
                                "$remiseParMontant",
                                "$quantiteVente",
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    "$tauxTVA",
                  ],
                },
                100,
              ],
            },
          ],
        },
        redevance: { $multiply: ["$redevance", "$quantiteVente"] },
        PTTC: {
          $add: [
            {
              $multiply: [
                {
                  $subtract: [
                    "$prixVenteHT",
                    {
                      $add: [
                        "$remiseParMontant",
                        {
                          $divide: [
                            { $multiply: ["$prixVenteHT", "$tauxRemise"] },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $divide: [{ $add: [100, "$tauxTVA"] }, 100] },
              ],
            },
            "$redevance",
          ],
        },
        totalGainCommerciale: "$totalGainCommerciale",
        totalGainReel: "$totalGainReel",
      },
    });

    pipeline.push({
      $unionWith: { coll: "bonretourclientarticles", pipeline: pipelineRetour },
    });

    // var rslt = await BonLivraisonArticle.aggregate(pipeline)
    // res.send({rslt:rslt})
    if (
      req.body.article.sousArticle != null &&
      isValidObjectId(req.body.article.sousArticle)
    ) {
      pipeline.push({
        $match: {
          article: ObjectId(req.body.article.sousArticle),
        },
      });
    } else {
      if (
        req.body.article.sousFamille != null &&
        isValidObjectId(req.body.article.sousFamille)
      ) {
        pipeline.push({
          $match: {
            sousfamilleArticleID: ObjectId(req.body.article.sousFamille),
          },
        });
      } else if (
        req.body.article.famille != null &&
        isValidObjectId(req.body.article.famille)
      ) {
        pipeline.push({
          $match: {
            familleArticleID: ObjectId(req.body.article.famille),
          },
        });
      } else if (
        req.body.article.categorie != null &&
        isValidObjectId(req.body.article.categorie)
      ) {
        pipeline.push({
          $match: {
            categorieArticleID: ObjectId(req.body.article.categorie),
          },
        });
      }
    }

    if (ObjectId.isValid(req.body.client)) {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
          idClient: ObjectId(req.body.client),
          societe:ObjectId(societe)
        },
      });
    } else {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
          societe:ObjectId(societe)

        },
      });
    }

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

    const articles = await BonLivraisonArticle.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await BonLivraisonArticle.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }

    //return res.send({ status: true, listGlobal: articles });
    const result = { docs: articles, pages: pages };

    consolelog2("journalVentes : route 1 (end)") 

    return res.send({ status: true, listGlobal: result, request: req.body });
  } catch (error) {
    console.log(error);
    return res.send({ status: false });
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
    // console.log("etape100");
    res.sendStatus(401);
  }
}

module.exports.routerJournalVente = router;
