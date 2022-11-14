const mongoose=require('mongoose')
const Joi=require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaUser=mongoose.Schema({
        email: {type: String, default: "", unique: true},
        password: {type: String, default: ""},
        codeForgotPassword: {type: String, default: ""},
    },
    {
        timestamps: true 
    },
)

schemaUser.plugin(mongoosePaginate);

schemaUser.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const User=mongoose.model('User',schemaUser)

module.exports.User=User
