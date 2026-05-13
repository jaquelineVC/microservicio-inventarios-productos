# Microservicio — Inventarios & Productos API

Sistema de microservicios con arquitectura limpia, replicación MySQL y procesos de segundo plano.

## Tecnologías

| Componente | Tecnología |
|---|---|
| API Inventarios | .NET 8 + Clean Architecture |
| API Productos | NestJS 11 + Clean Architecture |
| Base de datos | MySQL 8.0 (Master x2 + Réplica) |
| Contenedores | Docker + Docker Compose |
| Autenticación | JWT |
| Segundo plano |@Cron (NestJS) |
| Patrón | CQRS + Cross Cutting |

## Requisitos

- Docker Desktop instalado y corriendo
- Git
- Puerto 8080, 3001, 3306, 3307, 3308 disponibles

## Levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/jaquelineVC/microservicio-inventarios-productos.git
cd microservicio-inventarios-productos.git

# 2. Levantar todos los servicios
docker compose up --build -d

# 3. Verificar que todo esté corriendo
docker compose ps
```

## Servicios disponibles

| Servicio | URL |
|---|---|
| API Inventarios (.NET) | http://localhost:8080 |
| API Productos (NestJS) | http://localhost:3001 |
| MySQL Master Inventarios | localhost:3306 |
| MySQL Master Productos | localhost:3307 |
| MySQL Réplica (solo lectura) | localhost:3308 |

## Arquitectura de Base de Datos
API .NET  ──IUD──► MySQL Master 1 (inventarios_db :3306)
│
API NestJS──IUD──► MySQL Master 2 (productos_db   :3307)
│
MySQL Réplica  (solo SELECT    :3308)
▲           ▲
SELECT │           │ SELECT
API .NET            API NestJS

## Procesos de Segundo Plano

### API NestJS — Verificador de stock crítico
- Frecuencia: cada 5 minutos
- Acción: alerta si `stock < 5` unidades
- Lee de la réplica (CQRS — Query Side)
- Si réplica caída → 404 controlado, nunca 500

## Replicación MySQL

La replicación inicia automáticamente al levantar los contenedores.
El servicio `replication-setup` configura Master → Réplica sin intervención manual.


## Pruebas

### API Inventarios (.NET)
```bash
cd Inventarios.Api
dotnet test
```

### API Productos (NestJS)
```bash
cd Inventarios.Api.Nest/productos.api
npm run test:cov
```

## Seguridad implementada

- ✅ JWT Authentication
- ✅ Rate Limiting (DDoS protection)
- ✅ BCrypt password hashing (work factor 12)
- ✅ Security Headers (XSS, Clickjacking, MIME sniffing)
- ✅ SQL Injection detection y descarte
- ✅ Request sanitization
- ✅ Bloqueo progresivo por intentos fallidos
- ✅ Cross Cutting — manejo global de excepciones

## Estructura del proyecto
├── Inventarios.Api/          # API .NET 8
│   ├── Inventarios.api/      # Presentación
│   ├── Inventarios.api.Application/
│   ├── Inventarios.api.Domain/
│   └── Inventarios.api.Infraestructure/
├── Inventarios.Api.Nest/     # API NestJS 11
│   └── productos.api/
│       ├── src/
│       │   ├── domain/
│       │   ├── application/
│       │   ├── infrastructure/
│       │   └── presentation/
│       └── test/
├── mysql/                    # Configuración MySQL
│   ├── master/
│   ├── master-productos/
│   ├── replica/
│   └── init/
└── docker-compose.yml

## Autor

Diana Jaqueline Carbajal Guevara  
Instituto Tecnológico de Durango  
Materia: Tópicos Avanzados de Aplicaciones