const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonCasse=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    observation:{type:String,default: ""},
    
    utilisateur:{type:Schema.Types.ObjectId, ref: 'Utilisateur',default: 'null'},
  
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaBonCasse.plugin(mongoosePaginate);

schemaBonCasse.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonCasse = mongoose.model('BonCasse',schemaBonCasse)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await BonCasse.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        return {numero:"BC"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"BC"+exerciceString+"-00000001", num:1}
    }

}

module.exports.getNumeroAutomatique = getNumeroAutomatique

module.exports.BonCasse = BonCasse
