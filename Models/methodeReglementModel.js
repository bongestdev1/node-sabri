const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaMethodeReglement=mongoose.Schema({
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaMethodeReglement.plugin(mongoosePaginate);

schemaMethodeReglement.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const MethodeReglement = mongoose.model('MethodeReglement',schemaMethodeReglement)

function validateMethodeReglement(MethodeReglement){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),   
    })  
      
    return schema.validate(MethodeReglement)
}

module.exports.MethodeReglement=MethodeReglement
module.exports.validateMethodeReglement=validateMethodeReglement
