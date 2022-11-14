const { ParamLiv, validateParamLivr } = require('../Models/paramLiv')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { getSocieteRacine } = require('../Models/societeModel');
const { BonLivraison } = require('../Models/bonLivraisonModel');
const { BonLivraisonArticle } = require('../Models/bonLivraisonArticleModel');
const { consolelog } = require('../Models/errorModel');

var db = null
var MongoClient = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectID;

router.get('/getById/:id', async (req, res) => {
try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    const paramliv = await ParamLiv.findOne({ _id: req.params.id })

    return res.send({ status: true, resultat: paramliv })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.post('/getByidFormat/:idFormat/:typeDoc', async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

    var sort = {}
    for (let key in req.body.orderBy) {
        if (Number(req.body.orderBy[key]) != 0) {
            sort[key] = req.body.orderBy[key]
        }
    }

    if (Object.keys(sort).length == 0) {
        sort = { createdAt: -1 }
    }

    var listFilter = []

    listFilter.push({ societeRacine: societeRacine })

    // req.body.search.idFormat = req.params.idFormat

    //  req.body.search.typeDoc = req.params.typeDoc

    var search = req.body.search

    for (let key in search) {
        if (search[key] != "") {
            var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1)
            var word2 = search[key].toUpperCase()
            var word3 = search[key].toLowerCase()
            var objet1 = {}
            objet1[key] = { $regex: '.*' + word1 + '.*' }

            var objet2 = {}
            objet2[key] = { $regex: '.*' + word2 + '.*' }

            var objet3 = {}
            objet3[key] = { $regex: '.*' + word3 + '.*' }

            listFilter.push({ $or: [objet1, objet2, objet3] })
        }
    }

    const options = {
        page: Number(req.body.page),
        limit: Number(req.body.limit),
        customLabels: myCustomLabels,
        //populate: 'client'
        sort: sort
    };
    // return res.send({ status: true, resultat: paramliv })
    var result = []

    if (listFilter.length > 1) {
        result = await ParamLiv.paginate({ $and: listFilter }, options)
    } else if (listFilter.length == 1) {
        result = await ParamLiv.paginate(listFilter[0], options)
    } else {
        result = await ParamLiv.paginate({}, options)
    }

    return res.send({ status: true, resultat: result, request: req.body })
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


router.post('/newparamLiv', async (req, res) => {

    try{
    var body = req.body

    const paramliv = new ParamLiv(body);

    const result = await paramliv.save()

    return res.send({ status: true, resultat: result })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})
/* ////////////modifier////////////////////////// */


router.post('/modifierparamliv/:id', async (req, res) => {
    try{

    const paramliv = await ParamLiv.findById(req.params.id)

    if (!paramliv) {
        return
        res.status(401).send({ status: false })
    }

    const result = await ParamLiv.findOneAndUpdate({ _id: req.params.id }, req.body)

    const paramliv2 = await ParamLiv.findById(req.params.id);

    return res.send({ status: true, resultat: paramliv2 })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/* get all ************************************************************* */
router.post('/getAllParametres', verifytoken, async (req, res) => {
    try{

    const paramLivs = await ParamLiv.find({})

    return res.send({ status: true, paramLivs: paramLivs })

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




const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'itemsList',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator'
};

router.get('/deletelistParamliv/:idSociete', async (req, res) => {

    if (!ObjectId.isValid(req.params.idSociete)) {
        return res.send({ status: false })
    }

    var societeRacine = await getSocieteRacine(ObjectId(req.params.idSociete))

    console.log(societeRacine)

    var articles = await ParamLiv.deleteMany({ societeRacine: societeRacine })

    return res.send({ status: true })

})

router.get('/initialiserlistParamliv/:idSociete', async (req, res) => {

    if (!ObjectId.isValid(req.params.idSociete)) {
        return res.send({ status: false })
    }

    var societeRacine = await getSocieteRacine(ObjectId(req.params.idSociete))

    var articles = await ParamLiv.deleteMany({ societeRacine: societeRacine })

    await inisialiserChampsBonLivraison(societeRacine)

    return res.send({ status: true })

})

router.post('/listParamliv', async (req, res) => {

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))


    var sort = {}
    for (let key in req.body.orderBy) {
        if (Number(req.body.orderBy[key]) != 0) {
            sort[key] = req.body.orderBy[key]
        }
    }

    if (Object.keys(sort).length == 0) {
        sort = { _id: -1 }
    }

    var listFilter = []

    listFilter.push({ societeRacine: societeRacine })

    var search = req.body.search

    for (let key in search) {
        if (search[key] != "") {
            var word1 = search[key].charAt(0).toUpperCase() + search[key].slice(1)
            var word2 = search[key].toUpperCase()
            var word3 = search[key].toLowerCase()
            var objet1 = {}
            objet1[key] = { $regex: '.*' + word1 + '.*' }

            var objet2 = {}
            objet2[key] = { $regex: '.*' + word2 + '.*' }

            var objet3 = {}
            objet3[key] = { $regex: '.*' + word3 + '.*' }

            listFilter.push({ $or: [objet1, objet2, objet3] })
        }
    }

    const options = {
        page: Number(req.body.page),
        limit: Number(req.body.limit),
        customLabels: myCustomLabels,
        //populate: 'client'
        sort: sort
    };

    var result = []

    if (listFilter.length > 1) {
        result = await ParamLiv.paginate({ $and: listFilter }, options)
    } else if (listFilter.length == 1) {
        result = await ParamLiv.paginate(listFilter[0], options)
    } else {
        result = await ParamLiv.paginate({}, options)
    }


    return res.send({ status: true, resultat: result, request: req.body })

})

async function inisialiserChampsBonLivraison(societeRacine) {

    var bonLivraisonArticle = {
        numero: { type: Number, default: 0 },
        reference: { type: String, default: "" },
        designation: { type: String, default: "" },
        prixAchat: { type: Number, default: 0 },
        remiseF: { type: Number, default: 0 },
        prixFourn: { type: Number, default: 0 },
        isFodec: { type: String, default: "" },
        prixFodec: { type: Number, default: 0 },
        tauxDC: { type: Number, default: 0 },
        prixDC: { type: Number, default: 0 },
        totalFrais: { type: Number, default: 0 },
        tauxRemise: { type: Number, default: 0 },
        remiseParMontant: { type: Number, default: 0 },
        remiseParMontant2: { type: Number, default: 0 },
        montantRemise: { type: Number, default: 0 },
        prixSpecifique: { type: Number, default: 0 },
        prixVenteHT: { type: Number, default: 0 },
        quantiteVente: { type: Number, default: 0 },
        totalRemise: { type: Number, default: 0 },
        totalHT: { type: Number, default: 0 },
        tauxTVA: { type: Number, default: 0 },
        totalTVA: { type: Number, default: 0 },
        redevance: { type: Number, default: 0 },
        totalTTC: { type: Number, default: 0 },
        pVenteConseille: { type: Number, default: 0 },
        marge: { type: Number, default: 0 },

        date: { type: Date, default: new Date() },

        totalGainCommerciale: { type: Number, default: 0 },
        totalGainReel: { type: Number, default: 0 },

        prixRevient: { type: Number, default: 0 },

        totalRedevance: { type: Number, default: 0 },
        prixTTC: { type: Number, default: 0 },
        plafondRemise: { type: Number, default: 0 },
        unite1: { type: String, default: "" },
        unite2: { type: String, default: "" },
        coefficient: { type: Number, default: 0 },

        sansRemise: { type: String, default: "" },
        prixVenteHTReel: { type: Number, default: 0 },
    }

    var bonReceptionArticle = {
        numero:{type:Number,default: 0},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        prixAchat:{type:Number,default: 0},
        remiseF:{type:Number,default: 0},
        prixFourn:{type:Number,default: 0},
        isFodec:{type:String,default: ""},
        prixFodec:{type:Number,default: 0},
        tauxDC:{type:Number,default: 0},
        prixDC:{type:Number,default: 0},
        totalFrais:{type:Number,default: 0},
        tauxRemise:{type:Number,default: 0},
        remiseParMontant:{type:Number,default: 0},
        remiseParMontant2:{type:Number,default: 0},
        montantRemise:{type:Number,default: 0},
        prixSpecifique:{type:Number,default: 0},
        totalRemise:{type:Number,default: 0},
        totalHT:{type:Number,default: 0},
        tauxTVA:{type:Number,default: 0},
        totalTVA:{type:Number,default: 0},
        redevance:{type:Number,default: 0},
        totalTTC:{type:Number,default: 0},
        pVenteConseille:{type:Number,default: 0},
        marge:{type:Number,default: 0},
       
        quantiteLivree:{type:Number,default: 0},
        date:{type:Date,default: new Date()},
      
        totalRedevance:{type:Number,default: 0},
        prixTTC:{type:Number,default: 0},
        plafondRemise:{type:Number,default: 0},
        unite1: {type:String,default: ""},
        unite2: {type:String,default: ""},
        coefficient: {type:Number,default: 0},
    
        sansRemise:{type:String,default: ""},
        
        quantiteAchat:{type:Number,default: 0},
        prixAchatHTReel :{type:Number,default: 0},
        quantiteAchat2:{type:Number,default: 0},
        prixAchatHTReel2 :{type:Number,default: 0},
    }

    var demandeOffrePrixArticle = {
        numero:{type:Number,default: 0},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        prixAchat:{type:Number,default: 0},
        remiseF:{type:Number,default: 0},
        prixFourn:{type:Number,default: 0},
        isFodec:{type:String,default: ""},
        prixFodec:{type:Number,default: 0},
        tauxDC:{type:Number,default: 0},
        prixDC:{type:Number,default: 0},
        totalFrais:{type:Number,default: 0},
        tauxRemise:{type:Number,default: 0},
        remiseParMontant:{type:Number,default: 0},
        remiseParMontant2:{type:Number,default: 0},
        montantRemise:{type:Number,default: 0},
        prixSpecifique:{type:Number,default: 0},
        totalRemise:{type:Number,default: 0},
        totalHT:{type:Number,default: 0},
        tauxTVA:{type:Number,default: 0},
        totalTVA:{type:Number,default: 0},
        redevance:{type:Number,default: 0},
        totalTTC:{type:Number,default: 0},
        pVenteConseille:{type:Number,default: 0},
        marge:{type:Number,default: 0},
       
        quantiteLivree:{type:Number,default: 0},
        date:{type:Date,default: new Date()},
      
        totalRedevance:{type:Number,default: 0},
        prixTTC:{type:Number,default: 0},
        plafondRemise:{type:Number,default: 0},
        unite1: {type:String,default: ""},
        unite2: {type:String,default: ""},
        coefficient: {type:Number,default: 0},
    
        sansRemise:{type:String,default: ""},
        
        quantiteAccepter:{type:Number,default: 0},
    }

    var idFormats = {
        A5: "",
        A4: ""
    }

    var typeDocsVente = {
        bonLivraison: "Bon Livraison",
        devis: "Devis",
        commande: "Commande",
        bonRetourClient: "Bon Retour Client",
        factureVente: "Facture Vente",
    }

    var typeDocsAchat = {
        bonReception: "Bon Reception",
        devisAchat: "Devis Achat",
        bonCommande: "Bon Commande",
        bonRetourFournisseur: "Bon Retour Fournisseur",
        factureAchat: "Facture Achat",
    }

    var typeDocsAchat2 = {
        demandeOffrePrix: "Demande Offre Prix",
    }

    var listeColonneInisialiser = {
        prixVenteHTReel: {libelle:"P.U.HT", width:10, ordre:19, visibilite:'oui'},
        prixAchatHTReel: {libelle:"P.U.HT", width:10, ordre:19, visibilite:'oui'},
        quantiteVente: {libelle:"Quantite", width:10, ordre:18, visibilite:'oui'},
        quantiteAchat: {libelle:"Quantite", width:10, ordre:18, visibilite:'oui'},
        totalTTC: {libelle:"Total TTC", width:15, ordre:24, visibilite:'oui'},
        tauxTVA: {libelle:"TVA", width:7, ordre:22, visibilite:'oui'},
        totalHT: {libelle:"Montant HT", width:10, ordre:20, visibilite:'oui'},
        designation: {libelle:"Designation", width:38, ordre:3, visibilite:'oui'},
        reference: {libelle:"Reference", width:10, ordre:2, visibilite:'oui'},
    }

    var listeColonneInisialiserDemandeOffrePrix = {
        quantiteAccepter: {libelle:"Quantite", width:20, ordre:18, visibilite:'oui'},
        designation: {libelle:"Designation", width:60, ordre:3, visibilite:'oui'},
        reference: {libelle:"Reference", width:20, ordre:2, visibilite:'oui'},
    }

    var tabLigne = []

    for (let keyFormat in idFormats) {
        for (let keyTypeDocs in typeDocsVente) {

            var compteur = 0
            for (let key in bonLivraisonArticle) {
                compteur++
                var paramLiv = new ParamLiv({
                    idFormat: keyFormat,
                    typeDoc: typeDocsVente[keyTypeDocs],
                    champ: key,
                    libelle: key,
                    width: 20,
                    ordre: compteur,
                    visibilite: "non",
                    alignement: "left",
                    societeRacine: societeRacine,
                })

                if(listeColonneInisialiser[key]){
                    paramLiv.libelle = listeColonneInisialiser[key].libelle
                    paramLiv.width = listeColonneInisialiser[key].width
                    paramLiv.ordre = listeColonneInisialiser[key].ordre
                    paramLiv.visibilite = listeColonneInisialiser[key].visibilite
                }

                tabLigne.push(paramLiv)
               // await paramLiv.save()

            }
        }
    }


    for (let keyFormat in idFormats) {
        for (let keyTypeDocs in typeDocsAchat) {

            var compteur = 0
            for (let key in bonReceptionArticle) {
                compteur++
                var paramLiv = new ParamLiv({
                    idFormat: keyFormat,
                    typeDoc: typeDocsAchat[keyTypeDocs],
                    champ: key,
                    libelle: key,
                    width: 20,
                    ordre: compteur,
                    visibilite: "non",
                    alignement: "left",
                    societeRacine: societeRacine,
                })

                if(listeColonneInisialiser[key]){
                    paramLiv.libelle = listeColonneInisialiser[key].libelle
                    paramLiv.width = listeColonneInisialiser[key].width
                    paramLiv.ordre = listeColonneInisialiser[key].ordre
                    paramLiv.visibilite = listeColonneInisialiser[key].visibilite
                }
                
                tabLigne.push(paramLiv)
                //await paramLiv.save()

            }
        }
    }

    for (let keyFormat in idFormats) {
        for (let keyTypeDocs in typeDocsAchat2) {

            var compteur = 0
            for (let key in demandeOffrePrixArticle) {
                compteur++
                var paramLiv = new ParamLiv({
                    idFormat: keyFormat,
                    typeDoc: typeDocsAchat2[keyTypeDocs],
                    champ: key,
                    libelle: key,
                    width: 20,
                    ordre: compteur,
                    visibilite: "non",
                    alignement: "left",
                    societeRacine: societeRacine,
                })

                if(listeColonneInisialiserDemandeOffrePrix[key]){
                    paramLiv.libelle = listeColonneInisialiserDemandeOffrePrix[key].libelle
                    paramLiv.width = listeColonneInisialiserDemandeOffrePrix[key].width
                    paramLiv.ordre = listeColonneInisialiserDemandeOffrePrix[key].ordre
                    paramLiv.visibilite = listeColonneInisialiserDemandeOffrePrix[key].visibilite
                }
                
                tabLigne.push(paramLiv)
                //await paramLiv.save()

            }
        }
    }

    await ParamLiv.insertMany(tabLigne)

}

module.exports.routerParamLiv = router