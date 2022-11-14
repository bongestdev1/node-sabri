const {SousFamille, validateSousFamille, getNumeroAutomatiqueSousFamille} =require('../Models/sousFamilleModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {FamilleSousFamille} =require('../Models/familleSousFamilleModel')
const {User, validateDownloadData} =require('../Models/userModel')

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  file.originalname + Date.now())
    }
})
const {Famille} =require('../Models/familleModel')
const {Categorie} =require('../Models/categorieModel');
const { consolelog } = require('../Models/errorModel');

var upload = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     SousFamille:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: SousFamilles
 *   description: The SousFamilles managing API
 */


/**
 * @swagger
 * paths:
 *   /sousFamilles/upload:
 *     post:
 *       summary: upload image
 *       tags: [SousFamilles]
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
 * /sousFamilles/newSousFamille:
 *   post:
 *     summary: Returns the list of all the SousFamilles
 *     tags: [SousFamilles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the SousFamilles
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
 *
 */

router.post('/newSousFamille',verifytoken , async(req,res)=>{

    try{
    //const {error}=validateSousFamille(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
    
    var numero = await getNumeroAutomatiqueSousFamille(body.societeRacine)
    body.num = numero.num
    const sousFamille=new SousFamille(body);

    const result=await sousFamille.save()

    if(body.famille != undefined && body.famille != null && body.famille.length > 5){
        
        const familleSousFamille = new FamilleSousFamille({sousFamille: result.id, famille: body.famille, societeRacine: body.societeRacine})   
        await familleSousFamille.save() 
    }

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
 * /sousFamilles/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [SousFamilles]
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
 *                  sousFamilles:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id',verifytoken , async (req, res) => {

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

    const sousFamilles = await SousFamille.find({ societeRacine: societeRacine })
    const categories = await Categorie.find({ societeRacine: societeRacine })
    const familles = await Famille.find({ societeRacine: societeRacine })

    return res.send({ status: true, sousFamilles: sousFamilles, categories:categories, familles:familles })


} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})
/**
 * @swagger
 * /sousFamilles/modifierSousFamille/{id}:
 *   post:
 *     summary: Update the SousFamille by id
 *     tags: [SousFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The SousFamille id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the SousFamilles
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
 *
 *
 */

router.post('/modifierSousFamille/:id',verifytoken ,async(req,res)=>{

    try{
   // const {error}=validateSousFamille(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const sousFamille = await SousFamille.findById(req.params.id)

    if(!sousFamille) return res.status(401).send({status:false})


    const result = await SousFamille.findOneAndUpdate({_id:req.params.id}, req.body)

    const sousFamille2 = await SousFamille.findById(req.params.id)

    return res.send({status:true,resultat:sousFamille2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /sousFamilles/deleteSousFamille/{id}:
 *   post:
 *     summary: Remove the sousFamille by id
 *     tags: [SousFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The SousFamille id
 *
 *     responses:
 *       200:
 *         description: The SousFamille was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The SousFamille was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteSousFamille/:id',verifytoken , async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const sousFamille = await SousFamille.findById(req.params.id)

    if(!sousFamille) return res.status(401).send({status:false})


    if(await SousFamille.findOneAndDelete({_id:req.params.id})){
        await FamilleSousFamille.deleteMany({sousFamille:req.params.id})
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
 * /sousFamilles/listSousFamilles:
 *   post:
 *     summary: Returns the list of all the sousFamilles
 *     tags: [SousFamilles]
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
 *         description: The list of the SousFamilles
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

 router.post('/listSousFamilles',verifytoken ,async(req,res)=>{
  
    try{
    //if(req.user.user.role != "admin" ) return res.status(400).send({status:false})

    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
  
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
      result = await  SousFamille.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  SousFamille.paginate(listFilter[0], options)
    }else{
      result = await  SousFamille.paginate({}, options)
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
 * /sousFamilles/getById/{id}:
 *   get:
 *     summary: Remove the sousFamille by id
 *     tags: [SousFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The SousFamille id
 *
 *     responses:
 *       200:
 *         description: The SousFamille was deleted
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
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The SousFamille was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken , async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const sousFamille = await SousFamille.findOne({_id:req.params.id})

    return res.send({status:true,resultat:sousFamille})

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

module.exports.routerSousFamille=router
