SELECT setval('role_seq_generator', coalesce((SELECT max(id) FROM role), 1));
SELECT setval('privilege_seq_generator', coalesce((SELECT max(id) FROM privilege), 1));

insert into role (name, created_at) values ('DIRECTOR', current_timestamp) on conflict (name) do nothing;

insert into privilege (name, created_at) values ('PRIV_USER_MANAGEMENT', current_timestamp) on conflict (name) do nothing;
insert into privilege (name, created_at) values ('PRIV_COMPANY_INFO_ADMIN', current_timestamp) on conflict (name) do nothing;

-- Assign new privileges to DIRECTOR
insert into roles_privileges (role_id, privilege_id)
select r.id, p.id from role r, privilege p
where r.name = 'DIRECTOR' and p.name in ('PRIV_USER_MANAGEMENT', 'PRIV_COMPANY_INFO_ADMIN')
on conflict do nothing;

-- Assign all other privileges to DIRECTOR
insert into roles_privileges (role_id, privilege_id)
select r.id, p.id from role r, privilege p
where r.name = 'DIRECTOR' and p.name in (
    'PRIV_BLOG_ADMIN',
    'PRIV_CASES_ADMIN',
    'PRIV_PARTNERS_ADMIN',
    'PRIV_INDICATORS_ADMIN',
    'PRIV_CONTACTS_VIEW'
)
on conflict do nothing;
