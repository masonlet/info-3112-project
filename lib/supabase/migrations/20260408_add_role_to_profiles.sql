alter table profiles
  add column role text not null default 'member'
  check (role in ('member', 'product_manager', 'owner'));
