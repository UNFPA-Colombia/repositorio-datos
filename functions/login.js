const bcrypt = require("bcryptjs");
const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')
const jwt = require('jsonwebtoken');

// POST /login
module.exports.handler =  async (event, context, callback) => {
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    }).required()

    const { error, value } = schema.validate(JSON.parse(event.body))
    if (error) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: error.details[0].message
            })
        }
    }

    try {
        const user = await prisma.usuarios.findUnique({
            where: {
                email: value.email
            }
        })
        if (!user) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Usuario no encontrado'
                })
            }
        }
        const passwordValid = await bcrypt.compare(value.password, user.passwordHash);
        if (!passwordValid) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Contraseña incorrecta'
                })
            }
        }
        const token = jwt.sign({ id: user.id, role: user.rol, name: user.nombre, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auth: true, token: token })
        }
    }
    catch (e) {
        console.error(e)
        return { statusCode: 500 }
    }
}
