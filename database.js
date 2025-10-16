// database.js
import { createClient } from '@supabase/supabase-js';

// 🔑 GANTI DENGAN DATA DARI SUPABASE ANDA
const supabaseUrl = 'https://vbjpefjyulpopurjjexh.supabase.co'; // ← Ganti ini!
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianBlZmp5dWxwb3B1cmpqZXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODA0MjYsImV4cCI6MjA3NjE1NjQyNn0.iJYdv6SsKiK59wuH2eH0nctPkWTcOyZJpBXtg5-gBPI'; // ← Ganti ini!

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ambil semua data absensi
export async function getAbsensi() {
  const { data, error } = await supabase
    .from('absensi')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Tambah data absensi
export async function tambahAbsensi(nama, kelas) {
  if (!nama || !kelas) {
    throw new Error('Nama dan kelas wajib diisi');
  }

  const { data, error } = await supabase
    .from('absensi')
    .insert([{ nama, kelas }])
    .select();

  if (error) throw error;
  return data[0];
}

// Opsional: Hapus data
export async function hapusAbsensi(id) {
  const { error } = await supabase
    .from('absensi')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
