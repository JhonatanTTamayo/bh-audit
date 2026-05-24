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

  console.log('Roles iniciales creados correctamente.');
}

main()
  .catch((error) => {
    console.error('Error al crear roles iniciales:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });