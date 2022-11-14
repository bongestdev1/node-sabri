

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaPeriodicite=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaPeriodicite.plugin(mongoosePaginate);

schemaPeriodicite.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Periodicite = mongoose.model('Periodicite',schemaPeriodicite)

function validatePeriodicite(Periodicite){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(Periodicite)
}

module.exports.Periodicite=Periodicite
module.exports.validatePeriodicite=validatePeriodicite
