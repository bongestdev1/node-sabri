

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEtatTache=mongoose.Schema({  
    libelle:{type:String,default: ""}, 
    varibleParDefault:{type:String,default: "En attente"},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaEtatTache.plugin(mongoosePaginate);

schemaEtatTache.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const EtatTache = mongoose.model('EtatTache',schemaEtatTache)

function validateEtatTache(EtatTache){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        varibleParDefault:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(EtatTache)
}

module.exports.EtatTache=EtatTache
module.exports.validateEtatTache=validateEtatTache
