# Clientes BDB Backend

API REST para gestión de clientes bancarios con **Express.js**, **TypeORM** y **PostgreSQL**.

## Construcción

```bash
npm install       # Instalar dependencias
npm run build     # Compilar TypeScript a JavaScript
```

## Ejecución

### Development
```bash
npm run dev       # Hot-reload con nodemon (puerto según .env.dev)
```

### Production
```bash
npm run prod      # Build + ejecutar compilado
# o
npm start         # Alias de npm run prod
```

## Estructura del Proyecto

```
src/
├── app.ts                 # Punto de entrada
├── server.ts              # Configuración Express
├── ormconfig.ts           # Configuración TypeORM
├── handler.ts             # Handler para AWS Lambda
├── config/
│   └── swagger.ts         # Configuración Swagger/OpenAPI
├── entities/
│   └── Customer.ts        # Modelo de datos
├── modules/customers/
│   └── customer.controller.ts  # Lógica CRUD y validaciones
└── routes/
    └── customers.ts       # Endpoints REST
terraform/                 # Infraestructura como código (AWS)
tests/                     # Tests unitarios
```

## Componentes Principales

| Componente | Descripción |
|------------|-------------|
| **Express** | Servidor HTTP y routing |
| **TypeORM** | ORM para PostgreSQL |
| **Customer Entity** | Modelo de cliente con validaciones |
| **Swagger** | Documentación API en `/api-docs` |
| **AWS Lambda** | Deploy serverless via `handler.ts` |

## Pruebas

```bash
npm test          # Ejecutar tests con Jest
```

## CI/CD

El pipeline (`.github/workflows/deploy.yml`) se ejecuta en push a `main`:

1. **Build** - Compila TypeScript
2. **Package** - Empaqueta para Lambda
3. **Terraform** - Despliega infraestructura AWS (API Gateway, Lambda, RDS)

> **Nota:** Los cambios solo en archivos `.md` no disparan el deploy.
```

### Archivo `.env.prod` (Production)

```env
# Base de datos (usa host.docker.internal para Docker)
DB_HOST=host.docker.internal
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
DB_NAME=clientes_bdb

# Servidor y aplicación
APP_MODE=prod
APP_NAME=customers-prod
APP_LOG_MESSAGE=Ejecutando en PROD
SERVER_PORT=9090
```

### Descripción de variables

- **DB_HOST:** Host donde está corriendo PostgreSQL
- **DB_PORT:** Puerto de PostgreSQL (por defecto 5432)
- **DB_USERNAME:** Usuario de PostgreSQL
- **DB_PASSWORD:** Contraseña de PostgreSQL
- **DB_NAME:** Nombre de la base de datos
- **APP_MODE:** Modo de ejecución (`dev` o `prod`)
- **APP_NAME:** Nombre de la aplicación (usado en logs)
- **APP_LOG_MESSAGE:** Mensaje personalizado de inicio
- **SERVER_PORT:** Puerto donde escucha el servidor

---

## Despliegue con Docker

El proyecto incluye un `Dockerfile` para desplegar la aplicación en contenedores.

### Compilar imagen Docker

```bash
docker build -t clientes-bdb-backend .
```

### Ejecutar contenedor

```bash
docker run -p 9090:9090 \
  --env-file .env.prod \
  --network host \
  clientes-bdb-backend
```

---

## Flujo de Desarrollo Recomendado

1. **Durante desarrollo:** `npm run dev` - Desarrollo con reload automático
2. **Antes de commit:** `npm run build` - Verificar que compila sin errores
3. **Testing local:** `npm run prod` - Simular producción localmente
4. **Despliegue:** Usar Docker o servidor directo con `npm run prod`
