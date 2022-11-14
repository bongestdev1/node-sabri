const { Article, SousProduit, validateReferenceDesignation, validateReferenceDesignationModifier, validateArticle, validateArticlesPagination, getCodeBarre, } = require('../Models/articleModel')
const { BonLivraisonArticle } = require('../Models/bonLivraisonArticleModel')

const { ArticleSociete } = require('../Models/articleSocieteModel')
const { Frais } = require('../Models/fraisModel')

const {calculTypeTier, getLigneDoublante, getJsonFromXlsx, calculPrixArticles, saveArticles, saveClients, saveFournisseurs, saveInventaires, savePrixSpecifiqueTypeTier } = require('../Models/importationModel')

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
const { Client } = require('../Models/clientModel')

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
const { Fournisseur } = require('../Models/fournisseurModel')
const { TypeTier } = require('../Models/typeTierModel')
const { Variante } = require('../Models/varianteModel')

const xlsx = require('xlsx');
const { consolelog } = require('../Models/errorModel')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
})

var upload = multer({ storage: storage })



router.post('/upload', upload.array('myFiles'), verifytoken, async (req, res) => {
  try {
    const files = req.files
    let arr = [];
    files.forEach(element => {

      arr.push(element.path)

    })
    return res.send(arr)
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

//importation articles with accessoires
router.post('/extractFromFile', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    var posts = getJsonFromXlsx(req.body.pathFichier, req.body.shema)
    posts = await getLigneDoublante(posts, req.body.table, societeRacine)
    return res.send({ status: true, articles: posts })
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

//importation articles with accessoires
router.post('/saveFile', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

    switch (req.body.table) {
      case 'Articles':
        var posts = req.body.items
        posts = await calculPrixArticles(posts, req.body.tauxFodec, societeRacine)
        var nbrSave = await saveArticles(posts, societeRacine)
        return res.send({ status: true, nbrSave: nbrSave })
        break;
      case 'Clients':
        var posts = req.body.items
        var nbrSave = await saveClients(posts, societeRacine)
        return res.send({ status: true, nbrSave: nbrSave })
        break;
      case 'Fournisseurs':
        var posts = req.body.items
        var nbrSave = await saveFournisseurs(posts, societeRacine)
        return res.send({ status: true, nbrSave: nbrSave })
        break;
      case 'Inventaires':
        var posts = req.body.items
        var nbrSave = await saveInventaires(posts, societeRacine, ObjectId(req.body.societe), req.user.user)
        return res.send({ status: true, nbrSave: nbrSave })
        break;
      case 'Prix spécifique':
        var posts = req.body.items
        posts = await calculTypeTier(posts, societeRacine)
        var nbrSave = await savePrixSpecifiqueTypeTier(posts, societeRacine, ObjectId(req.body.societe), req.user.user)
        return res.send({ status: true, nbrSave: nbrSave })
        break;
    }
  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


//importation articles with accessoires
router.post('/saveFileClient', verifytoken, async (req, res) => {

  try {
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

    var posts = getJsonFromXlsx(req.body.pathFichier, req.body.shema)

    await saveClients(posts, societeRacine)

    return res.send({ status: true })

  } catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


function verifytoken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, 'secretkey', (err, authData) => {
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

module.exports.routerImportation = router


