

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTypeTier=mongoose.Schema({  
    num:{type:Number, default:0},
    type:{type:String,default: ""},
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
},
{ timestamps: true }
)

schemaTypeTier.plugin(mongoosePaginate);

schemaTypeTier.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TypeTier = mongoose.model('TypeTier',schemaTypeTier)

function validateTypeTier(TypeTier){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),
    })  
      
    return schema.validate(TypeTier)
}

async function getNumeroAutomatiqueTypeTier(idSocieteRacine){
    let lastDoc = (await TypeTier.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueTypeTier=getNumeroAutomatiqueTypeTier


module.exports.TypeTier=TypeTier
module.exports.validateTypeTier=validateTypeTier
