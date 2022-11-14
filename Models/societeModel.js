const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaSociete=mongoose.Schema({
    raisonSociale:{type:String,default: ""},
    societeParent:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    matriculeFiscale:{type:String,default: ""},
    responsable:{type:String,default: ""},
    cinResponable:{type:String,default: ""},
    telephones:{type:String,default: ""},
    mobiles:{type:String,default: ""},
    fax:{type:String,default: ""},
    localite:{type:String,default: ""},
    email:{type:String,default: ""},
    pays:{type:String,default: ""},
    gouvernorat:{type:String,default: ""},
    delegation:{type:String,default: ""},
    codePostale:{type:String,default: ""},
    adresse:{type:String,default: ""},
    rib:{type:String,default: ""},
    
    imagePath:{type:String,default: ""},
   
    exemptTimbreFiscale:{type:String,default: "non"},
    exemptTVA:{type:String,default: "non"},

    dateLancementSystem: {type:Date, default: ""},
 
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
 
    },
    { timestamps: true }
)

schemaSociete.plugin(mongoosePaginate);

schemaSociete.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Societe = mongoose.model('Societe',schemaSociete)

function validateSociete(Societe){

    let schema = Joi.object({

        raisonSociale:Joi.string().allow('', null),
        matriculeFiscale:Joi.string().allow('', null),
        responsable:Joi.string().allow('', null),
        cinResponable:Joi.string().allow('', null),
        téléphones:Joi.string().allow('', null),
        mobiles:Joi.string().allow('', null),
        fax:Joi.string().allow('', null),
        localité:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        pays:Joi.string().allow('', null),
        gouvernorat:Joi.string().allow('', null),
        pays:Joi.string().allow('', null),
        delegation:Joi.string().allow('', null),
        codePostale:Joi.string().allow('', null),

    })

    return schema.validate(Societe)
}


async function getSocieteRacine(idSociete){
    if(idSociete === null || !mongoose.isValidObjectId(idSociete) ){
        console.log("default id societe")
        return null
    }
    
    var idSocieteParent = idSociete
    var societe = await Societe.findById(idSociete)
 
    while(societe){
        if(societe.societeParent != null && societe.societeParent != undefined){
            idSocieteParent = societe.societeParent
            societe = await Societe.findById(idSocieteParent)
        }else{
            return idSocieteParent
        }
    }
           
    return null
}

async function getSocietesBySocieteParent(idSocieteParent){
    var societes = await getSocietesBySocieteParent2(idSocieteParent)
    var newSocietes = []
    for(let i = 0; i < societes.length; i++){
        if(societes[i] != null) newSocietes.push(societes[i])
    }
    return newSocietes
}

async function getSocietesBySocieteParent2(idSocieteParent){
    var societe = await Societe.findById(idSocieteParent)
    var societes = await Societe.find({societeParent:idSocieteParent})
    var newSocietes = []
    newSocietes.push(societe)
    if(societes.length > 0){
        for(let i = 0; i<societes.length; i++){
            const societeChildren = await getSocietesBySocieteParent2(societes[i].id)
            for(let j = 0; j<societeChildren.length; j++){
                newSocietes.push(societeChildren[j])
            }
        }
        return newSocietes
    }else{
        return newSocietes
    }
}

module.exports.validateSociete = validateSociete
module.exports.Societe=Societe
module.exports.getSocieteRacine=getSocieteRacine
module.exports.getSocietesBySocieteParent = getSocietesBySocieteParent
