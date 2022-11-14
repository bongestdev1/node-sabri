const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTypeCompte=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaTypeCompte.plugin(mongoosePaginate);

schemaTypeCompte.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TypeCompte = mongoose.model('TypeCompte',schemaTypeCompte)

function validateTypeCompte(TypeCompte){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(TypeCompte)
}

module.exports.TypeCompte=TypeCompte
module.exports.validateTypeCompte=validateTypeCompte
