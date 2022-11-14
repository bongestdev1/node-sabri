const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

var ObjectId = require('mongodb').ObjectID;

const Schema = mongoose.Schema

const schemaTauxTVA=mongoose.Schema({
    libelle:{type:String,default: 0},
    taux:{type:Number,default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaTauxTVA.plugin(mongoosePaginate);

schemaTauxTVA.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TauxTVA = mongoose.model('TauxTVA',schemaTauxTVA)

function validateTauxTVA(TauxTVA){

    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        taux:Joi.number().allow('', null),

    })

    return schema.validate(TauxTVA)
}

async function checkValeurTauxTva(idTauxTva, tauxTva, societeRacine){
    var tauxTvas = []
    
    if(idTauxTva != ""){
        var idTauxTva2 = ObjectId(idTauxTva)
        tauxTvas = await TauxTVA.find({_id: { $ne: idTauxTva2 }, taux: tauxTva, societeRacine:societeRacine})
    }else{
        tauxTvas = await TauxTVA.find({taux: tauxTva, societeRacine:societeRacine})
    }

    if(tauxTvas.length == 0){
        return true
    }else{
        return false
    } 
}

module.exports.TauxTVA=TauxTVA
module.exports.validateTauxTVA=validateTauxTVA
module.exports.checkValeurTauxTva = checkValeurTauxTva