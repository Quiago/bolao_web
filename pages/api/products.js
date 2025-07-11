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
        .from('products')
        .select('*', { count: 'exact' })
        .eq('business_account_id', user.id);

      // Aplicar filtros
      if (req.query.search) {
        query = query.or(`product_name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%,category.ilike.%${req.query.search}%`);
      }
      if (req.query.category) {
        query = query.eq('category', req.query.category);
      }
      if (req.query.available !== undefined) {
        query = query.eq('available', req.query.available === 'true');
      }
      if (req.query.price_gte) {
        query = query.gte('price', parseFloat(req.query.price_gte));
      }
      if (req.query.price_lte) {
        query = query.lte('price', parseFloat(req.query.price_lte));
      }
      if (req.query.stock_quantity_gte) {
        query = query.gte('stock_quantity', parseInt(req.query.stock_quantity_gte));
      }

      // Aplicar paginación
      query = query
        .range(offset, offset + pageSize - 1)
        .order('product_name', { ascending: true });

      const { data: products, error, count } = await query;

      if (error) {
        return res.status(500).json({ error: 'Error al consultar productos', details: error.message });
      }

      // Calcular metadata de paginación
      const totalPages = Math.ceil(count / pageSize);

      return res.status(200).json({ 
        products: products || [],
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
    // Creación de producto
    try {
      const productData = {
        ...req.body,
        business_account_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error al crear producto', details: error.message });
      }

      return res.status(201).json({ product });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT') {
    // Edición de producto
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });
    // Solo permitir editar productos del business_account
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('id, business_account_id')
      .eq('id', id)
      .single();
    if (findError || !product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.business_account_id !== user.id) return res.status(403).json({ error: 'No autorizado' });
    
    const updateData = {
      ...fields,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) return res.status(500).json({ error: 'Error al actualizar', details: updateError.message });
    return res.status(200).json({ product: updatedProduct });
  }

  if (req.method === 'DELETE') {
    // Eliminación de producto
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });
    // Solo permitir eliminar productos del business_account
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('id, business_account_id')
      .eq('id', id)
      .single();
    if (findError || !product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.business_account_id !== user.id) return res.status(403).json({ error: 'No autorizado' });
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (deleteError) return res.status(500).json({ error: 'Error al eliminar', details: deleteError.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 