-- URGENTE — Edificio Vanessa, 14 de agosto de 2026, 12:06 a. m.
--
-- Reportan sospecha de 3 personas con vida. Cambia todo el perfil del punto:
--
--   * Ya NO se piden manos para mover escombros. La zona es vulnerable a más
--     derrumbes y los rescatistas necesitan espacio para trabajar. Lo que hace
--     falta es equipo médico y gente que APOYE a los rescatistas, no público
--     general.
--   * Prioridad: desfibrilador, pipa de oxígeno, monitor de signos vitales y
--     carpa. Después linternas y guantes.
--   * La motobomba se queda en la lista pero deja de ser prioridad.
--   * El generador ya no hace falta.
--   * Hay contacto y tienen carro para recoger los insumos: Julián Lozano.
--
-- Correr esto de inmediato; el webhook purga la caché en segundos.

update places set
  address = 'Carrera 44 #9-55',

  description = 'Hay sospecha de tres personas con vida en el edificio. El equipo en el sitio cuenta con carro para ir a recoger los insumos: si tienes alguno, llama antes de desplazarte.

Lo que se necesita es equipo médico y personas que apoyen a los rescatistas, no público general moviendo escombros.',

  supplies_needed = 'PRIORIDAD
Desfibrilador, pipa de oxígeno, monitor de signos vitales y carpa.

TAMBIÉN
Linternas y guantes. Motobomba (ya no es lo más urgente).',

  safety_note = 'No vayas por tu cuenta a mover escombros. La zona es vulnerable a más derrumbes de otros edificios y los rescatistas necesitan espacio para trabajar. Si tienes alguno de los equipos que piden, llama primero a Julián Lozano y ellos lo recogen.',

  contact_method = 'whatsapp',
  contact_value  = '3218469901',
  is_verified    = true,
  confirmed_at   = now()

where name = 'Edificio Vanessa — Cra 44 con Calle 9';

-- El nombre lleva la dirección vieja e incompleta:
update places
   set name = 'Edificio Vanessa — Cra 44 #9-55'
 where name = 'Edificio Vanessa — Cra 44 con Calle 9';
