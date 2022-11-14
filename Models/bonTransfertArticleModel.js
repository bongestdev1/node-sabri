const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonTransfertArticle=mongoose.Schema({ 
   
    numero:{type:Number,default: 0},
    
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    quantiteVente:{type:Number,default: 0},
    unite:{type:String,default: ""},
    
    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    bonTransfert:{type: Schema.Types.ObjectId, ref: 'BonTransfert'},
    date:{type:Date,default: new Date()},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
},
{ timestamps: true }
)

schemaBonTransfertArticle.plugin(mongoosePaginate);

schemaBonTransfertArticle.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonTransfertArticle = mongoose.model('BonTransfertArticle',schemaBonTransfertArticle)


module.exports.BonTransfertArticle=BonTransfertArticle
