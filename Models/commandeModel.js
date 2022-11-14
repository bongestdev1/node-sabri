const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaCommande=mongoose.Schema({ 
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

    montantTotal:{type:Number,default: 0},
    montantPaye:{type:Number,default: 0},
    restPayer:{type:Number,default: 0},

    transfertBonLivraison:{type:String,default: ""},
    isTransfert:{type:String,default: "non"},
   
    isValid:{type:String,default: "non"},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
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

schemaCommande.plugin(mongoosePaginate);

schemaCommande.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Commande = mongoose.model('Commande',schemaCommande)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await Commande.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
       
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (6 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"C"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"C"+exerciceString+"-000001", num:1}
    }

}


module.exports.getNumeroAutomatique=getNumeroAutomatique


module.exports.Commande=Commande
