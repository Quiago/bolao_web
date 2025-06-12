import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tu-usuario-bolao-api.hf.space';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, location, type } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const params = {
      query,
      num_results: 20,
      min_score: 0.3
    };

    if (location && location !== '') {
      params.filter_location = location;
    }

    if (type && type !== '') {
      params.filter_type = type;
    }

    const response = await axios.post(`${BOLAO_API_URL}/search`, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const products = response.data.products.map((product, index) => ({
      id: product.id || `${product.name}-${index}`,
      ...product,
      delivery: product.delivery === 'True' || product.delivery === true,
      pickup: product.pickup === 'True' || product.pickup === true,
      product_price: parseFloat(product.product_price) || product.product_price
    }));

    res.status(200).json({
      products,
      total_results: response.data.total_results,
      search_time: response.data.search_time
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      return res.status(200).json({
        products: getMockData(req.query.query),
        total_results: 5,
        search_time: 0.1
      });
    }

    res.status(500).json({ 
      error: 'Error searching products',
      details: error.message 
    });
  }
}

function getMockData(query) {
  const mockProducts = [
    {
      id: '1',
      name: 'Market Rey',
      slug: 'market-rey',
      product_name: 'Hamburguesa Clásica',
      product_price: 8.99,
      score: 0.95,
      location: 'Habana del Este, La Habana',
      address: 'Carretera del asilo #6 /Naval y los Pinos casablanca',
      phone: '+5355159617',
      email: 'yanetsanler@gmail.com',
      web: 'www.marketrey.com',
      instagram: '@marketrey',
      facebook: 'marketrey',
      type: 'restaurantes',
      logo: 'https://img2.elyerromenu.com/images/market-rey/logo-y/img.webp',
      delivery: true,
      pickup: true,
      geo: '[-82.33339919218133, 23.154970416175193]'
    }
  ];

  return mockProducts.filter(product => 
    product.product_name.toLowerCase().includes(query.toLowerCase()) ||
    product.name.toLowerCase().includes(query.toLowerCase())
  );
}
