const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema


const schemaReglementFournisseur=mongoose.Schema({   
    fournisseur:{type: Schema.Types.ObjectId, ref: 'Fournisseur'},
    modeReglement:{type: Schema.Types.ObjectId, ref: 'ModeReglement'},
    tresorerie:{type:String,default: ""},
    montant:{type:Number,default: 0},
    dateReglement:{type:Date,default: ""},
    numCheque:{type:String,default: 0},
    dateEcheance:{type:Date,default: ""},
    notes:{type:String,default: ""},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaReglementFournisseur.plugin(mongoosePaginate);

schemaReglementFournisseur.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ReglementFournisseur = mongoose.model('ReglementFournisseur',schemaReglementFournisseur)


module.exports.ReglementFournisseur=ReglementFournisseur
