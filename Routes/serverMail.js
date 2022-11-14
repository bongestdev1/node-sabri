require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express')
const router = express.Router()
const { Utilisateur, validateUtilisateur, validateNewPassowrd, validateLogin, validateModifierMotPasse } = require('../Models/utilisateurModel')


const jwt = require('jsonwebtoken');
const { consolelog } = require('../Models/errorModel');


//Step 1
let transporter = nodemailer.createTransport({
  host: 'serv7.zenhosting.info',
  port: '587',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})


router.post('/emailMotPasseEmail', async (req, res) => {
  try{
  //step 2
  const { error } = validateModifierMotPasse(req.body)
  if (error) return res.send({ status: false, message: error.details[0].message })

  let user = await Utilisateur.findOne({ email: req.body.email })

  if (user == null) {
    return res.send({ status: false })
  }

  let codeModificationString = ""
  let ok = false
  while (!ok) {
    let nbrActivation1 = "00"
    for (let i = 0; i < 4; i++) {
      nbrActivation1 += (Math.floor(Math.random() * 100000000000) + 900000000000) + "";
    }
    codeModificationString = nbrActivation1 + ""

    let users = await Utilisateur.findOne({ codeForgotPassword: codeModificationString })

    if (users == null) {
      ok = true
    }
  }

  await Utilisateur.findByIdAndUpdate(user.id, { codeForgotPassword: codeModificationString })

  let url = req.body.baseUrl + "/" + codeModificationString;

  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Nouveau mot de passe",
    html: ` 
          <div style='text-align:center;'> 

            <span style="font-size:20px; padding:5px; font-weight:700; width:100%;"> Bonjour !! </span> 
            <br> 
            <span style="color:#fe5723; font-size:17px; padding:5px; font-weight:500; width:100%;"> Bienvenue </span> <br> 
       
            <p>Nous avons récemment reçu une demande de récupération du compte ${req.body.email}. </p>
            <p> Si vous ne vous êtes pas connecté récemment, vous devez immédiatement modifier votre mot de passe.</p>

            <button style=" background-color: #fe5723; /* Green */
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px; border-radius:25px;">

            <a style='font-size:15px; padding:5px; font-weight:500; color:white;' href="${url}" > Cliquez ici pour modifier votre Mot de passe !!</a> 
            </button> 
          </div>`
  }

  // Step  3
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      return res.send({ status: false })
    } else {
      return res.send({ status: true })
    }
  })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})



router.post('/emailValidation', async (req, res) => {

  try{
  var message = " Bonjour :" + req.body.nom + " \r\n Bienvenue  \r\n SVP, validez votre compte par c'est url : " + req.body.url;

  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Validation",
    html: ` <div style='text-align:center;'> <span style="font-size:20px; padding:5px; font-weight:500; width:100%;"> Bonjour ${req.body.nom}! </span> <br> <span style="font-size:17px; padding:5px; font-weight:500; width:100%;"> Bienvenue </span> <br> <button> <a style='font-size:15px; padding:5px; font-weight:500;' href=${req.body.url} > Valider Votre Compte </a> </button> </div>`
  }

  // Step  3
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      return res.send({ status: false })
    } else {
      return res.send({ status: true })
    }
  })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}

})

router.post('/emailValidation', async (req, res) => {

  try{
  var message = " Bonjour :" + req.body.nom + " \r\n Bienvenue  \r\n SVP, validez votre compte par c'est url : " + req.body.url;

  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Validation",
    html: ` <div style='text-align:center;'> <span style="font-size:20px; padding:5px; font-weight:500; width:100%;"> Bonjour ${req.body.nom}! </span> <br> <span style="font-size:17px; padding:5px; font-weight:500; width:100%;"> Bienvenue </span> <br> <button> <a style='font-size:15px; padding:5px; font-weight:500;' href=${req.body.url} > Valider Votre Compte </a> </button> </div>`
  }

  // Step  3
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      return res.send({ status: false })
    } else {
      return res.send({ status: true })
    }
  })

} catch (e) {
    consolelog(e) 
    
  // statements to handle any exceptions
  console.log(e)
  return res.send({ status: false }) // pass exception object to error handler
}
})

async function envoyerEmail(emails, pathDevis) {

  let mailOptions = {
    from: process.env.EMAIL,
    to: emails,
    subject: "Demande offre de prix",
    html: ` <p>Bonjour</p>
            <p>Je vous remercie d'envoyer votre proposition de tarif pour les produits dans cet document en pièce jointe.</p>`,
    attachments: [
      {
        filename: 'produits.pdf',
        path: pathDevis,
        contentType: 'application/pdf'
      }
    ]
  }

  // Step  3
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log("err =====", err)
        resolve(false);
      } else {
        console.log("data =====", data)
        resolve(true);
      }
    })
  })

}


function verifytoken(req, res, next) {

  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, 'secretkey', (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.user = authData;
        next();
      }
    });

  } else {
    res.sendStatus(401);
  }

}

module.exports.envoyerEmail = envoyerEmail
module.exports.routerServerMail = router
