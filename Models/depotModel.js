const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');
const { boolean } = require('joi');

const Schema = mongoose.Schema

const schemaDepot=mongoose.Schema({
    libelle:{type:String,default: ""},
    adresse:{type:String,default: ""},
    telephone:{type:String,default: ""},
    responsable:{type:String,default: ""},
    notes:{type:String,default: ""},
    email:{type:String,default: ""},
    est_magasin:{type:Boolean,default: true},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaDepot.plugin(mongoosePaginate);

schemaDepot.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Depot = mongoose.model('Depot',schemaDepot)

function validateDepot(Depot){

    let schema = Joi.object({

        libelle:Joi.string().allow('', null),

    })

    return schema.validate(Depot)
}

async function getNumeroAutomatiqueDepot(idSocieteRacine){
    let lastDoc = (await Depot.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        return {num:num}
    }else{
        return {num:1}
    }
}

module.exports.getNumeroAutomatiqueDepot=getNumeroAutomatiqueDepot
module.exports.Depot=Depot
module.exports.validateDepot=validateDepot
