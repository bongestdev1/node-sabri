const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');


const Schema = mongoose.Schema

const schemaClient=mongoose.Schema({
    num:{type:Number,default: 0},

    email:{type:String,default: ""},
    telephone:{type:String,default: ""},
    code:{type:String,default: ""},
    raisonSociale:{type:String,default: ""},
    matriculeFiscale:{type:String,default: ""},
    classement:{type:String,default: ""},
    mobiles:{type:String,default: ""},
    siteWeb:{type:String,default: ""},
    conditionReglement:{type:String,default: ""},
    typeTiers:{type: Schema.Types.ObjectId, ref: 'TypeTier'},
    
    soldeInitialDebit:{type:Number,default: 0},
    soldeInitialCredit:{type:Number,default: 0},
    credit:{type:Number,default: 0},
    impaye:{type:Number,default: 0},
    reglementEnCoursActual:{type:Number,default: 0},
    reglementRisqueActual:{type:Number,default: 0},
    nbFactureNonPayeActual:{type:Number,default: 0},
    
    //risque = credit + encours(cheque non payee)
    plafondCredit:{type:Number,default: 0},
    plafondEnCours:{type:Number,default: 0},
    plafondRisque:{type:Number,default: 0},
    nbFactureNonPaye:{type:Number,default: 0},

    fax:{type:String,default: ""},
    statusProspection:{type:String,default: ""},
    modeReglement:{type: Schema.Types.ObjectId, ref: 'ModeReglement'},
    secteur:{type: Schema.Types.ObjectId, ref: 'Secteur'},

    exemptTimbreFiscale:{type:String,default: "oui"},
    exemptTVA:{type:String,default: "oui"},
    
    agentPremierContact:{type: Schema.Types.ObjectId, ref: 'Personnel'},
    agentCommercial:{type: Schema.Types.ObjectId, ref: 'Personnel'},
    agentRecouvrement:{type: Schema.Types.ObjectId, ref: 'Personnel'},
    remise:{type:Number,default: 0},
    active:{type:String,default: "oui"},
    facture:{type:String,default: "non"},
    
    paysFacturation:{type:String,default: ""},
    gouvernoratFacturation:{type:String,default: ""},
    delegationFacturation:{type:String,default: ""},
    localiteFacturation:{type:String,default: ""},
    codePostaleFacturation:{type:String,default: ""},
    adresseFacturation:{type:String,default: ""},

    paysLivraison:{type:String,default: ""},
    gouvernoratLivraison:{type:String,default: ""},
    delegationLivraison:{type:String,default: ""},
    localiteLivraison:{type:String,default: ""},
    codePostaleLivraison:{type:String,default: ""},
    adresseLivraison:{type:String,default: ""},
    
    autresAdresse:[{
        titre:{type:String,default: ""},
        pays:{type:String,default: ""},
        gouvernorat:{type:String,default: ""},
        delegation:{type:String,default: ""},
        localite:{type:String,default: ""},
        codePostale:{type:String,default: ""},
        adresse:{type:String,default: ""},
    }],
    
    contacts:[{
        civilite:{type:String,default: ""},
        email:{type:String,default: ""},
        mobile:{type:String,default: ""},
        nomPrenom:{type:String,default: ""},
        telephone:{type:String,default: ""},
        typeContact:{type:String,default: ""},
    }],

    complements:[{
        type:{type:String,default: ""},
        valeur:{type:String,default: ""},
        complement:{type:String,default: ""},
        imprimable:{type:String,default: ""},
    }],

    observation:{type:String,default: ""},
    societeRacine:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
},
{ timestamps: true }
)

schemaClient.plugin(mongoosePaginate);

schemaClient.method("toJSON", function() {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;

    if(obj.contacts){
        for(let i = 0; i < obj.contacts.length; i++){
            obj.contacts[i].id = obj.contacts[i]._id
            delete obj.contacts[i]._id;
        }
    }
    

    if(obj.autresAdresse){
        for(let i = 0; i < obj.autresAdresse.length; i++){
           obj.autresAdresse[i].id = obj.autresAdresse[i]._id
           delete obj.autresAdresse[i]._id;
        }
    }

    if(obj.autresAdresse){
        for(let i = 0; i < obj.complements.length; i++){
            obj.complements[i].id = obj.complements[i]._id
            delete obj.complements[i]._id;
        }
    }
    
    delete obj._id;
   

    return obj;
});

const Client = mongoose.model('Client',schemaClient)

function validateClient(client){
    
    let itemAutresAdress = Joi.object().keys({
        titre:Joi.string().allow('', null),
        pays:Joi.string().allow('', null),
        gouvernorat:Joi.string().allow('', null),
        delegation:Joi.string().allow('', null),
        localite:Joi.string().allow('', null),
        codePostale:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
    })

    let itemContact = Joi.object().keys({
        type:Joi.string().allow('', null),
        titre:Joi.string().allow('', null),
        civilite:Joi.string().allow('', null),
    })

    let itemComplement = Joi.object().keys({
        type:Joi.string().allow('', null),
        valeur:Joi.string().allow('', null),
        imprimable:Joi.string().allow('', null),
    })
    
    let schema = Joi.object({
       
        nom:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        telephone:Joi.string().allow('', null),
        code:Joi.string().allow('', null),
        raisonSociale:Joi.string().allow('', null),
        matriculeFiscale:Joi.string().allow('', null),
        classement:Joi.string().allow('', null),
        plafondCredit:Joi.number().allow('', null),
        mobiles:Joi.string().allow('', null),
        siteWeb:Joi.string().allow('', null),
        conditionReglement:Joi.string().allow('', null),
        typeTiers:Joi.string().allow('', null),
        credit:Joi.number().allow('', null),
        fax:Joi.string().allow('', null),
        email:Joi.string().allow('', null),
        statusProspection:Joi.string().allow('', null),
        modeReglement:Joi.string().allow('', null),
        secteur:Joi.string().allow('', null),
        
        paysFacturation:Joi.string().allow('', null),
        gouvernoratFacturation:Joi.string().allow('', null),
        delegationFacturation:Joi.string().allow('', null),
        localiteFacturation:Joi.string().allow('', null),
        codePostaleFacturation:Joi.string().allow('', null),
        adresseFacturation:Joi.string().allow('', null),
    
        paysLivraison:Joi.string().allow('', null),
        gouvernoratLivraison:Joi.string().allow('', null),
        delegationLivraison:Joi.string().allow('', null),
        localiteLivraison:Joi.string().allow('', null),
        codePostaleLivraison:Joi.string().allow('', null),
        adresseLivraison:Joi.string().allow('', null),
    
        autresAdresse:Joi.array().items(itemAutresAdress),
        contacts:Joi.array().items(itemContact),
        complements:Joi.array().items(itemComplement),
        
        observation:Joi.string().allow('', null),
       
    })
      
    return schema.validate(client)
}

async function validateCodeRaisonSocialeMatriculeFiscale(body, societeRacine){
    var items = await Client.find({societeRacine:societeRacine, code:body.code}) 
    if(items.length > 0){
       return "Ce Code est déjà utilisée !!" 
    }

    items = await Client.find({societeRacine:societeRacine, raisonSociale:body.raisonSociale }) 
    if(items.length > 0){
        return "Ce raison sociale est déjà utilisée !!" 
    }
    
    return ""
} 

async function validateCodeRaisonSocialeMatriculeFiscaleModifier(body, societeRacine, id){
    
    var items = await Client.find({societeRacine:societeRacine,_id: {$ne: id}, code:body.code}) 
    if(items.length > 0){
       return "Ce Code est déjà utilisée !!" 
    }

    items = await Client.find({societeRacine:societeRacine,_id: {$ne: id}, raisonSociale:body.raisonSociale }) 
    if(items.length > 0){
        return "Ce raison sociale est déjà utilisée !!" 
    }
    
    return ""
} 

async function getNumeroAutomatique(idSocieteRacine){
    let lastDoc = (await Client.find({societeRacine:idSocieteRacine}).sort({_id: -1}).limit(1))[0];
    
    if(lastDoc != undefined){
        var num = lastDoc.num + 1
        var isSearch = true
        while (isSearch){
            var numString = num + ""
            var somme = numString+""
            
            for(let i = 0 ; i < (8 - numString.length); i++){
                somme = "0" + somme
            }
    
            var numeroAutomatique = {numero:"CL"+"-"+somme, num:num}
            var items = await Client.find({societeRacine:idSocieteRacine, code:numeroAutomatique.numero}) 
            
            if(items.length == 0){
               isSearch = false
               return numeroAutomatique 
            }
            num += 1
        }
    }else{
        return {numero:"CL"+"-00000001", num:1}
    }

}

function calculeEnCours(reglements, mode)
{
    let tab = [{ montant: 0, impaye: 0 }], montant = 0, impaye = 0
    let dateAujourdhui =new Date()
    for (let item of reglements)
    {
        if(item.situationReglement != null)
        {
            if(item.modeReglement.enCours == "true" && item.situationReglement.encaisse == "non")
            {
                montant += item.montant
                tab[0].montant = montant
            }
            if(item.situationReglement.encaisse == "non" && item.situationReglement.type == "impaye" && item.dateEcheance <= dateAujourdhui)
            {
                impaye += item.montant
                tab[0].impaye = impaye
            }
        }
    }
    return tab
}

module.exports.validateCodeRaisonSocialeMatriculeFiscale=validateCodeRaisonSocialeMatriculeFiscale
module.exports.validateCodeRaisonSocialeMatriculeFiscaleModifier=validateCodeRaisonSocialeMatriculeFiscaleModifier
module.exports.getNumeroAutomatique=getNumeroAutomatique
module.exports.getNumeroAutomatiqueClient=getNumeroAutomatique
module.exports.Client=Client
module.exports.validateClient=validateClient
module.exports.calculeEnCours=calculeEnCours
