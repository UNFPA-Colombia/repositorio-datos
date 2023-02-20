const { PrismaClient, Prisma  } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.object({
        divipola: Joi.string().length(5).required(),
        nombre: Joi.string().min(2).max(255).required(),
        municipios: Joi.array().items(
            Joi.string().length(5)
        ).default([])
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
        const createdRegion = await prisma.territorios.create({ 
            data: {
                divipola: value.divipola,
                nombre: value.nombre,
                tipo: 'RegionPDET',
                inferiores: {
                    connect: value.municipios.map(m => ({ divipola: m }))
                },
            }
         })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({createdRegion})
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