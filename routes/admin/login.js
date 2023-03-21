var express = require('express');//ok
var router = express.Router();//ok
var usuariosModel = require('./../../models/usuariosModel');// ./../../models/usuariosModel

router.get('/', function (req, res, next) {
    res.render('admin/login', {
        layout: 'admin/layout'
    });//ok
});

router.get('/logout', function (req, res, next) {
    req.session.destroy(); //Destruyo sesion
    res.render('admin/login', { //mandame a login
        layout: 'admin/layout'
    });
})

router.post('/', async (req, res, next) => {
    try {

        console.log(req.body);//Es solopara probar que se comunique ok
        var usuario = req.body.usuario;
        var password = req.body.password;

        var data = await usuariosModel.getUserAndPassword(usuario, password);

        if (data != undefined) {
            req.session.id_usuario = data.id; //Estos son los nombres de las columnas de BD
            req.session.nombre = data.usuario;
            res.redirect('/admin/novedades');
        } else {
            res.render('admin/login', {
                layout: 'admin/layout',
                error: true //De esta forma Habilito el ERROR
            })
        }//Cierre else
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;//todo "".js" siempre terminan con codigo de exprtacion
