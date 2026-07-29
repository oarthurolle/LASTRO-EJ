create index if not exists idx_partners_public_sort
    on partners (sort_order, id)
    where active = true;
