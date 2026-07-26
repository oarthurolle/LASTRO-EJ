create sequence if not exists blog_posts_seq_generator start with 1 increment by 1;
create sequence if not exists case_studies_seq_generator start with 1 increment by 1;
create sequence if not exists partners_seq_generator start with 1 increment by 1;
create sequence if not exists site_indicators_seq_generator start with 1 increment by 1;
create sequence if not exists contact_messages_seq_generator start with 1 increment by 1;

create table if not exists blog_posts (
    id bigint not null default nextval('blog_posts_seq_generator'),
    title varchar(150) not null,
    slug varchar(255) not null unique,
    summary varchar(255) not null,
    content text not null,
    cover_image_url varchar(255),
    author varchar(255) not null,
    category varchar(255),
    status varchar(50) not null,
    published_at timestamp(6),
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    primary key (id)
);

create table if not exists case_studies (
    id bigint not null default nextval('case_studies_seq_generator'),
    client_name varchar(255) not null,
    service_category varchar(255),
    problem text not null,
    solution text not null,
    result text not null,
    cover_image_url varchar(255),
    testimonial text,
    project_date date,
    status varchar(50) not null,
    primary key (id)
);

create table if not exists partners (
    id bigint not null default nextval('partners_seq_generator'),
    name varchar(255) not null,
    logo_url varchar(255) not null,
    external_link varchar(255),
    sort_order int not null,
    active boolean not null,
    primary key (id)
);

create table if not exists site_indicators (
    id bigint not null default nextval('site_indicators_seq_generator'),
    name varchar(255) not null,
    value varchar(255) not null,
    description varchar(255),
    updated_at timestamp(6) not null,
    primary key (id)
);

create table if not exists contact_messages (
    id bigint not null default nextval('contact_messages_seq_generator'),
    name varchar(255) not null,
    email varchar(255) not null,
    phone varchar(50),
    subject varchar(255) not null,
    message text not null,
    created_at timestamp(6) not null,
    primary key (id)
);

-- Sincronizar a sequence com o ID máximo atual (pois a migration anterior fez inserts com IDs fixos 1, 2, 3, 4)
SELECT setval('privilege_seq_generator', coalesce((SELECT max(id) FROM privilege), 1));

insert into privilege (name, created_at)
values
    ('PRIV_BLOG_ADMIN', current_timestamp),
    ('PRIV_CASES_ADMIN', current_timestamp),
    ('PRIV_PARTNERS_ADMIN', current_timestamp),
    ('PRIV_INDICATORS_ADMIN', current_timestamp),
    ('PRIV_CONTACTS_VIEW', current_timestamp)
on conflict (name) do nothing;

insert into roles_privileges (role_id, privilege_id)
select 2, id from privilege
where name in (
    'PRIV_BLOG_ADMIN',
    'PRIV_CASES_ADMIN',
    'PRIV_PARTNERS_ADMIN',
    'PRIV_INDICATORS_ADMIN',
    'PRIV_CONTACTS_VIEW'
)
on conflict do nothing;
