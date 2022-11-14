const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaSecteur=mongoose.Schema({
    num:{type:Number,default: ""},
    typeS:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaSecteur.plugin(mongoosePaginate);

schemaSecteur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Secteur = mongoose.model('Secteur',schemaSecteur)

function validateSecteur(Secteur){

    let schema = Joi.object({

        typeS:Joi.string().allow('', null),

    })

    return schema.validate(Secteur)
}

async function getNumeroAutomatiqueSecteur(idSocieteRacine){
    let lastDoc = (await Secteur.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueSecteur=getNumeroAutomatiqueSecteur

module.exports.Secteur=Secteur
module.exports.validateSecteur=validateSecteur
