const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaHistoriqueArticleVente=mongoose.Schema({ 
    idArticle :{type:Schema.Types.ObjectId, ref: 'Article'},
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    date:{type:Date,default: ""},
    numero:{type:String,default: ""},
    nomClient:{type:Schema.Types.ObjectId, ref: 'Client'},
    quantite:{type:String,default: ""},
    prixVenteHT:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    typeDocument:{type:String,default: ""},
    prixTTC:{type:Number, default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaHistoriqueArticleVente.plugin(mongoosePaginate);

schemaHistoriqueArticleVente.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const HistoriqueArticleVente = mongoose.model('HistoriqueArticleVente',schemaHistoriqueArticleVente)


module.exports.HistoriqueArticleVente=HistoriqueArticleVente
