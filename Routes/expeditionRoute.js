const { Expedition, getNumeroAutomatique } = require('../Models/expeditionModel')
const { LigneExpeditionModel } = require('../Models/ligneExpeditionModel')
const { BonLivraison } = require('../Models/bonLivraisonModel')
const { Utilisateur } = require('../Models/utilisateurModel')
const { Personnel } = require('../Models/personnelModel')
const { Transporteur } = require('../Models/transporteursModel')
const { MethodeReglement } = require('../Models/methodeReglementModel')
const { EtatGlobal } = require('../Models/etatGlobalModel')



const { Article, getArticlesWithQuantites, getArticlesWithQuantitesfilterBySearch } = require('../Models/articleModel')

const { ArticleSociete, updateQteEnStock, updateQteTherique, updateQteTheriqueQteEnStock } = require('../Models/articleSocieteModel')
var ObjectId = require('mongodb').ObjectID;

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')


const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { consolelog } = require('../Models/errorModel')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now())
    }
})


var upload = multer({ storage: storage })


router.post('/upload', upload.array('myFiles'), verifytoken, async (req, res) => {
   
try{
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


router.post('/newExpedition', verifytoken, async (req, res) => {

    try{
    var societe = ObjectId(req.body.societe)
    var exercice = req.body.exercice

    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    req.body.numero = numeroAutomatique.numero
    req.body.num = numeroAutomatique.num

    const expedition = new Expedition(req.body);

    const result = await expedition.save()

    for (let i = 0; i < req.body.ligneExpeditions.length; i++) {
  
        let item = new LigneExpeditionModel(req.body.ligneExpeditions[i])

        item.expedition = result.id
        item.quantiteVente = req.body.ligneExpeditions[i].quantiteVente
        item.societe = result.societe

        const resul = await item.save()
    }

    return res.send({ status: true, resultat: result })
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


router.post('/modifierExpedition/:id', verifytoken, async (req, res) => {

    try{
    const expedition = await Expedition.findById(req.params.id)

    if (expedition.societe != req.body.societe) {
        return res.send({ status: false })
    }

    if (!expedition) return res.status(401).send({ status: false })

    const result = await Expedition.findOneAndUpdate({ _id: req.params.id }, req.body)

    const expedition2 = await Expedition.findById(req.params.id)

    const ligneExpeditions = await LigneExpeditionModel.find({ expedition: req.params.id })

    for (let i = 0; i < ligneExpeditions.length; i++) {

        const deleteItem = await LigneExpeditionModel.findOneAndDelete({ _id: ligneExpeditions[i].id })
    }

    for (let i = 0; i < req.body.ligneExpeditions.length; i++) {

        let item = new LigneExpeditionModel(req.body.ligneExpeditions.length[i])
        item.expedition = result.id
        item.date = result.date
        const resul = item.save()
    }

    return res.send({ status: true, resultat: expedition2 })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


router.post('/deleteExpedition/:id', verifytoken, async (req, res) => {

    try{
    const expedition = await Expedition.findById(req.params.id)

    if (!expedition) return res.status(401).send({ status: false })


    const ligneExpeditions = await LigneExpeditionModel.find({ expedition: req.params.id })

    for (let i = 0; i < ligneExpeditions.length; i++) {

        const deleteItem = await LigneExpeditionModel.findOneAndDelete({ _id: ligneExpeditions[i].id })

    }

    if (await Expedition.findOneAndDelete({ _id: req.params.id })) {
        return res.send({ status: true })
    } else {
        return res.send({ status: false })
    }

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


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


router.post('/listExpeditions', verifytoken, async (req, res) => {

    try{
    var dateStart = new Date(req.body.dateStart)
    var dateEnd = new Date(req.body.dateEnd)
    var societe = ObjectId(req.body.societe)

    var sort = {}
    for (let key in req.body.orderBy) {
        if (Number(req.body.orderBy[key]) != 0) {
            sort[key] = req.body.orderBy[key]
        }
    }

    if (Object.keys(sort).length == 0) {
        sort = { _id: -1 }
    }

    var pipeline = []

    pipeline.push({ $match: { dateExpedition: { $lte: dateEnd, $gte: dateStart }, societe: societe } })

    pipeline.push({
        $lookup: {
            from: 'bonlivraisons',
            let: { "bonLivraison": "$bonLivraison" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$bonLivraison"] },
                        ]
                    }
                }
            },
            ],
            as: "bonlivraisons"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'utilisateurs',
            let: { "utilisateur": "$utilisateur" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$utilisateur"] },
                        ]
                    }
                }
            },
            ],
            as: "utilisateurs"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'personnels',
            let: { "responsable": "$responsable" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$responsable"] },
                        ]
                    }
                }
            },
            ],
            as: "personnels"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'transporteurs',
            let: { "transporteur": "$transporteur" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$transporteur"] },
                        ]
                    }
                }
            },
            ],
            as: "transporteurs"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'etatglobals',
            let: { "etatExpedition": "$etatExpedition" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$etatExpedition"] },
                        ]
                    }
                }
            },
            ],
            as: "etatglobals"
        }
    })

    pipeline.push({
        $lookup: {
            from: 'methodereglements',
            let: { "methodeReglement": "$methodeReglement" },
            pipeline: [{
                $match:
                {
                    $expr: {
                        "$and": [
                            { "$eq": ["$_id", "$$methodeReglement"] },
                        ]
                    }
                }
            },
            ],
            as: "methodereglements"
        }
    })
    pipeline.push({
        $set: {
            bonLivraison: { $arrayElemAt: ["$bonlivraisons.numero", 0] },
            utilisateur: { $arrayElemAt: ["$utilisateurs.nom", 0] },
            responsable: { $arrayElemAt: ["$personnels.nom", 0] },
            transporteur: { $arrayElemAt: ["$transporteurs.nom", 0] },
            etatExpedition: { $arrayElemAt: ["$etatglobals.etat", 0] },
            methodeReglement: { $arrayElemAt: ["$methodereglements.libelle", 0] },
            numeroExpedition: { $toString: "$numeroExpedition" },
            delaiExpedition: { $toString: "$delaiExpedition" },
            numeroColis: { $toString: "$numeroColis" },

            dateExpedition: {
                $dateToString: {
                    format: "%Y-%m-%d", date: "$dateExpedition"
                }
            },
            id: "$_id"
        }
    })

    pipeline.push({
        $project: {
            id: 1,
            numero: 1,
            bonLivraison: 1,
            utilisateur: 1,
            responsable: 1,
            transporteur: 1,
            numeroExpedition: 1,
            dateExpedition: 1,
            delaiExpedition: 1,
            datePrevuLivraison: 1,
            etatExpedition: 1,
            methodeReglement: 1,
            numeroColis: 1,
            notes: 1,
        }
    })

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

            let objectMatch = { $or: [objet1, objet2, objet3] }

            let objectParent = { $match: objectMatch }
            pipeline.push(objectParent)
        }
    }


    var sommePipeline = []
    for (let key in pipeline) {
        sommePipeline.push(pipeline[key])
    }

    pipeline.push({
        $sort: sort
    })

    var skip = Number(req.body.page - 1) * Number(req.body.limit)

    pipeline.push({ $limit: skip + Number(req.body.limit) })

    pipeline.push({ $skip: skip })

    const articles = await Expedition.aggregate(pipeline)

    sommePipeline.push({
        $count: "total"
    })

    var nbrTotal = await Expedition.aggregate(sommePipeline)

    if (nbrTotal.length == 0) {
        nbrTotal = [{ total: 0 }]
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit)
    var pages = nbrTotal[0].total / req.body.limit

    if (pages > nbrTotalTrunc) {
        pages = nbrTotalTrunc + 1
    }

    const result = { docs: articles, pages: pages }

    return res.send({ status: true, resultat: result, request: req.body })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


router.get('/getById/:id', verifytoken, async (req, res) => {

    try{
    if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

    var expedition = await Expedition.findOne({ _id: req.params.id })

    const ligneExpeditions = await LigneExpeditionModel.find({ expedition: expedition._id })

    return res.send({ status: true, resultat: expedition,ligneExpeditions:ligneExpeditions })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /expeditions/getAllParametres:
 *   get:
 *     summary: Remove the article by id
 *     tags: [Expeditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The article id
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
 *                  article:
 *                    type: array          
 *       404:
 *         description: The bl was not found
 *       500:
 *         description: Some error happened
 */
router.post('/getAllParametres', verifytoken, async (req, res) => {

    try{
    var societe = ObjectId(req.body.societe)

    var exercice = req.body.exercice
    var numeroAutomatique = await getNumeroAutomatique(societe, exercice)

    const expeditions = await Expedition.find({ societe: societe })

    const bonLivraisons = await BonLivraison.find({ societe: societe })
    const utilisateurs = await Utilisateur.find({ societeRacine: societe })
    const responsables = await Personnel.find({ societeRacine: societe })
    const transporteurs = await Transporteur.find({ societeRacine: societe })
    const etatExpeditions = await EtatGlobal.find({ societeRacine: societe })
    const methodeReglements = await MethodeReglement.find({ societeRacine: societe })
    const articles = await Article.find({ societeRacine: societe })
    
    return res.send({
        status: true, expeditions: expeditions, bonLivraisons: bonLivraisons,
        utilisateurs: utilisateurs,responsables: responsables,
        transporteurs: transporteurs,etatExpeditions: etatExpeditions,
        methodeReglements: methodeReglements,
        articles:articles,
        numeroAutomatique: numeroAutomatique.numero,
    })

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
module.exports.routerExpedition = router
