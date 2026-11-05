-- LỜI HAY Ý ĐÚNG – lược đồ Supabase. Chạy toàn bộ trong SQL Editor.
create extension if not exists pgcrypto;

create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text,
  role text not null default 'teacher' check (role in ('teacher','student','admin')),
  organization text, bio text, avatar_url text,
  is_locked boolean not null default false,
  created_at timestamptz default now());
create table public.subjects(id serial primary key, name text unique not null, sort int default 0, active boolean default true);
create table public.resource_categories(id serial primary key, name text not null, description text, sort int default 0, active boolean default true);
create table public.resources(
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, description text,
  subject text, topic_id int references public.resource_categories(id),
  type text, purpose text, audience text, level text,
  thumbnail_url text, external_url text, usage_guide text, source text, license text,
  allow_view boolean default true, allow_download boolean default false, allow_edit boolean default false,
  status text not null default 'draft' check (status in ('draft','pending','reviewing','revision','approved','rejected','hidden')),
  review_note text, views int default 0, downloads int default 0,
  version int default 1, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.resource_files(id uuid primary key default gen_random_uuid(), resource_id uuid references public.resources(id) on delete cascade, path text not null, name text, mime text, size bigint, created_at timestamptz default now());
create table public.resource_reviews(id uuid primary key default gen_random_uuid(), resource_id uuid references public.resources(id) on delete cascade, reviewer_id uuid references public.profiles(id), decision text not null, reason text, created_at timestamptz default now());
create table public.resource_versions(id uuid primary key default gen_random_uuid(), resource_id uuid references public.resources(id) on delete cascade, version int, snapshot jsonb, created_at timestamptz default now());
create table public.favorites(user_id uuid references public.profiles(id) on delete cascade, resource_id uuid references public.resources(id) on delete cascade, created_at timestamptz default now(), primary key(user_id,resource_id));
create table public.notifications(id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, title text, body text, link text, is_read boolean default false, created_at timestamptz default now());
create table public.resource_reports(id uuid primary key default gen_random_uuid(), resource_id uuid references public.resources(id) on delete cascade, reporter_id uuid references public.profiles(id), reason text not null, status text default 'open', created_at timestamptz default now());
create table public.resource_downloads(id uuid primary key default gen_random_uuid(), resource_id uuid references public.resources(id) on delete cascade, user_id uuid, created_at timestamptz default now());

insert into public.subjects(name,sort) values ('Tiếng Việt 4',1),('Đạo đức 4',2),('Tích hợp liên môn',3),('Hoạt động trải nghiệm',4);
insert into public.resource_categories(id,name,sort) values
 (1,'Làm quen và kết bạn',1),(2,'Xây dựng và duy trì tình bạn',2),(3,'Cảm thông và giúp đỡ người khác',3),
 (4,'Giao tiếp và hợp tác trong học tập',4),(5,'Giao tiếp lịch sự: cảm ơn, xin lỗi và ứng xử phù hợp',5),
 (6,'Ứng xử trong các tình huống đời sống',6),(7,'Bảo vệ bản thân trong giao tiếp',7);

-- Hàm tiện ích
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role='admin' and not is_locked) $$;

-- Tạo hồ sơ khi đăng ký. Chỉ cho phép teacher/student: không ai tự nâng quyền thành admin.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,email,full_name,role,organization) values(new.id,new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    case when new.raw_user_meta_data->>'role'='student' then 'student' else 'teacher' end,
    new.raw_user_meta_data->>'organization');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Chặn người dùng tự đổi role/khóa tài khoản
create or replace function public.guard_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is not null and not is_admin() and (new.role<>old.role or new.is_locked<>old.is_locked) then
    raise exception 'Không có quyền thay đổi vai trò hoặc trạng thái tài khoản';
  end if; return new;
end $$;
create trigger guard_profile_t before update on public.profiles for each row execute function public.guard_profile();

-- Người dùng thường chỉ được chuyển trạng thái: draft/revision/rejected -> draft|pending ; thay đổi nội dung quan trọng của bài đã duyệt -> pending
create or replace function public.guard_resource() returns trigger language plpgsql security definer set search_path=public as $$
begin
  new.updated_at=now();
  if is_admin() then return new; end if;
  if new.status is distinct from old.status then
    if not (new.status in ('draft','pending') and old.status in ('draft','revision','rejected','pending')) then
      raise exception 'Bạn không được tự thay đổi trạng thái kiểm duyệt';
    end if;
  elsif old.status='approved' and (new.title<>old.title or new.description is distinct from old.description or new.external_url is distinct from old.external_url) then
    insert into resource_versions(resource_id,version,snapshot) values(old.id,old.version,to_jsonb(old));
    new.status='pending'; new.version=old.version+1;
  end if;
  if new.views<>old.views or new.downloads<>old.downloads or new.review_note is distinct from old.review_note then
    new.views=old.views; new.downloads=old.downloads; new.review_note=old.review_note;
  end if;
  return new;
end $$;
create trigger guard_resource_t before update on public.resources for each row execute function public.guard_resource();

-- Admin kiểm duyệt (kiểm tra quyền ở phía máy chủ)
create or replace function public.review_resource(p_id uuid, p_decision text, p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare r resources;
begin
  if not is_admin() then raise exception 'Chỉ quản trị viên được kiểm duyệt'; end if;
  if p_decision not in ('approved','revision','rejected','hidden','reviewing') then raise exception 'Quyết định không hợp lệ'; end if;
  if p_decision in ('revision','rejected','hidden') and coalesce(trim(p_reason),'')='' then raise exception 'Cần nêu lý do'; end if;
  update resources set status=p_decision, review_note=p_reason where id=p_id returning * into r;
  insert into resource_reviews(resource_id,reviewer_id,decision,reason) values(p_id,auth.uid(),p_decision,p_reason);
  insert into notifications(user_id,title,body,link) values(r.author_id,'Kết quả kiểm duyệt: '||r.title,
    case p_decision when 'approved' then 'Học liệu đã được phê duyệt.' when 'revision' then 'Cần chỉnh sửa: '||p_reason when 'rejected' then 'Bị từ chối: '||p_reason else 'Trạng thái: '||p_decision end,'#/dashboard');
end $$;

create or replace function public.increment_view(p_id uuid) returns void language sql security definer set search_path=public as
$$ update resources set views=views+1 where id=p_id and status='approved' $$;
create or replace function public.record_download(p_id uuid) returns void language sql security definer set search_path=public as
$$ with u as (update resources set downloads=downloads+1 where id=p_id and status='approved' and allow_download returning id)
   insert into resource_downloads(resource_id,user_id) select id,auth.uid() from u $$;

-- RLS
alter table profiles enable row level security; alter table subjects enable row level security; alter table resource_categories enable row level security;
alter table resources enable row level security; alter table resource_files enable row level security; alter table resource_reviews enable row level security;
alter table resource_versions enable row level security; alter table favorites enable row level security; alter table notifications enable row level security;
alter table resource_reports enable row level security; alter table resource_downloads enable row level security;

create policy prof_read on profiles for select using (true);
create policy prof_upd on profiles for update using (id=auth.uid() or is_admin());
create policy sub_read on subjects for select using (true);
create policy sub_admin on subjects for all using (is_admin()) with check (is_admin());
create policy cat_read on resource_categories for select using (true);
create policy cat_admin on resource_categories for all using (is_admin()) with check (is_admin());

create policy res_read on resources for select using (status='approved' or author_id=auth.uid() or is_admin());
create policy res_ins on resources for insert with check (author_id=auth.uid() and status in ('draft','pending') and not exists(select 1 from profiles where id=auth.uid() and is_locked));
create policy res_upd on resources for update using (author_id=auth.uid() or is_admin());
create policy res_del on resources for delete using (author_id=auth.uid() and status in ('draft','rejected') or is_admin());

create policy rf_read on resource_files for select using (exists(select 1 from resources r where r.id=resource_id and (r.status='approved' or r.author_id=auth.uid() or is_admin())));
create policy rf_write on resource_files for all using (exists(select 1 from resources r where r.id=resource_id and (r.author_id=auth.uid() or is_admin())))
  with check (exists(select 1 from resources r where r.id=resource_id and (r.author_id=auth.uid() or is_admin())));
create policy rr_read on resource_reviews for select using (is_admin() or exists(select 1 from resources r where r.id=resource_id and r.author_id=auth.uid()));
create policy rv_read on resource_versions for select using (is_admin() or exists(select 1 from resources r where r.id=resource_id and r.author_id=auth.uid()));
create policy fav_all on favorites for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy nt_read on notifications for select using (user_id=auth.uid());
create policy nt_upd on notifications for update using (user_id=auth.uid());
create policy rp_ins on resource_reports for insert with check (auth.uid() is not null and reporter_id=auth.uid());
create policy rp_admin on resource_reports for all using (is_admin()) with check (is_admin());
create policy dl_admin on resource_downloads for select using (is_admin());

-- Storage: bucket riêng tư. Tệp chưa duyệt chỉ tác giả và admin truy cập được.
insert into storage.buckets(id,name,public) values('resources','resources',false) on conflict do nothing;
create policy st_upload on storage.objects for insert to authenticated with check (bucket_id='resources' and (storage.foldername(name))[1]=auth.uid()::text);
create policy st_owner on storage.objects for select to authenticated using (bucket_id='resources' and ((storage.foldername(name))[1]=auth.uid()::text or is_admin()));
create policy st_public_approved on storage.objects for select using (bucket_id='resources' and exists(
  select 1 from resource_files f join resources r on r.id=f.resource_id where f.path=name and r.status='approved' and (r.allow_download or r.allow_view)));
create policy st_delete on storage.objects for delete to authenticated using (bucket_id='resources' and ((storage.foldername(name))[1]=auth.uid()::text or is_admin()));

-- Sau khi đăng ký tài khoản đầu tiên, cấp quyền admin bằng tay (chạy trong SQL Editor):
-- update public.profiles set role='admin' where email='email-cua-ban@example.com';
