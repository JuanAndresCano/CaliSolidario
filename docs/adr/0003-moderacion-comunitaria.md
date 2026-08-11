# ADR-0003 — La comunidad marca el conflicto; el retiro es la excepción

- **Fecha:** 2026-08-11
- **Estado:** aceptado

## Contexto

La primera propuesta fue clásica: botón de reportar, cola de reportes, un
moderador retira. Se descartó por una razón de fondo — pone a una persona a
decidir en minutos, sin contexto, sobre situaciones que no presenció, y en un
tablero de emergencia esa persona se convierte en el cuello de botella justo
cuando el volumen crece.

La alternativa que se adoptó parte de otra premisa: quien tiene la información
es quien vivió el hecho, y quien mejor puede sopesarla es el resto de gente que
está coordinando entregas en la misma zona.

## Decisión

Comentarios públicos por aviso, de dos tipos:

- `comment` — un aporte cualquiera: "ya lo llevé", "yo tengo parte de eso".
- `warning` — una alerta: algo salió mal con el aviso o con quien lo publicó.

Una alerta **no retira el aviso**. Incrementa `posts.warning_count` mediante un
trigger, y con eso el aviso aparece marcado "⚠ En conflicto" en el tablero.
Los demás evalúan cada testimonio con "Me consta" / "No es así", y el autor
puede responder en el mismo hilo.

Tres límites, cada uno por un riesgo concreto:

1. **La marca es pública, el texto no.** `warning_count` lo ve cualquiera,
   incluso sin cuenta, porque la advertencia no sirve si solo la ven los
   registrados. Pero el cuerpo de los testimonios exige sesión: en Colombia
   injuria y calumnia son delitos, y una acusación con nombre propio no debe
   quedar indexable por buscadores ni raspable por cualquiera.
2. **Los testimonios no se editan, solo se borran.** Un texto editado después
   de que otros lo respaldaron dejaría de significar lo que respaldaron.
3. **El retiro administrativo sobrevive.** Una etiqueta de advertencia no
   detiene a alguien desesperado que igual va a llamar al número. Ante una
   estafa evidente el admin retira el aviso, y ante una acusación difamatoria
   oculta la alerta. Es la válvula, no el mecanismo principal.

## Consecuencias

- Un aviso en conflicto sigue siendo alcanzable. Si la alerta era un
  malentendido, la coordinación no se rompió; si era real, quien lo lea ya está
  advertido y con el relato a la vista.
- El sistema es manipulable: varias cuentas coordinadas pueden marcar en
  conflicto a alguien que está ayudando de verdad. Se mitiga en parte porque
  las alertas van firmadas, son evaluables por terceros y el autor responde en
  el mismo hilo. No se elimina. Es el costo aceptado de no poner a un censor.
- La responsabilidad legal por lo que se publique no desaparece por exigir
  sesión; solo se reduce la exposición. Si el proyecto crece, hace falta una
  política de contenidos publicada y un canal de retiro a petición del afectado.
- `warning_count` es un contador desnormalizado mantenido por trigger
  `security definer`. Si alguna vez se manipulan comentarios por fuera de la
  app, hay que recalcularlo.
