const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaSituationReglement=mongoose.Schema({
    libelle:{type:String,default: ""},
    encaisse:{type:String,default: ""},
    type:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaSituationReglement.plugin(mongoosePaginate);

schemaSituationReglement.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const SituationReglement = mongoose.model('SituationReglement',schemaSituationReglement)

function validateSituationReglement(SituationReglement){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),  
        encaisse:Joi.string().allow('', null),    
    })  
      
    return schema.validate(SituationReglement)
}

module.exports.SituationReglement=SituationReglement
module.exports.validateSituationReglement=validateSituationReglement
