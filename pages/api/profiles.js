import { getSupabaseClient } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not configured' });
  }

  if (req.method === 'GET') {
    try {
      // Obtener perfil por email o ID
      const { email, id } = req.query;
      
      if (!email && !id) {
        return res.status(400).json({ error: 'Email o ID requerido' });
      }

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (email) {
        query = query.eq('email', email);
      } else if (id) {
        query = query.eq('id', id);
      }

      const { data: profile, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Perfil no encontrado' });
        }
        return res.status(500).json({ error: 'Error al buscar perfil', details: error.message });
      }

      return res.status(200).json({ profile });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Crear nuevo perfil
      const { email, full_name, phone, avatar_url } = req.body;

      if (!email || !full_name) {
        return res.status(400).json({ 
          error: 'Los campos email y full_name son requeridos' 
        });
      }

      // Verificar si ya existe un perfil con ese email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        return res.status(409).json({ error: 'Ya existe un perfil con este email' });
      }

      const profileData = {
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error al crear perfil', details: error.message });
      }

      return res.status(201).json({ profile });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Actualizar perfil existente
      const { id, full_name, phone, avatar_url } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      // Verificar que el perfil existe
      const { data: existingProfile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (findError || !existingProfile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (full_name) updateData.full_name = full_name.trim();
      if (phone !== undefined) updateData.phone = phone?.trim() || null;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url?.trim() || null;

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Error al actualizar perfil', details: updateError.message });
      }

      return res.status(200).json({ profile: updatedProfile });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Soft delete del perfil
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      // Verificar que el perfil existe
      const { data: existingProfile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (findError || !existingProfile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }

      // Soft delete: marcar como inactivo
      const { error: deleteError } = await supabase
        .from('profiles')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({ error: 'Error al eliminar perfil', details: deleteError.message });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}