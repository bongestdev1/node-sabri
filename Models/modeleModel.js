const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaModele=mongoose.Schema({
        libelle:{type:String,default: ""},
        marque:{type: Schema.Types.ObjectId, ref: 'Marque'},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    },
    { timestamps: true }
)

schemaModele.plugin(mongoosePaginate);

schemaModele.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Modele = mongoose.model('Modele',schemaModele)

function validateModele(Modele){

    let schema = Joi.object({

        libelle:Joi.string().allow('', null),

    })

    return schema.validate(Modele)
}

async function getNumeroAutomatiqueModele(idSocieteRacine){
    let lastDoc = (await Modele.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueModele = getNumeroAutomatiqueModele

module.exports.Modele=Modele
module.exports.validateModele=validateModele
