const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');
const { BonLivraison } = require('./bonLivraisonModel');
const { Liltrage } = require('./liltrageModel');
const { Client } = require('./clientModel');
const { BonRetourClient } = require('./bonRetourClientModel');
const { BonRetourFournisseur } = require('./bonRetourFournisseurModel');
const { BonAchat } = require('./bonAchatModel');
const { Fournisseur } = require('./fournisseurModel');
const { FactureAchat } = require('./factureAchatModel');
const { BonReception } = require('./bonReceptionModel');
const { SessionCaisse } = require('./sessionCaisseModel');

var ObjectId = require('mongodb').ObjectID;

const Schema = mongoose.Schema

const schemaReglement=mongoose.Schema({  
     
    numero:{type:String,default: ""},
    exercice:{type:String,default: ""},
    num:{type:Number,default: 1},

    client:{type:String,default: ""},
    modeReglement:{type: Schema.Types.ObjectId, ref: 'ModeReglement'},
    
    typeReglement:{type:String,default: "bonLivraison"},
    activerLiltrage:{type:String,default: "non"},
    
    situationReglement:{type: Schema.Types.ObjectId, ref: 'SituationReglement'},
    
    montant:{type:Number,default: 0},
    dateReglement:{type:Date,default: ""},
    dateEncaissement :{type:Date,default: ""},
    numCheque:{type:String,default: 0},
    dateEcheance:{type:Date,default: ""},
    notes:{type:String,default: ""},

    sessionCaisse:{type: Schema.Types.ObjectId, ref: 'SessionCaisse'},

    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
    reste:{type:Number,default: ""},

},
{ timestamps: true }
)


schemaReglement.plugin(mongoosePaginate);

schemaReglement.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Reglement = mongoose.model('Reglement',schemaReglement)

async function getNumeroAutomatique(idSociete, typeReglement, exercice){
    var exerciceString = exercice+""
    var prefix = "ReBL"
    if(typeReglement === "bonRetourClient"){
        prefix = "ReBRC"
    }else if(typeReglement === "bonAchat"){
        prefix = "ReBR"
    }else if(typeReglement === "bonRetourFournisseur"){
        prefix = "ReBRF"
    }
    
    let lastDoc = (await Reglement.find({societe: ObjectId(idSociete), typeReglement:typeReglement, exercice:exerciceString}).sort({num: -1}).limit(1))[0];
    console.log("lastDoc = ",lastDoc)
    exerciceString = exerciceString.substring(2,4)
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var numString = num + ""
        var somme = numString+""
        for(let i = 0 ; i < (8 - numString.length); i++){
            somme = "0" + somme
        }

        console.log("numero:",prefix +exerciceString+"-"+somme)
    
        return {numero:prefix +exerciceString+"-"+somme, num:num}
    }else{
        return {numero:prefix +exerciceString+"-00000001", num:1}
    }
}

async function getReglementsByDocuments(idDocument){
    let liltrages = await Liltrage.find({document:idDocument})
    var reglements = []
    var somme = 0
    for(let i = 0; i < liltrages.length; i++){
      var reglement = {}
      reglement = await Reglement.findById(liltrages[i].reglement)
      if(reglement){
        somme += liltrages[i].montantAPayer
        var newReglement = {
            montantAPayer:liltrages[i].montantAPayer,
            dateReglement: reglement.dateReglement, 
            dateEcheance:reglement.dateEcheance,
            montant: reglement.montant , 
            reste:reglement.reste, 
            numCheque:reglement.numCheque, 
            numero:reglement.numero, 
            id: reglement.id, 
            modeReglement:reglement.modeReglement 
        }
        reglements.push(newReglement)
      }else{
        await Liltrage.findByIdAndDelete(liltrages[i].id)
      }
    }
    return reglements
}

async function deleteLiltrageOfBon(idBonLivraison){

    var liltrages = await Liltrage.find({document:idBonLivraison})
      
    for(let i = 0; i < liltrages.length; i++){
        await Liltrage.findOneAndDelete({_id:liltrages[i].id})
        var reglement = await Reglement.findById(liltrages[i].reglement)
        reglement.reste += liltrages[i].montantAPayer
        await Reglement.findOneAndUpdate({_id:reglement.id}, reglement)
    }
    
    return true
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function setLiltrageBonLivraison(bonLivraison, reglements, exercice){

    // await deleteLiltrageOfBon(bonLivraison.id)
   
    for(let i = 0; i < reglements.length; i++){
        var filter = {reglement:reglements[i].id.toString(), document:bonLivraison.id.toString()}
        var liltrages = await Liltrage.find(filter)
        
        if(liltrages.length == 0){
           let reglement = reglements[i]
           reglement.client = bonLivraison.client
           var numeroAutomatique = await getNumeroAutomatique(bonLivraison.societe, "bonLivraison", bonLivraison.exercice)
           
        //    if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
        //     reglement.sessionCaisse = null
        //    }

           if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
               reglement.sessionCaisse = null
             }else{
               const session = await SessionCaisse.findById(reglements[i].sessionCaisse)
               if(!session || (session && session.cloture === "oui")){
                   reglement.sessionCaisse = null
               }  
           }

           reglement.exercice = bonLivraison.exercice
           reglement.numero = numeroAutomatique.numero
           reglement.num = numeroAutomatique.num
           reglement.societe = bonLivraison.societe
           reglement.typeReglement = "bonLivraison"
           const client = await Client.findById(bonLivraison.client)
           const result2 = await Client.findOneAndUpdate({_id:client._id},{credit:Number(client.credit) + Number(reglement.montant)})
           reglement = new Reglement(reglement)
           reglement = await reglement.save()
          
           if(reglements[i].montantAPayer > 0 ){
              var liltrage = new Liltrage({reglement:reglement.id, document: bonLivraison.id, montantAPayer: reglements[i].montantAPayer})
              await liltrage.save()
            }
            reglements[i] = reglement

        }else{
            var reglement = await Reglement.findById(reglements[i].id)
            var liltrage = liltrages[0]
         
            reglement.reste += liltrage.montantAPayer
            reglement.reste -= reglements[i].montantAPayer

            if(reglements[i].montantAPayer > 0 ){
                await Liltrage.findByIdAndUpdate(liltrage.id, {montantAPayer:reglements[i].montantAPayer})
            }else{
                await Liltrage.findByIdAndDelete(liltrage.id)
            }
            
            await Reglement.findByIdAndUpdate(reglements[i].id, {reste:reglement.reste})
            
        }

    }

    var liltrages = await Liltrage.find({document:bonLivraison.id})
    var somme = 0
    
    for(let i = 0; i < liltrages.length; i++){
        somme += liltrages[i].montantAPayer
    }

    return somme
}

async function setLiltrageReglementBonLivraison(bonLivraisons, reglement){
    
    for(let i = 0; i < bonLivraisons.length; i++){
        var liltrage = new Liltrage({reglement:reglement, document: bonLivraisons[i].id, montantAPayer: bonLivraisons[i].montantAPayer})
        await liltrage.save()
    
        var liltrages = await Liltrage.find({document:bonLivraisons[i].id})
        
        var somme = 0
        for(let j = 0; j < liltrages.length; j++){
            somme += liltrages[j].montantAPayer
        }

        var bonLivraison = await BonLivraison.findById(bonLivraisons[i].id)
        var montantPaye = somme
        var restPayer = bonLivraison.montantTotal - somme
        
        await BonLivraison.findOneAndUpdate({_id:bonLivraisons[i].id}, {montantPaye:somme, restPayer:restPayer, isPayee:bonLivraisons[i].isPayee})
    }
    
    return bonLivraisons
}

async function deleteLiltrageOfReglementBonLivraison(idReglement){

    var liltrages = await Liltrage.find({reglement:idReglement})
      
    for(let i = 0; i < liltrages.length; i++){
        try{
            await Liltrage.findOneAndDelete({_id:liltrages[i].id})
            var bonLivraison = await BonLivraison.findById(liltrages[i].document)
         
            var montantPaye = bonLivraison.montantPaye - liltrages[i].montantAPayer
            var restPayer = bonLivraison.montantTotal - montantPaye
          
            var isPayee = "non"
            if(restPayer === 0){
               isPayee = "oui"   
            }
    
            await BonLivraison.findOneAndUpdate({_id:bonLivraison.id}, {montantPaye:montantPaye, restPayer:restPayer, isPayee:isPayee})
        
        }catch(e){
            
        }
    }
    
    return true
}


///////////////////////////////////////////////////////////////////////////////////////

async function setLiltrageBonRetourClient(bonLivraison, reglements){
    //await deleteLiltrageOfBon(bonLivraison.id)
  
    for(let i = 0; i < reglements.length; i++){
        
        var liltrages = await Liltrage.find({reglement:reglements[i].id, document:bonLivraison.id})
        if(liltrages.length == 0){
           let reglement = reglements[i]
           reglement.client = bonLivraison.client
           var numeroAutomatique = await getNumeroAutomatique(bonLivraison.societe, "bonRetourClient", bonLivraison.exercice)
        //    if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
        //     reglement.sessionCaisse = null
        //    }

           if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
            reglement.sessionCaisse = null
          }else{
            const session = await SessionCaisse.findById(reglements[i].sessionCaisse)
            if(!session || (session && session.cloture === "oui")){
                reglement.sessionCaisse = null
            }  
          }
          
           reglement.numero = bonLivraison.numero
           reglement.num = numeroAutomatique.num
           reglement.societe = bonLivraison.societe
           reglement.exercice = bonLivraison.exercice
           reglement.typeReglement = "bonRetourClient"
           const client = await Client.findById(bonLivraison.client)
           const result2 = await Client.findOneAndUpdate({_id:bonLivraison.client},{credit:Number(client.credit) - Number(reglement.montant)})
    
           reglement = new Reglement(reglement)
           reglement = await reglement.save()
           if(reglements[i].montantAPayer > 0 ){
              var liltrage = new Liltrage({reglement:reglement.id, document: bonLivraison.id, montantAPayer: reglements[i].montantAPayer})
              await liltrage.save()
            }
            reglements[i] = reglement
         
        }else{

            var reglement = await Reglement.findById(reglements[i].id)
            var liltrage = liltrages[0]
         
            reglement.reste += liltrage.montantAPayer
            reglement.reste -= reglements[i].montantAPayer

            if(reglements[i].montantAPayer > 0 ){
                await Liltrage.findByIdAndUpdate(liltrage.id, {montantAPayer:reglements[i].montantAPayer})
            }else{
                await Liltrage.findByIdAndDelete(liltrage.id)
            }
            
            await Reglement.findByIdAndUpdate(reglements[i].id, {reste:reglement.reste})
            
        }

    }

    var liltrages = await Liltrage.find({document:bonLivraison.id})
    var somme = 0
    
    for(let i = 0; i < liltrages.length; i++){
        somme += liltrages[i].montantAPayer
    }

    return somme
}

async function setLiltrageReglementBonRetourClient(bonLivraisons, reglement){

    for(let i = 0; i < bonLivraisons.length; i++){
        var liltrage = new Liltrage({reglement:reglement, document: bonLivraisons[i].id, montantAPayer: bonLivraisons[i].montantAPayer})
        await liltrage.save()
    
        var liltrages = await Liltrage.find({document:bonLivraisons[i].id})
        
        var somme = 0
        for(let j = 0; j < liltrages.length; j++){
            somme += liltrages[j].montantAPayer
        }

        var bonLivraison = await BonRetourClient.findById(bonLivraisons[i].id)
        var restPayer = bonLivraison.montantTotal - somme
     
        await BonRetourClient.findOneAndUpdate({_id:bonLivraisons[i].id}, {montantPaye:somme, restPayer:restPayer, isPayee:bonLivraisons[i].isPayee})
    }
    
    return bonLivraisons
}

async function deleteLiltrageOfReglementBonRetourClient(idReglement){

    var liltrages = await Liltrage.find({reglement:idReglement})
      
    for(let i = 0; i < liltrages.length; i++){
        await Liltrage.findOneAndDelete({_id:liltrages[i].id})
        var bonLivraison = await BonRetourClient.findById(liltrages[i].document)
       
        var montantPaye = bonLivraison.montantPaye - liltrages[i].montantAPayer
        var restPayer = bonLivraison.montantTotal - montantPaye
        
        var isPayee = "non"
        if(restPayer === 0){
           isPayee = "oui"   
        }

        await BonRetourClient.findOneAndUpdate({_id:bonLivraison.id}, {montantPaye : montantPaye, restPayer : restPayer, isPayee:isPayee})
    
    }
    
    return true
}


////////////////////////////////////////////////////////////////////////////////////////////////

async function setLiltrageBonAchat(bonLivraison, reglements, exercice){
    //await deleteLiltrageOfBon(bonLivraison.id)
  

    for(let i = 0; i < reglements.length; i++){
        
        var liltrages = await Liltrage.find({reglement:reglements[i].id, document:bonLivraison.id})
        if(liltrages.length == 0){
           let reglement = reglements[i]
           reglement.typeReglement = "bonAchat"
           reglement.client = bonLivraison.fournisseur
           var numeroAutomatique = await getNumeroAutomatique(bonLivraison.societe, "bonAchat", bonLivraison.exercice)
        //    if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
        //     reglement.sessionCaisse = null
        //    }

        
        if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
            reglement.sessionCaisse = null
          }else{
            const session = await SessionCaisse.findById(reglements[i].sessionCaisse)
            if(!session || (session && session.cloture === "oui")){
                reglement.sessionCaisse = null
            }  
        }
           reglement.numero = numeroAutomatique.numero
           reglement.num = numeroAutomatique.num
           reglement.societe = bonLivraison.societe
           reglement.exercice = bonLivraison.exercice

           const fournisseur = await Fournisseur.findById(bonLivraison.fournisseur)
           const result2 = await Fournisseur.findOneAndUpdate({_id:bonLivraison.fournisseur},{credit:Number(fournisseur.credit) + Number(reglement.montant)})
    
           reglement = new Reglement(reglement)
           reglement = await reglement.save()

            if(reglements[i].montantAPayer > 0 ){
              var liltrage = new Liltrage({reglement:reglement.id, document: bonLivraison.id, montantAPayer: reglements[i].montantAPayer})
              await liltrage.save()
            }
            reglements[i] = reglement
         
        }else{
            var reglement = await Reglement.findById(reglements[i].id)
            var liltrage = liltrages[0]
         
            reglement.reste += liltrage.montantAPayer
            reglement.reste -= reglements[i].montantAPayer

            if(reglements[i].montantAPayer > 0 ){
                await Liltrage.findByIdAndUpdate(liltrage.id, {montantAPayer:reglements[i].montantAPayer})
            }else{
                await Liltrage.findByIdAndDelete(liltrage.id)
            }
            
            await Reglement.findByIdAndUpdate(reglements[i].id, {reste:reglement.reste})
            
        }

    }

    var liltrages = await Liltrage.find({document:bonLivraison.id})
    var somme = 0
    
    for(let i = 0; i < liltrages.length; i++){
        somme += liltrages[i].montantAPayer
    }

    return somme
}

async function setLiltrageReglementBonAchat(bonLivraisons, reglement, exercice){

    for(let i = 0; i < bonLivraisons.length; i++){
        var liltrage = new Liltrage({reglement:reglement, document: bonLivraisons[i].id, montantAPayer: bonLivraisons[i].montantAPayer})
        await liltrage.save()
    
        var liltrages = await Liltrage.find({document:bonLivraisons[i].id})
        
        var somme = 0
        for(let j = 0; j < liltrages.length; j++){
            somme += liltrages[j].montantAPayer
        }

        var bonLivraison = await BonReception.findById(bonLivraisons[i].id)
        var montantPaye = somme
        var restPayer = bonLivraison.montantTotal - somme
        
        await BonReception.findOneAndUpdate({_id:bonLivraisons[i].id}, { restPayer:restPayer, montantPaye:montantPaye, isPayee:bonLivraisons[i].isPayee})
    }
    
    return bonLivraisons
}

async function deleteLiltrageOfReglementBonAchat(idReglement){

    var liltrages = await Liltrage.find({reglement:idReglement})
      
    for(let i = 0; i < liltrages.length; i++){
        await Liltrage.findOneAndDelete({_id:liltrages[i].id})
        var bonLivraison = await BonReception.findById(liltrages[i].document)
      
        var montantPaye = bonLivraison.montantPaye - liltrages[i].montantAPayer
        var restPayer = bonLivraison.montantTotal - montantPaye
       
        var isPayee = "non"
        if(restPayer === 0){
           isPayee = "oui"   
        }

        await BonReception.findOneAndUpdate({_id:bonLivraison.id}, {montantPaye:montantPaye, restPayer:restPayer, isPayee:isPayee})
    }
    
    return true
}

//////////////////////////////////////////////////////////////////////////////////////////


async function setLiltrageBonRetourFournisseur(bonLivraison, reglements){
    //await deleteLiltrageOfBon(bonLivraison.id)
  
    for(let i = 0; i < reglements.length; i++){
        
        var liltrages = await Liltrage.find({reglement:reglements[i].id, document:bonLivraison.id})
        if(liltrages.length == 0){
           let reglement = reglements[i]
           reglement.client = bonLivraison.fournisseur
           reglement.typeReglement = "bonRetourFournisseur"
           var numeroAutomatique = await getNumeroAutomatique(bonLivraison.societe, "bonRetourFournisseur", bonLivraison.exercice)
        //    if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
        //     reglement.sessionCaisse = null
        //    }

        if (!ObjectId.isValid(reglements[i].sessionCaisse)) {
            reglement.sessionCaisse = null
          }else{
            const session = await SessionCaisse.findById(reglements[i].sessionCaisse)
            if(!session || (session && session.cloture === "oui")){
                reglement.sessionCaisse = null
            }  
        }
           reglement.numero = bonLivraison.numero
           reglement.num = numeroAutomatique.num
           reglement.societe = bonLivraison.societe
           reglement.exercice = bonLivraison.exercice
           const fournisseur = await Fournisseur.findById(bonLivraison.fournisseur)
           const result2 = await Fournisseur.findOneAndUpdate({_id:bonLivraison.fournisseur},{credit:Number(fournisseur.credit) - Number(reglement.montant)})
    
           reglement = new Reglement(reglement)
           reglement = await reglement.save()
           if(reglements[i].montantAPayer > 0 ){
              var liltrage = new Liltrage({reglement:reglement.id, document: bonLivraison.id, montantAPayer: reglements[i].montantAPayer})
              await liltrage.save()
            }
            reglements[i] = reglement
         
        }else{
            var reglement = await Reglement.findById(reglements[i].id)
            var liltrage = liltrages[0]
         
            reglement.reste += liltrage.montantAPayer
            reglement.reste -= reglements[i].montantAPayer

            if(reglements[i].montantAPayer > 0 ){
                await Liltrage.findByIdAndUpdate(liltrage.id, {montantAPayer:reglements[i].montantAPayer})
            }else{
                await Liltrage.findByIdAndDelete(liltrage.id)
            }
            
            await Reglement.findByIdAndUpdate(reglements[i].id, {reste:reglement.reste})
            
        }

    }

    var liltrages = await Liltrage.find({document:bonLivraison.id})
    var somme = 0
    
    for(let i = 0; i < liltrages.length; i++){
        somme += liltrages[i].montantAPayer
    }

    return somme
}

async function setLiltrageReglementBonRetourFournisseur(bonLivraisons, reglement){

    for(let i = 0; i < bonLivraisons.length; i++){
        var liltrage = new Liltrage({reglement:reglement, document: bonLivraisons[i].id, montantAPayer: bonLivraisons[i].montantAPayer})
        await liltrage.save()
    
        var liltrages = await Liltrage.find({document:bonLivraisons[i].id})
        
        var somme = 0
        for(let j = 0; j < liltrages.length; j++){
            somme += liltrages[j].montantAPayer
        }

        var bonLivraison = await BonRetourFournisseur.findById(bonLivraisons[i].id)
        var montantPaye = somme
        var restPayer = bonLivraison.montantTotal - somme
        
        await BonRetourFournisseur.findOneAndUpdate({_id:bonLivraisons[i].id}, { isPayee:bonLivraisons[i].isPayee, montantPaye:montantPaye, restPayer:restPayer})
    }
    
    return bonLivraisons
}

async function deleteLiltrageOfReglementBonRetourFournisseur(idReglement){

    var liltrages = await Liltrage.find({reglement:idReglement})
      
    for(let i = 0; i < liltrages.length; i++){
        await Liltrage.findOneAndDelete({_id:liltrages[i].id})
        var bonLivraison = await BonRetourFournisseur.findById(liltrages[i].document)
       
        var montantPaye = bonLivraison.montantPaye - liltrages[i].montantAPayer
        var restPayer = bonLivraison.montantTotal - montantPaye
    
        var isPayee = "non"
        if(restPayer === 0){
           isPayee = "oui"   
        }

        await BonRetourFournisseur.findOneAndUpdate({_id:bonLivraison.id}, {montantPaye:montantPaye, restPayer:restPayer, isPayee:isPayee})
    }
    
    return true
}

/////////////////////////////////////////////////////////////////////////////////////



async function calculerSoldeClient(dateStart, dateEnd, idClient)
{
    var solde = 0

    var filterReglement = {client: idClient}
    var filterDocument = {client: idClient}
    var dateFilter = {}
    if(dateEnd != null){
       dateFilter['$lte'] =  dateEnd
    }

    if(dateStart != null){
        dateFilter['$gte'] =  dateStart
    }else{
        const client = await Client.findById(idClient)
        try{
            solde =   client.soldeInitialDebit - client.soldeInitialCredit
        }catch(e){
            solde = 0
        }
    }

    if(dateFilter['$gte'] != undefined || dateFilter['$lte'] != undefined){
        filterReglement = {client: idClient, dateReglement: dateFilter}
        filterDocument = {client: idClient, date: dateFilter}
    }

    const bonRetours = await BonRetourClient.find(filterDocument)
    const bonLivs = await BonLivraison.find(filterDocument)
    const reglements = await Reglement.find(filterReglement)
   
    for (let item of reglements) {
      if (item.typeReglement == "bonLivraison") {
        solde -= item.montant
      } else {
        solde += item.montant
      }
    }
  
    for (let item of bonRetours) {
      solde -= item.montantTotal
    }
  
    
    for (let item of bonLivs) {
      solde += item.montantTotal
    }

    return solde
}
async function calculerSoldeFournisseur(dateStart, dateEnd, idFournisseur)
{
    var filterReglement = {fournisseur: idFournisseur}
    var filterDocument = {fournisseur: idFournisseur}
    var dateFilter = {}
    if(dateEnd != null){
       dateFilter['$lte'] =  dateEnd
    }

    if(dateStart != null){
        dateFilter['$gte'] =  dateStart
    }

    if(dateFilter['$gte'] != undefined || dateFilter['$lte'] != undefined){
        filterReglement = {fournisseur: idFournisseur, dateReglement: dateFilter}
        filterDocument = {fournisseur: idFournisseur, date: dateFilter}
    }

    const bonRetours = await BonRetourFournisseur.find(filterDocument)
    const bonLivs = await BonReception.find(filterDocument)
    const reglements = await Reglement.find(filterReglement)
   
    var solde = 0
    for (let item of reglements) {
      if (item.typeReglement == "bonAchat") {
        solde += item.montant
      } else {
        solde -= item.montant
      }
    }
  
    for (let item of bonRetours) {
      solde += item.montantTotal
    }
  
    for (let item of bonLivs) {
      solde -= item.montantTotal
    }
    return solde
}

module.exports.calculerSoldeClient=calculerSoldeClient
module.exports.calculerSoldeFournisseur = calculerSoldeFournisseur

module.exports.deleteLiltrageOfBon = deleteLiltrageOfBon

module.exports.getReglementsByDocuments = getReglementsByDocuments

module.exports.deleteLiltrageOfReglementBonLivraison = deleteLiltrageOfReglementBonLivraison
module.exports.setLiltrageReglementBonLivraison = setLiltrageReglementBonLivraison
module.exports.setLiltrageBonLivraison=setLiltrageBonLivraison

module.exports.deleteLiltrageOfReglementBonRetourClient = deleteLiltrageOfReglementBonRetourClient
module.exports.setLiltrageReglementBonRetourClient = setLiltrageReglementBonRetourClient
module.exports.setLiltrageBonRetourClient=setLiltrageBonRetourClient

module.exports.deleteLiltrageOfReglementBonAchat = deleteLiltrageOfReglementBonAchat
module.exports.setLiltrageReglementBonAchat = setLiltrageReglementBonAchat
module.exports.setLiltrageBonAchat=setLiltrageBonAchat

module.exports.deleteLiltrageOfReglementBonRetourFournisseur = deleteLiltrageOfReglementBonRetourFournisseur
module.exports.setLiltrageReglementBonRetourFournisseur = setLiltrageReglementBonRetourFournisseur
module.exports.setLiltrageBonRetourFournisseur=setLiltrageBonRetourFournisseur

module.exports.getNumeroAutomatique=getNumeroAutomatique

module.exports.Reglement=Reglement
