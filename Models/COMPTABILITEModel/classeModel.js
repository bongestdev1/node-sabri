const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaClasse=mongoose.Schema({
    classeParent:{type:String,default: ""},
    code:{type:String,default: ""},
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe'},
  
    },
    { timestamps: true }
)

schemaClasse.plugin(mongoosePaginate);

schemaClasse.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Classe = mongoose.model('Classe',schemaClasse)

async function getClasseRacine(idClasse){
    var idClasseParent = idClasse
    var Classe = await Classe.findById(idClasse)
    
    while(Classe){
        if(Classe.ClasseParent != null){
            idClasseParent = Classe.ClasseParent
            Classe = await Classe.findById(idClasseParent)
        }else{
            return idClasseParent
        }
    }
    return null
}

async function getClassesByClasseParent(idClasseParent){
    var Classe = await Classe.findById(idClasseParent)
   
    var Classes = await Classe.find({ClasseParent:idClasseParent})
    var newClasses = []
    newClasses.push(Classe)
    if(Classes.length > 0){
        for(let i = 0; i<Classes.length; i++){
            const ClasseChildren = await getClassesByClasseParent(Classes[i].id)
            for(let j = 0; j<ClasseChildren.length; j++){
                newClasses.push(ClasseChildren[j])
            }
        }
        return newClasses
    }else{
        return newClasses
    }
}

module.exports.Classe=Classe
module.exports.getClasseRacine=getClasseRacine
module.exports.getClassesByClasseParent = getClassesByClasseParent
