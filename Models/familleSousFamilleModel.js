const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaFamilleSousFamille=mongoose.Schema({
        sousFamille: {type: Schema.Types.ObjectId, ref: 'SousFamille'},
        famille: {type: Schema.Types.ObjectId, ref: 'Famille'},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    },
    { timestamps: true }
)

schemaFamilleSousFamille.plugin(mongoosePaginate);

schemaFamilleSousFamille.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const FamilleSousFamille = mongoose.model('FamilleSousFamille',schemaFamilleSousFamille)

function validateFamilleSousFamille(FamilleSousFamille){

    let schema = Joi.object({

        sousFamille: Joi.string().allow('', null),
        famille: Joi.string().allow('', null)
   
    })

    return schema.validate(FamilleSousFamille)
}

module.exports.FamilleSousFamille=FamilleSousFamille
module.exports.validateFamilleSousFamille=validateFamilleSousFamille
