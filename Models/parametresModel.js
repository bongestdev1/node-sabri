const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaParametres=mongoose.Schema({
    nombreChiffresApresVerguleNormale:{type:Number,default: 3},
    nombreChiffresApresVerguleQuantite:{type:Number,default: 3},
    prixTimbreFiscale:{type:Number,default: 0.6},
    tauxFodec:{type:Number,default: 1},
    coefficientRetenueImpot:{type:Number,default: 1.5},
    clientPardefault:{type:Schema.Types.ObjectId, ref: 'Client',default: 'null'},
    modeReglementPardefault:{type:Schema.Types.ObjectId, ref: 'ModeReglement',default: 'null'},
    uniteMesurePardefault:{type:Schema.Types.ObjectId, ref: 'UniteMesure',default: 'null'},
    validationStockBonAchat:{type:String,default: "oui"},
    validationUpdatePrixAchatFromBonAchat:{type:String,default: "non"},
    societeTransport:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    validationTimbreFiscaleBonRec:{type:String,default: "oui"},
    validationTimbreFiscaleBonLiv:{type:String,default: "oui"},
      
    logo:{type:String,default: ""},
    
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaParametres.plugin(mongoosePaginate);

schemaParametres.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Parametres = mongoose.model('Parametres',schemaParametres)

module.exports.Parametres=Parametres
