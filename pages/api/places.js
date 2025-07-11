import { getSupabaseClient } from '../../utils/supabaseClient';
import { verifyToken } from '../../utils/verifyToken';

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not configured' });
  }

  if (req.method === 'GET') {
    try {
      // Parámetros de paginación
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;

      // Validar pageSize
      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'pageSize debe estar entre 1 y 100' });
      }

      // Query base
      let query = supabase
        .from('places')
        .select('*', { count: 'exact' })
        .eq('business_account_id', user.id);

      // Aplicar filtros
      if (req.query.search) {
        query = query.or(`name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%,address.ilike.%${req.query.search}%`);
      }
      if (req.query.category) {
        query = query.eq('category', req.query.category);
      }
      if (req.query.verified !== undefined) {
        query = query.eq('verified', req.query.verified === 'true');
      }
      if (req.query.address) {
        query = query.ilike('address', `%${req.query.address}%`);
      }

      // Aplicar paginación
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false });

      const { data: places, error, count } = await query;

      if (error) {
        return res.status(500).json({ error: 'Error al consultar lugares', details: error.message });
      }

      // Calcular metadata de paginación
      const totalPages = Math.ceil(count / pageSize);

      return res.status(200).json({ 
        places: places || [],
        meta: {
          currentPage: page,
          pageSize: pageSize,
          totalItems: count,
          totalPages: totalPages,
          offset: offset,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    // Creación de lugar
    try {
      const placeData = {
        ...req.body,
        business_account_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: place, error } = await supabase
        .from('places')
        .insert([placeData])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error al crear lugar', details: error.message });
      }

      return res.status(201).json({ place });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT') {
    // Edición de lugar
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });
    // Solo permitir editar lugares del business_account
    const { data: place, error: findError } = await supabase
      .from('places')
      .select('id, business_account_id')
      .eq('id', id)
      .single();
    if (findError || !place) return res.status(404).json({ error: 'Lugar no encontrado' });
    if (place.business_account_id !== user.id) return res.status(403).json({ error: 'No autorizado' });
    
    const updateData = {
      ...fields,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedPlace, error: updateError } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) return res.status(500).json({ error: 'Error al actualizar', details: updateError.message });
    return res.status(200).json({ place: updatedPlace });
  }

  if (req.method === 'DELETE') {
    // Eliminación de lugar
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });
    // Solo permitir eliminar lugares del business_account
    const { data: place, error: findError } = await supabase
      .from('places')
      .select('id, business_account_id')
      .eq('id', id)
      .single();
    if (findError || !place) return res.status(404).json({ error: 'Lugar no encontrado' });
    if (place.business_account_id !== user.id) return res.status(403).json({ error: 'No autorizado' });
    const { error: deleteError } = await supabase
      .from('places')
      .delete()
      .eq('id', id);
    if (deleteError) return res.status(500).json({ error: 'Error al eliminar', details: deleteError.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
