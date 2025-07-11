import { getSupabaseClient } from '../../../utils/supabaseClient';
import { verifyToken } from '../../../utils/verifyToken';

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not configured' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('business_account_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Producto no encontrado' });
        }
        return res.status(500).json({ error: 'Error al consultar producto', details: error.message });
      }

      return res.status(200).json({ product });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 