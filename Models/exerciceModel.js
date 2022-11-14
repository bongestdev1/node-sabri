const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaExercice=mongoose.Schema({
    exercice:{type:String,default: ""},
    isEnCours:{type:String,default: "oui"},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
    },
    { timestamps: true }
)

schemaExercice.plugin(mongoosePaginate);

schemaExercice.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Exercice = mongoose.model('Exercice',schemaExercice)


module.exports.Exercice=Exercice