import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tu-usuario-bolao-api.hf.space';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get(`${BOLAO_API_URL}/filters`);
    
    res.status(200).json({
      locations: response.data.locations || [],
      types: response.data.types || []
    });

  } catch (error) {
    console.error('Filters API error:', error);
    
    res.status(200).json({
      locations: [
        'Habana del Este, La Habana',
        'Centro Habana, La Habana',
        'Playa, La Habana',
        'Vedado, La Habana',
        'Miramar, La Habana',
        'Habana Vieja, La Habana',
        'Arroyo Naranjo, La Habana',
        'Boyeros, La Habana'
      ],
      types: [
        'restaurantes',
        'cafeterias',
        'heladerias',
        'dulcerias',
        'bares',
        'pizzerias',
        'comida_rapida',
        'paladares'
      ]
    });
  }
}
