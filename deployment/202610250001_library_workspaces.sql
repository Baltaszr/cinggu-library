-- Private full-editor libraries. Existing OLED characters and ownership rules are unchanged.
begin;
create table public.library_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 document jsonb not null check (
  jsonb_typeof(document)='object' and document->>'version'='2'
  and jsonb_typeof(document->'library'->'avatars')='array'
  and jsonb_array_length(document->'library'->'avatars') between 1 and 200
  and jsonb_typeof(document->'expressions')='array'
  and jsonb_typeof(document->'sequences')='array'
  and octet_length(document::text)<5000000
 ),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.library_workspaces enable row level security;
revoke all on public.library_workspaces from anon,authenticated;
grant select,insert,update,delete on public.library_workspaces to authenticated;
create policy library_workspace_own on public.library_workspaces for all to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function private.before_library_workspace() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='UPDATE' then NEW.user_id:=OLD.user_id;NEW.created_at:=OLD.created_at;end if;
 NEW.updated_at:=clock_timestamp();return NEW;
end $$;
create trigger library_workspace_timestamp before insert or update on public.library_workspaces for each row execute function private.before_library_workspace();
revoke all on function private.before_library_workspace() from public,anon,authenticated;

-- Owner reads only a summary: no artwork documents or authentication tokens are returned.
create or replace function public.owner_workspace() returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.is_owner() then raise exception 'Owner access required' using errcode='42501'; end if;
 select jsonb_build_object(
  'counts',jsonb_build_object(
   'creators',(select count(*) from public.profiles),
   'characters',(select count(*) from public.characters),
   'libraries',(select count(*) from public.library_workspaces),
   'activeCreators',(select count(*) from (select user_id from public.characters union select user_id from public.library_workspaces) saved)),
  'creators',coalesce((select jsonb_agg(x) from (
    select p.id,p.username,u.email,p.phone,p.created_at,u.last_sign_in_at,
    (select count(*) from public.characters c where c.user_id=p.id) as character_count,
    (select count(*) from public.library_workspaces w where w.user_id=p.id) as library_count
    from public.profiles p join auth.users u on u.id=p.id order by p.created_at desc limit 500
  ) x),'[]'::jsonb),
  'characters',coalesce((select jsonb_agg(x) from (
    select * from (
      select c.id,c.name,p.username,c.created_at,c.updated_at,jsonb_array_length(c.design->'frames') as frame_count,'OLED character' as kind
      from public.characters c join public.profiles p on p.id=c.user_id
      union all
      select w.user_id,'Cinggu library',p.username,w.created_at,w.updated_at,jsonb_array_length(w.document->'expressions'),'Editor workspace'
      from public.library_workspaces w join public.profiles p on p.id=w.user_id
    ) saved order by updated_at desc limit 200
  ) x),'[]'::jsonb),
  'activity',coalesce((select jsonb_agg(x) from (
    select * from (
      select p.username,'Joined Cinggu' as action,p.created_at as at from public.profiles p
      union all select p.username,'Saved: '||c.name,c.updated_at from public.characters c join public.profiles p on p.id=c.user_id
      union all select p.username,'Saved editor library',w.updated_at from public.library_workspaces w join public.profiles p on p.id=w.user_id
      union all select p.username,'Signed in',u.last_sign_in_at from auth.users u join public.profiles p on p.id=u.id where u.last_sign_in_at is not null
    ) events order by at desc limit 50
  ) x),'[]'::jsonb)
 ) into result;
 return result;
end $$;
comment on function public.owner_workspace() is 'Owner-only latest account and save summaries, not an exhaustive event history or visitor analytics.';
commit;
