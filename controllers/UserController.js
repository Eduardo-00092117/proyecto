const mongoose = require('mongoose'); //libreria para el manejo a la conexion de bases de datos
const User = require("../models/users"); //modelo usuarios.
const AuthController = {}; // objeto que tendra la logica de nuestra web
const bcrypt = require('bcrypt'); //libreria para encriptar

/*nos devuelve la vista signin que es para ingresar al sistema */
AuthController.inicio = function (req, res, next) {
    res.render('inicioNormal'); //
}

/*nos devuelve la vista signin que es para ingresar al sistema */
AuthController.login = function (req, res, next) {
    res.render('login'); //
}

/*nos devuelve la vista signiup para crear al usuario*/
AuthController.create = function (req, res, next) {
    res.render('registrar')
}

/*nos devuelve la vista pedirCorreo para crear al usuario*/
AuthController.formCorreo = function (req, res, next) {
    res.render('pedirCorreo')
}

/*nos devuelve la vista pedriClave para crear al usuario*/
AuthController.formClave = function (req, res, next) {
    res.render('pedirClave')
}

/*nos devuelve la vista cambiarContra para crear al usuario*/
AuthController.formContra = function (req, res, next) {
    res.render('cambiarContra')
}

/*Para crear el usuario*/
AuthController.store = async function (req, res) {
    //obteniendo los datos del usuario
    let user = {
        nombres: req.body.name,
        apellidos: req.body.last,
        correo: req.body.email,
        pass: req.body.pass,
        tipo: req.body.group1,
        numTarjeta: req.body.numT,
        codSeguridad: req.body.codT,
        fechaVencimiento: req.body.fechaT,
        tipoPago: req.body.group2
    }
    var email = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
    if (req.body.pass != req.body.pass2) {
        let dato1 = {
            error: 'Las contraseñas deben coincidir',
            pagina: 'registrar'
        }
        //parseamos el objeto json a cadena y lo alamcenamos en la variable session
        req.session.user = JSON.stringify(dato1);
        return res.render('error');
    } else if (!email.test(req.body.email)) {
        let dato1 = {
            error: 'El correo tiene formato incorrecto!!!!',
            pagina: 'registrar'
        }
        //parseamos el objeto json a cadena y lo alamcenamos en la variable session
        req.session.user = JSON.stringify(dato1);
        return res.render('error');
    } else {
        /*alamcenando el usuario*/
        await User.create(user, (error, user) => {
            if (error) // si se produce algun error
                //Devolvemos una vista con los mensajes de error
                return res.render('signup', { err: error, correo: user.correo });
            else {
                //Almacenamos los datos de la consulta en el objeto data
                let data = {
                    idUsuario: user._id.toString(),
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    correo: user.correo,
                    pass: user.pass,
                    tipo: user.tipo,
                    numTarjeta: user.numTarjeta,
                    codSeguridad: user.codSeguridad,
                    fechaVencimiento: user.fechaVencimiento,
                    tipoPago: user.tipoP,
                }
                //hash es el mé que nos permite encriptar el password
                //con 10 le indicamos cuantas veces realizara la encriptación
                bcrypt.hash(data.idUsuario, 10, function (err, hash) {
                    if (err) { //si produce un error
                        next(err); // retornaremos el error
                    }

                    data.idUsuario = hash; // almacenamos la password encriptada
                    //parseamos el objeto json a cadena y lo alamcenamos en la variable session
                    req.session.user = JSON.stringify(data);
                    console.log(req.session.user);
                    //nos dirigira a la pagina donde se encuentra el perfil del usuario
                    return res.redirect('/drive/inicioNormal');
                });
            }
        })
    }

};

/*nos dirigira al inicio del usuario normal (NORMAL O PREMIUM) */
AuthController.profile = function (req, res) {
    return res.render('inicioNormal');
}

/*Para ingresar al sistema*/
AuthController.signin = function (req, res, next) {
    var data = {};
    //user autentication es el metodo que nos permitira ingresar al sistema
    User.authenticate(req.body.email, req.body.pass, (error, user) => {
        if (error || !user) {
            let dato1 = {
                error: 'El usuario o contraseña son incorrectas!!',
                pagina: '/'
            }
            //parseamos el objeto json a cadena y lo alamcenamos en la variable session
            req.session.user = JSON.stringify(dato1);
            return res.render('error');
        }
        else {
            data.idUsuario = user._id.toString(),
                data.correo = user.correo,
                data.pass = user.pass

            //este método nos encriptara el userId para que sea alamcenado en la sesion
            bcrypt.hash(data.idUsuario, 10, function (err, hash) {
                if (err) {
                    next(err);
                }
                data.idUsuario = hash;
                //parseamos el objeto a cadena
                req.session.user = JSON.stringify(data);
                //si es correcto nos dirigira al perfil del usuario que esta ingresando.
                console.log(data.correo);
                return res.redirect('/drive/inicioNormal');
            });

        }
    });
};


AuthController.logout = function (req, res, next) {
    if (req.session) { //si la session existe
        req.session.destroy(function (err) { // destruimos la sesion
            if (err) { // si produce un error
                next(err);
            }
            else { //si la sesion se destruyo nos dirigira al index
                res.redirect('/');
            }
        });
    }
}


module.exports = AuthController;
