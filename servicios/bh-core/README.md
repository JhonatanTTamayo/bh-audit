# BH Core

Backend principal del sistema veterinario Breaze & Harold. Expone la API de autenticacion, usuarios, clientes, mascotas, citas, historial medico, vacunas, inventario, facturacion, reportes y comunicacion con auditoria.

La aplicacion esta construida con NestJS, Prisma y MySQL. Todas las rutas HTTP usan el prefijo global:

```text
/bh-core/v1
```

Swagger queda disponible en:

```text
/docs
```

## Tecnologias

- Node.js y NestJS 11.
- TypeScript.
- Prisma ORM.
- MySQL.
- JWT para autenticacion.
- Guards por rol.
- class-validator y class-transformer para DTOs.
- Nodemailer para correos.
- PDFKit para generacion de PDFs.
- Axios/fetch para integracion con `bh-audit`.

## Estructura principal

```text
src/
  app.module.ts
  main.ts
  basedatos/
    basedatos.module.ts
    prisma.service.ts
  modulos/
    audit/
    autenticacion/
    citas/
    clientes/
    correos/
    facturacion/
    historial-medico/
    inventario/
    mascotas/
    reportes/
    roles/
    usuarios/
    vacunas/
prisma/
  schema.prisma
  seed.js
  migrations/
test/
  app.e2e-spec.ts
```

## Configuracion

Crea un archivo `.env` en la raiz de `bh-core` tomando como base `.env.example`.

```env
PORT=3000
DATABASE_URL="mysql://usuario:password@localhost:3306/bh_core"
JWT_SECRET=
JWT_EXPIRES_IN=1d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@ejemplo.com
MAIL_PASS=password_app_o_clave_smtp
MAIL_FROM=correo@ejemplo.com

CLINIC_ADDRESS="Direccion de la sede principal"
BH_AUDIT_URL=http://localhost:8081/api/audit
BH_AUDIT_INTERNAL_KEY=
```

Notas:

- `DATABASE_URL` es usada por Prisma para conectarse a MySQL.
- `JWT_SECRET` debe definirse antes de usar autenticacion.
- `CLINIC_ADDRESS` se usa en correos de confirmacion de cita.
- `BH_AUDIT_URL` y `BH_AUDIT_INTERNAL_KEY` se usan para registrar eventos en el servicio de auditoria.

## Instalacion

```bash
npm install
```

## Base de datos

El esquema central esta en `prisma/schema.prisma`.

Modelos principales:

- `Usuario`, `Rol`, `CodigoVerificacion`.
- `Cliente`, `Mascota`.
- `Cita`, `CitaServicio`, `Pago`, `Servicio`.
- `HistorialMedico`, `MedicamentoPrescrito`, `Vacuna`.
- `Producto`.
- `Atencion`, `Factura`.

Comandos habituales:

```bash
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
```

## Ejecutar el proyecto

```bash
# desarrollo
npm run start

# desarrollo con watch
npm run start:dev

# produccion
npm run build
npm run start:prod
```

## Pruebas

```bash
# unitarias
npm run test

# e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Seguridad y roles

La autenticacion usa JWT. Los endpoints protegidos requieren:

```http
Authorization: Bearer <token>
```

Roles usados por el sistema:

- `ADMIN`
- `RECEPCIONISTA`
- `VETERINARIO`
- `CLIENTE`
- `SISTEMA`

Estados de usuario:

- `PENDIENTE_VERIFICACION`
- `PENDIENTE_APROBACION`
- `ACTIVO`
- `SUSPENDIDO`
- `RECHAZADO`

Reglas generales:

- Los administradores no se registran desde el endpoint publico de registro.
- Los usuarios `RECEPCIONISTA` y `VETERINARIO` quedan pendientes de aprobacion despues de verificar correo.
- Los usuarios `CLIENTE` quedan activos despues de verificar correo.
- El login exige correo verificado y estado `ACTIVO`.

## Modulo raiz

### AppModule

Archivo: `src/app.module.ts`.

Centraliza la carga de modulos:

- `BasedatosModule`
- `AutenticacionModule`
- `UsuariosModule`
- `RolesModule`
- `CorreosModule`
- `ClientesModule`
- `MascotasModule`
- `InventarioModule`
- `HistorialMedicoModule`
- `FacturacionModule`
- `CitasModule`
- `ReportesModule`
- `VacunasModule`
- `AuditModule`

### AppController

Endpoint de salud basico:

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/bh-core/v1` | Retorna `bh-core funcionando correctamente`. |

## Modulo Basedatos

Archivos:

- `src/basedatos/basedatos.module.ts`
- `src/basedatos/prisma.service.ts`

Responsabilidades:

- Registrar y exportar `PrismaService`.
- Abrir conexion con Prisma al iniciar el modulo.
- Cerrar conexion al destruir el modulo.

`PrismaService` extiende `PrismaClient`, por lo que los servicios pueden acceder a modelos como `usuario`, `cliente`, `producto`, `cita`, `factura`, etc.

## Modulo Autenticacion

Archivos:

- `src/modulos/autenticacion/autenticacion.controller.ts`
- `src/modulos/autenticacion/autenticacion.service.ts`
- `src/modulos/autenticacion/dto`
- `src/modulos/autenticacion/guards`
- `src/modulos/autenticacion/decoradores`

Responsabilidades:

- Registro de usuarios.
- Verificacion de correo por codigo de 6 digitos.
- Inicio de sesion con JWT.
- Proteccion de rutas mediante `JwtAuthGuard`.
- Control de roles mediante `RolesGuard` y decorador `@Roles()`.

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/auth/registro` | Publico | Registra usuario y envia codigo de verificacion. |
| `POST` | `/auth/verificar-correo` | Publico | Verifica el correo con codigo de 6 digitos. |
| `POST` | `/auth/login` | Publico | Valida credenciales y devuelve token JWT. |
| `GET` | `/auth/admin` | `ADMIN` | Prueba de acceso exclusivo para administradores. |

### DTOs

`RegistroUsuarioDto`:

- `nombreCompleto`
- `correo`
- `telefono`
- `contrasena`
- `rolId`

`VerificarCorreoDto`:

- `correo`
- `codigo`

`LoginDto`:

- `correo`
- `contrasena`

### Reglas de negocio

- El correo debe ser unico.
- El rol debe existir.
- El endpoint publico no permite crear usuarios con rol `ADMIN`.
- La contrasena se almacena con hash bcrypt.
- El codigo de verificacion expira en 15 minutos.
- Al verificar correo:
  - `RECEPCIONISTA` y `VETERINARIO` pasan a `PENDIENTE_APROBACION`.
  - `CLIENTE` pasa a `ACTIVO`.
- Si el usuario registrado es `CLIENTE` y existe un cliente con el mismo email sin usuario asociado, se vincula automaticamente.

## Modulo Usuarios

Archivos:

- `src/modulos/usuarios/usuarios.controller.ts`
- `src/modulos/usuarios/usuarios.service.ts`
- `src/modulos/usuarios/dto`

Responsabilidades:

- Gestion administrativa de usuarios.
- Aprobacion, rechazo y suspension de cuentas.
- Creacion de administradores.
- Listado paginado con filtros.

Todos los endpoints requieren JWT y rol `ADMIN`.

### Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/admin/usuarios/pendientes` | Lista recepcionistas y veterinarios pendientes de aprobacion. |
| `PATCH` | `/admin/usuarios/:usuarioId/aprobar` | Aprueba una cuenta pendiente. |
| `PATCH` | `/admin/usuarios/:usuarioId/rechazar` | Rechaza una cuenta pendiente. |
| `PATCH` | `/admin/usuarios/:usuarioId/suspender` | Suspende una cuenta existente. |
| `GET` | `/admin/usuarios` | Lista usuarios con filtros opcionales. |
| `POST` | `/admin/usuarios/administradores` | Crea una cuenta de administrador. |

### DTOs

`FiltroUsuariosDto`:

- `rol`
- `estado`
- `page`
- `size`

`RechazarCuentaDto`:

- `motivo`

`CreateAdminDto`:

- `nombreCompleto`
- `correo`
- `telefono`
- `contrasena`

### Reglas de negocio

- Solo cuentas con rol `RECEPCIONISTA` o `VETERINARIO`, correo verificado y estado `PENDIENTE_APROBACION` pueden aprobarse o rechazarse.
- Una cuenta ya suspendida no puede suspenderse nuevamente.
- El listado administrativo no expone `contrasenaHash`.
- La creacion de administradores busca el rol `ADMIN`, crea el usuario en `PENDIENTE_VERIFICACION` y envia codigo por correo.

## Modulo Clientes

Archivos:

- `src/modulos/clientes/clientes.controller.ts`
- `src/modulos/clientes/clientes.service.ts`
- `src/modulos/clientes/dto`

Responsabilidades:

- Crear clientes.
- Listar clientes.
- Actualizar datos de cliente.
- Consultar cliente por ID.
- Vincular clientes con usuarios de rol `CLIENTE` cuando el correo coincide.

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/clientes` | `RECEPCIONISTA` | Crea un cliente. |
| `GET` | `/clientes` | `RECEPCIONISTA`, `ADMIN` | Lista clientes. |
| `PUT` | `/clientes/:clienteId` | `RECEPCIONISTA` | Actualiza un cliente. |
| `GET` | `/clientes/:clienteId` | `RECEPCIONISTA`, `ADMIN`, `CLIENTE` | Obtiene un cliente por ID. |

### DTOs

`CrearClienteDto`:

- `nombre`
- `apellido`
- `email`
- `telefono`
- `documento`
- `direccion`

`ActualizarClienteDto`:

- `nombre`
- `apellido`
- `email`
- `telefono`
- `documento`
- `direccion`

### Reglas de negocio

- No permite duplicar `email` ni `documento`.
- Al crear un cliente, si existe un usuario `CLIENTE` con el mismo correo y sin cliente asociado, queda vinculado.
- Un usuario `CLIENTE` solo puede consultar su propia informacion.

## Modulo Mascotas

Archivos:

- `src/modulos/mascotas/mascota.controller.ts`
- `src/modulos/mascotas/mascota.service.ts`
- `src/modulos/mascotas/dto`

Responsabilidades:

- Registrar mascotas asociadas a un cliente.

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/clientes/:clienteId/mascotas` | `RECEPCIONISTA` | Registra una mascota para el cliente indicado. |

### DTOs

`CrearMascotaDto`:

- `nombre`
- `especie`
- `raza`
- `color`
- `fechaNacimiento`
- `peso`

### Reglas de negocio

- El cliente debe existir.
- La fecha de nacimiento se convierte a `Date`.
- La mascota queda asociada al `clienteId` recibido por parametro.

## Modulo Inventario

Archivos:

- `src/modulos/inventario/inventario.controller.ts`
- `src/modulos/inventario/inventario.service.ts`
- `src/modulos/inventario/dto`

Responsabilidades:

- Crear productos.
- Listar productos activos.
- Consultar productos por ID.
- Actualizar productos.
- Realizar eliminacion logica.
- Ajustar y descontar stock.
- Detectar stock bajo y proximos vencimientos.

### Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/inventario` | Crea producto de inventario. |
| `GET` | `/inventario` | Lista productos activos con filtros opcionales. |
| `GET` | `/inventario/stock-bajo` | Lista productos con `stock <= stockMinimo`. |
| `GET` | `/inventario/proximos-vencer` | Lista productos activos con vencimiento dentro de 30 dias. |
| `GET` | `/inventario/:id` | Obtiene producto activo por ID. |
| `PATCH` | `/inventario/:id` | Actualiza datos del producto. |
| `PATCH` | `/inventario/:id/stock` | Ajusta stock sumando o restando una cantidad. |
| `DELETE` | `/inventario/:id` | Desactiva producto con eliminacion logica. |

### DTOs

`CrearProductoDto`:

- `nombre`
- `tipo`: `MEDICAMENTO`, `VACUNA`, `INSUMO_QUIRURGICO`
- `stock`
- `stockMinimo`
- `precio`
- `fechaVencimiento`

`ActualizarProductoDto`:

- Campos parciales de `CrearProductoDto`.

`FiltroProductoDto`:

- `nombre`
- `tipo`

`AjustarStockDto`:

- `cantidad`

### Reglas de negocio

- No permite crear dos productos activos con el mismo nombre.
- Solo lista productos con `activo = true`.
- La eliminacion no borra registros; marca `activo = false`.
- El ajuste de stock no puede dejar stock negativo.
- `descontarStock` valida que el producto no este vencido y tenga stock suficiente.

## Modulo Historial Medico

Archivos:

- `src/modulos/historial-medico/historial-medico.controller.ts`
- `src/modulos/historial-medico/historial-medico.service.ts`
- `src/modulos/historial-medico/dto`

Responsabilidades:

- Registrar resultados de consulta.
- Listar historial medico de una mascota.
- Corregir registros dentro de ventana permitida.
- Prescribir medicamentos descontando inventario.
- Registrar eventos de auditoria cuando hay configuracion disponible.

Todos los endpoints requieren JWT y roles definidos por endpoint.

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/mascotas/historial-medico/prescribir` | `VETERINARIO` | Descuenta stock de un medicamento prescrito. |
| `POST` | `/mascotas/:mascotaId/historial` | `VETERINARIO` | Crea un registro medico para una mascota. |
| `GET` | `/mascotas/:mascotaId/historial` | `VETERINARIO`, `RECEPCIONISTA`, `ADMIN`, `CLIENTE` | Lista historial paginado. |
| `PUT` | `/mascotas/historial/:registroId` | `VETERINARIO` | Actualiza un registro medico. |

### DTOs

`PrescribirMedicamentoDto`:

- `productoId`
- `cantidad`

`CrearHistorialMedicoDto`:

- `motivoConsulta`
- `diagnostico`
- `tratamiento`
- `pesoMascota`
- `fechaProximaVisita`
- `medicamentos`: arreglo de `{ productoId, cantidad }`

`ActualizarHistorialMedicoDto`:

- Los mismos campos de creacion.

`FiltroHistorialMedicoDto`:

- `page`
- `size`

### Reglas de negocio

- La mascota debe existir.
- Al crear historial se actualiza el peso actual de la mascota.
- Los medicamentos se registran en `MedicamentoPrescrito` y descuentan stock.
- Antes de crear un historial se valida que exista stock suficiente.
- Solo el veterinario creador puede editar el registro.
- La edicion solo esta permitida durante las primeras 24 horas desde `creadoEn`.
- Al actualizar medicamentos, se eliminan las prescripciones anteriores y se crean las nuevas.
- El listado retorna datos de mascota, veterinario y medicamentos.

## Modulo Vacunas

Archivos:

- `src/modulos/vacunas/vacunas.controller.ts`
- `src/modulos/vacunas/vacunas.service.ts`
- `src/modulos/vacunas/dto`

Responsabilidades:

- Registrar vacunas aplicadas a mascotas.
- Asociar vacuna con producto de inventario cuando aplica.
- Registrar evento de auditoria cuando hay configuracion disponible.

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/mascotas/:mascotaId/vacunas` | `VETERINARIO` | Registra vacuna aplicada a una mascota. |

### DTOs

`CrearVacunaDto`:

- `nombre`
- `fechaAplicacion`
- `fechaProximaDosis`
- `productoId`
- `observaciones`

### Reglas de negocio

- La mascota debe existir.
- El veterinario autenticado queda asociado como responsable.
- Las fechas se devuelven en formato `YYYY-MM-DD`.

## Modulo Citas

Archivos:

- `src/modulos/citas/citas.controller.ts`
- `src/modulos/citas/citas.service.ts`
- `src/modulos/citas/dto`

Responsabilidades:

- Agendar citas.
- Consultar disponibilidad.
- Listar y consultar citas con alcance por rol.
- Cancelar y finalizar citas.
- Registrar pago obligatorio.
- Enviar correo de confirmacion.

Horarios de atencion:

```text
08:00, 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00
```

### Endpoints

| Metodo | Ruta | Roles | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/citas` | `CLIENTE`, `VETERINARIO`, `RECEPCIONISTA`, `ADMIN` | Lista citas con filtros y paginacion. |
| `GET` | `/citas/disponibilidad` | `RECEPCIONISTA`, `CLIENTE` | Consulta horarios disponibles. |
| `GET` | `/citas/:citaId` | `CLIENTE`, `VETERINARIO`, `RECEPCIONISTA`, `ADMIN` | Obtiene una cita por ID. |
| `PATCH` | `/citas/:citaId/cancelar` | `RECEPCIONISTA`, `ADMIN` | Cancela una cita confirmada. |
| `PATCH` | `/citas/:citaId/finalizar` | `VETERINARIO` | Finaliza una cita despues del historial medico. |
| `POST` | `/citas` | `CLIENTE`, `RECEPCIONISTA` | Agenda una cita con pago. |

### DTOs

`CrearCitaDto`:

- `mascotaId`
- `veterinarioId`
- `fecha`
- `hora`
- `servicioIds`
- `pago`

`PagoCitaDto`:

- `metodo`: `EFECTIVO`, `TARJETA`, `TRANSFERENCIA`
- `referencia`

`ConsultarDisponibilidadDto`:

- `veterinarioId`
- `fecha`

`FiltroCitasDto`:

- `veterinarioId`
- `mascotaId`
- `estado`: `CONFIRMADA`, `FINALIZADA`, `CANCELADA`
- `fechaDesde`
- `fechaHasta`
- `page`
- `size`

`CancelarCitaDto`:

- `motivo`

### Reglas de negocio

- El pago es obligatorio para agendar.
- Pagos con `TARJETA` o `TRANSFERENCIA` requieren `referencia`.
- No se permiten servicios duplicados en una misma cita.
- La mascota debe existir.
- Si agenda un `CLIENTE`, la mascota debe pertenecerle.
- El veterinario debe existir, tener rol `VETERINARIO` y estar `ACTIVO`.
- Todos los servicios seleccionados deben existir y estar activos.
- No puede existir otra cita confirmada para el mismo veterinario, fecha y hora.
- El monto total se calcula sumando precios de servicios.
- Al crear cita se registra el pago y se envia correo de confirmacion.
- `CLIENTE` solo ve citas de sus mascotas.
- `VETERINARIO` solo ve citas asignadas.
- `RECEPCIONISTA` y `ADMIN` pueden ver todas.
- Para finalizar una cita debe existir historial medico registrado por el veterinario para esa mascota en el dia de la cita.
- Una cita cancelada o finalizada no puede pasar por transiciones invalidas.

## Modulo Facturacion

Archivos:

- `src/modulos/facturacion/facturacion.controller.ts`
- `src/modulos/facturacion/facturacion.service.ts`
- `src/modulos/facturacion/dto`
- `src/modulos/facturacion/helpers`
- `src/modulos/facturacion/interfaces`

Responsabilidades:

- Crear facturas al finalizar atenciones.
- Consultar y listar facturas.
- Generar PDF de factura.
- Anular facturas.
- Generar reporte PDF por periodo.
- Registrar auditoria de creacion y anulacion.

### Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/facturacion` | Crea factura para una atencion. |
| `GET` | `/facturacion` | Lista facturas. |
| `GET` | `/facturacion/reporte/pdf?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | Descarga reporte PDF del periodo. |
| `GET` | `/facturacion/:id` | Obtiene factura por ID. |
| `GET` | `/facturacion/:id/pdf` | Descarga factura en PDF. |
| `PATCH` | `/facturacion/:id/anular` | Anula factura con motivo. |

### DTOs

`CrearFacturaDto`:

- `atencionId`
- `descuento`

`AnularFacturaDto`:

- `motivoAnulacion`

### Reglas de negocio

- La atencion debe existir.
- Solo puede existir una factura por atencion.
- El descuento no puede superar el total.
- El total se calcula con servicios y medicamentos de la atencion.
- Una factura anulada no puede anularse de nuevo.
- La anulacion exige motivo descriptivo.
- El reporte por periodo valida que `inicio` no sea mayor que `fin`.

## Modulo Reportes

Archivos:

- `src/modulos/reportes/reportes.controller.ts`
- `src/modulos/reportes/reportes.service.ts`
- `src/modulos/reportes/dto`
- `src/modulos/reportes/helpers`

Responsabilidades:

- Generar reporte PDF de trazabilidad.

### Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/reportes/trazabilidad/pdf?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` | Descarga PDF de trazabilidad. |

### DTOs

`FiltroTrazabilidadDto`:

- `fechaInicio`
- `fechaFin`
- `usuario`
- `tipoAccion`

### Estado actual

`ReportesService` devuelve datos simulados. Esta pendiente conectar el reporte con eventos reales de `bh-audit`.

## Modulo Correos

Archivos:

- `src/modulos/correos/correos.module.ts`
- `src/modulos/correos/correos.service.ts`
- `src/modulos/correos/plantillas`
- `src/modulos/correos/interfaces`

Responsabilidades:

- Configurar transporte SMTP.
- Enviar codigos de verificacion.
- Enviar confirmaciones de cita.
- Renderizar plantillas HTML.

Variables relacionadas:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`

## Modulo Audit

Archivos:

- `src/modulos/audit/audit.module.ts`
- `src/modulos/audit/audit.service.ts`
- `src/modulos/audit/dto`

Responsabilidades:

- Centralizar el envio de eventos relevantes hacia el microservicio `bh-audit`.
- Exponer `AuditService` para otros modulos.
- Operar en modo tolerante a fallos: si auditoria no responde, `bh-core` continua funcionando.

Acciones soportadas:

- `REGISTRO_USUARIO`
- `VERIFICACION_CORREO`
- `APROBACION_CUENTA`
- `RECHAZO_CUENTA`
- `LOGIN_EXITOSO`
- `LOGIN_FALLIDO`
- `CREACION_CITA`
- `CAMBIO_ESTADO_CITA`
- `PAGO_CITA`
- `CREACION_HISTORIAL`
- `EDICION_HISTORIAL`
- `REGISTRO_VACUNA`
- `INICIO_HOSPITALIZACION`
- `ALTA_HOSPITALIZACION`
- `CREACION_FACTURA`
- `ANULACION_FACTURA`
- `AJUSTE_INVENTARIO`
- `CREACION_SERVICIO`
- `EDICION_SERVICIO`
- `DESACTIVACION_SERVICIO`
- `SUSPENSION_USUARIO`

### Punto de revision

El cliente `AuditService` envia por defecto a:

```text
http://bh-audit-service/api/v1/eventos
```

Mientras que el servicio Spring de auditoria del workspace expone:

```text
/api/audit/events
```

Antes de desplegar la integracion, se debe alinear `BH_AUDIT_URL`, el path final y el contrato del payload.

## Modulo Roles

Archivo:

- `src/modulos/roles/roles.module.ts`

Actualmente solo existe como modulo registrado. Los roles se consumen desde base de datos y desde los guards/decoradores de autenticacion.

## Convenciones de respuesta

El proyecto devuelve errores usando excepciones HTTP de NestJS:

- `BadRequestException`
- `ConflictException`
- `ForbiddenException`
- `NotFoundException`
- `UnauthorizedException`
- `UnprocessableEntityException`

Varios servicios devuelven objetos con:

- `codigo`: identificador interno del error.
- `mensaje`: descripcion legible.

## Validacion global

Configurada en `src/main.ts`:

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

Implicaciones:

- Se eliminan propiedades no declaradas en DTOs.
- Se rechazan campos no permitidos.
- Se transforman tipos cuando el DTO usa `@Type()` o transformadores.

## Documentacion interactiva

Al ejecutar el proyecto, Swagger esta disponible en:

```text
http://localhost:3000/docs
```

La API funcional usa:

```text
http://localhost:3000/bh-core/v1
```

