
const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTacheProjetInterne=mongoose.Schema({ 
    reference:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    libelle:{type:String,default: ""},
    projetInterne:{type: Schema.Types.ObjectId, ref: 'ProjetInterne'},
    affecteA:{type: Schema.Types.ObjectId, ref: 'Personnel'},
    dateDebut:{type:Date,default: ""},
    dateFin:{type:Date,default: ""},
    chargeTravail:{type:String,default: ""},
    avancement:{type:Number,default: ""},
    description:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaTacheProjetInterne.plugin(mongoosePaginate);

schemaTacheProjetInterne.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TacheProjetInterne = mongoose.model('TacheProjetInterne',schemaTacheProjetInterne)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await TacheProjetInterne.find({societeRacine:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"TaPI"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"TaPI"+exerciceString+"-00000001", num:1}
    }
}

module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.TacheProjetInterne=TacheProjetInterne
