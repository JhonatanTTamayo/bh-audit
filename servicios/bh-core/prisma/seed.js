const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      nombre: 'ADMIN',
      descripcion: 'Administrador del sistema',
    },
    {
      nombre: 'CLIENTE',
      descripcion: 'Usuario cliente del sistema',
    },
    {
      nombre: 'RECEPCIONISTA',
      descripcion: 'Usuario encargado de recepción',
    },
    {
      nombre: 'VETERINARIO',
      descripcion: 'Usuario veterinario del sistema',
    },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: {
        nombre: rol.nombre,
      },
      update: {
        descripcion: rol.descripcion,
        activo: true,
      },
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: true,
      },
    });
  }

  const servicios = [
    {
      nombre: 'Consulta general',
      descripcion: 'Revision medica general de la mascota',
      precio: 50000,
    },
    {
      nombre: 'Vacunacion',
      descripcion: 'Aplicacion de vacuna segun esquema medico',
      precio: 80000,
    },
    {
      nombre: 'Desparasitacion',
      descripcion: 'Servicio de desparasitacion preventiva',
      precio: 40000,
    },
  ];

  for (const servicio of servicios) {
    const servicioExistente = await prisma.servicio.findFirst({
      where: {
        nombre: servicio.nombre,
      },
    });

    if (servicioExistente) {
      await prisma.servicio.update({
        where: {
          id: servicioExistente.id,
        },
        data: {
          descripcion: servicio.descripcion,
          precio: servicio.precio,
          activo: true,
        },
      });

      continue;
    }

    await prisma.servicio.create({
      data: {
        ...servicio,
        activo: true,
      },
    });
  }

  console.log('Roles y servicios iniciales creados correctamente.');
}

main()
  .catch((error) => {
    console.error('Error al crear roles iniciales:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
