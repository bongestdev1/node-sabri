const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaLigneAchatCharge=mongoose.Schema({
    bonAchatArticle:{type: Schema.Types.ObjectId, ref: 'BonAchatArticle'},
    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    chargeDirecte:{type: Schema.Types.ObjectId, ref: 'ChargeDirecte'},
    montant:{type:Number,default: 0},
},
{ timestamps: true }
)

schemaLigneAchatCharge.plugin(mongoosePaginate);

schemaLigneAchatCharge.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const LigneAchatCharge = mongoose.model('LigneAchatCharge',schemaLigneAchatCharge)

function validateLigneAchatCharge(LigneAchatCharge){
    let schema = Joi.object({        
    bonAchat:Joi.string().allow('', null),  
    chargeDirecte:Joi.string().allow('', null),  
    montant:Joi.number().allow('', null),    
    })  
      
    return schema.validate(LigneAchatCharge)
}

module.exports.LigneAchatCharge=LigneAchatCharge
module.exports.validateLigneAchatCharge=validateLigneAchatCharge
