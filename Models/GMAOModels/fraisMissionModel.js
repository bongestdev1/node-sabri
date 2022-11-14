

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaFraisMission=mongoose.Schema({  
    montant:{type:Number,default: 0},
    typeFrais:{type: Schema.Types.ObjectId, ref: 'TypeFrais'}, 
    mission:{type: Schema.Types.ObjectId, ref: 'Mission'}, 
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaFraisMission.plugin(mongoosePaginate);

schemaFraisMission.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const FraisMission = mongoose.model('FraisMission',schemaFraisMission)

function validateFraisMission(FraisMission){
    let schema = Joi.object({
        montant:Joi.number().allow('', null),
        typeFrais:Joi.string().allow('', null), 
        mission:Joi.string().allow('', null), 
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(FraisMission)
}

module.exports.FraisMission=FraisMission
module.exports.validateFraisMission=validateFraisMission
