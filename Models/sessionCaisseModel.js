const mongoose = require('mongoose')
const Joi = require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaSessionCaisse = mongoose.Schema({
  exercice:{type:String,default: ""},
  num:{type:Number,default: 1},
  
  caisse: { type: Schema.Types.ObjectId, ref: 'Caisse' },
  utilisateur: { type: Schema.Types.ObjectId, ref: 'Utilisateur' },
  numero: { type: String, default: "" },
  dateOuverture: { type: Date, default: "" },
  cloture: { type: String, default: "non" },
  dateCloture: { type: Date, default: "" },
  fondCaisseOuvrier: { type: Number, default: 0 },
  fondCaisseAdmin: { type: Number, default: 0 },
  totalCaisse: { type: Number, default: 0 },
  montantDifference: { type: Number, default: 0 },
  remarque: { type: String, default: "" },
  societe: { type: Schema.Types.ObjectId, ref: 'Societe', default: 'null' },
},
  {
    timestamps: true
  },
)

schemaSessionCaisse.plugin(mongoosePaginate);

schemaSessionCaisse.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const SessionCaisse = mongoose.model('SessionCaisse', schemaSessionCaisse)

async function getNumeroAutomatique(idSociete, exercice){
  
  var exerciceString = exercice+""
  let lastDoc = (await SessionCaisse.find({societe:idSociete, exercice:exerciceString}).sort({_id: -1}).limit(1))[0];
  var exerciceString = exerciceString.substring(2,4)
  if(lastDoc != undefined){
      var num = lastDoc.num + 1
      var numString = num + ""
      var somme = numString+""
      for(let i = 0 ; i < (6 - numString.length); i++){
          somme = "0" + somme
      }
      
      return {numero:"SC"+exerciceString+"-"+somme, num:num}
  }else{
      return {numero:"SC"+exerciceString+"-000001", num:1}
  }
}

function indexOf(x, tab) {
  for (let item in tab) {
    if (x == tab[item].typeOperation) {
      return item
    }
  }
  return -1
}


module.exports.indexOf=indexOf
module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.SessionCaisse = SessionCaisse
