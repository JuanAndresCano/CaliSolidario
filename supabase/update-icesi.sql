-- Actualización del centro de acopio de Universidad Icesi.
-- Requiere la migración 0014 (listas de hasta 2000 caracteres).
--
-- Se fusiona el acopio de bienestar animal en esta misma ficha en vez de crear
-- una segunda: es el mismo salón (G-108G), así que dos registros tendrían las
-- mismas coordenadas y en el mapa un pin taparía al otro. La lista va agrupada
-- por secciones para que quien lleva comida de perro no tenga que leerse la
-- lista de antihipertensivos.
--
-- CORRECCIONES ORTOGRÁFICAS (nombres de medicamentos, donde un error manda a
-- comprar lo que no es):
--   "CARBEDILOL" -> carvedilol
--   "METOPROL"   -> metoprolol
--
-- SIN CORREGIR, PORQUE NO ME CONSTA — confírmalos con Icesi:
--   "Hidrofenaco inyectable": podría ser diclofenaco, pero no lo doy por
--   hecho. Lo dejo tal cual apareció en la pieza.
--   "Dextromil": parece un nombre comercial. Igual, transcrito literal.
--
-- CONFLICTO DE HORARIO: la pieza de insumos médicos dice hasta las 5:00 p. m.
-- y la de bienestar animal hasta las 6:00 p. m., en el mismo salón. Publico
-- las dos como vinieron; si ya se unificó, corrige el campo `schedule`.

update places set
  description = 'Centro de acopio institucional en el edificio G, salón 108G.

Lo atienden estudiantes de Medicina y profesores para los insumos de personas, y el programa de Medicina Veterinaria y Zootecnia para el bienestar animal. También reciben ropa, elementos de aseo y comida no perecedera, y envían a otros municipios afectados.

Cuenta con el apoyo de la Alcaldía de Santiago de Cali.',

  schedule = 'Jornada continua de 8:00 a. m. a 5:00 p. m. (animales, hasta las 6:00 p. m.)',

  supplies_needed = 'MEDICAMENTOS PARA PERSONAS
Dipirona (1 y 2 g), diclofenaco 75 mg, ondansetrón inyectable, clindamicina 600 mg, metoclopramida inyectable 10 mg, acetaminofén en tabletas y en jarabe para niños, beclometasona inhalador, salbutamol inhalador, metronidazol, cefazolina, amlodipino, valsartán, enalapril, atorvastatina, captopril, losartán, nifedipino, hidroclorotiazida, metoprolol, carvedilol, espironolactona, verapamilo, clonidina, metformina, semaglutida y empagliflozina + metformina.

INSUMOS MÉDICOS
Gasa estéril, solución salina 0,9 %, lactato de Ringer, solución dextrosa, alcohol antiséptico, guantes de látex y estériles, equipo macrogoteo, sutura Prolene con aguja curva, sutura Vicryl, ambú resucitador manual (adulto y pediátrico), inhalocámaras (adulto y pediátrico), tapón venoso, micropore, esparadrapo, catéteres de distintos calibres, jeringas de 3, 5 y 10 mL, y yodopovidona en solución y en espuma.

PARA ANIMALES
Comida para perros y gatos, cocas de comida, camas, guacales, correas, cobijas y tarros de agua. En insumos: lactato de Ringer, cloruro de sodio, lidocaína y lidocaína inyectable, lágrimas artificiales, adrenalina, catéteres 18, 20 y 22, hidrofenaco inyectable, jeringas, dextrosa, dextromil, antitetánica, ácido tranexámico, dexametasona en ampollas, gasas, alcohol, guantes y tapabocas.

TAMBIÉN RECIBEN
Ropa, elementos de aseo y comida no perecedera.',

  confirmed_at = now()

where name = 'Universidad Icesi — medicamentos e insumos médicos';

-- El nombre se queda corto ahora que también recibe para animales:
update places
   set name = 'Universidad Icesi — insumos médicos y bienestar animal'
 where name = 'Universidad Icesi — medicamentos e insumos médicos';
