const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema



const schemaBonLivraison=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    client:{type: Schema.Types.ObjectId, ref: 'Client'},

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
    isTransfert:{type:String,default: "non"},

    isVenteContoire:{type: Boolean, default: false},

    ordreMission:{type:Schema.Types.ObjectId, ref: 'OrdreEmission',default: 'null'},
    
    factureVente:{type:Schema.Types.ObjectId, ref: 'FactureVente',default: 'null'},

    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    projet:{type:Schema.Types.ObjectId, ref: 'Projet',default: 'null'},
    
    transporteur:{type:Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
   
    coutTransport:{type:Number,default: 0},

},
{ timestamps: true }
)

schemaBonLivraison.plugin(mongoosePaginate);

schemaBonLivraison.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonLivraison = mongoose.model('BonLivraison',schemaBonLivraison)

async function getNumeroAutomatique(idSociete, exercice, isVenteContoire){
    var prefix = "BL"
    if(isVenteContoire){
        prefix = "VC"
    }
    
    var exerciceString = exercice+""
    let lastDoc = (await BonLivraison.find({societe:idSociete, exercice:exerciceString, isVenteContoire:isVenteContoire}).sort({_id: -1}).limit(1))[0];
    
    var exerciceString = exerciceString.substring(2,4)
    
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (6 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:prefix+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:prefix+exerciceString+"-000001", num:1}
    }

}

module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.BonLivraison=BonLivraison

