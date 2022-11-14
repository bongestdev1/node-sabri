const {TypeTier, validateTypeTier, getNumeroAutomatiqueTypeTier} =require('../Models/typeTierModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { consolelog, consolelog2 } = require('../Models/errorModel');
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
 *     TypeTier:
 *       type: object
 *       required:
 *         - libelle
 *         - societeRacine
 *       properties:
 *         libelle:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: TypeTiers
 *   description: The TypeTiers managing API
 */


/**
 * @swagger
 * paths:
 *   /typeTiers/upload:
 *     post:
 *       summary: upload image
 *       tags: [TypeTiers]
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
 * /typeTiers/newTypeTier:
 *   post:
 *     summary: Returns the list of all the TypeTiers
 *     tags: [TypeTiers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the TypeTiers
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
 *                    libelle:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newTypeTier',verifytoken, async(req,res)=>{

    try{
    //const {error}=validateTypeTier(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 
    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    var numero = await getNumeroAutomatiqueTypeTier(body.societeRacine)
    body.num = numero.num

    const typeTier=new TypeTier(body);

    const result=await typeTier.save()

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
 * /typeTiers/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [TypeTiers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The projet id
 * 
 *     responses:
 *       200:
 *         description: The projet was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  typeTiers:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id',verifytoken, async(req,res)=>{
    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
    const typeTiers = await TypeTier.find({societeRacine:societeRacine})
    
    return res.send({status:true, typeTiers:typeTiers }) 

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
    
  })

/**
 * @swagger
 * /typeTiers/modifierTypeTier/{id}:
 *   post:
 *     summary: Update the TypeTier by id
 *     tags: [TypeTiers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeTier id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the TypeTiers
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
 *                     libelle:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierTypeTier/:id',verifytoken, async(req,res)=>{

    try{
   // const {error}=validateTypeTier(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const typeTier = await TypeTier.findById(req.params.id)

    if(!typeTier) return res.status(401).send({status:false})

    const result = await TypeTier.findOneAndUpdate({_id:req.params.id}, req.body)

    const typeTier2 = await TypeTier.findById(req.params.id)

    return res.send({status:true,resultat:typeTier2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /typeTiers/deleteTypeTier/{id}:
 *   post:
 *     summary: Remove the TypeTier by id
 *     tags: [TypeTiers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeTier id
 *
 *     responses:
 *       200:
 *         description: The TypeTier was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The TypeTier was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteTypeTier/:id',verifytoken, async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const typeTier = await TypeTier.findById(req.params.id)

    if(!typeTier) return res.status(401).send({status:false})


    if(await TypeTier.findOneAndDelete({_id:req.params.id})){
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
 * /typeTiers/listTypeTiers:
 *   post:
 *     summary: Returns the list of all the TypeTiers
 *     tags: [TypeTiers]
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
 *         description: The list of the TypeTiers
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
 *                            libelle:
 *                              type: string
 *                            societeRacine:
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

 router.post('/listTypeTiers',verifytoken, async(req,res)=>{
  
    try{

      consolelog2("listTypeTiers : route 1 (start)") 

    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));

    var sort = {};
    for (let key in req.body.orderBy) {
      if (Number(req.body.orderBy[key]) != 0) {
        sort[key] = req.body.orderBy[key];
      }
    }

    if (Object.keys(sort).length == 0) {
      sort = { _id: -1 };
    }

    var pipeline = [];

    pipeline.push({
      $match: {
        societeRacine: societeRacine, 
        type:req.body.type,
      },
    });
    pipeline.push({
        $set:{
            id:"$_id",
          num: "$num",
          libelle:"$libelle",
          societeRacine:"$societeRacine",
          type:"$type",
        }
      })
      pipeline.push({
        $project:{
          id:"$id",
          num: "$num",
          libelle:"$libelle",
          type:"$type",
          societeRacine:"$societeRacine"
        }
      })

      var search = req.body.search;

      for (let key in search) {
        console.log(key);
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
  
      const articles = await TypeTier.aggregate(pipeline);
  
      sommePipeline.push({
        $count: "total",
      });
  
      var nbrTotal = await TypeTier.aggregate(sommePipeline);
  
      if (nbrTotal.length == 0) {
        nbrTotal = [{ total: 0 }];
      }
  
      const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit);
      var pages = nbrTotal[0].total / req.body.limit;
  
      if (pages > nbrTotalTrunc) {
        pages = nbrTotalTrunc + 1;
      }
  
      const result = { docs: articles, pages: pages };

      consolelog2("listTypeTiers : route 1 (end)") 

      return res.send({ status: true, resultat: result, request: req.body });
  
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

    
})


/**
 * @swagger
 * /typeTiers/getById/{id}:
 *   get:
 *     summary: Remove the TypeTier by id
 *     tags: [TypeTiers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeTier id
 *
 *     responses:
 *       200:
 *         description: The TypeTier was deleted
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
 *                     libelle:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The TypeTier was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const typeTier = await TypeTier.findOne({_id:req.params.id})

    return res.send({status:true,resultat:typeTier})

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

module.exports.routerTypeTier=router
