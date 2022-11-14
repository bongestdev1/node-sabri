const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaLigneExpeditionModel=mongoose.Schema({ 

       
    numero:{type:Number,default: 0},
    
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    unite:{type:String,default: ""},

    remiseF:{type:Number,default: 0},
    prixFourn:{type:Number,default: 0},
    isFodec:{type:String,default: ""},
    prixFodec:{type:Number,default: 0},
    tauxDC:{type:Number,default: 0},
    prixDC:{type:Number,default: 0},
    totalFrais:{type:Number,default: 0},
    tauxRemise:{type:Number,default: 0},
    remiseParMontant:{type:Number,default: 0},
    remiseParMontant2:{type:Number,default: 0},
    montantRemise:{type:Number,default: 0},
    prixSpecifique:{type:Number,default: 0},
    totalRemise:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    tauxTVA:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    redevance:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    pVenteConseille:{type:Number,default: 0},
    marge:{type:Number,default: 0},

    prixRevient:{type:Number,default: 0},
    
    date:{type:Date,default: new Date()},

    expedition:{type: Schema.Types.ObjectId, ref: 'Expedition'},
    
    article:{type: Schema.Types.ObjectId, ref: 'Article'},

    quantiteVente:{type:Number,default: 0},

    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaLigneExpeditionModel.plugin(mongoosePaginate);

schemaLigneExpeditionModel.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const LigneExpeditionModel = mongoose.model('LigneExpeditionModel',schemaLigneExpeditionModel)


module.exports.LigneExpeditionModel=LigneExpeditionModel
