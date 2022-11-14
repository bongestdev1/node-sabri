const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaProjet=mongoose.Schema({
        libelle:{type:String,default: ""},
        adresse:{type:String,default: ""},
        enCours:{type:Boolean,default: true},
        budjet:{type:Number,default: 0},
        totalVente:{type:Number,default: 0},
        totalReglement:{type:Number,default: 0},
        client:{type: Schema.Types.ObjectId, ref: 'Client'},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaProjet.plugin(mongoosePaginate);

schemaProjet.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Projet = mongoose.model('Projet',schemaProjet)

function validateProjet(Projet){

    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        enCours:Joi.boolean().allow('', null),
        budjet:Joi.number().allow('', null),
        totalVente:Joi.number().allow('', null),
        totalReglement:Joi.number().allow('', null),
        client:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })

    return schema.validate(Projet)
}

module.exports.Projet=Projet
module.exports.validateProjet=validateProjet
