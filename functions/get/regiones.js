const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.object().keys({
        municipios: Joi.boolean().default(false),
    }).required()
    try {
        const { value, error } = schema.validate(event.queryStringParameters ? event.queryStringParameters : {})
        if (error) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.details[0].message })
            }
        }
        const regiones = await prisma.territorios.findMany({
            where: { tipo: 'Región PDET' },
            include: { inferiores: value.municipios }
        })
        regiones.forEach(region => {
            region.municipios = region.inferiores
            delete region.inferiores
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regiones)
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(error)
        }
    }
}