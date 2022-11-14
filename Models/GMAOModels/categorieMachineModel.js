

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaCategorieMachine=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaCategorieMachine.plugin(mongoosePaginate);

schemaCategorieMachine.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const CategorieMachine = mongoose.model('CategorieMachine',schemaCategorieMachine)

function validateCategorieMachine(CategorieMachine){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(CategorieMachine)
}

module.exports.CategorieMachine=CategorieMachine
module.exports.validateCategorieMachine=validateCategorieMachine
