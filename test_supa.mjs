
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://muiawpcrlvnalczgzjxu.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aWF3cGNybHZuYWxjemd6anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzY5MDEsImV4cCI6MjA2NjcxMjkwMX0.EVI-igEHdJARrO6-bC3ooY37lq7ajoRLuiI97o4cGb8"
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Configured' : 'Not Configured')

let { data: products, error } = await supabase
  .from('products')
  .select("*")
  .eq('name', 'Delacrem')  // Exact match on place name
  .order('product_name', { ascending: true })
console.log('Products:', products)