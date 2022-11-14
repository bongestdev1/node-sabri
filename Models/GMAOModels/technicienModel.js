const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaTechnicien=mongoose.Schema({
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

schemaTechnicien.plugin(mongoosePaginate);

schemaTechnicien.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Technicien = mongoose.model('Technicien',schemaTechnicien)

function validateTechnicien(Technicien){

    let schema = Joi.object({
        nom:Joi.string().allow('', null),
        prenom:Joi.string().allow('', null),
        role:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        telephone:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),

    })

    return schema.validate(Technicien)
}

module.exports.Technicien=Technicien
module.exports.validateTechnicien=validateTechnicien
