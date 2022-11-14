
const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaProjetInterne=mongoose.Schema({ 
    reference:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},
    
    libelle:{type:String,default: ""},
    dateDebut:{type:Date,default: ""},
    dateFin:{type:Date,default: ""},
    statutOpportunite:{type: Schema.Types.ObjectId, ref: 'StatuOpportunite'},
    probabiliteOpportunite:{type:Number,default: 0},
    mantantOpportunite:{type:Number,default: 0},
    budget:{type:Number,default: 0},
    tauxAvancement:{type:Number,default: 0},
    description:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe'},
  
},
{ timestamps: true }
)

schemaProjetInterne.plugin(mongoosePaginate);

schemaProjetInterne.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ProjetInterne = mongoose.model('ProjetInterne',schemaProjetInterne)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await ProjetInterne.find({societeRacine:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"PI"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"PI"+exerciceString+"-00000001", num:1}
    }
}

module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.ProjetInterne=ProjetInterne
