const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var multer = require("multer");
const fs = require("fs");
var dateFormat = require("dateformat");
const { Liltrage } = require("../Models/liltrageModel");
var ObjectId = require("mongodb").ObjectID;

router.get("/getliltrage", async (req, res) => {
  var pipeline = [];
  pipeline.push({
    $project: {
      _id: 1,
      reglement: 1,
      document: 1,
      montantAPayer:1,
    },
  });
  var rslt = await Liltrage.aggregate(pipeline);
  console.log(rslt);
  res.send({ rslt: rslt });
});

module.exports.routerLiltrage = router;
