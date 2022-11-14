const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaFactureAchat=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},

    totalRemise:{type:Number,default: 0},
    totalRemiseFacture:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    timbreFiscale:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    
    totalGainCommerciale:{type:Number,default: 0},
    totalGainReel:{type:Number,default: 0},

    montantEscompte:{type:Number,default: 0},
    totalDC:{type:Number,default: 0},

    totalRedevance:{type:Number,default: 0},
    totalFodec:{type:Number,default: 0},
    
    isPayee:{type:String,default: "non"},
    montantTotal:{type:Number,default: 0},
    montantPaye:{type:Number,default: 0},
    restPayer:{type:Number,default: 0},
    
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    isChangeStock:{type:Boolean,default: false},
    
    numeroFactureVenteFournisseur:{type:String,default: ""},
    dateFactureVenteFournisseur:{type:Date,default: ""},
    captureFactureVenteFournisseur:{type:String,default: ""},
    
},
{ timestamps: true }
)

schemaFactureAchat.plugin(mongoosePaginate);

schemaFactureAchat.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const FactureAchat = mongoose.model('FactureAchat',schemaFactureAchat)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await FactureAchat.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (6 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"FA"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"FA"+exerciceString+"-000001", num:1}
    }

}

module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.FactureAchat=FactureAchat

