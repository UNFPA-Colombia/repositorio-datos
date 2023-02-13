const { Prisma, PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.handler = async (event, context, callback) => {
    try {
        const data = JSON.parse(event.body)
        const createdDepartamentos = await prisma.departamentos.createMany({
            data: data,
            skipDuplicates: true,
        })
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdDepartamentos)
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientRequestError) {
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