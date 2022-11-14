const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonRetourClientArticle=mongoose.Schema({ 
   
    numero:{type:Number,default: 0},
    reference:{type:String,default: ""},
    designation:{type:String,default: ""},
    prixAchat:{type:Number,default: 0},
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
    prixVenteHT:{type:Number,default: 0},
    quantiteVente:{type:Number,default: 0},
    totalRemise:{type:Number,default: 0},
    totalHT:{type:Number,default: 0},
    tauxTVA:{type:Number,default: 0},
    totalTVA:{type:Number,default: 0},
    redevance:{type:Number,default: 0},
    totalTTC:{type:Number,default: 0},
    pVenteConseille:{type:Number,default: 0},
    marge:{type:Number,default: 0},

    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    bonRetourClient:{type: Schema.Types.ObjectId, ref: 'BonRetourClient'},
    date:{type:Date,default: new Date()},
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    quantiteLivree:{type:Number,default: 0},
  
    totalGainCommerciale:{type:Number,default: 0},
    totalGainReel:{type:Number,default: 0},

    totalRedevance:{type:Number,default: 0},
    prixTTC:{type:Number,default: 0},
    plafondRemise:{type:Number,default: 0},
    unite1: {type:String,default: ""},
    unite2: {type:String,default: ""},
    coefficient: {type:Number,default: 0},

    sansRemise:{type:String,default: ""},
    prixVenteHTReel :{type:Number,default: 0},

    quantiteVente2:{type:Number,default: 0},
    prixVenteHTReel2 :{type:Number,default: 0},

    prixRevient:{type:Number,default: 0},

    frais:[{   
        quantite:{type:Number,default: 0},
        montant:{type:Number,default: 0},
        tauxTVA:{type:Number,default: 0},
        frais:{type: Schema.Types.ObjectId, ref: 'Frais'},
    }],
    margeMontant:{type:Number,default: 0},
  
},
{ timestamps: true }
)

schemaBonRetourClientArticle.plugin(mongoosePaginate);

schemaBonRetourClientArticle.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const BonRetourClientArticle = mongoose.model('BonRetourClientArticle',schemaBonRetourClientArticle)


module.exports.BonRetourClientArticle=BonRetourClientArticle
