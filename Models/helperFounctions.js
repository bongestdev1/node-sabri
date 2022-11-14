const mongoose=require('mongoose')
const Joi=require('joi')
var ObjectId = require('mongodb').ObjectID;


function checkForeignKey(req){

    var foreignKeys = [
        "fournisseur", 
        "categorie", 
        "famille", 
        "sousFamille", 
        "modele",
        "marque", 
        "unite1", 
        "unite2"
    ]

    for (let key in foreignKeys) {
        if (!ObjectId.isValid(req[key])) {
          req[key] = null
        }
    }

    return req

}

module.exports.checkForeignKey=checkForeignKey
