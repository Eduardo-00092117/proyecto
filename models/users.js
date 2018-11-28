const mongoose = require('mongoose'); //Para manipular conexión y el manejo de la base de datos
const bcrypt = require('bcrypt'); // Para encriptar contraseñas

const { Schema } = mongoose; //Objeto Schema para realizar diferentes operaciones
const UserSchema = new Schema({
    //atributos con sus validaciones, explicitamente de mongoDB
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true},
    pass: { type: String, required: true },
    tipo: { type: String, required: true },
    numTarjeta: { type: String },
    codSeguridad: { type: Number },
    fechaVencimiento: { type: Date },
    tipoPago: { type: String }
});

UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ correo: email })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('Usuario no encontrado!!.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.pass, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback(new Error('Usuario o contraseña incorrectos!!'));
                }
            })
        });
}

UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.pass, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.pass = hash;
        next();
    })

    bcrypt.hash(user.numTarjeta, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.numTarjeta = hash;
        next();
    })
});

let User = mongoose.model('users', UserSchema);

module.exports = User;

