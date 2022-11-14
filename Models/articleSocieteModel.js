const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema

const schemaArticleSociete=mongoose.Schema({
    
    article:{type: Schema.Types.ObjectId, ref: 'Article'},
    societe:{type: Schema.Types.ObjectId, ref: 'Societe'},

    enVente:{type:String, default: ""},
    enAchat:{type:String, default: ""},

    enBalance:{type:String, default: ""},
    enPromotion:{type:String, default: ""},
    enNouveau:{type:String, default: ""},
    enDisponible:{type:String, default: ""},
    enArchive:{type:String, default: ""},
    enVedette:{type:String, default: ""},
    enLiquidation:{type:String, default: ""},

    qteTheorique:{type:Number, default: 0},
    qteEnStock:{type:Number, default: 0},

    seuilAlerteQTS:{type:Number, default: 0},
    seuilRearpQTS:{type:Number, default: 0},

    venteAvecStockNegative:{type:String, default: "non"},
    
    stockMax :{type:Number, default: 0},
   
    prixRevientInitial:{type:Number,default: 0},
    qteInitial:{type:Number,default: 0},
    
    stocks:[{   
        sousProduit:{type:String, default: ""},
        qteEnStock:{type:Number, default: 0},
        unite:{type:String, default: 0},
        lot:{type:String, default: ""},
        isSerie:{type:String, default: ""},
    }],
},
{ timestamps: true })

schemaArticleSociete.plugin(mongoosePaginate);

schemaArticleSociete.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ArticleSociete=mongoose.model('ArticleSociete',schemaArticleSociete)

async function updateQteEnStock(newArticle, typeOperation){
    var quantite = 0
    if(newArticle.quantiteVente == undefined){
        quantite = newArticle.quantiteAchat
    }else{
        quantite = newArticle.quantiteVente
    }

    let articles = await ArticleSociete.find({article:newArticle.article, societe: newArticle.societe})
    let article = articles[0]
    if(article == undefined)
    {
        return
    }    
    if(typeOperation == "moin"){
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) - Number(quantite)})
    }else{
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) + Number(quantite)})
    }
    
}

async function updateQteTherique(newArticle, typeOperation){
    var quantite = 0
    if(newArticle.quantiteVente == undefined){
        quantite = newArticle.quantiteAchat
    }else{
        quantite = newArticle.quantiteVente
    }

    let articles = await ArticleSociete.find({article:newArticle.article, societe: newArticle.societe})
    let article = articles[0]
    if(article == undefined)
    {
        return
    }
    if(typeOperation == "moin"){
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteTheorique:Number(article.qteTheorique) -  Number(quantite)})
    }else{
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteTheorique:Number(article.qteTheorique) +  Number(quantite)})
    }

}

async function updateQteTheriqueQteEnStock(newArticle, typeOperationEnStock, typeOperationTheorique){
    console.log(newArticle.quantiteVente == undefined)
     
    var quantite = 0
    if(newArticle.quantiteVente == undefined){
        quantite = newArticle.quantiteAchat
        console.log(quantite)
    }else{
        quantite = newArticle.quantiteVente
    }

    let articles = await ArticleSociete.find({article:newArticle.article, societe: newArticle.societe})
    let article = articles[0]
    if(article == undefined)
    {
        return
    }
    if(typeOperationEnStock == "moin" && typeOperationTheorique == "moin"){
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) - Number(quantite),  qteTheorique:Number(article.qteTheorique) -  Number(quantite)})
    }else if(typeOperationEnStock == "moin" && typeOperationTheorique != "moin"){
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) - Number(quantite),  qteTheorique:Number(article.qteTheorique) +  Number(quantite)})
    }else if(typeOperationEnStock != "moin" && typeOperationTheorique == "moin"){
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) + Number(quantite),  qteTheorique:Number(article.qteTheorique) -  Number(quantite)})
    }else{
        article = await ArticleSociete.findOneAndUpdate({_id:article.id}, {qteEnStock:Number(article.qteEnStock) + Number(quantite),  qteTheorique:Number(article.qteTheorique) + Number(quantite)})
    }

}

module.exports.updateQteTheriqueQteEnStock = updateQteTheriqueQteEnStock
module.exports.updateQteTherique = updateQteTherique
module.exports.updateQteEnStock = updateQteEnStock
module.exports.ArticleSociete = ArticleSociete
