const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema


const schemaBonRetourFournisseur=mongoose.Schema({ 
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

    isRetourAchatContoire:{type:Boolean,default: false},

    transfertBonReception:{type:String,default: ""},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  

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
    }],

    transporteur:{type:Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
   
    coutTransport:{type:Number,default: 0},


},
{ timestamps: true }
)

schemaBonRetourFournisseur.plugin(mongoosePaginate);

schemaBonRetourFournisseur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonRetourFournisseur = mongoose.model('BonRetourFournisseur',schemaBonRetourFournisseur)

async function getNumeroAutomatique(idSociete, exercice, isRetourAchatContoire){
    var prefix = "BRF"
    if(isRetourAchatContoire){
        prefix = "RAC"
    }
    var exerciceString = exercice+""
    let lastDoc = (await BonRetourFournisseur.find({societe:idSociete, exercice:exerciceString, isRetourAchatContoire: isRetourAchatContoire}).sort({_id: -1}).limit(1))[0];
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

module.exports.BonRetourFournisseur=BonRetourFournisseur
