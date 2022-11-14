

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaStatuOpportunite=mongoose.Schema({  
    libelle:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaStatuOpportunite.plugin(mongoosePaginate);

schemaStatuOpportunite.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const StatuOpportunite = mongoose.model('StatuOpportunite',schemaStatuOpportunite)

function validateStatuOpportunite(StatuOpportunite){
    let schema = Joi.object({
        libelle:Joi.string().allow('', null),
    })  
      
    return schema.validate(StatuOpportunite)
}

module.exports.StatuOpportunite=StatuOpportunite
module.exports.validateStatuOpportunite=validateStatuOpportunite
