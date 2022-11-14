
const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaPlanPreventif=mongoose.Schema({ 
    libelle:{type:String,default: ""},
    operationPreventif:{type: Schema.Types.ObjectId, ref: 'OperationPreventif'},
    machine:{type:String,default: ""},
    dernierDate:{type:Date,default: ""},
    prochaineDate:{type:Date,default: ""},
    periodicite:{type: Schema.Types.ObjectId, ref: 'Periodicite'},
    alerteAvant:{type:Number,default: ""},
    interne:{type:String,default: ""},
    dureeExecution:{type:Number,default: ""},
    montant:{type:Number,default: ""},
    notes:{type:String,default: ""},
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'}, 
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
      
    techniciens:[{
        id:{type:String,default: ""},
        nom:{type:String,default: ""},
        prenom:{type:String,default: ""},
        role:{type:String,default: ""},
        email:{type:String,default: ""},
        telephone:{type:String,default: ""},  
    }],
    
    listTaches:[{        
        dateExecution:{type:Date,default: ""},
        etatTache:{type: Schema.Types.ObjectId, ref: 'EtatTache'}, 
        montant:{type:Number,default: ""},
        numero:{type:Number,default: ""},
        personnel: [],
    }]

},
{ timestamps: true }
)

schemaPlanPreventif.plugin(mongoosePaginate);

schemaPlanPreventif.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const PlanPreventif = mongoose.model('PlanPreventif',schemaPlanPreventif)

module.exports.PlanPreventif=PlanPreventif
