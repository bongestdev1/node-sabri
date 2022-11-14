const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaParametresImportation=mongoose.Schema({
        table:{type:String,default: ""},
        parametres:{type:String,default: ""},
        
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    },
    { timestamps: true }
)

schemaParametresImportation.plugin(mongoosePaginate);

schemaParametresImportation.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ParametresImportation = mongoose.model('ParametresImportation',schemaParametresImportation)

module.exports.ParametresImportation=ParametresImportation
