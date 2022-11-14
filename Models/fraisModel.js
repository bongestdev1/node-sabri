const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaFrais=mongoose.Schema({
    type:{type:String,default: ""},
    direct:{type:String,default: ""},
    tauxTVA:{type:Number,default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaFrais.plugin(mongoosePaginate);

schemaFrais.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Frais = mongoose.model('Frais',schemaFrais)

module.exports.Frais=Frais
