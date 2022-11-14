const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEtatGlobal=mongoose.Schema({
    etat:{type:String,default: ""},
    table:{type:String,default: ""},
    ordre:{type:Number,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaEtatGlobal.plugin(mongoosePaginate);

schemaEtatGlobal.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const EtatGlobal = mongoose.model('EtatGlobal',schemaEtatGlobal)

module.exports.EtatGlobal=EtatGlobal
