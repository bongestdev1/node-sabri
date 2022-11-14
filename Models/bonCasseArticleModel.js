const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonCasseArticle=mongoose.Schema({ 
   
    numero:{type:Number,default: 0},
    
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    quantiteVente:{type:Number,default: 0},
    unite:{type:String,default: ""},
    prixRevient:{type:Number,default: 0},
    
    
    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    bonCasse:{type: Schema.Types.ObjectId, ref: 'BonCasse'},
    date:{type:Date,default: new Date()},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
},
{ timestamps: true }
)

schemaBonCasseArticle.plugin(mongoosePaginate);

schemaBonCasseArticle.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonCasseArticle = mongoose.model('BonCasseArticle',schemaBonCasseArticle)


module.exports.BonCasseArticle=BonCasseArticle
