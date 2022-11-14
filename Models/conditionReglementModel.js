
const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaConditionReglement=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},

},
{ timestamps: true }
)

schemaConditionReglement.plugin(mongoosePaginate);

schemaConditionReglement.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ConditionReglement = mongoose.model('ConditionReglement',schemaConditionReglement)

function validateConditionReglement(ConditionReglement){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(ConditionReglement)
}

module.exports.ConditionReglement=ConditionReglement
module.exports.validateConditionReglement=validateConditionReglement
