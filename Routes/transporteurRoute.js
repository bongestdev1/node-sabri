const {Transporteur, validateTransporteur} =require('../Models/transporteursModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { consolelog } = require('../Models/errorModel');
var ObjectId = require('mongodb').ObjectID;


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  file.originalname + Date.now())
    }
})


var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     UniteMesure:
 *       type: object
 *       required:
 *         - nom
 *         - numVehicule
 *         - gsm
 *         - tel
 *         - email
 *       properties:
 *         nom:
 *           type: string
 *         numVehicule:
 *           type: string
 *         gsm:
 *           type: string
 *         tel:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Transporteur
 *   description: The Transporteur managing API
 */


/**
 * @swagger
 * paths:
 *   /transporteurs/upload:
 *     post:
 *       summary: upload image
 *       tags: [Transporteurs]
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
router.post('/upload',upload.array('myFiles'),verifytoken,async(req,res)=>{
    try{
    const files = req.files
    let arr=[];
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


/**
 * @swagger
 * /transporteurs/newTransporteur:
 *   post:
 *     summary: Returns the list of all the Transporteurs
 *     tags: [Transporteurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                numVehicule:
 *                  type: number
 *                gsm:
 *                  type: string
 *                tel:
 *                  type: string
 *                email:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Transporteurs
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
 *                    nom:
 *                      type: string
 *                    numVehicule:
 *                      type: number
 *                    gsm:
 *                      type: string
 *                    tel:
 *                      type: string
 *                    email:
 *                      type: string
 *
 */

router.post('/newTransporteur',verifytoken, async(req,res)=>{

    try{
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))
    
    const transporteur=new Transporteur(body);

    const result=await transporteur.save()

    return res.send({status:true,resultat:result})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /transporteurs/modifierTransporteur/{id}:
 *   post:
 *     summary: Update the Transporteur by id
 *     tags: [Transporteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Transporteur id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                numVehicule:
 *                  type: number
 *                gsm:
 *                  type: string
 *                tel:
 *                  type: string
 *                email:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Transporteurs
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
 *                     nom:
 *                       type: string
 *                     numVehicule:
 *                       type: number
 *                     gsm:
 *                       type: string
 *                     tel:
 *                       type: string
 *                     email:
 *                       type: string
 *
 *
 */

router.post('/modifierTransporteur/:id',verifytoken, async(req,res)=>{

    try{
    const transporteur = await Transporteur.findById(req.params.id)

    if(!transporteur) return res.status(401).send({status:false})

    const result = await Transporteur.findOneAndUpdate({_id:req.params.id}, req.body)

    const transporteur2 = await Transporteur.findById(req.params.id)

    return res.send({status:true,resultat:transporteur2})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /transporteurs/deleteTransporteur/{id}:
 *   post:
 *     summary: Remove the Transporteur by id
 *     tags: [Transporteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Transporteur id
 *
 *     responses:
 *       200:
 *         description: The Transporteur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Transporteur was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteTransporteur/:id',verifytoken, async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const transporteur = await Transporteur.findById(req.params.id)

    if(!transporteur) return res.status(401).send({status:false})


    if(await Transporteur.findOneAndDelete({_id:req.params.id})){
        return res.send({status:true})
    }else{
        return res.send({status:false})
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



/**
 * @swagger
 * /transporteurs/listTransporteurs:
 *   post:
 *     summary: Returns the list of all the Transporteurs
 *     tags: [Transporteurs]
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
 *         description: The list of the Transporteurs
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
 *                            nom:
 *                              type: string
 *                            numVehicule:
 *                              type: number
 *                            gsm:
 *                              type: string
 *                            tel:
 *                              type: string
 *                            email:
 *                              type: string
 *                            order:
 *                              type: number
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listTransporteurs',verifytoken, async(req,res)=>{
  
    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societeRacine))
  
    var sort = {}
    for( let key in req.body.orderBy){
        if(Number(req.body.orderBy[key]) != 0){
             sort[key] = req.body.orderBy[key]
        }  
    }

    if(Object.keys(sort).length == 0){
        sort = {createdAt:-1}
    }
   
    var listFilter =[]
    listFilter.push({societeRacine:societeRacine})
    
    var search = req.body.search
    
    for( let key in search){
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

            listFilter.push({$or:[objet1, objet2, objet3]})
        }  
    }

    const options = {
        page: Number(req.body.page),
        limit: Number(req.body.limit),
        customLabels: myCustomLabels,
        //populate: 'client'
        sort:sort
    };

    var result = []
    
    if(listFilter.length > 1){
      result = await  Transporteur.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  Transporteur.paginate(listFilter[0], options)
    }else{
      result = await  Transporteur.paginate({}, options)
    }

    return res.send({status:true, resultat:result, request:req.body})
  
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /transporteurs/getById/{id}:
 *   get:
 *     summary: Remove the Transporteur by id
 *     tags: [Transporteurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Transporteur id
 *
 *     responses:
 *       200:
 *         description: The Transporteur was deleted
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
 *                     nom:
 *                       type: string
 *                     numVehicule:
 *                       type: number
 *                     gsm:
 *                       type: string
 *                     tel:
 *                       type: string
 *                     email:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Transporteur was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const transporteur = await Transporteur.findOne({_id:req.params.id})

    return res.send({status:true,resultat:transporteur})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

router.post('/getAllParametres', verifytoken, async(req,res)=>{

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societeRacine))
    
    const transporteurs = await Transporteur.find({societeRacine:societeRacine})
    
    return res.send({status:true, transporteurs:transporteurs}) 

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
  
})

function verifytoken(req, res, next){
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'secretkey', (err, authData) => {
            if(err){
                res.sendStatus(403);
            }else{
                req.user = authData;
                next();
            }
        });

    }else{
        console.log("etape100");
        res.sendStatus(401);
    }

}

module.exports.routerTransporteur=router
