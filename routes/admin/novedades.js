var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModels');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

/*Listar las novedades*/
router.get('/', async function (req, res, next) {

    var novedades = await novedadesModel.getNovedades();

    novedades = novedades.map(novedad => {
        if (novedad.img_id) {
            const imagen = cloudinary.image(novedad.img_id, {
                width: 80,
                heigth: 80,
                crop: 'fill'
            });
            return {
                ...novedad,//Traigo Titulo, subtitulo y Detalle
                imagen//Traigo imagen
            }
        } else {
            return {
                ...novedad,//Traigo Titulo, subtitulo y Detalle
                imagen: ''//No traigo nada
            }
        }
    })

    res.render('admin/novedades', {
        layout: 'admin/layout',
        persona: req.session.nombre,
        novedades
    });
});


/*Eliminar Novedad*/
router.get('/eliminar/:id', async (req, res, next) => {
    const id = req.params.id;

    let novedad = await novedadesModel.getNovedadById(id);
    if(novedad.img_id) {
        await (destroy(novedad.img_id));
    }

    await novedadesModel.deleteNovedadesById(id);
    res.redirect(`/admin/novedades`)
});

/*Agregar Novedad*/
router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    })
});

/*Insertamos la novedad en la BD*/
router.post('/agregar', async (req, res, next) => {
    try {
        /*Declaramos como trabaja el bloque de la IMG*/
        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }
        /*Esto es una validacion en donde pido que haya algo en titulo, subtitulo y detalle*/
        if (req.body.titulo != "" && req.body.subtitulo != "" && req.body.detalle != "") {
            /*Si se da esta condicion me comunico con novedades y traigo funcion insertar, enviando todos los datos (req, body)*/
            await novedadesModel.insertNovedades({
                ...req.body,
                img_id
            });
            /*Guarda la info recibida y mostralo en el listado*/
            res.redirect('/admin/novedades')
            /*En el caso de no cumplirse lo anterior, tenemos lo siguiente*/
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos'
            })
        }
    } catch (error) {
        console.log(error)
        res.render('admin/agregar'), {
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo la novedad'
        }
    }
})

/*Diseño de modificar + traer la novedad elegida*/
router.get('/modificar/:id', async (req, res, next) => {
    /*Traigo informacion del ID*/
    var id = req.params.id;
    /*Me comunico con el modelo x el ID*/
    var novedad = await novedadesModel.getNovedadById(id)
    res.render('admin/modificar', {
        layout: 'admin/layout',
        /*Traigo Novedad y lo paso al Render asi lo imprimir en cada campo*/
        novedad
    });
});

/*Actualizar las novedades*/
router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;

        if (req.body.img_delete === "1") {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0) {
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original){
            await (destroy(req.body.img_original));
        }
        //console.log(req.body.id); //Para ver si trae id.
        var obj = {
            titulo: req.body.titulo,
            subtitulo: req.body.subtitulo,
            detalle: req.body.detalle,
            img_id
        }
        console.log(obj) //Para ver si trae los datos
        await novedadesModel.modificarNovedadById(obj, req.body.id);
        res.redirect('/admin/novedades');
    } catch (error) {
        console.log(error)
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modifico la Novedad'
        })
    }
});


module.exports = router;
