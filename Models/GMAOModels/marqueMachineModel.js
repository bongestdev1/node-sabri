

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaMarqueMachine=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaMarqueMachine.plugin(mongoosePaginate);

schemaMarqueMachine.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const MarqueMachine = mongoose.model('MarqueMachine',schemaMarqueMachine)

function validateMarqueMachine(MarqueMachine){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(MarqueMachine)
}

module.exports.MarqueMachine=MarqueMachine
module.exports.validateMarqueMachine=validateMarqueMachine
