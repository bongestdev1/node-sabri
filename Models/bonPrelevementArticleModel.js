const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonPrelevementArticle=mongoose.Schema({ 
   
    numero:{type:Number,default: 0},
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    prixAchat:{type:Number,default: 0},
    tauxRemise:{type:Number,default: 0},
    montantRemise:{type:Number,default: 0},
    prixSpecifique:{type:Number,default: 0},
    prixVenteHT:{type:Number,default: 0},
    quantiteVente:{type:Number,default: 0},
    unite:{type:String,default: ""},
    totalRemise:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    tauxTVA:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    redevance:{type:String,default: 0},
    totalTTC:{type:Number,default: 0},
    pVenteConseille:{type:Number,default: 0},
    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    bonPrelevement:{type: Schema.Types.ObjectId, ref: 'BonPrelevement'},
    quantiteLivree:{type:Number,default: 0},
    date:{type:Date,default: new Date()},
    
},
{ timestamps: true }
)

schemaBonPrelevementArticle.plugin(mongoosePaginate);

schemaBonPrelevementArticle.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonPrelevementArticle = mongoose.model('BonPrelevementArticle',schemaBonPrelevementArticle)


module.exports.BonPrelevementArticle=BonPrelevementArticle
