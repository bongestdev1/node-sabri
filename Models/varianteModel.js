const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaVariante=mongoose.Schema({
    libelle:{type:String,default: ""},
    valeurs:[{
        valeur:{type:String,default: ""},
    }],
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
},
{ timestamps: true }
)

schemaVariante.plugin(mongoosePaginate);

schemaVariante.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Variante = mongoose.model('Variante',schemaVariante)


module.exports.Variante=Variante
