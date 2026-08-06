import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xmtidywirgkwaueolgth.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGlkeXdpcmdrd2F1ZW9sZ3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzcwMjAsImV4cCI6MjEwMTQxMzAyMH0.1XN6Nc3jFPk9Y8y9kKZAfB1Fx8qoWM_8u8oN5VkZJqA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: File, folder: string = 'documents', companyId?: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const basePath = companyId ? `${companyId}/${folder}` : folder;
    const filePath = `${basePath}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('enterprise-storage')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('enterprise-storage')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}
