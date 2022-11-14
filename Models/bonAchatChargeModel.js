const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonAchatCharge=mongoose.Schema({
    bonAchat:{type: Schema.Types.ObjectId, ref: 'BonAchat'},
    chargeDirecte:{type: Schema.Types.ObjectId, ref: 'ChargeDirecte'},
    montant:{type:Number,default: 0},
},
{ timestamps: true }
)

schemaBonAchatCharge.plugin(mongoosePaginate);

schemaBonAchatCharge.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonAchatCharge = mongoose.model('BonAchatCharge',schemaBonAchatCharge)

function validateBonAchatCharge(BonAchatCharge){
    let schema = Joi.object({        
    bonAchat:Joi.string().allow('', null),  
    chargeDirecte:Joi.string().allow('', null),  
    montant:Joi.number().allow('', null),    
    })  
      
    return schema.validate(BonAchatCharge)
}

module.exports.BonAchatCharge=BonAchatCharge
module.exports.validateBonAchatCharge=validateBonAchatCharge
