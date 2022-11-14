const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaDemandeOffrePrix=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
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
    idBonCommandeTransfert:{type:String,default: ""},
    demandeAchatInterne:{type:String,default: ""},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    etat:{type: Schema.Types.ObjectId, ref: 'EtatGlobal'},
  
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
   
    fournisseurs:[{
        fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
        email:{type:String,default: ""},
        nbrEnvoyer:{type:Number,default: 0},
    }]
},
{ timestamps: true }
)

schemaDemandeOffrePrix.plugin(mongoosePaginate);

schemaDemandeOffrePrix.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const DemandeOffrePrix = mongoose.model('DemandeOffrePrix',schemaDemandeOffrePrix)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await DemandeOffrePrix.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
       
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"DOP"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"DOP"+exerciceString+"-00000001", num:1}
    }

}


module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.DemandeOffrePrix=DemandeOffrePrix
