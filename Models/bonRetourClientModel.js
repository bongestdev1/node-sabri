const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonRetourClient=mongoose.Schema({ 
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

    transfertBonLivraison:{type:String,default: ""},
  
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    factureAvoir:{type:Schema.Types.ObjectId, ref: 'FactureAvoir',default: 'null'},

    isRetourVenteContoire:{type: Boolean, default: false},

    transporteur:{type:Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
   
    coutTransport:{type:Number,default: 0},

    /*articles:[{
        numero:{type:Number,default: 0},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        prixAchat:{type:Number,default: 0},
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
    expeditions:[{
        transporteur:{type:String,default: ""},
        date:{type:String,default: ""},
        articles:[{
           numero:{type:Number,default: 0},
           article:{type: Schema.Types.ObjectId, ref: 'Article'},
           reference:{type:String,default: ""},
           designation:{type:String,default: ""},
           quantiteVente:{type:Number,default: 0},
           quantiteLivree:{type:Number,default: 0},
           quantiteALivree:{type:Number,default: 0},
           quantiteRestant:{type:Number,default: 0},
           unite:{type:String,default: ""},
        }]
    }]
},
{ timestamps: true }
)

schemaBonRetourClient.plugin(mongoosePaginate);

schemaBonRetourClient.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonRetourClient = mongoose.model('BonRetourClient',schemaBonRetourClient)

async function getNumeroAutomatique(idSociete, exercice, isRetourVenteContoire){
    var exerciceString = exercice+""
    var prefix = "BRC"
  
    if(isRetourVenteContoire){
        prefix = "RVC"
    }

    var lastDoc = (await BonRetourClient.find({societe:idSociete, exercice:exerciceString, isRetourVenteContoire: isRetourVenteContoire}).sort({_id: -1}).limit(1))[0];
  
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

module.exports.BonRetourClient=BonRetourClient
