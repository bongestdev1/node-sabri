const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');


const Schema = mongoose.Schema

const schemaLiltrage=mongoose.Schema({  
    
    reglement:{type:String,default: ""},
    document:{type:String,default: ""},
    montantAPayer:{type:Number,default: ""},
    
},
{ timestamps: true }
)

schemaLiltrage.plugin(mongoosePaginate);

schemaLiltrage.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Liltrage = mongoose.model('Liltrage',schemaLiltrage)

module.exports.Liltrage = Liltrage 