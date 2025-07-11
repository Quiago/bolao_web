import { getSupabaseClient } from '../../utils/supabaseClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, phone, website, description } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('business_account')
      .insert([
        { email, password: hashedPassword, phone, website, description }
      ])
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    // Generar JWT para el nuevo usuario
    const secret = process.env.JWT_SECRET || 'supersecret';
    const payload = {
      id: data.id,
      email: data.email,
    };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return res.status(200).json({ success: true, token, user: { id: data.id, email: data.email, phone: data.phone, website: data.website, description: data.description } });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
