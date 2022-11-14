const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEcheanceClient=mongoose.Schema({   
    client:{type: Schema.Types.ObjectId, ref: 'Client'},
    reglement:{type: Schema.Types.ObjectId, ref: 'Reglement'},
    dateEcheance:{type:Date,default: ""},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
 },
{ timestamps: true }
)

schemaEcheanceClient.plugin(mongoosePaginate);

schemaEcheanceClient.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const EcheanceClient = mongoose.model('EcheanceClient',schemaEcheanceClient)


module.exports.EcheanceClient=EcheanceClient
