

const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaChargeSociete=mongoose.Schema({  

    date:{type:Date,default: ""},
    montant:{type:Number,default: 0},
    modeReglement:{type: Schema.Types.ObjectId, ref: 'ModeReglement'},
    sessionCaisse:{type: Schema.Types.ObjectId, ref: 'SessionCaisse'},
    motif:{type:String,default: ""},
    proprietaire:{type:String,default: ""},
    notes:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaChargeSociete.plugin(mongoosePaginate);

schemaChargeSociete.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ChargeSociete = mongoose.model('ChargeSociete',schemaChargeSociete)


module.exports.ChargeSociete=ChargeSociete
