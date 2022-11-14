const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaRole=mongoose.Schema({ 
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    modules:[{
        id:{type:String,default: ""},
        avoirAccee:{type:String,default: ""},
    }]
},
{ timestamps: true }
)

schemaRole.plugin(mongoosePaginate);

schemaRole.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Role = mongoose.model('Role',schemaRole)



module.exports.Role=Role
