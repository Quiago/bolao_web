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
        query = query.or(`product_name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%,name.ilike.%${req.query.search}%,type.ilike.%${req.query.search}%`);
      }
      if (req.query.type) {
        query = query.eq('type', req.query.type);
      }
      if (req.query.location) {
        query = query.ilike('location', `%${req.query.location}%`);
      }
      if (req.query.delivery) {
        query = query.eq('delivery', req.query.delivery);
      }
      if (req.query.pickup) {
        query = query.eq('pickup', req.query.pickup);
      }
      if (req.query.price_gte) {
        query = query.gte('product_price', parseFloat(req.query.price_gte));
      }
      if (req.query.price_lte) {
        query = query.lte('product_price', parseFloat(req.query.price_lte));
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
      // Validar campos requeridos
      const { name, product_slug } = req.body;
      if (!name || !product_slug) {
        return res.status(400).json({ 
          error: 'Los campos name y product_slug son requeridos' 
        });
      }

      // Generar slug automáticamente si no se proporciona
      const finalSlug = req.body.slug || req.body.product_slug || req.body.product_name?.toLowerCase().replace(/\s+/g, '-') || '';

      const productData = {
        name: req.body.name,
        product_slug: req.body.product_slug,
        product_name: req.body.product_name || null,
        description: req.body.description || null,
        type: req.body.type || null,
        location: req.body.location || null,
        address: req.body.address || null,
        phone: req.body.phone || null,
        phone2: req.body.phone2 || null,
        web: req.body.web || null,
        web2: req.body.web2 || null,
        email: req.body.email || null,
        facebook: req.body.facebook || null,
        instagram: req.body.instagram || null,
        youtube: req.body.youtube || null,
        telegram: req.body.telegram || null,
        logo: req.body.logo || null,
        geo: req.body.geo || null,
        score: req.body.score || null,
        delivery: req.body.delivery || null,
        pickup: req.body.pickup || null,
        slug: finalSlug,
        product_price: req.body.product_price ? parseFloat(req.body.product_price) : null,
        price: req.body.price || null,
        'prince-range-min': req.body['prince-range-min'] || null,
        'prince-range-max': req.body['prince-range-max'] || null,
        business_account_id: user.id
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
    
    // Filtrar solo campos válidos del esquema
    const allowedFields = [
      'name', 'product_slug', 'product_name', 'description', 'type', 
      'location', 'address', 'phone', 'phone2', 'web', 'web2', 
      'email', 'facebook', 'instagram', 'youtube', 'telegram', 
      'logo', 'geo', 'score', 'delivery', 'pickup', 'slug', 
      'product_price', 'price', 'prince-range-min', 'prince-range-max'
    ];
    
    const updateData = {};
    
    // Solo incluir campos válidos
    allowedFields.forEach(field => {
      if (fields[field] !== undefined) {
        if (field === 'product_price') {
          updateData[field] = parseFloat(fields[field]) || null;
        } else {
          updateData[field] = fields[field];
        }
      }
    });
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('business_account_id', user.id) // Doble verificación
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