

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaModeleMachine=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaModeleMachine.plugin(mongoosePaginate);

schemaModeleMachine.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ModeleMachine = mongoose.model('ModeleMachine',schemaModeleMachine)

function validateModeleMachine(ModeleMachine){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(ModeleMachine)
}

module.exports.ModeleMachine=ModeleMachine
module.exports.validateModeleMachine=validateModeleMachine
