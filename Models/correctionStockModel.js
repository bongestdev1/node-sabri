const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaCorrectionStock=mongoose.Schema({ 
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    societe:{type: Schema.Types.ObjectId, ref: 'Societe'},
    personnel:{type: Schema.Types.ObjectId, ref: 'Utilisateur'},
    notes:{type:String,default: ""},
   
    ligneCorrectionStocks:[{
        numero:{type:Number,default: 0},
        article:{type: Schema.Types.ObjectId, ref: 'Article'},
        reference:{type:String,default: ""},
        designation:{type:String,default: ""},
        qteAncienne:{type:Number,default: 0},
        qteDifference:{type:Number,default: 0},
        qteNouvelle:{type:Number,default: 0},
        notes:{type:String,default: ""},
    }],
},
{ timestamps: true }
)

schemaCorrectionStock.plugin(mongoosePaginate);

schemaCorrectionStock.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const CorrectionStock = mongoose.model('CorrectionStock',schemaCorrectionStock)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await CorrectionStock.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        return {numero:"CrS"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"CrS"+exerciceString+"-00000001", num:1}
    }

}

module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.CorrectionStock=CorrectionStock
