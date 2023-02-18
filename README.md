# Funciones serverless de los repositorios de datos del UNFPA Colombia
Este repositorio contiene el esquema de datos y las funciones serverless de los repositorios de datos del UNFPA, que se encuentran alojados en una base de datos relacional.

## Modelo de datos
El modelo de datos se encuentra en el archivo [`schema.prisma`](https://github.com/UNFPA-Colombia/repositorio-datos/blob/c4224caa498f94859562b9a40571209c945a05f1/prisma/schema.prisma).

## Despliegue

Para hacer el despliegue se debe clonar el repositorio, instalar las dependencias por medio de `npm install` y crear un archivo `.env` con la variable de ambiente `DATABASE_URL` que contenga la dirección a la base de datos ([ver más](https://www.prisma.io/docs/guides/development-environment/environment-variables#example-set-the-database_url-environment-variable-in-an-env-file)).

También se debe hacer log in a *Serverless* -debe estar instalado (`npm install -g serverless`)- y modificar la primera linea del archivo `serverless.yml` para incluir la organización adecuada ([ver más](https://www.serverless.com/framework/docs/guides/dashboard#enabling-the-dashboard-on-existing-serverless-framework-services)).

https://github.com/UNFPA-Colombia/repositorio-datos/blob/a355c8f387c14e9f291e92d79968e2fedc42f00c/serverless.yml#L1

Posteriormente se debe ejecutar el comando `prisma generate` para generar el modelo y si se han hecho cambios se debe ejecutar `npx prisma db push` para sincronizar el modelo con la base de datos. 

Finalmente se hace el despliegue por medio del comando `serverless deploy` o `npx serveless deploy` si *Serverless* no se instaló globalmente.

## Nueva base de datos
Para configurar este modelo en una nueva base de datos se deben seguir los mismos pasos del despliegue y adicionalmente agrgegar la información de los territorios haciendo uso de las funciones.
