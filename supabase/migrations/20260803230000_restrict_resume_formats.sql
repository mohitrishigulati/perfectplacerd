-- Resume uploads are intentionally limited to text-readable PDF and DOCX files.
update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
where id = 'resumes';
