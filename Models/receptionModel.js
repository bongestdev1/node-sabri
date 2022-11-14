const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaReception=mongoose.Schema({ 
    
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},
    document:{type:String,default: ""},
    typeDocument:{type:String,default: ""},
    transporteur:{type:Schema.Types.ObjectId, ref: 'Transporteur',default: 'null'},
    idConnecte:{type:String,default: ""},
    date:{type:Date,default: ""},
    articles:[{
       numero:{type:Number,default: 0},
       article:{type: Schema.Types.ObjectId, ref: 'Article'},
       reference:{type:String,default: ""},
       designation:{type:String,default: ""},
       quantiteVente:{type:Number,default: 0},
       quantiteARecevoit:{type:Number,default: 0},
       quantiteRecevoit:{type:Number,default: 0},
       sousProduit:{type:String,default: ""},
       lot:{type:String,default: ""},
       unite:{type:String,default: ""},
    }],
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    
},
{ timestamps: true }
)

schemaReception.plugin(mongoosePaginate);

schemaReception.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Reception = mongoose.model('Reception',schemaReception)

async function getNumeroAutomatique(idSociete, exercice){
    var exerciceString = exercice+""
    let lastDoc = (await Reception.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
    var exerciceString = exerciceString.substring(2,4)
       
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }
        
        return {numero:"BRec"+exerciceString+"-"+somme, num:num}
    }else{
        return {numero:"BRec"+exerciceString+"-00000001", num:1}
    }
}


module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.Reception=Reception