const {Famille, validateFamille, getNumeroAutomatiqueFamille} =require('../Models/familleModel')
const {FamilleSousFamille} =require('../Models/familleSousFamilleModel')
const {SousFamille} =require('../Models/sousFamilleModel')
const {CategorieFamille, validateCategorieFamille} =require('../Models/categorieFamilleModel')

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
 *     Famille:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *         order:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Familles
 *   description: The Familles managing API
 */


/**
 * @swagger
 * paths:
 *   /familles/upload:
 *     post:
 *       summary: upload image
 *       tags: [Familles]
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
 * /familles/newFamille:
 *   post:
 *     summary: Returns the list of all the familles
 *     tags: [Familles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                order:
 *                  type: number
 *                familles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the Familles
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
 *                    order:
 *                      type: number
 *
 */

router.post('/newFamille',verifytoken , async(req,res)=>{

    try{
    //const {error}=validateFamille(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})
    var body = req.body 

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))
    var numero = await getNumeroAutomatiqueFamille(body.societeRacine)
    body.num = numero.num

    const famille=new Famille(body);

    const resultFamille=await famille.save()

    const sousFamilles = req.body.sousFamilles

    if(sousFamilles == null && sousFamilles == undefined){
        return res.send({status:true,resultat:resultFamille})     
    }

    var newFamilles = []

    for(let i = 0; i < sousFamilles.length; i++){
        const nbrFamilles = await SousFamille.count({_id:sousFamilles[i].id})
        const nbrExistesDeja = await FamilleSousFamille.count({famille:resultFamille.id, sousFamille:sousFamilles[i].id})
        
        if(nbrExistesDeja == 0 && nbrFamilles == 1){
            const familleSousFamille=new FamilleSousFamille({famille:resultFamille.id, sousFamille:sousFamilles[i].id, societeRacine:body.societeRacine});
            const resultFamilleSousFamille = await familleSousFamille.save()
            newFamilles.push(resultFamilleSousFamille)
        }
    }

    if(req.body.categorie != null && req.body.categorie != undefined && req.body.categorie != ""){
        const categorieFamille=new CategorieFamille({categorie:req.body.categorie, famille:resultFamille.id, societeRacine:body.societeRacine});
        const resultCategorieFamille=await categorieFamille.save()
    }

    return res.send({status:true,resultat:resultFamille})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /familles/getAllParametres:
 *   get:
 *     summary: Remove the projet by id
 *     tags: [Familles]
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
 *                  familles:
 *                    type: array         
 *       404:
 *         description: The projet was not found
 *       500:
 *         description: Some error happened
 */
 router.get('/getAllParametres/:id',verifytoken , async (req, res) => {
   
    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.params.id))

    const familles = await Famille.find({ societeRacine: societeRacine })

    return res.send({ status: true, familles: familles })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /familles/modifierFamille/{id}:
 *   post:
 *     summary: Update the famille by id
 *     tags: [Familles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Famille id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                libelle:
 *                  type: string
 *                order:
 *                  type: number
 *                familles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *     responses:
 *       200:
 *         description: The list of the Familles
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
 *                     order:
 *                       type: number
 *                     
 *
 *
 */

router.post('/modifierFamille/:id',verifytoken , async(req,res)=>{

    try{
   /* const {error}=validateFamille(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
*/
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const famille = await Famille.findById(req.params.id)

    if(!famille) return res.status(401).send({status:false})

    const result = await Famille.findOneAndUpdate({_id:req.params.id},{ 
        libelle: req.body.libelle,
        order: req.body.order
    })

    const sousFamilles = req.body.sousFamilles

    for(let i = 0; i < sousFamilles.length; i++){
        const nbrSousFamilles = await SousFamille.count({_id:sousFamilles[i].id})
        const nbrExistesDeja = await FamilleSousFamille.count({famille:req.params.id, sousFamille:sousFamilles[i].id})
        
        if(nbrExistesDeja == 0 && nbrSousFamilles == 1){
            const familleSousFamille=new FamilleSousFamille({famille:req.params.id, sousFamille:sousFamilles[i].id, societeRacine:famille.societeRacine});
            const resultFamilleSousFamille=await familleSousFamille.save()
        }
    }

    const familleSousFamilles = await FamilleSousFamille.find({famille:req.params.id})

    for(let i = 0; i < familleSousFamilles.length; i++){
        var isExist = false
        for(let j = 0; j < sousFamilles.length; j++){
            if(familleSousFamilles[i].sousFamille == sousFamilles[j].id){
                isExist = true
            }
        }
        if(!isExist){
            const deleteFamilleSousFamille = await FamilleSousFamille.findOneAndDelete({_id:familleSousFamilles[i].id})
        }
    }

    const famille2 = await Famille.findById(req.params.id)

    return res.send({status:true,resultat:famille2})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

/**
 * @swagger
 * /familles/deleteFamille/{id}:
 *   post:
 *     summary: Remove the Famille by id
 *     tags: [Familles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Famille id
 *
 *     responses:
 *       200:
 *         description: The Famille was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Famille was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteFamille/:id',verifytoken , async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const familleSousFamilles = await FamilleSousFamille.find({famille:req.params.id})

    for(let i = 0; i < familleSousFamilles.length; i++){
        const deleteFamilleSousFamille = await FamilleSousFamille.findOneAndDelete({_id:familleSousFamilles[i].id})
    }

    const categorieFamilles = await CategorieFamille.find({famille:req.params.id})

    for(let i = 0; i < categorieFamilles.length; i++){
        const deleteCategorieFamilles = await CategorieFamille.findOneAndDelete({_id:categorieFamilles[i].id})
    }

    const famille = await Famille.findById(req.params.id)

    if(!famille) return res.status(401).send({status:false})


    if(await Famille.findOneAndDelete({_id:req.params.id})){
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
 * /familles/listFamilles:
 *   post:
 *     summary: Returns the list of all the familles
 *     tags: [Familles]
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
 *         description: The list of the Familles
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

 router.post('/listFamilles',verifytoken , async(req,res)=>{
  
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

    listFilter.push({ societeRacine:societeRacine } )
    
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
      result = await  Famille.paginate({$and:listFilter}, options) 
    }else if(listFilter.length == 1){
      result = await  Famille.paginate(listFilter[0], options)
    }else{
      result = await  Famille.paginate({}, options)
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
 * /familles/getById/{id}:
 *   get:
 *     summary: Remove the famille by id
 *     tags: [Familles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Famille id
 *
 *     responses:
 *       200:
 *         description: The Famille was deleted
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
 *                     order:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Famille was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id',verifytoken , async(req,res)=>{

    try{
    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const famille = await Famille.findOne({_id:req.params.id})

    const familleSousFamilles = await FamilleSousFamille.find({famille:req.params.id}).populate({path:"sousFamille",select:"_id, libelle"})

    return res.send({status:true,resultat:famille, sousFamilles:familleSousFamilles })

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

module.exports.routerFamille=router
