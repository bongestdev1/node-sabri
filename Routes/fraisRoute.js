const {Frais} =require('../Models/fraisModel')
const {TauxTVA} =require('../Models/tauxTVAModel')
const {calculPrixRevientArticle} = require('../Models/articleModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel')
const { consolelog } = require('../Models/errorModel')
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
 *     Frais:
 *       type: object
 *       required:
 *         - taux
 *       properties:
 *         taux:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Frais
 *   description: The frais managing API
 */


/**
 * @swagger
 * paths:
 *   /frais/upload:
 *     post:
 *       summary: upload image
 *       tags: [Frais]
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
router.post('/upload',upload.array('myFiles'),verifytoken ,async(req,res)=>{
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
 * /frais/newFrais:
 *   post:
 *     summary: Returns the list of all the frais
 *     tags: [Frais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                taux:
 *                  type: number
 *     responses:
 *       200:
 *         description: The list of the frais
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
 *                    taux:
 *                      type: number
 *
 */



 router.post('/newFrais',verifytoken , async(req,res)=>{

    try{
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
    
    console.log(body)

    const frais =new Frais(body)

    const result=await frais.save()
    
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
 * /frais/modifierFrais/{id}:
 *   post:
 *     summary: Update the frais by id
 *     tags: [Frais]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The frais id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                taux:
 *                  type: number
 *     responses:
 *       200:
 *         description: The list of the frais
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
 *                    taux:
 *                      type: number
 *
 *
 */

router.post('/modifierFrais/:id',verifytoken , async(req,res)=>{

    try{
    const frais = await Frais.findById(req.params.id)

    if(!frais) return res.status(401).send({status:false})

    const result = await Frais.findOneAndUpdate({_id:req.params.id},req.body)

    const frais2 = await Frais.findById(req.params.id)

    return res.send({status:true,resultat:frais2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /frais/deleteFrais/{id}:
 *   post:
 *     summary: Remove the Frais by id
 *     tags: [Frais]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The frais id
 *
 *     responses:
 *       200:
 *         description: The frais was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The frais was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteFrais/:id',verifytoken , async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const frais = await Frais.findById(req.params.id)

    if(!frais) return res.status(401).send({status:false})
 
    await calculPrixRevientArticle(req.params.id, frais.societeRacine) 

    if(await Frais.findOneAndDelete({_id:req.params.id})){
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
 * /frais/listFrais:
 *   post:
 *     summary: Returns the list of all the frais
 *     tags: [Frais]
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
 *     responses:
 *       200:
 *         description: The list of the frais
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
 *                            taux:
 *                              type: number
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listFrais',verifytoken , async(req,res)=>{

    try{
    var societeRacine =  await getSocieteRacine(ObjectId(req.body.societe))
  
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
      result = await  Frais.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  Frais.paginate(listFilter[0], options)
    }else{
      result = await  Frais.paginate({}, options)
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
 * /frais/getById/{id}:
 *   get:
 *     summary: Remove the frais by id
 *     tags: [Frais]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The frais id
 *
 *     responses:
 *       200:
 *         description: The frais was deleted
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
 *                     taux:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The frais was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken , async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const frais = await Frais.findOne({_id:req.params.id})

    return res.send({status:true,resultat:frais})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /fraiss/getAllParametres:
 *   get:
 *     summary: Remove the OrdreEmission by id
 *     tags: [Frais]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The OrdreEmission id
 * 
 *     responses:
 *       200:
 *         description: The OrdreEmission was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  fraiss:
 *                    type: array         
 *       404:
 *         description: The OrdreEmission was not found
 *       500:
 *         description: Some error happened
 */
 router.post('/getAllParametres',verifytoken , async(req,res)=>{
   try{
    var societeRacine =  await getSocieteRacine(ObjectId(req.body.societe))
    
    const fraiss = await Frais.find({societeRacine:societeRacine})  
    const tauxTVAs = await TauxTVA.find({societeRacine:societeRacine}) 
    
    return res.send({status:true, fraiss:fraiss, tauxTVAs:tauxTVAs}) 
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

module.exports.routerFrais=router
