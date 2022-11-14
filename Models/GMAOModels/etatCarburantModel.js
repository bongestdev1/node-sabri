

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEtatCarburant=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaEtatCarburant.plugin(mongoosePaginate);

schemaEtatCarburant.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const EtatCarburant = mongoose.model('EtatCarburant',schemaEtatCarburant)

function validateEtatCarburant(EtatCarburant){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(EtatCarburant)
}

module.exports.EtatCarburant=EtatCarburant
module.exports.validateEtatCarburant=validateEtatCarburant
