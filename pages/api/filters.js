export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // SIEMPRE devolver estos valores exactos, ignorando lo que venga de la API
  const fixedFilters = {
    types: [
      'heladerias',
      'panaderias',
      'restaurantes',
      'dulcerias',
      'cafes',
      'cafeterias',
      'pizzerias',
      'bares'
    ],
    locations: [
      'Habana del Este, La Habana',
      'Habana Vieja, La Habana',
      'Playa, La Habana',
      'Plaza, La Habana',
      'Arroyo Naranjo, La Habana',
      'Boyeros, La Habana',
      'Diez de Octubre, La Habana',
      'Artemisa, Artemisa',
      'Centro Habana, La Habana',
      'La Habana, Cuba',
      'Cotorro, La Habana',
      'La Lisa, La Habana',
      'Cerro, La Habana'
    ]
  };

  // Devolver siempre los valores fijos
  res.status(200).json(fixedFilters);
}