const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaExpedition=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    bonLivraison:{type: Schema.Types.ObjectId, ref: 'Fournisseur',default: 'null'},
    utilisateur:{type: Schema.Types.ObjectId, ref: 'Utilisateur',default: 'null'},
    responsable:{type: Schema.Types.ObjectId, ref: 'Personnel',default: 'null'},
    transporteur:{type: Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
    dateExpedition:{type:Date,default: ""},
    delaiExpedition:{type:Number,default: 0},
    datePrevuLivraison:{type:String,default: ""},
    etatExpedition:{type: Schema.Types.ObjectId, ref: 'EtatGlobal',default: 'null'},
    methodeReglement:{type: Schema.Types.ObjectId, ref: 'MethodeReglement',default: 'null'},
    numeroColis:{type:Number,default: 0},
    coli:{type:String,default: ""},
    notes:{type:String,default: ""},
     
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaExpedition.plugin(mongoosePaginate);

schemaExpedition.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Expedition = mongoose.model('Expedition',schemaExpedition)


async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await Expedition.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
       
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        return {numero:"EX"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"EX"+exerciceString+"-00000001", num:1}
    }

}


module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.Expedition=Expedition
