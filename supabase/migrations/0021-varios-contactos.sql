-- Migración 0021 — varios contactos por lugar.
--
-- `places` tenía un solo par (contact_method, contact_value). Al cargar la
-- orientación jurídica de Icesi, que atiende con tres celulares y tres
-- personas distintas, hubo que dejar dos de ellos escritos dentro de la
-- descripción: texto que nadie puede tocar y que no se convierte en un botón.
--
-- Un acopio grande tiene el mismo problema: un número para donaciones y otro
-- para coordinar voluntarios.
--
-- EXPAND / CONTRACT: las columnas `contact_method` y `contact_value` se
-- quedan. El código desplegado hoy las lee, y el mapa las sigue usando para
-- el contacto principal. La aplicación escribe en las dos partes —la tabla
-- nueva y las columnas viejas con el primer contacto— hasta que una migración
-- posterior las elimine. Sin eso, entre correr esto y desplegar el código
-- nuevo habría una ventana con contactos desincronizados.

create table if not exists place_contacts (
  id       uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,

  method contact_method not null,
  value  text not null check (length(trim(value)) between 3 and 120),

  -- Quién contesta: "Valentina Valencia", "Coordinación de voluntarios".
  -- Con tres números iguales en pantalla, esto es lo único que le dice a
  -- alguien a cuál escribir.
  label text check (length(label) <= 60),

  -- El primero es el principal: el que va en el botón grande y el que se
  -- copia a las columnas heredadas.
  orden smallint not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists place_contacts_place_idx
  on place_contacts (place_id, orden);

-- ---------------------------------------------------------------------------
-- RLS: se hereda del lugar. Un contacto es visible si su lugar lo es, y lo
-- administra quien administra el lugar. Duplicar aquí las reglas de `places`
-- garantizaría que algún día se separen.
-- ---------------------------------------------------------------------------

alter table place_contacts enable row level security;

drop policy if exists place_contacts_select_public on place_contacts;
create policy place_contacts_select_public on place_contacts
  for select using (
    exists (select 1 from places p where p.id = place_id and p.is_active)
  );

drop policy if exists place_contacts_admin on place_contacts;
create policy place_contacts_admin on place_contacts
  for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists place_contacts_gestor on place_contacts;
create policy place_contacts_gestor on place_contacts
  for all to authenticated
  using (
    exists (
      select 1 from places p
       where p.id = place_id
         and gestor_de() is not null
         and p.municipio = gestor_de()
    )
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  )
  with check (
    exists (
      select 1 from places p
       where p.id = place_id
         and gestor_de() is not null
         and p.municipio = gestor_de()
    )
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  );

-- El webhook de revalidación también tiene que dispararse cuando cambia un
-- contacto: si no, cambiar un número no purga la caché y el sitio sigue
-- mostrando el viejo hasta que vence el reloj.
--
-- Solo si configuraste los webhooks por SQL (migración 0015). Si los pusiste
-- desde el panel de Supabase, agrega ahí uno más para esta tabla.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'notificar_revalidacion') then
    drop trigger if exists place_contacts_revalidar on place_contacts;
    create trigger place_contacts_revalidar
      after insert or update or delete on place_contacts
      for each statement execute function notificar_revalidacion();
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Traspaso de lo que ya existe. Idempotente: solo copia el contacto heredado
-- de los lugares que todavía no tienen ninguna fila aquí.
-- ---------------------------------------------------------------------------

insert into place_contacts (place_id, method, value, orden)
select p.id, p.contact_method, p.contact_value, 0
  from places p
 where p.contact_method is not null
   and p.contact_value is not null
   and length(trim(p.contact_value)) >= 3
   and not exists (
     select 1 from place_contacts c where c.place_id = p.id
   );

-- ---------------------------------------------------------------------------
-- Los tres números de la orientación jurídica, que hasta ahora vivían dentro
-- de la descripción. Al sacarlos de ahí se vuelven botones y la descripción
-- queda para lo que es.
-- ---------------------------------------------------------------------------

update place_contacts
   set label = 'Juan Andrés Cuéllar'
 where value = '3163819989'
   and place_id in (
     select id from places where name = 'Orientación jurídica gratuita'
   );

insert into place_contacts (place_id, method, value, label, orden)
select p.id, 'whatsapp', v.value, v.label, v.orden
  from places p
  cross join (values
    ('3158652444', 'Valentina Valencia', 1),
    ('3153368111', 'Nicole Rivas',       2)
  ) as v(value, label, orden)
 where p.name = 'Orientación jurídica gratuita'
   and not exists (
     select 1 from place_contacts c
      where c.place_id = p.id and c.value = v.value
   );

update places
   set description = 'Egresados y estudiantes del Programa de Derecho de la Universidad Icesi acompañan sin costo a quienes enfrentan trámites derivados del sismo. Atención virtual o presencial en Cali; se coordina por WhatsApp.

- Seguros y pólizas: daños en vivienda, copropiedad y vehículo; qué hacer si la aseguradora objeta o demora el pago.
- Arrendamiento: terminación o suspensión del canon si el inmueble quedó inhabitable, y devolución del depósito.
- Sucesiones y estado civil: trámites tras el fallecimiento de un familiar.
- Vivienda y copropiedad: responsabilidad de constructoras y administraciones, y acceso a ayudas y subsidios del Estado.

Es orientación jurídica inicial; no constituye representación judicial.'
 where name = 'Orientación jurídica gratuita';

-- ---------------------------------------------------------------------------
-- Comprobación:
--
--   select p.name, c.orden, c.method, c.value, c.label
--     from places p join place_contacts c on c.place_id = p.id
--    order by p.name, c.orden;
-- ---------------------------------------------------------------------------
