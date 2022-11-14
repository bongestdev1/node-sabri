const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { BonReceptionArticle } = require("../Models/bonReceptionArticleModel");
const { BonReception } = require("../Models/bonReceptionModel");
const { BonRetourFournisseur } = require("../Models/bonRetourFournisseurModel");
const { consolelog } = require("../Models/errorModel");
const { Fournisseur } = require("../Models/fournisseurModel");
const { isValidObjectId } = require("mongoose");
const {
  Societe,
  getSocieteRacine,
  getSocietesBySocieteParent,
} = require("../Models/societeModel");
const {
  BonRetourFournisseurArticle,
} = require("../Models/bonRetourFournisseurArticleModel");

var ObjectId = require("mongodb").ObjectID;

router.post("/journalAchats", verifytoken, async (req, res) => {
  try {
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
      sort = { date: -1 , numero:1};
    }

    pipelineRetour.push({
      $lookup: {
        from: "bonretourfournisseurs",
        let: { bonRetour: "$bonRetourFournisseur" },
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
              ],
              as: "fournisseur",
            },
          },
          {
            $project: {
              date: "$date",
              numero: "$numero",
              totalGainCommerciale: "$totalGainCommerciale",
              totalGainReel: "$totalGainReel",
              idFournisseur: { $arrayElemAt: ["$fournisseur._id", 0] },
              code_fr: { $arrayElemAt: ["$fournisseur.code", 0] },
              fournisseur: { $arrayElemAt: ["$fournisseur.raisonSociale", 0] },
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
        code_fr: { $arrayElemAt: ["$bonRetourArray.code_fr", 0] },
        fournisseur: { $arrayElemAt: ["$bonRetourArray.fournisseur", 0] },
        idFournisseur: { $arrayElemAt: ["$bonRetourArray.idFournisseur", 0] },

        facture: { $arrayElemAt: ["$bonRetourArray.facture", 0] },
        dateFacture: { $arrayElemAt: ["$bonRetourArray.dateFacture", 0] },
        timbreFiscale: { $arrayElemAt: ["$bonRetourArray.timbreFiscale", 0] },

        idArticle: { $arrayElemAt: ["$articles.id", 0] },
        categorieArticleID: {
          $arrayElemAt: ["$articles.categorieArticleID", 0],
        },

        familleArticleID: { $arrayElemAt: ["$articles.familleArticleID", 0] },
        sousfamilleArticleID: {
          $arrayElemAt: ["$articles.sousfamilleArticleID", 0],
        },

        categorie: { $arrayElemAt: ["$articles.categorieArticle", 0] },
        famille: { $arrayElemAt: ["$articles.familleArticle", 0] },
        sousfamille: { $arrayElemAt: ["$articles.sousfamilleArticle", 0] },

        totalGainCommerciale: {
          $arrayElemAt: ["$bonRetourArray.totalGainCommerciale", 0],
        },
        totalGainReel: { $arrayElemAt: ["$bonRetourArray.totalGainReel", 0] },
      },
    });
    pipelineRetour.push({
      $project: {
        societe:"$societe",
        article: "$idArticle",
        idFournisseur: "$idFournisseur",
        categorieArticleID: "$categorieArticleID",
        familleArticleID: "$familleArticleID",
        sousfamilleArticleID: "$sousfamilleArticleID",

        date: "$date",
        numero: "$numero",
        facture: "$facture",
        dateFacture: "$dateFacture",
        timbreFiscale: "$timbreFiscale",

        code_fourn: "$code_fr",
        fournisseur: "$fournisseur",
        reference: "$reference",
        designation: "$designation",
        categorieLibelle: "$categorie",
        familleLibelle: "$famille",
        sousFamilleLibelle: "$sousfamille",
        quantite: {$multiply:["$quantiteAchat",-1]},

        prixFourn: "$prixFourn",
        prixAchatHT: { $multiply: ["$prixFourn", {$multiply:["$quantiteAchat",-1]}] },
        fodec: { $multiply: ["$prixFodec", {$multiply:["$quantiteAchat",-1]}] },
        droitConsomation: { $multiply: ["$prixDC", {$multiply:["$quantiteAchat",-1]}] },
        tauxRemise: "$tauxRemise",
        montantRemise: "$remiseParMontant",
        totalRemise: {
          $add: [
            {
              $divide: [
                {
                  $multiply: [
                    { $multiply: ["$prixFourn", {$multiply:["$quantiteAchat",-1]}] },
                    "$tauxRemise",
                  ],
                },
                100,
              ],
            },
            { $multiply: ["$remiseParMontant", {$multiply:["$quantiteAchat",-1]}] },
          ],
        },
        totalHT: {
          $subtract: [
            { $multiply: ["$prixFourn", {$multiply:["$quantiteAchat",-1]}] },
            {
              $add: [
                {
                  $divide: [
                    {
                      $multiply: [
                        { $multiply: ["$prixFourn", {$multiply:["$quantiteAchat",-1]}] },
                        "$tauxRemise",
                      ],
                    },
                    100,
                  ],
                },
                { $multiply: ["$remiseParMontant", {$multiply:["$quantiteAchat",-1]}] },
              ],
            },
          ],
        },
        totalNetHT: {$multiply:["$totalHT",-1]},
        tauxTVA: "$tauxTVA",
        totalTVA: {$multiply:["$totalTVA",-1]},

        droitTimbre: "$timbreFiscale",

        redevance: { $multiply: ["$redevance", {$multiply:["$quantiteAchat",-1]}] },
        totalTTC: {$multiply:["$totalTTC",-1]},
        PUTTC:{$multiply:[{$divide:[{$subtract:["$totalTTC","$timbreFiscale"]},{$multiply:["$quantiteAchat",-1]}]},-1]}
      },
    });
    
    pipeline.push({
      $lookup: {
        from: "bonreceptions",
        let: { bonReception: "$bonReception" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$bonReception"] }],
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
              ],
              as: "fournisseur",
            },
          },
          {
            $lookup: {
              from: "factureachats",
              let: { facture: "$factureAchat" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$facture"] }],
                    },
                  },
                },
              ],
              as: "factureAchat",
            },
          },

          {
            $set: {
              date: "$date",
              numero: "$numero",
              totalGainCommerciale: "$totalGainCommerciale",
              totalGainReel: "$totalGainReel",
              idFournisseur: { $arrayElemAt: ["$fournisseur._id", 0] },
              code_fr: { $arrayElemAt: ["$fournisseur.code", 0] },
              fournisseur: { $arrayElemAt: ["$fournisseur.raisonSociale", 0] },
              facture: { $arrayElemAt: ["$factureAchat.numero", 0] },
              dateFacture: { $arrayElemAt: ["$factureAchat.date", 0] },
              timbreFiscale: {
                $arrayElemAt: ["$factureAchat.timbreFiscale", 0],
              },
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
        code_fr: { $arrayElemAt: ["$bonLivraisonArray.code_fr", 0] },
        fournisseur: { $arrayElemAt: ["$bonLivraisonArray.fournisseur", 0] },
        idFournisseur: {
          $arrayElemAt: ["$bonLivraisonArray.idFournisseur", 0],
        },

        facture: { $arrayElemAt: ["$bonLivraisonArray.facture", 0] },
        dateFacture: { $arrayElemAt: ["$bonLivraisonArray.dateFacture", 0] },
        timbreFiscale: {
          $arrayElemAt: ["$bonLivraisonArray.timbreFiscale", 0],
        },

        idArticle: { $arrayElemAt: ["$articles.id", 0] },
        categorieArticleID: {
          $arrayElemAt: ["$articles.categorieArticleID", 0],
        },

        familleArticleID: { $arrayElemAt: ["$articles.familleArticleID", 0] },
        sousfamilleArticleID: {
          $arrayElemAt: ["$articles.sousfamilleArticleID", 0],
        },

        categorie: { $arrayElemAt: ["$articles.categorieArticle", 0] },
        famille: { $arrayElemAt: ["$articles.familleArticle", 0] },
        sousfamille: { $arrayElemAt: ["$articles.sousfamilleArticle", 0] },

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
        article: "$idArticle",
        idFournisseur: "$idFournisseur",
        categorieArticleID: "$categorieArticleID",
        familleArticleID: "$familleArticleID",
        sousfamilleArticleID: "$sousfamilleArticleID",

        date: "$date",
        numero: "$numero",
        facture: "$facture",
        dateFacture: "$dateFacture",
        timbreFiscale: "$timbreFiscale",

        code_fourn: "$code_fr",
        fournisseur: "$fournisseur",
        reference: "$reference",
        designation: "$designation",
        categorieLibelle: "$categorie",
        familleLibelle: "$famille",
        sousFamilleLibelle: "$sousfamille",
        quantite: "$quantiteAchat",

        prixFourn: "$prixFourn",
        prixAchatHT: { $multiply: ["$prixFourn", "$quantiteAchat"] },
        fodec: { $multiply: ["$prixFodec", "$quantiteAchat"] },
        droitConsomation: { $multiply: ["$prixDC", "$quantiteAchat"] },
        tauxRemise: "$tauxRemise",
        montantRemise: "$remiseParMontant",
        totalRemise: {
          $add: [
            {
              $divide: [
                {
                  $multiply: [
                    { $multiply: ["$prixFourn", "$quantiteAchat"] },
                    "$tauxRemise",
                  ],
                },
                100,
              ],
            },
            { $multiply: ["$remiseParMontant", "$quantiteAchat"] },
          ],
        },
        totalHT: {
          $subtract: [
            { $multiply: ["$prixFourn", "$quantiteAchat"] },
            {
              $add: [
                {
                  $divide: [
                    {
                      $multiply: [
                        { $multiply: ["$prixFourn", "$quantiteAchat"] },
                        "$tauxRemise",
                      ],
                    },
                    100,
                  ],
                },
                { $multiply: ["$remiseParMontant", "$quantiteAchat"] },
              ],
            },
          ],
        },
        totalNetHT: "$totalHT",
        tauxTVA: "$tauxTVA",
        totalTVA: "$totalTVA",

        droitTimbre: "$timbreFiscale",

        redevance: { $multiply: ["$redevance", "$quantiteAchat"] },
        totalTTC: "$totalTTC",
        PUTTC:{$divide:[{$subtract:["$totalTTC","$timbreFiscale"]},"$quantiteAchat"]}

      },
    });
    // rslt= await BonReceptionArticle.aggregate(pipeline)
    // res.send({rslt:rslt}) 
    pipeline.push({
      $unionWith: {
        coll: "bonretourfournisseurarticles",
        pipeline: pipelineRetour,
      },
    });
    
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

    if (ObjectId.isValid(req.body.fournisseur)) {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
          idFournisseur: ObjectId(req.body.fournisseur),
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

    const articles = await BonReceptionArticle.aggregate(pipeline);

    sommePipeline.push({
      $count: "total",
    });

    var nbrTotal = await BonReceptionArticle.aggregate(sommePipeline);

    if (nbrTotal.length == 0) {
      nbrTotal = [{ total: 0 }];
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
    var pages = nbrTotal[0].total / req.body.limit;

    if (pages > nbrTotalTrunc) {
      pages = nbrTotalTrunc + 1;
    }
    // var rslt = await BonReceptionArticle.aggregate(pipeline)
    // res.send({rslt:rslt})
    //return res.send({ status: true, listGlobal: articles });
    const result = { docs: articles, pages: pages };
    return res.send({ status: true, listGlobal: result, request: req.body });
  } catch (error) {
    console.log(error);
    return res.send({ status: false });
  }
});

router.post("/getALLParametresJournalAchats", verifytoken, async (req, res) => {
  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.magasin));

    var fournisseurs = await Fournisseur.find({ societeRacine: societeRacine });

    return res.send({ status: true, fournisseurs: fournisseurs });
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
    //console.log("etape100");
    res.sendStatus(401);
  }
}

module.exports.routerJournalAchat = router;
