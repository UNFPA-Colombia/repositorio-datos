const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

exports.handler = async (event, context, callback) => {
    const schema = Joi.object().keys({
        municipios: Joi.boolean().default(false),
        divipola: Joi.string().length(5).required(),
    }).required()
    try {
        const { value, error } = schema.validate(event.queryStringParameters)
        if (error) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.details[0].message })
            }
        }
        const departamento = await prisma.territorios.findUnique({
            where: {
                tipo: 'Departamento',
                divipola: value.divipola,
            },
            include: { inferiores: value.municipios }
        })
        departamento.municipios = departamento.inferiores
        delete departamento.inferiores  
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