
const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaTachePreventif=mongoose.Schema({ 
    planPreventif:{type: Schema.Types.ObjectId, ref: 'PlanPreventif'},
    dateExecution:{type:Date,default: ""},
    personnel:{type: Schema.Types.ObjectId, ref: 'Personnel'},
    machine:{type: Schema.Types.ObjectId, ref: 'Machine'},
    etatTache:{type: Schema.Types.ObjectId, ref: 'EtatTache',default: 'En Attente'},
    montant:{type:Number,default: ""},
    numero:{type:Number,default: ""},
    notes:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaTachePreventif.plugin(mongoosePaginate);

schemaTachePreventif.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const TachePreventif = mongoose.model('TachePreventif',schemaTachePreventif)

module.exports.TachePreventif=TachePreventif
