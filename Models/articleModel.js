const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');
const {ArticleSociete} =require('../Models/articleSocieteModel');
const { PrixSpecifiqueLigne } = require('./prixSpecifiqueLigneModel');
const Schema = mongoose.Schema
const ObjectId = require('mongoose').Types.ObjectId;

const schemaArticle=mongoose.Schema({
         
    remiseFacturePourcentage:{type:Number,default: 0},
    remiseFactureMontant:{type:Number,default: 0},
   
    isFodec:{type:String, default: "oui"},
    prixFodec:{type:Number, default: ""},
    tauxDC:{type:Number, default: ""},
    prixDC:{type:Number, default: ""},
    totalFrais:{type:Number, default: ""},
    reference:{type:String, default: ""},
    codeBarre:{type:String, default: ""},
    designation:{type:String, default: ""},
    typeArticle:{type:String, default: ""},
    categorie:{type: Schema.Types.ObjectId, ref: 'Categorie'},
    famille:{type: Schema.Types.ObjectId, ref: 'Famille'},
    sousFamille:{type: Schema.Types.ObjectId, ref: 'SousFamille'},
    marque:{type: Schema.Types.ObjectId, ref: 'Marque'},
    modele:{type: Schema.Types.ObjectId, ref: 'Modele'},
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
    tauxTVA:{type:String, default: ""},
    prixFourn:{type:Number, default: ""},
    remiseF:{type:Number, default: ""},
    marge:{type:Number, default: ""},
    prixVenteHT:{type:Number, default: ""},
    montantTVA:{type:Number, default: ""},
    prixAchat:{type:Number, default: ""},
    prixAchatTTC:{type:Number, default: ""},
    valeurStock:{type:Number, default: ""},
    qteEnStock:{type:Number, default: 0},
    prixTTC:{type:Number, default: ""},
    plafondRemise:{type:Number, default: ""},
    pVenteConseille:{type:Number, default: ""},
    sansRemise:{type:String, default: "non"},
    enVente:{type:String, default: ""},
    enAchat:{type:String, default: ""},
    refFournisseur:{type:String, default: ""},
    redevance:{type:Number, default: ""},
    enBalance:{type:String, default: ""},
    enPromotion:{type:String, default: ""},
    enNouveau:{type:String, default: ""},
    lotActive:{type:String, default: ""},
    longueur:{type:Number, default: ""},
    largeur:{type:Number, default: ""},
    hauteur:{type:Number, default: ""},
    surface:{type:Number, default: ""},
    volume:{type:Number, default: ""},
    enDisponible:{type:String, default: ""},
    enArchive:{type:String, default: ""},
    enVedette:{type:String, default: ""},
    enLiquidation:{type:String, default: ""},
    description:{type:String, default: ""},
    observations:{type:String, default: ""},
    poids:{type:Number, default: ""},
    couleur:{type:String, default: ""},
    unite1:{type:String, default: ""},
    unite2:{type:String, default: ""},
    coefficient:{type:Number, default: ""},
    emplacement:{type:String, default: ""},
    raccourciPLU:{type:String, default: ""},
    prixVenteHT2:{type:Number, default: ""},
    prixVenteHT3:{type:Number, default: ""},
    qteTheorique:{type:Number, default: 0},
    seuilAlerteQTS:{type:Number, default: ""},
    seuilRearpQTS:{type:Number, default: ""},
    margeAppliqueeSur:{type:String, default: "Achat"},

    remiseParMontant:{type:Number, default: ""},
    
    prixRevient:{type:Number, default: ""},
    prixRevientTTC:{type:Number, default: ""},

    frais:[{   
      montant:{type:Number,default: 0},
      frais:{type: Schema.Types.ObjectId, ref: 'Frais'},
    }],

    sousArticles:[{ 
      sousArticle:{type: Schema.Types.ObjectId, ref: 'Article'},
      quantite:{type:Number, default: 0},
    }],

    venteAvecStockNegative:{type:String, default: "non"},
    stockMax :{type:Number, default: 0},

    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},

},
{ timestamps: true })

schemaArticle.plugin(mongoosePaginate);

schemaArticle.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Article=mongoose.model('Article',schemaArticle)


// start sous produit
const schemaSousProduit=mongoose.Schema({
    
  article:{type: Schema.Types.ObjectId, ref: 'Article'},
 
  variantes:[{
    variante:{type:String, default: ""},
    valeur:{type:String, default: ""},
  }],
  
  impactPrix:{type:Number, default: 0},
  impactPoids:{type:Number, default: 0},
  reference:{type:String, default: ""},

},
{ timestamps: true })

schemaSousProduit.plugin(mongoosePaginate);

schemaSousProduit.method("toJSON", function() {
const { __v, _id, ...object } = this.toObject();
object.id = _id;
return object;
});

const SousProduit=mongoose.model('SousProduit',schemaSousProduit)
// end sous produit

function validateArticle(Article){

    const schema2=Joi.object({
        
        reference:Joi.string().allow('', null),
        codeBarre:Joi.string().allow('', null),
        designation:Joi.string().allow('', null),
        typeArticle:Joi.string().allow('', null),
        categorie:Joi.string().allow('', null),
        famille:Joi.string().allow('', null),
        sousFamille:Joi.string().allow('', null),
        marque:Joi.string().allow('', null),
        modele:Joi.string().allow('', null),
        tauxTVA:Joi.string().allow('', null),
        prixFourn:Joi.number().allow('', null),
        remiseF:Joi.number().allow('', null),
        marge:Joi.number().allow('', null),
        prixVenteHT:Joi.number().allow('', null),
        montantTVA:Joi.number().allow('', null),
        prixAchat:Joi.number().allow('', null),
        valeurStock:Joi.number().allow('', null),
        qteEnStock:Joi.number().allow('', null),
        prixTTC:Joi.number().allow('', null),
        plafondRemise:Joi.number().allow('', null),
        pVenteConseille:Joi.number().allow('', null),
        enVente:Joi.string().allow('', null),
        enAchat:Joi.string().allow('', null),
        refFournisseur:Joi.string().allow('', null),
        redevance:Joi.number().allow('', null),
        enBalance:Joi.string().allow('', null),
        enPromotion:Joi.string().allow('', null),
        enNouveau:Joi.string().allow('', null),
        lotActive:Joi.string().allow('', null),
        longueur:Joi.number().allow('', null),
        largeur:Joi.number().allow('', null),
        hauteur:Joi.number().allow('', null),
        surface:Joi.number().allow('', null),
        volume:Joi.number().allow('', null),
        enDisponible:Joi.string().allow('', null),
        enArchive:Joi.string().allow('', null),
        enVedette:Joi.string().allow('', null),
        enLiquidation:Joi.string().allow('', null),
        description:Joi.string().allow('', null),
        observations:Joi.string().allow('', null),
        poids:Joi.number().allow('', null),
        couleur:Joi.string().allow('', null),
        unite1:Joi.string().allow('', null),
        unite2:Joi.string().allow('', null),
        coefficient:Joi.number().allow('', null),
        emplacement:Joi.string().allow('', null),
        raccourciPLU:Joi.string().allow('', null),
        prixVenteHT2:Joi.number().allow('', null),
        prixVenteHT3:Joi.number().allow('', null),
        seuilAlerteQTS:Joi.number().allow('', null),
        seuilRearpQTS:Joi.number().allow('', null),
        
    })

    return schema2.validate(Article)

}

async function validateReferenceDesignation(body, societeRacine){
    var articles = await Article.find({societeRacine:societeRacine, reference:body.reference}) 
    if(articles.length > 0){
       return "Cette référence est déjà utilisée !!" 
    }

    articles = await Article.find({societeRacine:societeRacine, designation:body.designation }) 
    if(articles.length > 0){
        return "Cette designation est déjà utilisée !!" 
    }
    
    return ""
} 

async function validateReferenceDesignationModifier(body, societeRacine, id){
    
    var articles = await Article.find({societeRacine:societeRacine,_id: {$ne: id}, reference:body.reference}) 
    if(articles.length > 0){
       return "Cette référence est déjà utilisée !!" 
    }

    articles = await Article.find({societeRacine:societeRacine,_id: {$ne: id}, designation:body.designation }) 
    if(articles.length > 0){
        return "Cette designation est déjà utilisée !!" 
    }
    
    return ""
} 

function validateArticlesPagination(request){
    
    const schema4=Joi.object({
        page:Joi.number().required(),
        limit:Joi.number().required(),
    })

    return schema4.validate(request)

}


function getCodeBarre() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

async function getArticlesWithQuantites(societe, societeRacine){
  
  return await getArticlesWithQuantitesfilterBySearch(societe, societeRacine, {})

}

async function getArticlesWithQuantitesfilterBySearch(societe, societeRacine, search){
  
  sort = {createdAt:-1}
  
  var pipeline = []

  pipeline.push({ $match : { societeRacine:societeRacine } } )
    
  pipeline.push({
    $lookup: {
      from: 'articlesocietes',
      let: {"article":"$_id", "societe":societe},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$article", "$$article" ] },
              { "$eq": [ "$societe", "$$societe" ] },
            ]
          }
        }
      }],
      as:"articlesocietes"
    }
  })

  // pipeline.push({
  //   $lookup: {
  //     from: 'prixspecifiquelignes',
  //     let: {"article":"$_id"},
  //     pipeline: [{$match: 
  //       {$expr: {
  //           "$and": [
  //             { "$eq": [ "$article", "$$article" ] },
  //           ]
  //         }
  //       }
  //     }],
  //     as:"prixspecifiquelignes"
  //   }
  // })

  // pipeline.push({
  //   $lookup: {
  //     from: 'prixspecifiquelignetypetiers',
  //     let: {"article":"$_id"},
  //     pipeline: [{$match: 
  //       {$expr: {
  //           "$and": [
  //             { "$eq": [ "$article", "$$article" ] },
  //           ]
  //         }
  //       }
  //     }],
  //     as:"prixspecifiquelignetypetiers"
  //   }
  // })
  
  pipeline.push({
    $lookup: {
      from: 'sousproduits',
      let: {"article":"$_id"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$article", "$$article" ] },
            ]
          }
        }
      }],
      as:"sousproduits"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'categories',
      let: { "categorie": "$categorie"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$categorie" ] },
            ]
          }
        }
      }],
      as:"categories"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'familles',
      let: { "famille": "$famille"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$famille" ] },
            ]
          }
        }
      }],
      as:"familles"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'sousfamilles',
      let: { "sousfamille": "$sousFamille"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$sousfamille" ] },
            ]
          }
        }
      }],
      as:"sousfamilles"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'marques',
      let: { "marque": "$marque"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$marque" ] },
            ]
          }
        }
      }],
      as:"marques"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'modeles',
      let: { "modele": "$modele"},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$modele" ] },
            ]
          }
        }
      }],
      as:"modeles"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'unitemesures',
      let: { "unite": { "$toObjectId": "$unite1" }},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$unite" ] },
            ]
          }
        }
      }],
      as:"unites1"
    }
  })

  pipeline.push({
    $lookup: {
      from: 'unitemesures',
      let: { "unite": { "$toObjectId": "$unite2" }},
      pipeline: [{$match: 
        {$expr: {
            "$and": [
              { "$eq": [ "$_id", "$$unite" ] },
            ]
          }
        }
      }],
      as:"unites2"
    }
  })

  pipeline.push({
    $set: {
      categorie: { $arrayElemAt: ["$categories.libelle", 0] },
      famille: { $arrayElemAt: ["$familles.libelle", 0] },
      sousFamille: { $arrayElemAt: ["$sousfamilles.libelle", 0] },
      marque: { $arrayElemAt: ["$marques.libelle", 0] },
      modele: { $arrayElemAt: ["$modeles.libelle", 0] },
      unite1: { $arrayElemAt: ["$unites1.libelle", 0] },
      unite2: { $arrayElemAt: ["$unites2.libelle", 0] },
      stocks:{  $arrayElemAt: ["$articlesocietes.stocks", 0]  },
      sousProduits:"$sousproduits",
      // prixSpecifiques:"$prixspecifiquelignes",
      
      frais:"$frais",
      
      id:"$_id",
     
      qteEnStock:{ $toString: { $arrayElemAt: ["$articlesocietes.qteEnStock", 0] } }, 
      stockMax:{ $toString: { $arrayElemAt: ["$articlesocietes.stockMax", 0] } }, 
      qteTheorique:{ $toString: { $arrayElemAt: ["$articlesocietes.qteTheorique", 0] } },
      seuilRearpQTS:{ $toString: { $arrayElemAt: ["$articlesocietes.seuilRearpQTS", 0] } },
      seuilAlerteQTS:{ $toString: { $arrayElemAt: ["$articlesocietes.seuilAlerteQTS", 0] } },
   
      enVente:{ $toString: { $arrayElemAt: ["$articlesocietes.enVente", 0] } }, 
      enAchat:{ $toString: { $arrayElemAt: ["$articlesocietes.enAchat", 0] } }, 
  
      enBalance:{ $toString: { $arrayElemAt: ["$articlesocietes.enBalance", 0] } }, 
      enPromotion:{ $toString: { $arrayElemAt: ["$articlesocietes.enPromotion", 0] } }, 
      enNouveau:{ $toString: { $arrayElemAt: ["$articlesocietes.enNouveau", 0] } }, 
      enDisponible:{ $toString: { $arrayElemAt: ["$articlesocietes.enDisponible", 0] } }, 
      enArchive:{ $toString: { $arrayElemAt: ["$articlesocietes.enArchive", 0] } }, 
      enVedette:{ $toString: { $arrayElemAt: ["$articlesocietes.enVedette", 0] } }, 
      enLiquidation:{ $toString: { $arrayElemAt: ["$articlesocietes.enLiquidation", 0] } }, 
      venteAvecStockNegative:{ $toString: { $arrayElemAt: ["$articlesocietes.venteAvecStockNegative", 0] } }, 
      totalFrais:{ $toString: "$totalFrais" },
      prixFourn:{ $toString: "$prixFourn" }, 
      remiseF:{ $toString: "$remiseF" }, 
      remiseParMontant:{ $toString: "$remiseParMontant" }, 
      marge:{ $toString: "$marge" }, 
      prixVenteHT:{ $toString: "$prixVenteHT" }, 
      tauxTVA:{ $toString: "$tauxTVA" }, 
      montantTVA:{ $toString: "$montantTVA" }, 
      prixAchat:{ $toString: "$prixAchat" }, 
      prixAchatTTC:{ $toString: "$prixAchatTTC" },
      valeurStock:{ $toString: "$valeurStock" }, 
      prixTTC:{ $toString: "$prixTTC" }, 
      prixRevient:{ $toString: "$prixRevient" }, 
      plafondRemise:{ $toString: "$plafondRemise" }, 
      pVenteConseille:{ $toString: "$pVenteConseille" },
      longueur:{ $toString: "$longueur" }, 
      largeur:{ $toString: "$largeur" }, 
      hauteur:{ $toString: "$hauteur" }, 
      surface:{ $toString: "$surface" }, 
      volume:{ $toString: "$volume" },
      prixVenteHT2:{ $toString: "$prixVenteHT2" },
      prixVenteHT3:{ $toString: "$prixVenteHT3" },
      poids:{ $toString: "$poids" },
      coefficient:{ $toString: "$coefficient" },
      isFodec:{ $toString: "$isFodec" },
      prixFodec:{ $toString: "$prixFodec" },
      tauxDC:{ $toString: "$tauxDC" },
      prixDC:{ $toString: "$prixDC" },
      redevance:{ $toString: "$redevance" },
      unite1:{ $toString: "$unite1" },
      unite2:{ $toString: "$unite2" },
      coefficient:{ $toString: "$coefficient" },
    }
  })

  pipeline.push({

    $project: {
      _id:0,
      prixspecifiquelignes:0,
    }

  })

  for(let key in search){
    if(search[key] != ""){
        var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1)
        var word2 = search[key].toUpperCase()
        var word3 = search[key].toLowerCase()

     
        var objet1 = {}
        objet1[key] = { $regex: '.*' + word1 + '.*' }
       
        var objet2 = {}
        objet2[key] = { $regex: '.*' + word2 + '.*' }
        
        var objet3 = {}
        objet3[key] = { $regex: '.*' + word3 + '.*' }

        let objectMatch = {$or:[objet1, objet2, objet3]}
        
        let objectParent = {$match : objectMatch}
        pipeline.push(objectParent)
    }  
  }

  var sommePipeline = []
  for(let key in pipeline){
    sommePipeline.push(pipeline[key])
  }

  pipeline.push({
    $sort:sort
  })

  const articles = await Article.aggregate(pipeline)

  return articles

}

async function calculPrixRevientArticle(idFraisSupprimer, societeRacine){
   var articles = await Article.find({societeRacine:societeRacine})
   for(let item of articles){
      item.frais = item.frais.filter(x => x.frais != idFraisSupprimer)
      var somme = 0
      for(let itemFrais of item.frais){
        somme += itemFrais.montant
      }
      
      item.totalFrais = somme
      
      if(item.margeAppliqueeSur == "Revient"){
        var prixRevient = item.totalFrais + item.prixAchat
        item.marge = ((item.prixVenteHT / prixRevient) - 1) * 100
      }

      await Article.findByIdAndUpdate(item.id, item)
   }
}

function setNullForObject(request){
  var tabKeys = ["factureAchat", "transporteur", "factureVente", "ordreMission", "projet"]
  for(let key of tabKeys){
    if(!isValidObjectId(request[key])){
      request[key] = null
    }
  }

  return request
}

function isValidObjectId(id){
    
  if(ObjectId.isValid(id)){
      if((String)(new ObjectId(id)) === id)
          return true;
      return false;
  }
  return false;
}

module.exports.setNullForObject = setNullForObject
module.exports.getArticlesWithQuantitesfilterBySearch = getArticlesWithQuantitesfilterBySearch
module.exports.calculPrixRevientArticle = calculPrixRevientArticle
module.exports.Article=Article
module.exports.SousProduit=SousProduit
module.exports.getArticlesWithQuantites=getArticlesWithQuantites
module.exports.validateReferenceDesignation=validateReferenceDesignation
module.exports.getCodeBarre=getCodeBarre
module.exports.validateArticle=validateArticle
module.exports.validateArticlesPagination=validateArticlesPagination
module.exports.validateReferenceDesignationModifier=validateReferenceDesignationModifier
