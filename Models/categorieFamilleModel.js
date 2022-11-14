const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaCategorieFamille=mongoose.Schema({
        categorie: {type: Schema.Types.ObjectId, ref: 'Categorie'},
        famille: {type: Schema.Types.ObjectId, ref: 'Famille'},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaCategorieFamille.plugin(mongoosePaginate);

schemaCategorieFamille.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const CategorieFamille = mongoose.model('CategorieFamille',schemaCategorieFamille)

function validateCategorieFamille(CategorieFamille){

    let schema = Joi.object({

        categorie: Joi.string().allow('', null),
        famille: Joi.string().allow('', null)
   
    })

    return schema.validate(CategorieFamille)
}

module.exports.CategorieFamille=CategorieFamille
module.exports.validateCategorieFamille=validateCategorieFamille
