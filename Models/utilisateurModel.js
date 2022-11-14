const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');
const { Role } = require('./roleModel');
var ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema

const Schema1 = mongoose.Schema

const schemaUtilisateur=mongoose.Schema({
        nom:{type:String,default: 0},
        prenom:{type:String,default: 0},
        role:{type:Schema.Types.ObjectId, ref: 'Role',default: 'null'},
        login: {type: String, default: "", unique: true},
        email: {type: String, default: "", unique: true},
        password: {type: String, default: ""},
        telephone:{type:String,default: 0},
        adresse:{type:String,default: 0},
        codeForgotPassword: {type: String, default: ""},
        societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
        possedeCaisse:{type: Boolean, default: false},
    },
    { timestamps: true }
)

schemaUtilisateur.plugin(mongoosePaginate);

schemaUtilisateur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Utilisateur = mongoose.model('Utilisateur',schemaUtilisateur)

function validateUtilisateur(Utilisateur){

    let schema = Joi.object({
        nom:Joi.string().allow('', null),
        prenom:Joi.string().allow('', null),
        role:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        password:Joi.string().allow('', null),
        telephone:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        codeForgotPassword:Joi.string().allow('', null),
        societeRacine:Joi.string().allow('', null),

    })

    return schema.validate(Utilisateur)
}

function validateLogin(login){

    const schema2 = Joi.object({
        email:Joi.string().required().email(),
        password:Joi.string().min(6).required()
    })

    return schema2.validate(login)
}

function validateModifierMotPasse(request){

    const schema2 = Joi.object({
        email:Joi.string().required().email(),
        baseUrl:Joi.string().min(6).required()
    })

    return schema2.validate(request)
}

function validateNewPassowrd(request){

    const schema2 = Joi.object({
        code:Joi.string().min(6).required(),
        newPassword:Joi.string().min(6).required()
    })

    return schema2.validate(request)
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth();
}

async function validateVerifierAccee(idUser, idAccee){
    if (ObjectId.isValid(idUser)) {
        const user = await Utilisateur.findById(idUser)

       if (user != null && ObjectId.isValid(user.role)) {
            const role = await Role.findById(user.role)

            if (role != null) {
                var isAutorisee = true
                console.log(idAccee)
                role.modules.forEach(item => {
                    if (item.id === idAccee) {
                     
                   
                        if (item.avoirAccee !== "oui") {
                            isAutorisee = false
                        }
                    }
                })
                
                return isAutorisee
                
            }
        }
    }

    return false
} 

module.exports.validateVerifierAccee = validateVerifierAccee
module.exports.Utilisateur=Utilisateur
module.exports.validateUtilisateur=validateUtilisateur
module.exports.validateNewPassowrd=validateNewPassowrd
module.exports.validateLogin=validateLogin
module.exports.validateModifierMotPasse=validateModifierMotPasse
