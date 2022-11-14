const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaMarque=mongoose.Schema({
        libelle:{type:String,default: 0},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaMarque.plugin(mongoosePaginate);

schemaMarque.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Marque = mongoose.model('Marque',schemaMarque)

function validateMarque(Marque){

    let schema = Joi.object({

        libelle:Joi.string().allow('', null),

    })

    return schema.validate(Marque)
}

async function getNumeroAutomatiqueMarque(idSocieteRacine){
    let lastDoc = (await Marque.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueMarque=getNumeroAutomatiqueMarque

module.exports.Marque=Marque
module.exports.validateMarque=validateMarque
