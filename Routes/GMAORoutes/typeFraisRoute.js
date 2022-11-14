const {TypeFrais, validateTypeFrais} =require('../../Models/GMAOModels/typeFraisModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');

const {Societe, getSocieteRacine, getSocietesBySocieteGParent } =require('../../Models/societeModel')
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
 *     TypeFrais:
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
 *   name: TypeFraiss
 *   description: The TypeFraiss managing API
 */


/**
 * @swagger
 * paths:
 *   /typeFraiss/upload:
 *     post:
 *       summary: upload image
 *       tags: [TypeFraiss]
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
router.post('/upload',upload.array('myFiles'),async(req,res)=>{
    try{
    const files = req.files
    let arr=[];
    files.forEach(element => {

        arr.push(element.path)

    })
    return res.send(arr)

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /typeFraiss/newTypeFrais:
 *   post:
 *     summary: Returns the list of all the TypeFraiss
 *     tags: [TypeFraiss]
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
 *         description: The list of the TypeFraiss
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

router.post('/newTypeFrais', async(req,res)=>{

    try{
    //const {error}=validateTypeFrais(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societeRacine))

    const typeFrais=new TypeFrais(body);

    const result=await typeFrais.save()

    return res.send({status:true,resultat:result})

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /typeFraiss/modifierTypeFrais/{id}:
 *   post:
 *     summary: Update the TypeFrais by id
 *     tags: [TypeFraiss]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeFrais id

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
 *         description: The list of the TypeFraiss
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

router.post('/modifierTypeFrais/:id', async(req,res)=>{

    try{
   // const {error}=validateTypeFrais(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    
    const typeFrais = await TypeFrais.findById(req.params.id)
    
    if(!typeFrais) return res.status(401).send({status:false})
    const result = await TypeFrais.findOneAndUpdate({_id:req.params.id}, req.body)

    const typeFrais2 = await TypeFrais.findById(req.params.id)

    return res.send({status:true,resultat:typeFrais2})

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /typeFraiss/deleteTypeFrais/{id}:
 *   post:
 *     summary: Remove the TypeFrais by id
 *     tags: [TypeFraiss]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeFrais id
 *
 *     responses:
 *       200:
 *         description: The TypeFrais was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The TypeFrais was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteTypeFrais/:id', async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    
    const typeFrais = await TypeFrais.findById(req.params.id)
    
    if(!typeFrais) return res.status(401).send({status:false})


    if(await TypeFrais.findOneAndDelete({_id:req.params.id})){
        return res.send({status:true})
    }else{
        return res.send({status:false})
    }

} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

/**
 * @swagger
 * /typeFraiss/getAllParametres:
 *   get:
 *     summary:
 *     tags: [TypeFraiss]
 * 
 *     responses:
 *       200:
 *         description: The TypeFraiss was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *                  TypeFraiss:
 *                    type: array          
 *       404:
 *         description: The TypeFraiss was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id', async(req,res)=>{

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))
  
    const typeFraiss = await TypeFrais.find({societeRacine:societeRacine})

    return res.send({status:true, typeFraiss:typeFraiss})     
} catch (e) {
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
 * /typeFraiss/listTypeFraiss:
 *   post:
 *     summary: Returns the list of all the TypeFraiss
 *     tags: [TypeFraiss]
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
 *         description: The list of the TypeFraiss
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

 router.post('/listTypeFraiss', async(req,res)=>{
  
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
      result = await  TypeFrais.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  TypeFrais.paginate(listFilter[0], options)
    }else{
      result = await  TypeFrais.paginate({}, options)
    }

    return res.send({status:true, resultat:result, request:req.body})
    
} catch (e) {
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})


/**
 * @swagger
 * /typeFraiss/getById/{id}:
 *   get:
 *     summary: Remove the TypeFrais by id
 *     tags: [TypeFraiss]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TypeFrais id
 *
 *     responses:
 *       200:
 *         description: The TypeFrais was deleted
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
 *         description: The TypeFrais was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const typeFrais = await TypeFrais.findOne({_id:req.params.id})

    return res.send({status:true,resultat:typeFrais})

} catch (e) {
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

module.exports.routerTypeFrais=router
