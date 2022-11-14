const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaUniteMesure=mongoose.Schema({
    libelle:{type:String,default: ""},
    code:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaUniteMesure.plugin(mongoosePaginate);

schemaUniteMesure.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const UniteMesure = mongoose.model('UniteMesure',schemaUniteMesure)

function validateUniteMesure(UniteMesure){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),  
        code:Joi.string().allow('', null),    
    })  
      
    return schema.validate(UniteMesure)
}

async function getNumeroAutomatiqueUnite(idSocieteRacine){
    let lastDoc = (await UniteMesure.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueUnite = getNumeroAutomatiqueUnite
module.exports.UniteMesure=UniteMesure
module.exports.validateUniteMesure=validateUniteMesure
