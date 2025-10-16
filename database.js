// database.js
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN KREDENSIAL DARI SUPABASE ANDA
const supabaseUrl = 'https://vbjpefjyulpopurjjexh.supabase.co'; // ← Ganti ini!
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianBlZmp5dWxwb3B1cmpqZXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODA0MjYsImV4cCI6MjA3NjE1NjQyNn0.iJYdv6SsKiK59wuH2eH0nctPkWTcOyZJpBXtg5-gBPI'; // ← Ganti ini!

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi: Ambil semua data absensi
export async function getAbsensi() {
  const { data, error } = await supabase
    .from('absensi')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil data:', error);
    throw new Error('Gagal mengambil data absensi');
  }
  return data;
}

// Fungsi: Tambah data absensi
export async function tambahAbsensi(nama, kelas) {
  if (!nama || !kelas) {
    throw new Error('Nama dan kelas tidak boleh kosong');
  }

  const { data, error } = await supabase
    .from('absensi')
    .insert([{ nama, kelas }])
    .select();

  if (error) {
    console.error('Error menambah data:', error);
    throw new Error('Gagal menambah data absensi');
  }
  return data[0];
}

// Fungsi: Hapus data absensi (opsional)
export async function hapusAbsensi(id) {
  const { error } = await supabase
    .from('absensi')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error menghapus data:', error);
    throw new Error('Gagal menghapus data');
  }
}

// Fungsi: Ekspor ke CSV (opsional, bisa dipakai di route)
export async function getAllAbsensiForCSV() {
  const { data, error } = await supabase
    .from('absensi')
    .select('nama, kelas, tanggal, jam')
    .order('tanggal', { ascending: false });

  if (error) throw error;
  return data;
}
