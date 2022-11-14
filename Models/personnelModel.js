const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaPersonnel=mongoose.Schema({
        num:{type:Number,default: 0},
        nom:{type:String,default: 0},
        prenom:{type:String,default: 0},
        role:{type:String,default: 0},
        email:{type:String,default: 0},
        telephone:{type:String,default: 0},
        adresse:{type:String,default: 0},

        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},

    },
    { timestamps: true }
)

schemaPersonnel.plugin(mongoosePaginate);

schemaPersonnel.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Personnel = mongoose.model('Personnel',schemaPersonnel)

function validatePersonnel(Personnel){

    let schema = Joi.object({
        nom:Joi.string().allow('', null),
        prenom:Joi.string().allow('', null),
        role:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        telephone:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),

    })

    return schema.validate(Personnel)
}

async function getNumeroAutomatiquePersonnel(idSocieteRacine){
    let lastDoc = (await Personnel.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiquePersonnel=getNumeroAutomatiquePersonnel

module.exports.Personnel=Personnel
module.exports.validatePersonnel=validatePersonnel
