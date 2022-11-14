const mongoose = require('mongoose')
const Joi = require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaBonPrelevement = mongoose.Schema({

    numero: { type: Number, default: 0 },
    date: { type: Date, default: new Date() },
    magasinier: { type: String, default: "" },
    personnel: { type: String, default: "" },
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    articleAchats:[{
        numero:{type:Number,default: 0},
        article:{type: Schema.Types.ObjectId, ref: 'Article'},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        prixVenteHT:{type:Number,default: 0},
        quantite:{type:Number,default: 0},
        unite:{type:String,default: ""},
     }]
},
    { timestamps: true }
)

schemaBonPrelevement.plugin(mongoosePaginate);

schemaBonPrelevement.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object; 
});

const BonPrelevement = mongoose.model('BonPrelevement', schemaBonPrelevement)


module.exports.BonPrelevement = BonPrelevement
