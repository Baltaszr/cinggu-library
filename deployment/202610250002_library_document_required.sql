-- Missing fields must fail validation rather than evaluate to SQL NULL.
alter table public.library_workspaces add constraint library_document_required check (
 coalesce(jsonb_typeof(document)='object' and document->>'version'='2'
 and jsonb_typeof(document->'library'->'avatars')='array'
 and jsonb_typeof(document->'expressions')='array'
 and jsonb_typeof(document->'sequences')='array',false)
);
