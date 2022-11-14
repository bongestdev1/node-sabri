const { CategorieFamille, validateCategorieFamille } = require('../Models/categorieFamilleModel')
const { Categorie } = require('../Models/categorieModel')
const { Famille } = require('../Models/familleModel')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')
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

/**
 * @swagger
 * components:
 *   schemas:
 *     CategorieFamille:
 *       type: object
 *       required:
 *         - categorie
 *         - famille
 *       properties:
 *         categorie:
 *           type: string
 *         famille:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: CategorieFamilles
 *   description: The CategorieFamilles managing API
 */



/**
 * @swagger
 * /categorieFamilles/newCategorieFamille:
 *   post:
 *     summary: Returns the list of all the CategorieFamilles
 *     tags: [CategorieFamilles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                categorie:
 *                  type: string
 *                famille:
 *                  type: string
 *     responses:
 *       200:
 *         description: The list of the CategorieFamilles
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
 *                    categorie:
 *                      type: string
 *                    famille:
 *                      type: string
 *
 */

router.post('/newCategorieFamille', verifytoken, async (req, res) => {

    try {
        //const {error}=validateCategorieFamille(req.body)
        //if(error) return res.status(400).send({status:false,message:error.details[0].message})

        //if(req.user.user.role != "admin") return res.status(401).send({status:false})

        const nbrCategories = await Categorie.count({ _id: req.body.categorie })
        const nbrFamilles = await Famille.count({ _id: req.body.famille })
        const nbrExistesDeja = await CategorieFamille.count({ categorie: req.body.categorie, famille: req.body.famille })

        if (nbrExistesDeja > 0 || nbrCategories == 0 || nbrFamilles == 0) {
            return res.send({ status: true })
        }

        const categorieFamille = new CategorieFamille(req.body);

        const result = await categorieFamille.save()

        return res.send({ status: true, resultat: result })

    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})


/**
 * @swagger
 * /categorieFamilles/deleteCategorieFamille/{id}:
 *   post:
 *     summary: Remove the categorieFamille by id
 *     tags: [CategorieFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The categorieFamille id
 *
 *     responses:
 *       200:
 *         description: The categorieFamille was deleted
 *         content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: boolean
 *       404:
 *         description: The CategorieFamille was not found
 *       500:
 *         description: Some error happened
 */

router.post('/deleteCategorieFamille/:id', verifytoken, async (req, res) => {

    try {
        //if(req.user.user.role != "admin") return res.status(401).send({status:false})

        const categorieFamille = await CategorieFamille.findById(req.params.id)

        if (!categorieFamille) return res.status(401).send({ status: false })


        if (await CategorieFamille.findOneAndDelete({ _id: req.params.id })) {
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




/**
 * @swagger
 * /categorieFamilles/getByCategorie/{id}:
 *   get:
 *     summary: Remove the categorieFamille by id
 *     tags: [CategorieFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The CategorieFamille id
 *
 *     responses:
 *       200:
 *         description: The CategorieFamille was deleted
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
 *                     categorie:
 *                       type: string
 *                     famille:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The CategorieFamille was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getByCategorie/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const categorieFamilles = await CategorieFamille.find({ categorie: req.params.id }).populate({ path: "categorie", select: "_id, libelle" }).populate({ path: "famille", select: "_id, libelle" })

        return res.send({ status: true, resultat: categorieFamilles })
    } catch (e) {
    consolelog(e) 
    
        // statements to handle any exceptions
        console.log(e)
        return res.send({ status: false }) // pass exception object to error handler
    }
})

/**
 * @swagger
 * /categorieFamilles/getByFamille/{id}:
 *   get:
 *     summary: Remove the categorieFamille by id
 *     tags: [CategorieFamilles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The CategorieFamille id
 *
 *     responses:
 *       200:
 *         description: The CategorieFamille was deleted
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
 *                     categorie:
 *                       type: string
 *                     famille:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: The CategorieFamille was not found
 *       500:
 *         description: Some error happened
 */
router.get('/getByFamille/:id', verifytoken, async (req, res) => {

    try {
        if (req.params.id == undefined || req.params.id == null || req.params.id == "") return res.status(400).send({ status: false })

        const categorieFamilles = await CategorieFamille.find({ famille: req.params.id }).populate({ path: "categorie", select: "_id, libelle" }).populate({ path: "famille", select: "_id, libelle" })

        return res.send({ status: true, resultat: categorieFamilles })
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

module.exports.routerCategorieFamille = router
