const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.object().keys({
        departamento: Joi.boolean().default(false),
        regiones: Joi.boolean().default(false),
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
        const municipios = await prisma.territorios.findMany({
            where: { tipo: 'Municipio' },
            include: { superiores: (value.departamento || value.regiones) }
        })
        municipios.forEach(municipio => {
            if (value.departamento) {
                municipio.departamento = municipio.superiores.find(superior => superior.tipo === 'Departamento')
            }
            if (value.regiones) {
                municipio.regiones = municipio.superiores.filter(superior => superior.tipo === 'RegionPDET')
            }
            delete municipio.superiores
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(municipios)
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