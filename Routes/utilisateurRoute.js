const {Utilisateur, validateUtilisateur, validateNewPassowrd, validateLogin, validateModifierMotPasse} =require('../Models/utilisateurModel')
const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const {User, validateDownloadData} =require('../Models/userModel')


const {Role} =require('../Models/roleModel')

var ObjectId = require('mongodb').ObjectID;

const {Societe, getSocieteRacine, getSocietesBySocieteParent } =require('../Models/societeModel');
const { getMaxListeners } = require('process');
const { consolelog, consolelog2 } = require('../Models/errorModel');


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
 *     Utilisateur:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - role
 *         - email
 *         - telephone
 *         - adresse
 *         - codeForgotPassword
 *         - societeRacine
 *       properties:
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         role:
 *           type: string
 *         email:
 *           type: string
 *         telephone:
 *           type: string
 *         adresse:
 *           type: string
 *         codeForgotPassword:
 *           type: string
 *         societeRacine:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: The Utilisateurs managing API
 */


/**
 * @swagger
 * paths:
 *   /utilisateurs/upload:
 *     post:
 *       summary: upload image
 *       tags: [Utilisateurs]
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
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


/**
 * @swagger
 * /utilisateurs/newUtilisateur:
 *   post:
 *     summary: Returns the list of all the Utilisateurs
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                prenom:
 *                  type: string
 *                role:
 *                  type: string
 *                email:
 *                  type: string
 *                telephone:
 *                  type: string
 *                adresse:
 *                  type: string
 *                codeForgotPassword:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Utilisateurs
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
 *                    prenom:
 *                      type: string
 *                    role:
 *                      type: string
 *                    email:
 *                      type: string
 *                    telephone:
 *                      type: string
 *                    adresse:
 *                      type: string
 *                    codeForgotPassword:
 *                      type: string
 *                    societeRacine:
 *                      type: string
 *
 */

router.post('/newUtilisateur', verifytoken, async(req,res)=>{

    try{
        consolelog2("dashboard : route 1 (start)") 
    //const {error}=validateUtilisateur(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    req.body.societeRacine = await getSocieteRacine(ObjectId(req.body.societe))

    const emailExist = await Utilisateur.findOne({ email: req.body.email});
    if(emailExist) return res.send({status:false,message:'Votre email est déjà existé'})

    const loginExist = await Utilisateur.findOne({ login: req.body.login});
    if(loginExist) return res.send({status:false,message:'Votre login est déjà existé'})

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const utilisateur = new Utilisateur({
        nom:req.body.nom,
        prenom:req.body.prenom,
        telephone:req.body.telephone,
        adresse:req.body.adresse,
        role:req.body.role,
        email:req.body.email,
        login:req.body.login,
        password: hashPassword,
        possedeCaisse: req.body.possedeCaisse,
        societeRacine:req.body.societeRacine,
    })

    var result=await utilisateur.save()

    result.password = undefined

    consolelog2("dashboard : route 1 (end)") 
    
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
 * /utilisateurs/modifierUtilisateur/{id}:
 *   post:
 *     summary: Update the Utilisateur by id
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Utilisateur id

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                nom:
 *                  type: string
 *                prenom:
 *                  type: string
 *                role:
 *                  type: string
 *                email:
 *                  type: string
 *                telephone:
 *                  type: string
 *                adresse:
 *                  type: string
 *                codeForgotPassword:
 *                  type: string
 *                societeRacine:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the Utilisateurs
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
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     adresse:
 *                       type: string
 *                     codeForgotPassword:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *
 *
 */

router.post('/modifierUtilisateur/:id', verifytoken, async(req,res)=>{

    try{
        
    //const {error}=validateUtilisateur(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const users = await Utilisateur.find({_id:req.params.id})
    const user = users[0]


    if(users.length == 0) return res.send({status:false,message:"Votre utilisateur n'existe pas"});
    
    if(req.body.email != null && req.body.email != ""){
        const users2 = await Utilisateur.find({email:req.body.email})
        if(users2.length > 0 && user.email != req.body.email) return res.send({status:false,message:'Votre email est déjà existé'});
    }

    if(req.body.login != null && req.body.login != ""){
        const users2 = await Utilisateur.find({login:req.body.login})
        if(users2.length > 0 && user.login != req.body.login) return res.send({status:false,message:'Votre login est déjà existé'});
    }

    var result = await Utilisateur.findByIdAndUpdate(user.id, {
        nom:req.body.nom,
        prenom:req.body.prenom,
        telephone:req.body.telephone,
        adresse:req.body.adresse,
        role:req.body.role,
        email:req.body.email,
        login:req.body.login,
        possedeCaisse: req.body.possedeCaisse,
    })
        
    return res.send({status:true,resultat:result})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.post('/modifierMotDePasseUtilisateur/:id', verifytoken, async(req,res)=>{

    try{
    //const {error}=validateUtilisateur(req.body)
    //if(error) return res.status(400).send({status:false,message:error.details[0].message})

    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const users = await Utilisateur.find({_id:req.params.id})
    const user = users[0]

    if(users.length == 0) return res.send({status:false,message:'errorUpdateUtilisateur1'});
    
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    var result = await Utilisateur.findByIdAndUpdate(user.id, {
        password:hashPassword,
    })
        
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
 * /utilisateurs/deleteUtilisateur/{id}:
 *   post:
 *     summary: Remove the Utilisateur by id
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Utilisateur id
 *
 *     responses:
 *       200:
 *         description: The Utilisateur was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The Utilisateur was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteUtilisateur/:id', verifytoken, async(req,res)=>{

    try{
    //if(req.user.user.role != "admin") return res.status(401).send({status:false})

    const utilisateur = await Utilisateur.findById(req.params.id)

    if(!utilisateur) return res.status(401).send({status:false})

    if(await Utilisateur.findOneAndDelete({_id:req.params.id})){
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
 * /utilisateurs/listUtilisateurs:
 *   post:
 *     summary: Returns the list of all the Utilisateurs
 *     tags: [Utilisateurs]
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
 *         description: The list of the Utilisateurs
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
 *                            prenom:
 *                              type: string
 *                            role:
 *                              type: string
 *                            email:
 *                              type: string
 *                            telephone:
 *                              type: string
 *                            adresse:
 *                              type: string
 *                            codeForgotPassword:
 *                              type: string
 *                            societeRacine:
 *                              type: string
 *                            createdAt:
 *                              type: string
 *                            updatedAt:
 *                              type: string
 *
 *
 *
 */

 router.post('/listUtilisateurs', verifytoken, async(req,res)=>{
  
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
        sort = { _id: -1 }
    }

    var pipeline = []
   

    pipeline.push({ $match : {societeRacine : societeRacine} } )

    
    pipeline.push({
      $lookup: {
        from: 'roles',
        let: { "role": "$role"},
        pipeline: [{$match: 
          {$expr: {
              "$and": [
                { "$eq": [ "$_id", "$$role" ] },
              ]
            }
          }
        }],
        as:"roles"
      }
    })

    pipeline.push({
      $set: {
        role: { $arrayElemAt: ["$roles.libelle", 0] },
        id:"$_id",
       }
    })

    pipeline.push({
       $project: { id:1, role:1, prenom:1, nom:1, email:1, adresse:1, telephone:1}
    })

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

            let objectMatch = {$or:[objet1, objet2, objet3]}
            
            let objectParent = {$match : objectMatch}
            pipeline.push(objectParent)
        }  
    }

    
    var sommePipeline = []
    for(let key in pipeline){
      sommePipeline.push(pipeline[key])
    }

    pipeline.push({
      $sort:sort
    })

    var skip = Number(req.body.page - 1) * Number(req.body.limit)

    pipeline.push({$limit: skip + Number(req.body.limit)})

    pipeline.push({$skip: skip})

    const articles = await Utilisateur.aggregate(pipeline)

    sommePipeline.push({
      $count: "total"
    })

   
    var nbrTotal = await Utilisateur.aggregate(sommePipeline)

    if(nbrTotal.length == 0){
      nbrTotal = [{total:0}]
    }

    const nbrTotalTrunc = Math.trunc(nbrTotal[0].total / req.body.limit)
    var pages = nbrTotal[0].total / req.body.limit

    if(pages > nbrTotalTrunc){
      pages = nbrTotalTrunc + 1
    }

    const result = {docs:articles, pages:pages}
   
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
 * /utilisateurs/getById/{id}:
 *   get:
 *     summary: Remove the Utilisateur by id
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Utilisateur id
 *
 *     responses:
 *       200:
 *         description: The Utilisateur was deleted
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
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     adresse:
 *                       type: string
 *                     codeForgotPassword:
 *                       type: string
 *                     societeRacine:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The Utilisateur was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getById/:id', verifytoken, async(req,res)=>{

    try{

    if(req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({status:false})

    const utilisateur = await Utilisateur.findOne({_id:req.params.id})

    return res.send({status:true,resultat:utilisateur})

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }


})


router.post('/login', async(req,res)=>{
    
    try{
    /*const {error}=validateLogin(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
    */
  
    //await Utilisateur.collection.drop()


    var user = await Utilisateur.findOne({$or: [{ email: req.body.email}, {login: req.body.email}]});
   
    var user2 = await Utilisateur.findOne({$or: [{ email: req.body.email}, {login: req.body.email}]}).populate('role');
    
    if(!user) return res.send({status:false, message:'errorLogin'});

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.send({status:false, message:'errorLogin'})    

    if(user.codeForgotPassword.length > 1){
        const result = await User.findByIdAndUpdate(user.id,{
            codeForgotPassword: ""
        })
    }

    user.password = undefined

    jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({status:true, token:token, user: user2});
    });

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }


})

router.post('/loginAdmin', async(req,res)=>{
    
    try{
    const users = await User.find({});
    
    if(users.length == 0){
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
    
        var user = new User({email: req.body.email, password: hashPassword, codeForgotPassword: ""})
        var user = await user.save()
        user.password = undefined

        jwt.sign({user}, 'secretkey', (err, token) => {
            res.json({status:true, token:token, user: user});
        });
    }

    var user = await User.findOne({ email: req.body.email});
    
    if(!user) return res.send({status:false, message:'errorLogin'});

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.send({status:false, message:'errorLogin'})    

    if(user.codeForgotPassword.length > 1){
        const result = await User.findByIdAndUpdate(user.id,{
            codeForgotPassword: ""
        })
    }

    user.password = undefined

    jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({status:true, token:token, user: user});
    });

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.post('/newPassword', async(req,res)=>{
   
    try{
    const {error}=validateNewPassowrd(req.body)
    if(error) return res.status(400).send({status:false,message:error.details[0].message})
    
    if(req.body.code.length < 10){
        return res.send({status:false});
    }

    const user = await Utilisateur.findOne({codeForgotPassword: req.body.code});
    if(user == null) return res.send({status:false});

    var hashPassword = ""
    const salt = await bcrypt.genSalt(10);
    hashPassword = await bcrypt.hash(req.body.newPassword, salt);
     
    const result = await Utilisateur.findByIdAndUpdate(user.id,{
        password: hashPassword,
        codeForgotPassword: ""
    })
         
    return res.send({status:true})
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }

})

router.post('/getAllParametres', verifytoken, async(req,res)=>{

    try{
    var societeRacine = await getSocieteRacine(ObjectId(req.body.societe))
    
    const roles = await Role.find({societeRacine:societeRacine})
    const utilisateurs = await Utilisateur.find({societeRacine:societeRacine})  
    return res.send({status:true, roles:roles, utilisateurs:utilisateurs}) 
} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
  
})

function verifytoken(req, res, next){
    const bearerHeader = req.headers['authorization'];
    
    console.log("bearerHeader",bearerHeader)
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

module.exports.routerUtilisateur=router
