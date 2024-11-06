export function parseArgv() {
  // Obtener argumentos de línea de comandos y establecer valores predeterminados
  const args = process.argv.slice(2);
  const numSides = parseInt(args[0]) || 8;
  const radius = parseFloat(args[1]) || 1.0;
  const thickness = parseFloat(args[2]) || 0.5;

  // Validar argumentos
  if (
    numSides < 3 ||
    numSides > 360 ||
    !Number.isInteger(numSides) ||
    radius <= 0 ||
    thickness <= 0
  ) {
    console.error(
      "Parámetros no válidos. Asegúrate de que el número de lados sea un entero y esté entre 3 y 360 y que el radio y ancho sean positivos."
    );
    process.exit(2);
  }

  return { numSides, radius, thickness };
}
