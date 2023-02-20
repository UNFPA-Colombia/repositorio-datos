const bcrypt = require("bcryptjs");
const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

module.exports.handler =  async (event, context, callback) => {
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(40).required(),
        name: Joi.string().min(2).max(30).required(),
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
    const passwordHash = await bcrypt.hash(value.password, 8);

    try {

        const createdUser = await prisma.usuarios.create({
            data: {
                email: value.email,
                passwordHash: passwordHash,
                nombre: value.name,
                rol: 'USER',
            }
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdUser)
        }
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return {
                    statusCode: 409,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Un usuario con este correo ya existe'
                    })
                }
            }
        }
        console.error(e)
        return { statusCode: 500 }
    }
};