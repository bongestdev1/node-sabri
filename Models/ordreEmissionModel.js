const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const { Mission } = require('../Models/GMAOModels/missionModel');

const schemaOrdreEmission=mongoose.Schema({
        numero:{type:String,default: ""},
        exercice:{type:String,default: ""},
        num:{type:Number,default: 1},

        client:{type: Schema.Types.ObjectId, ref: 'Client'},
        transporteur:{type: Schema.Types.ObjectId, ref: 'Transporteur'},
        destination:{type:String,default: ""},
        adresse:{type:String,default: ""},
        montant:{type:Number,default: 0}, 
        numBL:{type:String,default: ""}, 
        date:{type:Date,default: ""},
        statu:{type: Schema.Types.ObjectId, ref: 'EtatGlobal'},
        notes:{type:String,default: ""}, 
        typeMission:{type: Schema.Types.ObjectId, ref: 'Mission'},
        listBA : [],
        societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }

)

schemaOrdreEmission.plugin(mongoosePaginate);

schemaOrdreEmission.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const OrdreEmission = mongoose.model('OrdreEmission',schemaOrdreEmission)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await OrdreEmission.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"OrM"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"OrM"+exerciceString+"-00000001", num:1}
    }
}

module.exports.getNumeroAutomatique=getNumeroAutomatique


module.exports.OrdreEmission=OrdreEmission
