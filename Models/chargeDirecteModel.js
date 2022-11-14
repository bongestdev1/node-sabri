

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaChargeDirecte=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaChargeDirecte.plugin(mongoosePaginate);

schemaChargeDirecte.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ChargeDirecte = mongoose.model('ChargeDirecte',schemaChargeDirecte)

function validateChargeDirecte(ChargeDirecte){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(ChargeDirecte)
}

module.exports.ChargeDirecte=ChargeDirecte
module.exports.validateChargeDirecte=validateChargeDirecte
