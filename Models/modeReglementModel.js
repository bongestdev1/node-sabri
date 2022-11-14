const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaModeReglement=mongoose.Schema({   
    num:{type:Number,default: ""},
    libelle:{type:String,default: ""},
    ordre:{type:Number,default: 0},
    valeurRetiree:{type:Number,default: 0},
    tierNecessaire:{type:String,default: false},
    enCours:{type:String,default: false},
    image:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'}, 
},
{ timestamps: true }
)

schemaModeReglement.plugin(mongoosePaginate);

schemaModeReglement.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ModeReglement = mongoose.model('ModeReglement',schemaModeReglement)

function validateModeReglement(ModeReglement){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        ordre:Joi.number().allow('', null),
        valeurRetiree:Joi.number().allow('', null),
        tierNecessaire:Joi.string().allow('', null),
        image:Joi.string().allow('', null),
    })  
      
    return schema.validate(ModeReglement)
}

async function getNumeroAutomatiqueModeReglement(idSocieteRacine){
    let lastDoc = (await ModeReglement.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueModeReglement=getNumeroAutomatiqueModeReglement

module.exports.ModeReglement=ModeReglement
module.exports.validateModeReglement=validateModeReglement
