const User = require("../models/users");
const bcrypt = require("bcrypt");
const AuthMiddleware = {};

//middleware que verifica si una persona esta logueada
AuthMiddleware.isAuthentication = function (req, res, next) {
    if (!req.session.user) // verificamos is existe la session
    {
        return res.redirect('/'); //redirigimos al index si esto no es posible
    }
    //si existe la sesion parsea el contenido
    data = JSON.parse(req.session.user);
    User.findOne({ correo: data.correo })
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            else {
                if (!user) {
                    return res.redirect('/');
                }
                else {
                    bcrypt.compare(data.idUsuario, user._id.toString(), function (err, result) {
                        console.log("llego aca", data.idUsuario);
                        if (result == true) {
                            return next();
                        }
                        else {
                            return next(err);
                        }
                    });
                }
            }
        });
};

module.exports = AuthMiddleware;