const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.array().items(
        Joi.object({
            nombre: Joi.string().min(2).max(255).required(),
            divipola: Joi.string().length(5).required(),
        }).required()
    ).required()
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
        const createdDepartamentos = await prisma.territorios.createMany({
            data: value.map(d => ({
                nombre: d.nombre,
                divipola: d.divipola,
                tipo: 'Departamento',
            })),
            skipDuplicates: true,
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdDepartamentos)
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