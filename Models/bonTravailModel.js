const mongoose = require('mongoose')
const Joi = require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonTravail = mongoose.Schema({

    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},
    
    date: { type: Date, default: new Date() },
    personnel: {type:Schema.Types.ObjectId, ref: 'Personnel',default: 'null'},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    observation:{type:String,default: ""},

    totalRemise:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    timbreFiscale:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    totalGain:{type:Number,default: 0},

    montantEscompte:{type:Number,default: 0},
    totalDC:{type:Number,default: 0},

    totalRedevance:{type:Number,default: 0},
    totalFodec:{type:Number,default: 0},
    
    isPayee:{type:String,default: "non"},
    montantTotal:{type:Number,default: 0},
    montantPaye:{type:Number,default: 0},
    restPayer:{type:Number,default: 0},

},
    { timestamps: true }
)

schemaBonTravail.plugin(mongoosePaginate);

schemaBonTravail.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object; 
});

const BonTravail = mongoose.model('BonTravail', schemaBonTravail)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await BonTravail.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"BTl"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"BTl"+exerciceString+"-00000001", num:1}
    }

}

module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.BonTravail = BonTravail
