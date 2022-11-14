const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaHistoriqueArticleAchat=mongoose.Schema({ 
    idArticle :{type:Schema.Types.ObjectId, ref: 'Article'},
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    date:{type:Date,default: ""},
    numero:{type:String,default: ""},
    nomFournisseur:{type:Schema.Types.ObjectId, ref: 'Fournisseur'},
    quantite:{type:String,default: ""},
    typeDocument:{type:String,default: ""},
    prixVenteHT:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaHistoriqueArticleAchat.plugin(mongoosePaginate);

schemaHistoriqueArticleAchat.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const HistoriqueArticleAchat = mongoose.model('HistoriqueArticleAchat',schemaHistoriqueArticleAchat)


module.exports.HistoriqueArticleAchat=HistoriqueArticleAchat
