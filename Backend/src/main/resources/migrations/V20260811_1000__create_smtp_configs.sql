create sequence if not exists smtp_configs_seq_generator start with 1 increment by 1;

create table if not exists smtp_configs (
    id bigint not null default nextval('smtp_configs_seq_generator'),
    name varchar(120) not null,
    host varchar(255) not null,
    port integer not null,
    username varchar(255),
    password varchar(255),
    from_name varchar(255),
    from_address varchar(255) not null,
    contact_recipient varchar(255),
    auth boolean not null default false,
    starttls boolean not null default false,
    active boolean not null default false,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    primary key (id)
);

-- Garante que no máximo uma configuração SMTP esteja ativa por vez.
create unique index if not exists uq_smtp_configs_active on smtp_configs (active) where active;