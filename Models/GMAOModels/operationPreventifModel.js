

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaOperationPreventif=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaOperationPreventif.plugin(mongoosePaginate);

schemaOperationPreventif.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const OperationPreventif = mongoose.model('OperationPreventif',schemaOperationPreventif)

function validateOperationPreventif(OperationPreventif){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(OperationPreventif)
}

module.exports.OperationPreventif=OperationPreventif
module.exports.validateOperationPreventif=validateOperationPreventif
