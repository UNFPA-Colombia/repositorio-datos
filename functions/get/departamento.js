const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schemaQ = Joi.object().keys({
        municipios: Joi.boolean().default(false),
    }).default({})
    const schemaP = Joi.object().keys({
        divipola: Joi.string().length(5).required(),
    }).required()
    try {
        const resultQ = schemaQ.validate(event.queryStringParameters ? event.queryStringParameters : {})
        if (resultQ.error) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: resultQ.error.details[0].message })
            }
        }
        const resultP = schemaP.validate(event.pathParameters)
        if (resultP.error) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: resultP.error.details[0].message })
            }
        }
        const departamento = await prisma.territorios.findFirstOrThrow({
            where: {
                tipo: 'Departamento',
                divipola: resultP.value.divipola,
            },
            include: { inferiores: resultQ.value.municipios }
        })
        if (resultQ.value.municipios) {
            departamento.municipios = departamento.inferiores
            delete departamento.inferiores
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(departamento)
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.name === 'NotFoundError') {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Un departamento con esta divipola no existe'
                    })
                }
            }
        }
        console.error(error)
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(error)
        }
    }
}