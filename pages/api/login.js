import { getSupabaseClient } from '../../utils/supabaseClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('business_account')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    const match = await bcrypt.compare(password, data.password);
    if (!match) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    // Generar JWT
    const secret = process.env.JWT_SECRET || 'supersecret';
    const payload = {
      id: data.id,
      business_account_id: data.id, // Explícito para mayor claridad
      email: data.email,
      business_name: data.business_name || null,
    };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        id: data.id,
        business_account_id: data.id,
        email: data.email, 
        phone: data.phone, 
        website: data.website, 
        description: data.description,
        business_name: data.business_name 
      } 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
