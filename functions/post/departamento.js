const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.object({
        nombre: Joi.string().min(2).max(255).required(),
        divipola: Joi.string().length(5).required(),
    }).required()
    try {
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
        const createdDepartamento = await prisma.territorios.create({ 
            data: {
                nombre: value.nombre,
                divipola: value.divipola,
                tipo: 'Departamento',
            }
         })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdDepartamento)
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return {
                    statusCode: 409,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Un departamento con esta divipola ya existe'
                    })
                }
            }
        }
        console.error(e)
        return { statusCode: 500 }
    }
}