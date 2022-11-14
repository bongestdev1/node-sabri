const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaParamLiv=mongoose.Schema({
    idFormat:{type:String,default: ""},
    typeDoc:{type:String,default: ""},
    champ:{type:String,default: ""},
    libelle:{type:String,default: ""},
    width:{type:Number,default: 0},
    ordre:{type:Number,default: 0},
    visibilite:{type:String,default: ""},
    alignement:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaParamLiv.plugin(mongoosePaginate);

schemaParamLiv.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ParamLiv = mongoose.model('ParamLiv',schemaParamLiv)

function validateParamLiv(ParamLiv){
    let schema = Joi.object({
        idFormat:Joi.string().allow('', null),
        typeDoc:Joi.string().allow('', null),
        champ:Joi.string().allow('', null),
        libelle:Joi.string().allow('', null),
        width:Joi.number.allow('', 0),
        ordre:Joi.number.allow('', 0),
        visibilite:Joi.string().allow('', null),
        alignement:Joi.string().allow('', null),
    })
    return schema.validate(ParamLiv)
}
module.exports.ParamLiv=ParamLiv
module.exports.validateParamLiv=validateParamLiv
