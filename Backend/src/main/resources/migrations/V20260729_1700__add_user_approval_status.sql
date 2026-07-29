alter table users
    add column if not exists approval_status varchar(20) not null default 'APPROVED';

update users
set approval_status = 'APPROVED'
where approval_status is null;

