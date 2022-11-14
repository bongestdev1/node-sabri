const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaHistorique=mongoose.Schema({ 
    idUtilisateur:{type:String,default: ""},
    idDocument:{type:String,default: ""},
    message:{type:String,default: ""},
    date:{type:Date,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
},
{ timestamps: true }
)

schemaHistorique.plugin(mongoosePaginate);

schemaHistorique.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Historique = mongoose.model('Historique',schemaHistorique)


module.exports.Historique=Historique
