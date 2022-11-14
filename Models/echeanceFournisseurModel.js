const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEcheanceFournisseur=mongoose.Schema({   
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
    reglement:{type: Schema.Types.ObjectId, ref: 'Reglement'},
    dateEcheance:{type:Date,default: ""},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
 },
{ timestamps: true }
)

schemaEcheanceFournisseur.plugin(mongoosePaginate);

schemaEcheanceFournisseur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const EcheanceFournisseur = mongoose.model('EcheanceFournisseur',schemaEcheanceFournisseur)


module.exports.EcheanceFournisseur=EcheanceFournisseur
