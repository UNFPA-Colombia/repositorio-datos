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
        const departamentos = await prisma.territorios.findMany({
            where: { tipo: 'Departamento' },
            include: { inferiores: value.municipios }
        })
        departamentos.forEach(departamento => {
            departamento.municipios = departamento.inferiores
            delete departamento.inferiores
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(departamentos)
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