-- Actualización del centro de acopio de Universidad Icesi.
-- Requiere la migración 0014 (listas de hasta 2000 caracteres) aplicada antes.
--
-- DOS CORRECCIONES ORTOGRÁFICAS A LA PIEZA ORIGINAL, ambas en nombres de
-- medicamentos, donde un error manda a la gente a comprar lo que no es:
--
--   "CARBEDILOL" -> carvedilol
--   "METOPROL"   -> metoprolol
--
-- Confírmalas con Icesi si puedes, pero publicarlas mal era peor.

update places set
  description = 'Centro de acopio institucional atendido por estudiantes de Medicina y profesores. Punto de recepción: edificio G, aula 108G.

Además de insumos médicos reciben ropa, elementos de aseo y comida no perecedera, y envían a otros municipios afectados.',

  schedule = 'Toda la semana, jornada continua de 8:00 a. m. a 5:00 p. m.',

  supplies_needed = 'MEDICAMENTOS
Dipirona (1 y 2 g), diclofenaco 75 mg, ondansetrón inyectable, clindamicina 600 mg, metoclopramida inyectable 10 mg, acetaminofén en tabletas y en jarabe para niños, beclometasona inhalador, salbutamol inhalador, metronidazol, cefazolina, amlodipino, valsartán, enalapril, atorvastatina, captopril, losartán, nifedipino, hidroclorotiazida, metoprolol, carvedilol, espironolactona, verapamilo, clonidina, metformina, semaglutida y empagliflozina + metformina.

INSUMOS
Gasa estéril, solución salina 0,9 %, solución de lactato de Ringer, solución dextrosa, alcohol antiséptico, guantes de látex y estériles, equipo macrogoteo, sutura Prolene con aguja curva, sutura Vicryl, ambú resucitador manual (adulto y pediátrico), inhalocámaras (adulto y pediátrico), tapón venoso, micropore, esparadrapo, catéteres de distintos calibres, jeringas de 3, 5 y 10 mL, y yodopovidona en solución y en espuma.

TAMBIÉN RECIBEN
Ropa, elementos de aseo y comida no perecedera.',

  confirmed_at = now()

where name = 'Universidad Icesi — medicamentos e insumos médicos';
