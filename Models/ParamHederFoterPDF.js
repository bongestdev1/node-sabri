const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaParamPDF=mongoose.Schema({
    nomsociale:{type:String,default: ""},
    adresseEmail:{type:String,default: ""},
    numTel1:{type:String,default: ""},
    numTel2:{type:String,default: ""},
    numFax:{type:String,default: ""},
    adresse:{type:String,default: ""},
    matriculefisc:{type:String,default: ""},
    rib:{type:String,default: ""},
    name:{type:String,default: ""},
    imagePath: { type: String,default: "" },
    societe:{type:Schema.Types.ObjectId, ref: 'Societe',default: 'null'},
  
    },
    { timestamps: true }
)

schemaParamPDF.plugin(mongoosePaginate);

schemaParamPDF.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const ParamPDF = mongoose.model('ParamPDF',schemaParamPDF)

function validateParamPdf(ParamPDF){
    let schema = Joi.object({
        nomsociale:Joi.string().allow('', null),
        adresseEmail:Joi.string().allow('', null),
        numTel1:Joi.string().allow('', null),
        numTel2:Joi.string().allow('', null),
        numFax:Joi.string().allow('', null),
        adresse:Joi.string().allow('', null),
        matriculefisc:Joi.string().allow('', null),
        rib:Joi.string().allow('', null),
        name:Joi.string().allow('', null),
        imagePath:Joi.string().allow('', null),
    })
    return schema.validate(ParamPDF)
}
module.exports.ParamPDF=ParamPDF
module.exports.validateParamPdf=validateParamPdf
