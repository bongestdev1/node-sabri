const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaSousFamille=mongoose.Schema({  
    libelle:{type:String,default: ""},
    num:{type:Number,default: 0},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaSousFamille.plugin(mongoosePaginate);

schemaSousFamille.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const SousFamille = mongoose.model('SousFamille',schemaSousFamille)

function validateSousFamille(SousFamille){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
    })  
      
    return schema.validate(SousFamille)
}

async function getNumeroAutomatiqueSousFamille(idSocieteRacine){
    let lastDoc = (await SousFamille.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueSousFamille=getNumeroAutomatiqueSousFamille

module.exports.SousFamille=SousFamille
module.exports.validateSousFamille=validateSousFamille
