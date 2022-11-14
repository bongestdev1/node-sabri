const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaChauffeur=mongoose.Schema({
        nom:{type:String,default: 0},
        prenom:{type:String,default: 0},
        role:{type:String,default: 0},
        email:{type:String,default: 0},
        telephone:{type:String,default: 0},
        adresse:{type:String,default: 0},

        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},

    },
    { timestamps: true }
)

schemaChauffeur.plugin(mongoosePaginate);

schemaChauffeur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Chauffeur = mongoose.model('Chauffeur',schemaChauffeur)

function validateChauffeur(Chauffeur){

    let schema = Joi.object({
        nom:Joi.string().allow('', null),
        prenom:Joi.string().allow('', null),
        role:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        telephone:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),

    })

    return schema.validate(Chauffeur)
}

module.exports.Chauffeur=Chauffeur
module.exports.validateChauffeur=validateChauffeur
