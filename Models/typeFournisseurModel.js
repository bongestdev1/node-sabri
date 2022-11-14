

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTypeFournisseur=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaTypeFournisseur.plugin(mongoosePaginate);

schemaTypeFournisseur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TypeFournisseur = mongoose.model('TypeFournisseur',schemaTypeFournisseur)

function validateTypeFournisseur(TypeFournisseur){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(TypeFournisseur)
}

module.exports.TypeFournisseur=TypeFournisseur
module.exports.validateTypeFournisseur=validateTypeFournisseur
