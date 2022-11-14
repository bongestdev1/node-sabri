const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaFamille=mongoose.Schema({
        libelle:{type:String,default: 0},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
        num:{type:Number,default: 0},
    },
    { timestamps: true }
)

schemaFamille.plugin(mongoosePaginate);

schemaFamille.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Famille = mongoose.model('Famille',schemaFamille)

function validateFamille(Famille){

    let schema = Joi.object({

        libelle:Joi.string().allow('', null),

    })

    return schema.validate(Famille)
}

async function getNumeroAutomatiqueFamille(idSocieteRacine){
    let lastDoc = (await Famille.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueFamille=getNumeroAutomatiqueFamille
module.exports.Famille=Famille
module.exports.validateFamille=validateFamille
