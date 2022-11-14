const { Personnel, validatePersonnel, getNumeroAutomatiquePersonnel } = require('../Models/personnelModel')
const { Secteur, validateSecteur, getNumeroAutomatiqueSecteur } = require('../Models/secteurModel')
const { TypeTier, validateTypeTier, getNumeroAutomatiqueTypeTier } = require('../Models/typeTierModel')
const { ModeReglement, validateModeReglement, getNumeroAutomatiqueModeReglement } = require('../Models/modeReglementModel')
const { Exercice } = require('../Models/exerciceModel')

const { Article, SousProduit, validateReferenceDesignation, validateReferenceDesignationModifier, validateArticle, validateArticlesPagination, getCodeBarre, } = require('../Models/articleModel')
const { BonLivraisonArticle } = require('../Models/bonLivraisonArticleModel')

const { ArticleSociete } = require('../Models/articleSocieteModel')
const { Frais } = require('../Models/fraisModel')

const { UniteMesure, validateUniteMesure, getNumeroAutomatiqueUnite } = require('../Models/uniteMesureModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

const { Modele, getNumeroAutomatiqueModele } = require('../Models/modeleModel')
const { Categorie, getNumeroAutomatiqueCategorie } = require('../Models/categorieModel')
const { CategorieFamille } = require('../Models/categorieFamilleModel')
const { Famille, getNumeroAutomatiqueFamille } = require('../Models/familleModel')
const { Marque, getNumeroAutomatiqueMarque } = require('../Models/marqueModel')
const { FamilleSousFamille } = require('../Models/familleSousFamilleModel')
const { SousFamille, getNumeroAutomatiqueSousFamille } = require('../Models/sousFamilleModel')
const { TauxTVA } = require('../Models/tauxTVAModel')
const { BonLivraison } = require('../Models/bonLivraisonModel')
const { Client, getNumeroAutomatiqueClient } = require('../Models/clientModel')

const express = require('express')
var ObjectId = require('mongodb').ObjectID;
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
const { pipeline } = require('stream')
const { Fournisseur, getNumeroAutomatiqueFournisseur } = require('../Models/fournisseurModel')
const { Variante } = require('../Models/varianteModel')

const xlsx = require('xlsx');
const { isValidObjectId } = require('mongoose')
const { Inventaire, getNumeroAutomatiqueInventaire } = require('./inventaireModel')
const { PrixSpecifiqueLigneTypeTier } = require('./prixSpecifiqueLigneTypeTierModel')

function checkUndefined(item) {
  if (item === null) {
    return false
  }

  if (item === undefined) {
    return false
  }

  if (Number(item) !== NaN) {
    item = item + ""
  }

  if (item.length === 0) {
    return false
  }

  return true
}

async function getLigneDoublante(items, table, societeRacine) {

  switch (table) {
    case 'Articles':
      for (let i = 0; i < items.length; i++) {
        if (checkUndefined(items[i].reference)) {
          var articles = await Article.find({ reference: items[i].reference + "", societeRacine: societeRacine })
          if (articles.length > 0) {
            items[i].message = "double"
          } else {
            items[i].message = "bien"
          }
        } else {
          items[i].message = "erreur"
        }
      }
      break;
    case 'Clients':
      for (let i = 0; i < items.length; i++) {
        if (checkUndefined(items[i].code)) {
          var clients = await Client.find({ code: items[i].code + "", societeRacine: societeRacine })
          if (clients.length > 0) {
            items[i].message = "double"
          } else {
            items[i].message = "bien"
          }
        } else {
          items[i].message = "erreur"
        }
      }
      break;
    case 'Fournisseurs':
      for (let i = 0; i < items.length; i++) {
        if (checkUndefined(items[i].code)) {
          var fournisseurs = await Fournisseur.find({ code: items[i].code + "", societeRacine: societeRacine })
          if (fournisseurs.length > 0) {
            items[i].message = "double"
          } else {
            items[i].message = "bien"
          }
        } else {
          items[i].message = "erreur"
        }
      }
      break;
    case 'Inventaires':
      for (let i = 0; i < items.length; i++) {
        if (checkUndefined(items[i].reference)) {
          var articles = await Article.find({ reference: items[i].reference + "", societeRacine: societeRacine })
          if (articles.length > 0) {
            items[i].message = "bien"
          }else{
            items[i].message = "erreur"
          }
        } else {
          items[i].message = "erreur"
        }
      }
      break;
      case 'Prix spécifique':
        for (let i = 0; i < items.length; i++) {
          if (checkUndefined(items[i].reference)) {
            var articles = await Article.find({ reference: items[i].reference + "", societeRacine: societeRacine })
            if (articles.length > 0) {
              items[i].message = "bien"
            } else {
              items[i].message = "erreur"
            }
          } else {
            items[i].message = "erreur"
          }
        }
        break;
  }

  return items

}

async function getIdFromColonne(item, key, societeRacine) {

  if (item[key] === undefined || item[key] === null || item[key] === "") {
    return null
  }

  switch (key) {
    case 'typeTiers':
      var idTypeTier = await getTypeTier(item, key, societeRacine)
      return idTypeTier
      break;
    case 'modeReglement':
      var idModeReglement = await getModeReglement(item, key, societeRacine)
      return idModeReglement
      break;
    case 'agentPremierContact':
      var idPersonnel = await getPersonnel(item, key, societeRacine)
      return idPersonnel
      break;
    case 'agentCommercial':
      var idPersonnel = await getPersonnel(item, key, societeRacine)
      return idPersonnel
      break;
    case 'agentRecouvrement':
      var idPersonnel = await getPersonnel(item, key, societeRacine)
      return idPersonnel
      break;
    case 'secteur':
      var idSecteur = await getSecteur(item, societeRacine)
      return idSecteur
      break;
    case 'categorie':
      var idCategorie = await getCategorieArticle(item, societeRacine)
      return idCategorie
      break;
    case 'famille':
      var idFamille = await getFamilleArticle(item, societeRacine)
      return idFamille
      break;
    case 'sousFamille':
      var idSousFamille = await getSousFamilleArticle(item, societeRacine)
      return idSousFamille
      break;
    case 'unite1':
      var idUnite1 = await getUniteArticle(item, key, societeRacine)
      return idUnite1
      break;
    case 'unite2':
      var idUnite2 = await getUniteArticle(item, key, societeRacine)
      return idUnite2
      break;
    case 'marque':
      var idMarque = await getMarqueArticle(item, societeRacine)
      return idMarque
      break;
    case 'modele':
      var idModele = await getModeleArticle(item, societeRacine)
      return idModele
      break;
    case 'reference':
      const articles = await Article.find({ reference: item.reference, societeRacine: societeRacine })
      if (articles.length > 0) {
        return articles[0]
      }
      return null
      break;
    default:
      return null
  }

}

async function getFraisArticle(item, societeRacine) {

  var allFrais = await Frais.find({ societeRacine: societeRacine })
  var allFrais2 = JSON.parse(JSON.stringify(allFrais))

  var fraisArticle = []
  for (let key in item) {
    if (isValidObjectId(key)) {
      for (let frais of allFrais2) {
        if (frais.id === key) {
          fraisArticle.push({ frais: ObjectId(key), montant: (isNaN(Number(item[key])) ? 0 : Number(item[key])) })
        }
      }
    }
  }
  return fraisArticle
}

async function getFraisActive(item, societeRacine) {

  var allFrais = await Frais.find({ societeRacine: societeRacine })
  var allFrais2 = JSON.parse(JSON.stringify(allFrais))

  var fraisArticle = []
  for (let key in item) {
    if (isValidObjectId(key)) {
      for (let frais of allFrais2) {
        if (frais.id === key && ((item[key]+"").toUpperCase() == ("oui").toUpperCase() || item[key] == 1)) {
          fraisArticle.push({ idFrais: ObjectId(key)})
        }
      }
    }
  }

  return fraisArticle
}

async function getCategorieArticle(item, societeRacine) {
  var categoriesFilter = []

  if (!isNaN(item.categorie)) {
    categoriesFilter = await Categorie.find({ $or: [{ num: Number(item.categorie) }, { libelle: item.categorie }], societeRacine: societeRacine })
  } else {
    categoriesFilter = await Categorie.find({ libelle: item.categorie, societeRacine: societeRacine })
  }

  if (categoriesFilter.length > 0) {
    return categoriesFilter[0].id
  } else {
    var numCategorie = await getNumeroAutomatiqueCategorie(societeRacine)
    var categorie = new Categorie({ libelle: item.categorie, societeRacine: societeRacine, num: numCategorie.num })
    var categorieResult = await categorie.save()
    return categorieResult.id
  }

  return null
}

async function getFamilleArticle(item, societeRacine) {

  var famillesFilter = []

  if (!isNaN(item.famille)) {
    famillesFilter = await Famille.find({ $or: [{ num: Number(item.famille) }, { libelle: item.famille }], societeRacine: societeRacine })
  } else {
    famillesFilter = await Famille.find({ libelle: item.famille, societeRacine: societeRacine })
  }

  var idFamille = ""
  if (famillesFilter.length > 0) {
    idFamille = famillesFilter[0].id
  } else {
    var numero = await getNumeroAutomatiqueFamille(societeRacine)
    var famille = new Famille({ libelle: item.famille, societeRacine: societeRacine, num: numero.num })
    var familleResult = await famille.save()
    idFamille = familleResult.id
  }

  var familleCategories = await CategorieFamille.find({ categorie: item.categorie, famille: idFamille })
  if (familleCategories.length === 0) {
    var categorieFamille = new CategorieFamille({ categorie: item.categorie, famille: idFamille, societeRacine: societeRacine })
    await categorieFamille.save()
  }

  return idFamille

}

async function getSousFamilleArticle(item, societeRacine) {

  var sousFamillesFilter = []

  if (!isNaN(item.sousFamille)) {
    sousFamillesFilter = await SousFamille.find({ $or: [{ num: Number(item.sousFamille) }, { libelle: item.sousFamille }], societeRacine: societeRacine })
  } else {
    sousFamillesFilter = await SousFamille.find({ libelle: item.sousFamille, societeRacine: societeRacine })
  }

  if (sousFamillesFilter.length > 0) {
    item.sousFamille = sousFamillesFilter[0].id
  } else {
    var numero = await getNumeroAutomatiqueSousFamille(societeRacine)
    var sousFamille = new SousFamille({ libelle: item.sousFamille, societeRacine: societeRacine, num: numero.num })
    var sousFamilleResult = await sousFamille.save()
    item.sousFamille = sousFamilleResult.id
  }

  var familleSousFamilles = await FamilleSousFamille.find({ sousFamille: item.sousFamille, famille: item.famille })
  if (familleSousFamilles.length === 0) {
    var familleSousFamille = new FamilleSousFamille({ sousFamille: item.sousFamille, famille: item.famille, societeRacine: societeRacine })
    await familleSousFamille.save()
  }

  return item.sousFamille
}

async function getMarqueArticle(item, societeRacine) {

  var marquesFilter = []

  if (!isNaN(item.marque)) {
    marquesFilter = await Marque.find({ $or: [{ num: Number(item.marque) }, { libelle: item.marque }], societeRacine: societeRacine })
  } else {
    marquesFilter = await Marque.find({ libelle: item.marque, societeRacine: societeRacine })
  }

  if (marquesFilter.length > 0) {
    item.marque = marquesFilter[0].id
  } else {
    var numMarque = await getNumeroAutomatiqueMarque(societeRacine)
    var marque = new Marque({ libelle: item.marque, societeRacine: societeRacine, num: numMarque.num })
    var marqueResult = await marque.save()
    item.marque = marqueResult.id
  }

  return item.marque
}

async function getModeleArticle(item, societeRacine) {

  var modelesFilter = []

  if (!isNaN(item.modele)) {
    modelesFilter = await Modele.find({ $or: [{ num: Number(item.modele) }, { libelle: item.modele }], societeRacine: societeRacine, marque: item.marque })
  } else {
    modelesFilter = await Modele.find({ libelle: item.modele, societeRacine: societeRacine, marque: item.marque })
  }

  if (modelesFilter.length > 0) {
    item.modele = modelesFilter[0].id
  } else {
    var numModele = await getNumeroAutomatiqueModele(societeRacine)
    var modele = new Modele({ libelle: item.modele, societeRacine: societeRacine, num: numModele.num, marque: item.marque })
    var modeleResult = await modele.save()
    item.modele = modeleResult.id
  }

  return item.modele
}

async function getUniteArticle(item, key, societeRacine) {

  var unitesFilter = []

  if (!isNaN(item[key])) {
    unitesFilter = await UniteMesure.find({ $or: [{ num: Number(item[key]) }, { libelle: item[key] }], societeRacine: societeRacine })
  } else {
    unitesFilter = await UniteMesure.find({ libelle: item[key], societeRacine: societeRacine })
  }

  if (unitesFilter.length > 0) {
    item[key] = unitesFilter[0].id
  } else {
    var numUnite = await getNumeroAutomatiqueUnite(societeRacine)
    var unite = new UniteMesure({ libelle: item[key], societeRacine: societeRacine, num: numUnite.num })
    var uniteResult = await unite.save()
    item[key] = uniteResult.id
  }

  return item[key]
}

async function saveArticles(posts, societeRacine) {
  var compteurs = { bien: 0, erreur: 0 }

  for (let i = 0; i < posts.length; i++) {

    if (posts[i].message === "bien") {
      var article = new Article(posts[i])
      console.log(article)
      const resultArticle = await article.save()

      const societes = await getSocietesBySocieteParent(societeRacine)

      for (let j = 0; j < societes.length; j++) {

        const articleSociete = await ArticleSociete.find({ societe: societes[j].id, article: resultArticle.id })

        if (articleSociete.length == 0) {
          const articleSociete = new ArticleSociete({
            article: resultArticle.id,
            societe: societes[j].id,

            prixRevientInitial: posts[i].prixRevientInitial,
            qteInitial: posts[i].qteInitial,

            enVente: resultArticle.enVente,
            enAchat: resultArticle.enAchat,

            enBalance: resultArticle.enBalance,
            enPromotion: resultArticle.enPromotion,
            enNouveau: resultArticle.enNouveau,
            enDisponible: resultArticle.enDisponible,
            enArchive: resultArticle.enArchive,
            enVedette: resultArticle.enVedette,
            enLiquidation: resultArticle.enLiquidation,

            qteTheorique: posts[i].qteInitial,
            qteEnStock: posts[i].qteInitial,

            seuilAlerteQTS: resultArticle.seuilAlerteQTS,
            seuilRearpQTS: resultArticle.seuilRearpQTS,

            venteAvecStockNegative: resultArticle.venteAvecStockNegative,
            stockMin: resultArticle.stockMin,
            stockMax: resultArticle.stockMax,

          });

          const result = await articleSociete.save()
        }
      }

      compteurs.bien++
    } else {
      compteurs.erreur++
    }

  }

  return compteurs
}

async function calculPrixArticles(posts, tauxFodec, societeRacine) {

  var champsNumbers = ["pVenteConseille", "tauxDC", "stockMin", "stockMax", "seuilRearpQTS", "seuilAlerteQTS", "tauxTVA", "prixFourn", "remiseF", "tauxDC", "marge", "remiseParMontant"]
  var champsBooleans = ["sansRemise", "lotActive", "enBalance", "enArchive", "enNouveau", "enLiquidation", "enPromotion", "enVedette", "enDisponible", "enAchat", "enVente", "isFodec", "venteAvecStockNegative"]
  for (let i = 0; i < posts.length; i++) {
    posts[i].societeRacine = societeRacine
    posts[i].frais = await getFraisArticle(posts[i], societeRacine)

    for (let key of champsBooleans) {
      if (Number(posts[i][key]) === 0) {
        posts[i][key] = "non"
      } else {
        posts[i][key] = "oui"
      }
    }

    for (let key of champsNumbers) {
      if (isNaN(posts[i][key])) {
        posts[i][key] = 0
      }
    }

    if(!posts[i].tauxFodec || posts[i].tauxFodec === 0){
      posts[i].isFodec = "non"
    }else{
      posts[i].isFodec = "oui"
    }

    // if (posts[i].margeAppliqueeSur === undefined) {
      posts[i].margeAppliqueeSur = "Revient"
    // }

    if (posts[i].typeArticle === undefined) {
      posts[i].typeArticle = "produit"
    } else {
      posts[i].typeArticle = posts[i].typeArticle.toLowerCase()
    }

    var prixAchat = Number(posts[i].prixFourn) - Number(posts[i].prixFourn) * Number(posts[i].remiseF / 100)
    var marge = Number(posts[i].marge)

    posts[i].prixDC = Number(prixAchat * posts[i].tauxDC / 100)

    if (posts[i].isFodec == "oui") {
      posts[i].prixFodec = Number(prixAchat * tauxFodec / 100)
    } else {
      posts[i].prixFodec = Number(0)
    }

    posts[i].prixAchat = Number(prixAchat) + Number(posts[i].prixDC) + Number(posts[i].prixFodec)

    posts[i].prixAchat = posts[i].prixAchat - posts[i].remiseParMontant
    posts[i].prixAchatTTC = Number(posts[i].prixAchat + posts[i].prixAchat * posts[i].tauxTVA / 100)

    var totalFrais = 0
    for (let frais of posts[i].frais) {
      totalFrais += frais.montant
    }

    // if (posts[i].margeAppliqueeSur == "Revient") {
      var prixRevient = Number(posts[i].prixAchat) + Number(totalFrais)
     
      posts[i].prixRevient = prixRevient
      posts[i].prixVenteHT = Number(prixRevient) + marge * prixRevient / 100
    // } else {
    //   posts[i].prixVenteHT = Number(posts[i].prixAchat) + marge * posts[i].prixAchat / 100
    // }

    posts[i].montantTVA = Number(posts[i].prixVenteHT * posts[i].tauxTVA / 100)
    posts[i].prixTTC = Number(posts[i].montantTVA) + Number(posts[i].prixVenteHT)

    posts[i].categorie = await getIdFromColonne(posts[i], "categorie", societeRacine)
    posts[i].famille = await getIdFromColonne(posts[i], "famille", societeRacine)
    posts[i].sousFamille = await getIdFromColonne(posts[i], "sousFamille", societeRacine)
    posts[i].marque = await getIdFromColonne(posts[i], "marque", societeRacine)
    posts[i].modele = await getIdFromColonne(posts[i], "modele", societeRacine)
    posts[i].unite1 = await getIdFromColonne(posts[i], "unite1", societeRacine)
    posts[i].unite2 = await getIdFromColonne(posts[i], "unite2", societeRacine)
   
  }

  return posts

}

async function calculTypeTier(posts, societeRacine) {

  var champsNumbers = ["marge", "margePourcentage", "quantiteMin", "quantiteMax", "newPrixVenteHT"]
 
  for (let i = 0; i < posts.length; i++) {
    posts[i].societeRacine = societeRacine
    posts[i].isEnable = societeRacine
    posts[i].frais = await getFraisActive(posts[i], societeRacine)

    for (let key of champsNumbers) {
      if (isNaN(posts[i][key])) {
        posts[i][key] = 0
      }
    }

    const article = await Article.findOne({reference:posts[i].reference})

    const typeTier = await TypeTier.findOne({libelle:posts[i].typeTier})
    if(!typeTier){
      var numero = await getNumeroAutomatiqueTypeTier(societeRacine)
      var typetier2 = new TypeTier()
      typetier2.numero = numero.num
      typetier2.libelle = posts[i].typeTier
      typetier2.societeRacine = societeRacine
      const typeTier3 = await typetier2.save()
      posts[i].typeTier = typeTier3.id
    }else{
      posts[i].typeTier = typeTier.id
    }

    posts[i].message = "bien"
    try{
      posts[i].article = article.id
    }catch(e){
      posts[i].article = null
      posts[i].message = "error"
    }

  }

  return posts

}

function getNumberFromString(text) {
  var numberString = ""
  for (let i = 0; i < text.length; i++) {
    if (!isNaN(text[i])) {
      numberString += text[i]
    }
  }
  return Number(numberString)
}

function getTextFromString(text) {
  var textString = ""
  for (let i = 0; i < text.length; i++) {
    if (isNaN(text[i])) {
      textString += text[i]
    }
  }
  return textString
}

function getKeyFromString(shema, textCell) {
  for (let key in shema) {
    if (shema[key] == textCell) {
      return key
    }
  }
  return ""
}


function getJsonFromXlsx(pathFichier, shemaXlsx) {
  const workbook = xlsx.readFile(pathFichier)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  var shema = shemaXlsx
  var keys = []

  for (let key in shema) {
    keys.push(key)
  }

  let posts = []
  let post = {}
  let compteur = 0
  var nomberLigne = 2

  for (let cell in worksheet) {
    const cellAsString = cell.toString();

    if (cellAsString[1] !== 'r' && cellAsString !== 'm' && getNumberFromString(cellAsString) === 1 && compteur < keys.length) {
      shema[keys[compteur]] = getTextFromString(cellAsString)
      compteur++
    }
  }

  compteur = 0

  for (let cell in worksheet) {
    const cellAsString = cell.toString();

    if (cellAsString[1] !== 'r' && cellAsString !== 'm' && getNumberFromString(cellAsString) > 1) {
      if (getNumberFromString(cellAsString) !== nomberLigne) {
        nomberLigne = getNumberFromString(cellAsString)
        posts.push(post)
        post = {}
      }

      if (getKeyFromString(shema, getTextFromString(cellAsString)) != "") {
        post[getKeyFromString(shema, getTextFromString(cellAsString))] = worksheet[cell].v
      }
    }
  }

  posts.push(post)

  for (let item of posts) {
    for (let key in shema) {
      if (item[key] === undefined) {
        item[key] = null
      }
    }
  }

  return posts
}

async function saveClients(posts, societeRacine) {
  var compteurs = { bien: 0, erreur: 0 }

  for (let i = 0; i < posts.length; i++) {

    if (posts[i].message === "bien") {
      posts[i].societeRacine = societeRacine

      var numeroAutomatique = await getNumeroAutomatiqueClient(societeRacine)

      posts[i].num = numeroAutomatique.num
      
      if(!posts[i].soldeInitialDebit || isNaN(posts[i].soldeInitialDebit)){
        posts[i].soldeInitialDebit = 0
      }

      if(!posts[i].soldeInitialCredit || isNaN(posts[i].soldeInitialCredit)){
        posts[i].soldeInitialCredit = 0
      }

      posts[i].typeTiers = await getIdFromColonne(posts[i], "typeTiers", societeRacine)
      posts[i].secteur = await getIdFromColonne(posts[i], "secteur", societeRacine)
      posts[i].modeReglement = await getIdFromColonne(posts[i], "modeReglement", societeRacine)
      posts[i].agentPremierContact = await getIdFromColonne(posts[i], "agentPremierContact", societeRacine)
      posts[i].agentCommercial = await getIdFromColonne(posts[i], "agentCommercial", societeRacine)
      posts[i].agentRecouvrement = await getIdFromColonne(posts[i], "agentRecouvrement", societeRacine)

      var client = new Client(posts[i])
      await client.save()
      compteurs.bien++
    } else {
      compteurs.erreur++
    }

  }

  return compteurs

}

async function saveFournisseurs(posts, societeRacine) {
  var compteurs = { bien: 0, erreur: 0 }
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].message === "bien") {
      posts[i].societeRacine = societeRacine
      var numeroAutomatique = await getNumeroAutomatiqueFournisseur(societeRacine)

      posts[i].num = numeroAutomatique.num

      if(!posts[i].soldeInitialDebit || isNaN(posts[i].soldeInitialDebit)){
        posts[i].soldeInitialDebit = 0
      }

      if(!posts[i].soldeInitialCredit || isNaN(posts[i].soldeInitialCredit)){
        posts[i].soldeInitialCredit = 0
      }

      posts[i].typeTiers = await getIdFromColonne(posts[i], "typeTiers", societeRacine)
      posts[i].secteur = await getIdFromColonne(posts[i], "secteur", societeRacine)
      posts[i].modeReglement = await getIdFromColonne(posts[i], "modeReglement", societeRacine)
      posts[i].agentPremierContact = await getIdFromColonne(posts[i], "agentPremierContact", societeRacine)
      posts[i].agentCommercial = await getIdFromColonne(posts[i], "agentCommercial", societeRacine)
      posts[i].agentRecouvrement = await getIdFromColonne(posts[i], "agentRecouvrement", societeRacine)

      var fournisseur = new Fournisseur(posts[i])
      await fournisseur.save()
      compteurs.bien++
    } else {
      compteurs.erreur++
    }
  }
  return compteurs
}

async function saveInventaires(posts, societeRacine, societe, userCurrent) {
  var compteurs = { bien: 0, erreur: 0 }
  var tabLignes = []

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].message === "bien") {
      posts[i].societeRacine = societeRacine
      var article = await getIdFromColonne(posts[i], "reference", societeRacine)
      var articleSociete = await ArticleSociete.findOne({article:article.id, societe:societe})
      compteurs.bien++
      var item = {}
      item.numero = compteurs.bien
      item.reference = article.reference
      item.designation = article.designation
      item.article = article.id
      item.qteTheorique = articleSociete.qteTheorique
      item.qteEnStock = articleSociete.qteEnStock
      item.qteInv1 = posts[i].quantite
      item.qteInv2 = 0
      item.qteInv3 = 0
      item.qteInv1IsValid = "oui"
      item.qteInv2IsValid = "non"
      item.qteInv3IsValid = "non"
      item.notes = ""
      item.qteInvValide = posts[i].quantite
      tabLignes.push(item)
    } else {
      compteurs.erreur++
    }
  }

  var inventaire = new Inventaire()
  var numero = await getNumeroAutomatiqueInventaire(societe)

  inventaire.numero = numero.numero
  inventaire.num = numero.num
  inventaire.date = new Date
  inventaire.societe = societe
  inventaire.categorie = null
  inventaire.cloture = true
  inventaire.personne = userCurrent.id
  inventaire.notes = ""
  inventaire.ligneInventaire = tabLignes
  await inventaire.save()
  
  return compteurs
}

async function savePrixSpecifiqueTypeTier(posts, societeRacine, societe, userCurrent) {
  var compteurs = { bien: 0, erreur: 0 }
  var tabLignes = []

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].message === "bien") {
      posts[i].societeRacine = societeRacine
      compteurs.bien++
      posts[i].isEnable = true
      var item = await PrixSpecifiqueLigneTypeTier.findOne({typeTier:posts[i].typeTier, article:posts[i].article})
      if(item){
        const result = await PrixSpecifiqueLigneTypeTier.findByIdAndUpdate(item._id, posts[i])
      }else{
        var prix = new PrixSpecifiqueLigneTypeTier(posts[i])
        const result = await prix.save()
      }

      tabLignes.push(posts[i])
     
    } else {
      compteurs.erreur++
    }
  }
  
  return compteurs
}

async function getSecteur(item, key, societeRacine) {

  var secteursFilter = []

  if (!isNaN(item[key])) {
    secteursFilter = await Secteur.find({ $or: [{ num: Number(item[key]) }, { typeS: item[key] }], societeRacine: societeRacine })
  } else {
    secteursFilter = await Secteur.find({ typeS: item[key], societeRacine: societeRacine })
  }

  if (secteursFilter.length > 0) {
    item[key] = marquesFilter[0].id
  } else {
    var numSecteur = await getNumeroAutomatiqueSecteur(societeRacine)
    var secteur = new Secteur({ typeS: item[key], societeRacine: societeRacine, num: numSecteur.num })
    var secteurResult = await secteur.save()
    item[key] = secteurResult.id
  }

  return item[key]
}

async function getTypeTier(item, key, societeRacine) {

  var typeTiersFilter = []

  if (!isNaN(item[key])) {
    typeTiersFilter = await TypeTier.find({ $or: [{ num: Number(item[key]) }, { libelle: item[key] }], societeRacine: societeRacine })
  } else {
    typeTiersFilter = await TypeTier.find({ libelle: item[key], societeRacine: societeRacine })
  }

  if (typeTiersFilter.length > 0) {
    item[key] = typeTiersFilter[0].id
  } else {
    var numTypeTier = await getNumeroAutomatiqueTypeTier(societeRacine)
    var typeTier = new TypeTier({ libelle: item[key], societeRacine: societeRacine, num: numTypeTier.num })
    var typeTierResult = await typeTier.save()
    item[key] = typeTierResult.id
  }

  return item[key]
}

async function getModeReglement(item, key, societeRacine) {

  var modeReglementsFilter = []

  if (!isNaN(item[key])) {
    modeReglementsFilter = await ModeReglement.find({ $or: [{ num: Number(item[key]) }, { libelle: item[key] }], societeRacine: societeRacine })
  } else {
    modeReglementsFilter = await ModeReglement.find({ libelle: item[key], societeRacine: societeRacine })
  }

  if (modeReglementsFilter.length > 0) {
    item[key] = modeReglementsFilter[0].id
  } else {
    var numModeReglement = await getNumeroAutomatiqueModeReglement(societeRacine)
    var modeReglement = new ModeReglement({ libelle: item[key], societeRacine: societeRacine, num: numModeReglement.num })
    var modeReglementResult = await modeReglement.save()
    item[key] = modeReglementResult.id
  }

  return item[key]
}

async function getPersonnel(item, key, societeRacine) {

  var personnelsFilter = []

  if (!isNaN(item[key])) {
    personnelsFilter = await Personnel.find({ $or: [{ num: Number(item[key]) }, { nom: item[key] }], societeRacine: societeRacine })
  } else {
    personnelsFilter = await Personnel.find({ nom: item[key], societeRacine: societeRacine })
  }

  if (personnelsFilter.length > 0) {
    item[key] = personnelsFilter[0].id
  } else {
    var numPersonnel = await getNumeroAutomatiquePersonnel(societeRacine)
    var personnel = new Personnel({ nom: item[key], societeRacine: societeRacine, num: numPersonnel.num })
    var personnelResult = await personnel.save()
    item[key] = personnelResult.id
  }

  return item[key]
}

module.exports.saveInventaires = saveInventaires
module.exports.getLigneDoublante = getLigneDoublante
module.exports.saveFournisseurs = saveFournisseurs
module.exports.saveClients = saveClients
module.exports.getJsonFromXlsx = getJsonFromXlsx
module.exports.calculPrixArticles = calculPrixArticles
module.exports.saveArticles = saveArticles
module.exports.calculTypeTier = calculTypeTier
module.exports.savePrixSpecifiqueTypeTier = savePrixSpecifiqueTypeTier