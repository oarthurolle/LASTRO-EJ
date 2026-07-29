-- Roles e privilégios abaixo são metadados do sistema, não conteúdo demonstrativo.
insert into roles_privileges (role_id, privilege_id)
select r.id, p.id
from role r
join privilege p on p.name in ('MFA_SELF_MANAGE', 'MFA_SELF_DISABLE')
where r.name = 'DIRECTOR'
on conflict do nothing;

update users set email = lower(trim(email));
alter table users alter column email set not null;
alter table users alter column approval_status set default 'PENDING';

create unique index if not exists uq_users_email_normalized
    on users (lower(email));

alter table users
    add constraint ck_users_approval_status
    check (approval_status in ('PENDING', 'APPROVED', 'REJECTED'));

update blog_posts set version = 0 where version is null;
alter table blog_posts alter column version set not null;

alter table blog_posts
    add constraint ck_blog_posts_status
    check (status in ('DRAFT', 'PUBLISHED', 'UNPUBLISHED'));

alter table partners
    add constraint ck_partners_sort_order
    check (sort_order >= 0);

alter table email_token drop constraint if exists fk_email_token_user;
alter table email_token
    add constraint fk_email_token_user
    foreign key (user_id)
    references users(id)
    on delete cascade;
