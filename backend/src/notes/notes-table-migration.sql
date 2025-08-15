-- Migration to add organization and search/filter columns to the 'notes' table in Supabase

alter table notes
  add column if not exists folder text,
  add column if not exists tags text[],
  add column if not exists color_label text,
  add column if not exists icon text,
  add column if not exists file_type text,
  add column if not exists ocr_text text;
