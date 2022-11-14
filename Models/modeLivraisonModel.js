const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaModeLivraison=mongoose.Schema({
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaModeLivraison.plugin(mongoosePaginate);

schemaModeLivraison.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ModeLivraison = mongoose.model('ModeLivraison',schemaModeLivraison)

function validateModeLivraison(ModeLivraison){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),   
    })  
      
    return schema.validate(ModeLivraison)
}

module.exports.ModeLivraison=ModeLivraison
module.exports.validateModeLivraison=validateModeLivraison
