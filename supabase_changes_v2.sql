-- Run once in Supabase -> SQL Editor.

-- 1. Let invoices store a chosen (back-dated / random) invoice date
alter table invoices add column if not exists invoice_date date;

-- 2. Make the controller account an ADMIN.
--    FIRST create the user in: Supabase Dashboard -> Authentication -> Users -> Add user
--      email: karthickeyan2372005@gmail.com   (tick "Auto Confirm User", enter the password there)
--    THEN run this:
insert into profiles (id, role, is_approved, business_name)
select id, 'ADMIN', true, 'Controller'
from auth.users
where email = 'karthickeyan2372005@gmail.com'
on conflict (id) do update set role = 'ADMIN', is_approved = true;
