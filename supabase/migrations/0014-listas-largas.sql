-- Migración 0014 — las listas de insumos pueden ser largas.
--
-- El tope de 500 caracteres se quedó corto con la lista priorizada de Icesi:
-- unos 25 medicamentos y 18 insumos con dosis y presentaciones. Resumirla no
-- es opción — quien va a la farmacia necesita el nombre exacto, y "y demás
-- insumos médicos" hace que llegue lo que no sirve.
--
-- Con el salto de línea permitido, la tarjeta puede mostrar la lista agrupada
-- (medicamentos / insumos) en vez de un párrafo corrido ilegible en un móvil.

alter table places drop constraint if exists places_supplies_needed_check;
alter table places drop constraint if exists places_supplies_surplus_check;

alter table places add constraint places_supplies_needed_check
  check (supplies_needed is null or length(supplies_needed) <= 2000);

alter table places add constraint places_supplies_surplus_check
  check (supplies_surplus is null or length(supplies_surplus) <= 2000);
