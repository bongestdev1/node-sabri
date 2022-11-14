

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaEnergie=mongoose.Schema({  
    libelle:{type:String,default: ""},
    tarif:{type:Number,default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaEnergie.plugin(mongoosePaginate);

schemaEnergie.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Energie = mongoose.model('Energie',schemaEnergie)

function validateEnergie(Energie){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        tarif:Joi.number().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(Energie)
}

module.exports.Energie=Energie
module.exports.validateEnergie=validateEnergie
