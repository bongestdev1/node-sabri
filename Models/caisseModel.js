const mongoose = require('mongoose')
const Joi = require('joi')
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema
const Schema1 = mongoose.Schema

const schemaCaisse = mongoose.Schema({
  libelle: { type: String, default: "" },
  societeRacine: { type: Schema.Types.ObjectId, ref: 'Societe', default: 'null' },
},
  {
    timestamps: true
  },
)

schemaCaisse.plugin(mongoosePaginate);

schemaCaisse.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Caisse = mongoose.model('Caisse', schemaCaisse)

module.exports.Caisse = Caisse
