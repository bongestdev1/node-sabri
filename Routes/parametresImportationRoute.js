const { ParametresImportation } = require('../Models/parametresImportationModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const fs = require('fs');

var dateFormat = require('dateformat');
const { User, validateDownloadData } = require('../Models/userModel')

const { Societe, getSocieteRacine, getSocietesBySocieteParent } = require('../Models/societeModel')
var ObjectId = require('mongodb').ObjectID;
const { Exercice } = require('../Models/exerciceModel');
const { Utilisateur } = require('../Models/utilisateurModel');
const { UniteMesure } = require('../Models/uniteMesureModel');
const { ModeReglement } = require('../Models/modeReglementModel');
const { Client } = require('../Models/clientModel');
const { Frais } = require('../Models/fraisModel');
const { consolelog } = require('../Models/errorModel');



/**
 * @swagger
 * /parametres/newParametres:
 *   post:
 *     summary: Returns the list of all the parametres
 *     tags: [Parametres]
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
 *         description: The list of the parametres
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
router.post('/setConfiguration/:table', verifytoken, async (req, res) => {
try{
    var body = req.body
    body.table = req.params.table

    body.societeRacine = await getSocieteRacine(ObjectId(body.societe))

    var parametres = await ParametresImportation.find({ societeRacine: body.societeRacine, table:req.params.table })

    var result = null

    if (parametres.length > 0) {
        result = await ParametresImportation.findOneAndUpdate({ _id: parametres[0].id }, body)
        result = await ParametresImportation.findOne({ _id: parametres[0].id })
    }else{
        const parametres = new ParametresImportation(body)
        result = await parametres.save()
    }

    return res.send({ status: true, resultat: result })

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})


router.post('/getConfiguration/:table', verifytoken, async (req, res) => {

    try{
    var body = req.body
    var societeRacine = await getSocieteRacine(ObjectId(body.societe))

    const parametres = await ParametresImportation.find({ societeRacine: societeRacine, table:req.params.table })
   
    if (parametres.length > 0) {
        return res.send({ status: true, resultat: parametres[0]})
    } else {

        const parametres = new ParametresImportation({
            societeRacine : societeRacine,
            table:req.params.table,
            parametres:"{}"
        })

        var result = await parametres.save()
   
        return res.send({ status: true, resultat: result })
    }

} catch (e) {
    consolelog(e) 
    
    // statements to handle any exceptions
    console.log(e)
    return res.send({ status: false }) // pass exception object to error handler
  }
})

router.post("/getAllParametres", verifytoken, async (req, res) => {
    try {
      var societeRacine = await getSocieteRacine(ObjectId(req.body.societe));
      var societe = ObjectId(req.body.societe);
      var exercice = req.body.exercice;
  
      const frais = await Frais.find({
        societeRacine: societeRacine,
      });
  
      return res.send({
        status:true,
        allFrais: frais
      });
  
    } catch (e) {
    consolelog(e) 
    
      // statements to handle any exceptions
      console.log(e)
      return res.send({ status: false }) // pass exception object to error handler
    }
  
  });

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

module.exports.routerParametresImportation = router
