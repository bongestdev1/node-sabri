const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonReception=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
    
    totalRemise:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    timbreFiscale:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
   
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
    validationStockBonReception:{type:String,default: "non"},
    
    idBonCommandeTransfert:{type:String,default: ""},

    isAchatContoire:{type:Boolean,default: false},
    
    isTransfert:{type:String,default: "non"},
    factureAchat:{type:Schema.Types.ObjectId, ref: 'FactureAchat',default: 'null'},

    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
    //isTransfert:{type:String,default: "non"},
    
    isChangeStock:{type:Boolean,default: false},
    
    /*articles:[{
        numero:{type:Number,default: 0},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        prixReception:{type:Number,default: 0},
        tauxRemise:{type:Number,default: 0},
        montantRemise:{type:Number,default: 0},
        prixSpecifique:{type:Number,default: 0},
        prixVenteHT:{type:Number,default: 0},
        quantiteVente:{type:Number,default: 0},
        unite:{type:String,default: ""},
        totalRemise:{type:Number,default: 0},
        totalHT:{type:Number,default: 0},
        tauxTVA:{type:Number,default: 0},
        totalTVA:{type:Number,default: 0},
        redevance:{type:String,default: 0},
        totalTTC:{type:Number,default: 0},
        pVenteConseille:{type:Number,default: 0},
        article:{type: Schema.Types.ObjectId, ref: 'Article'},
        quantiteLivree:{type:Number,default: 0},
    }],*/
   
    charges:[{
        idCharge:{type: Schema.Types.ObjectId, ref: 'ChargeDireste'},
        libelle:{type:String,default: ""},
        montant:{type:Number,default: ""},  
    }],

    totalTTCFacture:{type:Number,default: 0},
    totalHTFacture:{type:Number,default: 0},
    totalRemiseFacture:{type:Number,default: 0},
   
    numeroBonLivraisonFournisseur:{type:String,default: ""},
    dateBonLivraisonFournisseur:{type:Date,default: ""},
    captureBonLivraisonFournisseur:{type:String,default: ""},

    transporteur:{type:Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
    coutTransport:{type:Number,default: 0},

},
{ timestamps: true }
)

schemaBonReception.plugin(mongoosePaginate);

schemaBonReception.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonReception = mongoose.model('BonReception',schemaBonReception)

async function getNumeroAutomatique(idSociete, exercice, isAchatContoire){
    var exerciceString = exercice+""
    var prefix= "BRP"
    if(isAchatContoire){
        prefix= "AC"
    }
    let lastDoc = (await BonReception.find({societe:idSociete, exercice:exerciceString, isAchatContoire: isAchatContoire}).sort({_id: -1}).limit(1))[0];
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
module.exports.BonReception=BonReception
