import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiago-bolao-search.hf.space';
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const headers = {};
    
    // Add Hugging Face authorization if token is available
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    const response = await axios.get(`${BOLAO_API_URL}/filters`, {
      headers
    });
    
    res.status(200).json({
      locations: response.data.locations || [],
      types: response.data.types || []
    });

  } catch (error) {
    console.error('Filters API error:', error);
    
    res.status(200).json({
      types: [
        'Todos',
        'restaurantes',
        'cafeterias',
        'heladerias',
        'dulcerias',
        'bares',
        'pizzerias',
        'comida_rapida',
        'paladares',
        'Pastelería',
        'Bebidas',
        'Snacks',
        'Postres'
      ],
      locations: [
        'Todas',
        'Habana del Este, La Habana',
        'Centro Habana, La Habana',
        'Playa, La Habana',
        'Vedado, La Habana',
        'Miramar, La Habana',
        'Habana Vieja, La Habana',
        'Arroyo Naranjo, La Habana',
        'Boyeros, La Habana'
      ]
    });
  }
}
