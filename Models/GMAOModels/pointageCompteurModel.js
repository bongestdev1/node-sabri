
const mongoose = require('mongoose')
const Joi = require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaPointageCompteur = mongoose.Schema({
    num:{type:Number,default: 0},
    numero: { type: String, default: "" },
    date: { type: Date, default: "" },
    vehicule: { type: Schema.Types.ObjectId, ref: 'Vehicule' },
    chauffeur: { type: Schema.Types.ObjectId, ref: 'Chauffeur' },
    valeurCompteur: { type: Number, default: "" },
    notes: { type: String, default: "" },
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
},
    { timestamps: true }
)

schemaPointageCompteur.plugin(mongoosePaginate);

schemaPointageCompteur.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

async function getNumeroAutomatique(idSocieteRacine){
    let lastDoc = (await PointageCompteur.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var isSearch = true
        while (isSearch){
            var numString = num + ""
            var somme = numString+""
            
            for(let i = 0 ; i < (8 - numString.length); i++){
                somme = "0" + somme
            }
    
            var numeroAutomatique = {numero:"PC"+"-"+somme, num:num}
            var items = await PointageCompteur.find({societeRacine:idSocieteRacine, code:numeroAutomatique.numero}) 
            
            if(items.length == 0){
               isSearch = false
               return numeroAutomatique 
            }
            num += 1
        }
    }else{
        return {numero:"PC"+"-00000001", num:1}
    }

}

const PointageCompteur = mongoose.model('PointageCompteur', schemaPointageCompteur)
module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.PointageCompteur = PointageCompteur
