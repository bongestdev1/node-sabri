const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaInventaire=mongoose.Schema({ 
    numero:{type:String,default: ""},
    num:{type:Number,default: 1},

    date:{type:Date,default: ""},
    societe:{type: Schema.Types.ObjectId, ref: 'Societe'},
    categorie:{type: Schema.Types.ObjectId, ref: 'Categorie'},
    cloture:{type:Boolean,default: true},
    personne:{type: Schema.Types.ObjectId, ref: 'Utilisateur'},
    notes:{type:String,default: ""},
   
    ligneInventaire:[{
        numero:{type:Number,default: 0},
        reference:{type:String,default: 0},
        designation:{type:String,default: 0},
        article:{type: Schema.Types.ObjectId, ref: 'Article'},
        qteTheorique:{type:Number,default: 0},
        qteEnStock:{type:Number,default: 0},
        qteInv1:{type:Number,default: 0},
        qteInv2:{type:Number,default: 0},
        qteInv3:{type:Number,default: 0},
        qteInv1IsValid: {type:String,default: "non"},
        qteInv2IsValid: {type:String,default: "non"},
        qteInv3IsValid: {type:String,default: "non"},
        qteInvValide:{type:Number,default: 0},
        notes:{type:String,default: 0},
        lot:{type:String,default: ""},
        isShow:{type:Number,default: 0}
    }],
},
{ timestamps: true }
)

schemaInventaire.plugin(mongoosePaginate);

schemaInventaire.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Inventaire = mongoose.model('Inventaire',schemaInventaire)

async function getNumeroAutomatiqueInventaire(idSociete){
   
    let lastDoc = (await Inventaire.find({societe:idSociete}).sort({_id: -1}).limit(1))[0];
  
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"I"+"-"+somme, num:num}
    }else{
        return {numero:"I"+"-00000001", num:1}
    }

}


module.exports.getNumeroAutomatiqueInventaire=getNumeroAutomatiqueInventaire
module.exports.Inventaire=Inventaire
