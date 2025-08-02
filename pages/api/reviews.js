import { getSupabaseClient } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not configured' });
  }

  if (req.method === 'GET') {
    try {
      // Obtener reseñas por place_id
      const { place_id, profile_id, page = 1, pageSize = 10 } = req.query;

      if (!place_id && !profile_id) {
        return res.status(400).json({ error: 'place_id o profile_id requerido' });
      }

      // Parámetros de paginación
      const pageNum = parseInt(page) || 1;
      const pageSizeNum = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * pageSizeNum;

      // Validar pageSize
      if (pageSizeNum < 1 || pageSizeNum > 50) {
        return res.status(400).json({ error: 'pageSize debe estar entre 1 y 50' });
      }

      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      if (place_id) {
        query = query.eq('place_id', place_id);
      }

      if (profile_id) {
        query = query.eq('profile_id', profile_id);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .range(offset, offset + pageSizeNum - 1)
        .order('created_at', { ascending: false });

      const { data: reviews, error, count } = await query;

      if (error) {
        return res.status(500).json({ error: 'Error al obtener reseñas', details: error.message });
      }

      const totalPages = Math.ceil(count / pageSizeNum);

      // Calcular estadísticas si es para un place específico
      let stats = null;
      if (place_id) {
        const { data: statsData, error: statsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('place_id', place_id)
          .eq('is_active', true);

        if (!statsError && statsData) {
          const ratings = statsData.map(r => r.rating);
          const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
          
          // Contar por estrellas
          const ratingCounts = {
            5: ratings.filter(r => r === 5).length,
            4: ratings.filter(r => r === 4).length,
            3: ratings.filter(r => r === 3).length,
            2: ratings.filter(r => r === 2).length,
            1: ratings.filter(r => r === 1).length,
          };

          stats = {
            average: parseFloat(average.toFixed(1)),
            total: ratings.length,
            distribution: ratingCounts
          };
        }
      }

      return res.status(200).json({
        reviews: reviews || [],
        stats,
        meta: {
          currentPage: pageNum,
          pageSize: pageSizeNum,
          totalItems: count,
          totalPages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Crear nueva reseña
      const { place_id, profile_id, rating, title, comment } = req.body;

      if (!place_id || !profile_id || !rating) {
        return res.status(400).json({ 
          error: 'Los campos place_id, profile_id y rating son requeridos' 
        });
      }

      // Validar rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating debe estar entre 1 y 5' });
      }

      // Verificar que el place existe
      const { data: place, error: placeError } = await supabase
        .from('places')
        .select('id')
        .eq('id', place_id)
        .single();

      if (placeError || !place) {
        return res.status(404).json({ error: 'Lugar no encontrado' });
      }

      // Verificar que el profile existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile_id)
        .eq('is_active', true)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }

      // Verificar si ya existe una reseña de este usuario para este lugar
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('place_id', place_id)
        .eq('profile_id', profile_id)
        .single();

      if (existingReview) {
        return res.status(409).json({ error: 'Ya existe una reseña de este usuario para este lugar' });
      }

      const reviewData = {
        place_id: parseInt(place_id),
        profile_id: profile_id,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const { data: review, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error al crear reseña', details: error.message });
      }

      return res.status(201).json({ review });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Actualizar reseña existente
      const { id, rating, title, comment, profile_id } = req.body;

      if (!id || !profile_id) {
        return res.status(400).json({ error: 'ID y profile_id requeridos' });
      }

      // Verificar que la reseña existe y pertenece al usuario
      const { data: existingReview, error: findError } = await supabase
        .from('reviews')
        .select('id, profile_id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (findError || !existingReview) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }

      if (existingReview.profile_id !== profile_id) {
        return res.status(403).json({ error: 'No autorizado para modificar esta reseña' });
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating debe estar entre 1 y 5' });
        }
        updateData.rating = parseInt(rating);
      }

      if (title !== undefined) updateData.title = title?.trim() || null;
      if (comment !== undefined) updateData.comment = comment?.trim() || null;

      const { data: updatedReview, error: updateError } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Error al actualizar reseña', details: updateError.message });
      }

      return res.status(200).json({ review: updatedReview });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Eliminar reseña (soft delete)
      const { id, profile_id } = req.body;

      if (!id || !profile_id) {
        return res.status(400).json({ error: 'ID y profile_id requeridos' });
      }

      // Verificar que la reseña existe y pertenece al usuario
      const { data: existingReview, error: findError } = await supabase
        .from('reviews')
        .select('id, profile_id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (findError || !existingReview) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }

      if (existingReview.profile_id !== profile_id) {
        return res.status(403).json({ error: 'No autorizado para eliminar esta reseña' });
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('reviews')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('profile_id', profile_id);

      if (deleteError) {
        return res.status(500).json({ error: 'Error al eliminar reseña', details: deleteError.message });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}