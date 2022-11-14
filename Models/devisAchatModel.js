const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaDevisAchat=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
    
    totalRemise:{type:Number,default: 0},
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
    validationStockBonAchat:{type:String,default: "non"},
    
    isTransfert:{type:String,default: "non"},
    bonCommande:{type:Schema.Types.ObjectId, ref: 'BonCommande',default: 'null'},
    demandeOffrePrix:{type:Schema.Types.ObjectId, ref: 'DemandeOffrePrix',default: 'null'},
  
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaDevisAchat.plugin(mongoosePaginate);

schemaDevisAchat.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const DevisAchat = mongoose.model('DevisAchat',schemaDevisAchat)


async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await DevisAchat.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
       
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (6 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"DeA"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"DeA"+exerciceString+"-000001", num:1}
    }

}


module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.DevisAchat=DevisAchat
