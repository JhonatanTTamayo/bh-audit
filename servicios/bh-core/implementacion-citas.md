# Modulo de citas - Documentacion tecnica

## Proposito

El modulo de citas gestiona el agendamiento y ciclo de vida de las atenciones veterinarias dentro del microservicio `bh-core`.

Su responsabilidad principal es permitir que una cita sea creada, consultada y actualizada de acuerdo con las reglas operativas de la clinica veterinaria.

## Alcance inicial

El alcance inicial del modulo contempla los endpoints `POST /citas` y `GET /citas`.

El endpoint `POST /citas` es el encargado de agendar una cita confirmada con pago obligatorio.

Este flujo permite:

- Seleccionar una mascota.
- Seleccionar un veterinario.
- Definir fecha y hora de atencion.
- Seleccionar uno o varios servicios.
- Registrar el pago obligatorio de la cita.
- Confirmar la cita solo cuando las reglas de negocio se cumplen.
- Notificar al cliente por correo electronico cuando la cita queda confirmada.

El endpoint `GET /citas` es el encargado de listar citas registradas aplicando filtros dinamicos, paginacion y reglas de acceso por rol.

Este flujo permite:

- Consultar citas registradas.
- Filtrar por veterinario.
- Filtrar por mascota.
- Filtrar por estado.
- Filtrar por rango de fechas.
- Paginar los resultados.
- Restringir automaticamente el alcance de los resultados segun el rol autenticado.

## Reglas de negocio

### Roles autorizados

El agendamiento de citas esta permitido para usuarios autenticados con los siguientes roles:

- `RECEPCIONISTA`
- `CLIENTE`

El listado de citas esta permitido para usuarios autenticados con los siguientes roles:

- `ADMIN`
- `RECEPCIONISTA`
- `VETERINARIO`
- `CLIENTE`

### Alcance del listado por rol

El resultado de `GET /citas` se limita automaticamente segun el rol del usuario autenticado.

- `CLIENTE`: ve solo las citas asociadas a sus propias mascotas.
- `VETERINARIO`: ve solo las citas asignadas a su usuario.
- `RECEPCIONISTA`: puede ver todas las citas.
- `ADMIN`: puede ver todas las citas.

Los filtros recibidos por query se combinan con estas reglas de alcance. Por ejemplo, si un cliente envia `veterinarioId`, el sistema filtra por ese veterinario, pero mantiene la restriccion de que las citas deben pertenecer a mascotas del cliente autenticado.

### Pago obligatorio

Toda cita creada mediante `POST /citas` debe incluir informacion de pago.

Si la peticion no incluye pago, la cita no debe ser creada ni confirmada.

### Calculo de monto total

El monto total de la cita se calcula sumando el precio de todos los servicios seleccionados en `servicioIds`.

El valor aplicado de cada servicio debe conservarse en la relacion historica entre cita y servicio, para evitar que cambios futuros en el catalogo alteren el valor de citas ya registradas.

### Disponibilidad del veterinario

Un veterinario no puede tener dos citas confirmadas en la misma fecha y hora.

Antes de crear una cita, el sistema debe consultar si existe una cita activa para el mismo `veterinarioId`, `fecha` y `hora`.

Si existe cruce de horario, el sistema debe responder con conflicto `409` y el codigo de error:

```json
{
  "codigo": "HORARIO_OCUPADO",
  "mensaje": "El veterinario ya tiene una cita agendada en ese horario."
}
```

La validacion se ejecuta antes de crear la cita y se repite dentro de la transaccion de creacion para reducir el riesgo de cruces cuando llegan solicitudes concurrentes.

### Confirmacion por correo

Cuando la cita se crea correctamente, el sistema debe enviar un correo automatico al cliente asociado a la mascota.

El correo de confirmacion incluye:

- Nombre del cliente.
- Nombre de la mascota.
- Fecha de la cita.
- Hora de la cita.
- Nombre del veterinario asignado.
- Direccion de la sede.
- Recordatorio de llegar con 10 minutos de anticipacion.

La direccion de la sede se obtiene desde la variable de entorno:

```text
CLINIC_ADDRESS
```

En esta version no existe un catalogo de sedes en el contrato API, por lo que la direccion se maneja como configuracion del microservicio.

### Filtros de listado

El endpoint `GET /citas` permite aplicar filtros opcionales mediante parametros query.

Filtros disponibles:

- `veterinarioId`
- `mascotaId`
- `estado`
- `fechaDesde`
- `fechaHasta`
- `page`
- `size`

Si se envia `fechaDesde` y `fechaHasta`, la fecha inicial no puede ser mayor que la fecha final.

Si el rango es invalido, el sistema responde con error `400` y el codigo:

```json
{
  "codigo": "RANGO_FECHAS_INVALIDO",
  "mensaje": "La fecha desde no puede ser mayor que la fecha hasta."
}
```

### Paginacion

El listado de citas devuelve una respuesta paginada.

Valores por defecto:

- `page`: `0`
- `size`: `20`

La respuesta incluye:

- `page`
- `size`
- `totalElements`
- `totalPages`
- `first`
- `last`
- `content`

## Contrato de entrada

### CrearCitaDto

El endpoint `POST /citas` recibe un cuerpo con la siguiente estructura:

```json
{
  "mascotaId": "uuid",
  "veterinarioId": "uuid",
  "fecha": "2026-05-20",
  "hora": "10:00",
  "servicioIds": ["uuid"],
  "pago": {
    "metodo": "tarjeta",
    "referencia": "TXN-001"
  }
}
```

Validaciones principales:

- `mascotaId` debe ser un UUID valido.
- `veterinarioId` debe ser un UUID valido.
- `fecha` debe tener formato de fecha valido.
- `hora` debe tener formato `HH:mm`.
- `servicioIds` debe ser un arreglo con al menos un UUID valido.
- `pago` es obligatorio.

### PagoCitaDto

El objeto `pago` recibe:

- `metodo`
- `referencia`

Metodos permitidos:

- `efectivo`
- `tarjeta`
- `transferencia`

Internamente, el metodo de pago se transforma al enum usado por Prisma:

- `EFECTIVO`
- `TARJETA`
- `TRANSFERENCIA`

La referencia es obligatoria cuando el metodo de pago es `tarjeta` o `transferencia`.

### FiltroCitasDto

El endpoint `GET /citas` recibe los filtros por query params con la siguiente estructura:

```text
GET /api/citas?veterinarioId=uuid&mascotaId=uuid&estado=CONFIRMADA&fechaDesde=2026-05-01&fechaHasta=2026-05-31&page=0&size=20
```

Validaciones principales:

- `veterinarioId` debe ser un UUID valido cuando se envia.
- `mascotaId` debe ser un UUID valido cuando se envia.
- `estado` debe ser un valor valido del enum `EstadoCita`.
- `fechaDesde` debe tener formato de fecha valido cuando se envia.
- `fechaHasta` debe tener formato de fecha valido cuando se envia.
- `page` debe ser un numero entero mayor o igual a `0`.
- `size` debe ser un numero entero mayor o igual a `1`.

## Modelo de datos

### Usuario

El modelo `Usuario` representa clientes, recepcionistas, veterinarios y administradores.

Para citas se utilizan dos relaciones:

- Un cliente puede tener varias mascotas.
- Un veterinario puede tener varias citas asignadas.

### Mascota

Representa una mascota registrada en el sistema.

Campos principales:

- `id`
- `nombre`
- `especie`
- `raza`
- `edad`
- `peso`
- `estado`
- `clienteId`

Una mascota pertenece a un cliente y puede tener multiples citas.

### Servicio

Representa un servicio ofrecido por la clinica.

Campos principales:

- `id`
- `nombre`
- `descripcion`
- `precio`
- `activo`

Solo los servicios activos deben poder seleccionarse al agendar nuevas citas.

### Cita

Representa una atencion veterinaria agendada.

Campos principales:

- `id`
- `fecha`
- `hora`
- `estado`
- `montoTotal`
- `motivoCancelacion`
- `mascotaId`
- `veterinarioId`

Una cita pertenece a una mascota, esta asignada a un veterinario, tiene servicios asociados y posee un pago.

### CitaServicio

Modelo intermedio entre `Cita` y `Servicio`.

Ademas de relacionar ambas entidades, conserva el campo `precioAplicado`, que corresponde al precio del servicio en el momento en que la cita fue creada.

### Pago

Representa el pago asociado a una cita confirmada.

Campos principales:

- `id`
- `metodo`
- `referencia`
- `monto`
- `fechaPago`
- `citaId`

La relacion entre cita y pago es uno a uno.

## Enums

### EstadoMascota

Valores posibles:

- `ACTIVA`
- `HOSPITALIZADA`
- `FALLECIDA`

### EstadoCita

Valores posibles:

- `CONFIRMADA`
- `FINALIZADA`
- `CANCELADA`

### MetodoPago

Valores posibles:

- `EFECTIVO`
- `TARJETA`
- `TRANSFERENCIA`

## Persistencia

La persistencia del modulo se gestiona con Prisma y MySQL.

El modelo de datos asociado a citas se encuentra definido en:

```text
prisma/schema.prisma
```

La migracion que agrega las tablas necesarias para citas, mascotas, servicios y pagos se encuentra en:

```text
prisma/migrations/20260520230000_agregar_modelos_citas/migration.sql
```

### Tablas creadas

La migracion crea las siguientes tablas:

- `mascotas`
- `servicios`
- `citas`
- `citas_servicios`
- `pagos`

### Indices relevantes

La tabla `citas` incluye un indice compuesto sobre:

```text
veterinario_id, fecha, hora
```

Este indice soporta la consulta de disponibilidad del veterinario durante el agendamiento.

La tabla `pagos` incluye una restriccion unica sobre `cita_id`, garantizando que una cita tenga como maximo un pago asociado.

### Aplicacion de migraciones

En un entorno con `DATABASE_URL` configurada, las migraciones se aplican con:

```bash
npx prisma migrate deploy
```

Para entornos de desarrollo donde se requiera crear nuevas migraciones desde cambios en el schema, se usa:

```bash
npx prisma migrate dev
```

Despues de modificar el schema de Prisma, el cliente debe regenerarse con:

```bash
npx prisma generate
```

## Diseno tecnico

### Responsabilidad unica

El modulo de citas debe separar las responsabilidades de la siguiente manera:

- El controlador expone las rutas HTTP y delega la operacion.
- Los DTOs validan la forma de los datos de entrada.
- El servicio de citas aplica reglas de negocio.
- Prisma gestiona la persistencia.
- El servicio de correos gestiona la notificacion al cliente.

### Inversion de dependencias

Las dependencias deben resolverse por inyeccion de dependencias de NestJS.

El servicio de citas debe recibir `PrismaService` y `CorreosService` desde el constructor, evitando crear instancias manuales de clientes o servicios externos.

## Estructura esperada del modulo

```text
src/modulos/citas/
├─ citas.module.ts
├─ citas.controller.ts
├─ citas.service.ts
└─ dto/
   ├─ crear-cita.dto.ts
   ├─ filtro-citas.dto.ts
   └─ pago-cita.dto.ts
```

## Endpoint de listado

### GET /api/citas

Ruta encargada de consultar citas registradas.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `ADMIN`, `RECEPCIONISTA`, `VETERINARIO` o `CLIENTE`.

Parametros query:

- `veterinarioId`: filtra por veterinario.
- `mascotaId`: filtra por mascota.
- `estado`: filtra por estado de cita.
- `fechaDesde`: filtra desde una fecha inicial.
- `fechaHasta`: filtra hasta una fecha final.
- `page`: numero de pagina base 0.
- `size`: cantidad de elementos por pagina.

Responsabilidades por archivo:

- `citas.controller.ts`: expone la ruta HTTP, recibe filtros y delega la operacion al servicio.
- `citas.service.ts`: aplica filtros dinamicos, reglas de acceso por rol, paginacion y formato de respuesta.
- `filtro-citas.dto.ts`: valida los parametros query recibidos por el endpoint.

El controlador no contiene reglas de negocio. Su responsabilidad se limita a recibir el DTO validado, obtener el usuario autenticado desde el request y delegar la operacion al servicio de citas.

## Endpoint de consulta por ID

### GET /api/citas/{citaId}

Ruta encargada de obtener la informacion completa de una cita existenten.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `ADMIN`, `RECEPCIONISTA`, `VETERINARIO` o `CLIENTE`.

Parametros de ruta:

- `citaId`: UUID de la cita.

Responsabilidades por archivo:

- `citas.controller.ts`: expone la ruta HTTP y delega la operacion al servicio.
- `citas.service.ts`: aplica reglas de alcance por rol y consulta la cita con sus relaciones.

El controlador no contiene reglas de negocio. Su responsabilidad se limita a recibir el ID validado, obtener el usuario autenticado desde el request y delegar la operacion al servicio de citas.

## Endpoint de finalizacion

### PATCH /api/citas/{citaId}/finalizar

Ruta encargada de marcar una cita confirmada como finalizada.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `VETERINARIO`.

Parametros de ruta:

- `citaId`: UUID de la cita.

Responsabilidades por archivo:

- `citas.controller.ts`: expone la ruta HTTP y delega la operacion al servicio.
- `citas.service.ts`: valida que la cita pertenezca al veterinario autenticado, que exista y que este en estado `CONFIRMADA`, y luego actualiza el estado.

El controlador no contiene reglas de negocio. Su responsabilidad se limita a recibir el ID validado, obtener el usuario autenticado desde el request y delegar la operacion al servicio de citas.

## Endpoint de cancelación

### PATCH /api/citas/{citaId}/cancelar

Ruta encargada de cancelar una cita que aun no ha sido atendida y registrar el motivo de cancelación.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `RECEPCIONISTA` o `ADMIN`.

Parametros de ruta:

- `citaId`: UUID de la cita.

Cuerpo de la petición:

- `motivo`: texto obligatorio que describe la justificación de la cancelación.

Responsabilidades por archivo:

- `citas.controller.ts`: expone la ruta HTTP, valida `citaId` y `MotivoRequestDto`, y delega la operación al servicio.
- `citas.service.ts`: valida que la cita exista, que no haya sido atendida, y actualiza el estado y el motivo de cancelación.
- `motivo-request.dto.ts`: valida la estructura y longitud del motivo enviado.

El controlador no contiene reglas de negocio. Su responsabilidad se limita a recibir el ID y el DTO validados, obtener el usuario autenticado desde el request y delegar la operación al servicio de citas.

## Endpoint de agendamiento

### POST /api/citas

Ruta encargada de recibir la solicitud de agendamiento de una cita.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `RECEPCIONISTA` o `CLIENTE`.

Responsabilidades por archivo:

- `citas.module.ts`: registra las dependencias necesarias del modulo.
- `citas.controller.ts`: expone la ruta HTTP y delega la operacion al servicio.
- `citas.service.ts`: concentra las reglas de negocio del agendamiento.
- `crear-cita.dto.ts`: valida la estructura principal del cuerpo de la peticion.
- `pago-cita.dto.ts`: valida la informacion de pago obligatoria.

El controlador no contiene reglas de negocio. Su responsabilidad se limita a recibir el DTO validado, obtener el usuario autenticado desde el request y delegar la operacion al servicio de citas.

## Flujo de listado de citas

El servicio de citas ejecuta las siguientes validaciones y operaciones para `GET /api/citas`:

1. Obtiene `page` y `size` desde los filtros o aplica valores por defecto.
2. Valida que `fechaDesde` no sea mayor que `fechaHasta` cuando ambas fechas son enviadas.
3. Construye los filtros dinamicos para `veterinarioId`, `mascotaId`, `estado` y rango de fechas.
4. Aplica el alcance de resultados segun el rol del usuario autenticado.
5. Consulta las citas con sus relaciones principales.
6. Cuenta el total de citas que cumplen los filtros.
7. Calcula los metadatos de paginacion.
8. Formatea cada cita usando el mismo formato de respuesta utilizado por el modulo.
9. Devuelve una respuesta paginada con `page`, `size`, `totalElements`, `totalPages`, `first`, `last` y `content`.

Errores de negocio principales:

- `RANGO_FECHAS_INVALIDO`

## Flujo de creacion de cita

El servicio de citas ejecuta las siguientes validaciones y operaciones para `POST /api/citas`:

1. Verifica que el pago este presente.
2. Verifica que no existan servicios duplicados en la solicitud.
3. Consulta la mascota y su cliente.
4. Si el usuario autenticado tiene rol `CLIENTE`, valida que la mascota le pertenezca.
5. Consulta el veterinario y valida que exista, tenga rol `VETERINARIO` y estado `ACTIVO`.
6. Consulta los servicios seleccionados y valida que todos existan y esten activos.
7. Valida que no exista una cita `CONFIRMADA` para el mismo veterinario, fecha y hora.
8. Calcula `montoTotal` sumando el precio de los servicios seleccionados.
9. Crea la cita, sus servicios historicos y el pago asociado dentro de una transaccion.
10. Envia el correo de confirmacion al cliente.
11. Devuelve la cita confirmada con mascota, veterinario, servicios, monto total y pago.

## Flujo de finalizacion de cita

El servicio de citas ejecuta las siguientes validaciones y operaciones para `PATCH /api/citas/{citaId}/finalizar`:

1. Valida que el veterinario autenticado sea el asignado a la cita.
2. Verifica que la cita exista y pueda obtenerse con las relaciones necesarias.
3. Valida que la cita este en estado `CONFIRMADA`.
4. Actualiza el estado de la cita a `FINALIZADA`.
5. Devuelve la cita actualizada en el mismo formato de respuesta del modulo.

Errores de negocio principales:

- `CITA_NO_ENCONTRADA`
- `CITA_NO_FINALIZABLE`

## Flujo de cancelacion de cita

El servicio de citas ejecuta las siguientes validaciones y operaciones para `PATCH /api/citas/{citaId}/cancelar`:

1. Verifica que la cita exista.
2. Valida que la cita no este en estado `FINALIZADA` ni `CANCELADA`.
3. Actualiza el estado de la cita a `CANCELADA`.
4. Almacena el texto de `motivoCancelacion` en la cita.
5. Devuelve la cita actualizada en el mismo formato de respuesta del modulo.

Errores de negocio principales:

- `CITA_NO_ENCONTRADA`
- `CITA_NO_CANCELABLE`

## Endpoint de disponibilidad

### GET /api/citas/disponibilidad

Ruta encargada de consultar los horarios disponibles de un veterinario en una fecha.

Seguridad:

- Requiere token JWT valido.
- Requiere rol `RECEPCIONISTA` o `CLIENTE`.

Parametros query:

- `veterinarioId` (required): UUID del veterinario.
- `fecha` (required): Fecha a consultar en formato `YYYY-MM-DD`.

Respuesta:

- `fecha`: la fecha consultada.
- `veterinarioId`: id del veterinario consultado.
- `horariosDisponibles`: arreglo de strings con horarios en formato `HH:mm`.

Reglas de calculo (implementacion actual):

- Se considera una regla por defecto de franjas horarias por hora entre `08:00` y `17:00`.
- Se consultan las citas con estado `CONFIRMADA` para el `veterinarioId` y la `fecha` indicada y se excluyen esas horas del conjunto de horarios disponibles.
- Esta regla es configurable y puede reemplazarse por una politica basada en la jornada laboral del veterinario o bloques de tiempo diferentes.

Archivos implicados:

- `citas.controller.ts`: expone la ruta `GET /disponibilidad` y valida query.
- `citas.service.ts`: implementa `consultarDisponibilidad` y calcula franjas disponibles.
- `dto/disponibilidad.dto.ts`: valida los parametros `veterinarioId` y `fecha`.

Errores de seguridad y autorizacion:

- `ACCESO_DENEGADO` (rol no permitido)
- `UNAUTHORIZED` (token faltante o invalido)


- `PAGO_OBLIGATORIO`
- `SERVICIOS_DUPLICADOS`
- `MASCOTA_NO_ENCONTRADA`
- `MASCOTA_NO_PERTENECE_AL_CLIENTE`
- `VETERINARIO_NO_DISPONIBLE`
- `SERVICIOS_INVALIDOS`
- `HORARIO_OCUPADO`
- `CITA_NO_ENCONTRADA`
- `CITA_NO_FINALIZABLE`
