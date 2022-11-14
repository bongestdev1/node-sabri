const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaCategorie=mongoose.Schema({
        libelle:{type:String,default: 0},
        order:{type:Number,default: 0},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
        num:{type:Number, default: 0},
    },
    { timestamps: true }
)

schemaCategorie.plugin(mongoosePaginate);

schemaCategorie.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Categorie = mongoose.model('Categorie',schemaCategorie)

function validateCategorie(Categorie){

    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
        order:Joi.number().allow('', null),
    })

    return schema.validate(Categorie)
}

async function getNumeroAutomatiqueCategorie(idSocieteRacine){
    let lastDoc = (await Categorie.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueCategorie=getNumeroAutomatiqueCategorie
module.exports.Categorie=Categorie
module.exports.validateCategorie=validateCategorie
