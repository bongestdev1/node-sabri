const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaTransporteur=mongoose.Schema({
        nom:{type:String,default: ""},
        numVehicule:{type:String,default: 0},
        gsm:{type:String,default: ""},
        tel:{type:String,default: ""},
        email:{type:String,default: ""},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    },
    { timestamps: true }
)

schemaTransporteur.plugin(mongoosePaginate);

schemaTransporteur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Transporteur = mongoose.model('Transporteur',schemaTransporteur)

function validateTransporteur(Transporteur){
    let schema = Joi.object({
        nom:Joi.string().allow('', null),
        numVehicule:Joi.string().allow('', null),
        gsm:Joi.string().allow('', null),
        tel:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
    })
    return schema.validate(Transporteur)
}
module.exports.Transporteur=Transporteur
module.exports.validateTransporteur=validateTransporteur
