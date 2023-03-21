var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var novedadesModel = require('../models/novedadesModels');
var cloudinary = require('cloudinary').v2;


/* GET home page. */
router.get('/', async function (req, res, next) {
  var novedades = await novedadesModel.getNovedades()

  novedades = novedades.splice(0, 5);//Selecciono los 5 primeros elementos del array.
  novedades = novedades.map(novedad => {
    if (novedad.img_id) {
      const imagen = cloudinary.url(novedad.img_id, {
        width: 460,
        crop: 'fill'
      });
      return {
        ...novedad,//Traigo Titulo, subtitulo y Detalle
        imagen//Traigo imagen
      }
    } else {
      return {
        ...novedad,//Traigo Titulo, subtitulo y Detalle
        imagen: '/images/Imagen_no_disponible.jpg'//Link de NO IMAGEN
      }
    }
  })

  res.render('index', {
    novedades
  });
});


router.post('/', async (req, res, next) => {

  console.log(req.body) //¿Estoy capturando datos?

  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  var email = req.body.email;
  var mensaje = req.body.mensaje;
  var telefono = req.body.telefono;

  var obj = {
    to: 'gabogaleano@gmail.com',
    subjet: 'Contacto',
    html: nombre + " " + apellido + " " + " // " + email + " // " + telefono + " // " + mensaje + ".-"
  }//Cierro var obj

  var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }) //Cierro Transporter

  var info = await transporter.sendMail(obj);

  res.render('index', {
    message: 'Mensaje enviado correctamente',
  })
})//Cierro Peticion del POST

module.exports = router;
