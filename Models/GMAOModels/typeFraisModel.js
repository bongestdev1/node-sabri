

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTypeFrais=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaTypeFrais.plugin(mongoosePaginate);

schemaTypeFrais.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TypeFrais = mongoose.model('TypeFrais',schemaTypeFrais)

function validateTypeFrais(TypeFrais){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(TypeFrais)
}

module.exports.TypeFrais=TypeFrais
module.exports.validateTypeFrais=validateTypeFrais
