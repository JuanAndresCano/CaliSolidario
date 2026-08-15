# CaliSolidario — documento de contexto

Base de conocimiento del proyecto: qué es, qué demuestra y qué necesita.
Pensado para escribir con él —publicaciones, correos a instituciones,
presentaciones— sin tener que reconstruir la historia cada vez.

- **Sitio:** https://calisolidario.triadaaliados.com
- **Código:** https://github.com/JuanAndresCano/CaliSolidario
- **Actualizado:** 14 de agosto de 2026

> Las cifras de este documento tienen fecha a propósito. Antes de usarlas en
> una publicación, vuelve a correr `scripts/estado-tablero.sh` y
> `scripts/listar-lugares.sh`: en una emergencia envejecen en horas.

---

## 1. Qué es, en una frase

Un tablero público donde quien necesita ayuda tras el sismo y quien puede
darla se encuentran directamente, sin intermediarios y sin dinero de por medio.

## 2. El problema que resuelve

El 10 de agosto de 2026 un sismo de magnitud 7,4 con epicentro en el Chocó
golpeó a Cali. En las horas siguientes pasaron dos cosas a la vez: miles de
personas salieron a ayudar, y miles de familias se quedaron sin nada.

**La escasez no era de solidaridad. Era de información.** Lo que se observó en
terreno esos primeros días:

- Puntos de acopio donde no dejaban entrar más voluntarios porque ya había
  demasiada gente, mientras barrios enteros no recibían nada.
- Sitios con tanta comida perecedera que ya no podían recibir más, y que
  seguían apareciendo en las cadenas de WhatsApp como si les faltara.
- Clínicas que ya no aceptaban donantes de sangre y otras que sí los
  necesitaban, sin forma de saber cuál era cuál.
- Cuatro o cinco plataformas ciudadanas en paralelo, cada una con su propio
  mapa, obligando a un voluntario a revisar todas para decidir a dónde ir.

El problema, entonces, no es conectar oferta con demanda. Es **enrutar**: decir
dónde sobra, dónde falta y qué falta exactamente, y que eso siga siendo cierto
dos horas después.

## 3. Qué hace hoy

| Función | Para quién |
|---|---|
| Publicar lo que se necesita o lo que se ofrece | Cualquiera con cuenta de Google |
| Ver puntos de acopio con **lo que le falta y lo que le sobra** a cada uno | Quien va a donar |
| Ver **zonas a las que no está llegando la ayuda** | Quien quiere ir donde más falta |
| Ver **albergues disponibles** | Quien se quedó sin vivienda |
| Ver **servicios profesionales gratuitos** verificados | Quien necesita apoyo emocional, legal, veterinario |
| Mapa de la ciudad con todos esos puntos | Quien necesita ubicarse |
| Guías escritas por profesionales | Cualquiera |
| Marcar un aviso como resuelto | Quien lo publicó |
| Alertar sobre un aviso sospechoso | Cualquiera con cuenta |

Mirar es libre y no pide registro. La cuenta solo hace falta para publicar,
para ver un dato de contacto o para cerrar un aviso propio.

## 4. Uso real

**Primeras 24 horas de medición** (12–13 de agosto de 2026):

- **1.355 personas**, 6.504 páginas vistas
- **84 % desde el celular** (Android 48 %, iOS 36 %)
- **91 % desde Colombia**; el resto es diáspora buscando cómo ayudar
- Una de cada cuatro personas que entra intenta publicar algo
- La mayor parte del tráfico llega sin referente: es el enlace pegado en chats
  de WhatsApp

> La analítica se instaló dos días después del lanzamiento. Todo el tráfico
> anterior, incluidos los picos de difusión iniciales, no quedó contado.

**Contenido al 14 de agosto:**

- **148 avisos** publicados por la ciudadanía, 14 ya marcados como resueltos
- **17 puntos curados**: 8 acopios, 5 albergues, 3 zonas desatendidas,
  1 servicio profesional

## 5. El dato que más importa: el tablero se dio vuelta

| | 12 de agosto | 14 de agosto |
|---|---|---|
| Avisos totales | 52 | 148 |
| Ofertas de ayuda | 32 | 37 |
| Necesidades | 20 | 111 |

En 48 horas las necesidades se multiplicaron por cinco mientras las ofertas
apenas se movieron. **La ola de voluntarios espontáneos está bajando justo
cuando las necesidades alcanzan su punto más alto.**

Es el patrón conocido de toda emergencia: la respuesta ciudadana es intensa las
primeras 72 horas y después decae, mientras el daño sigue ahí durante semanas.
La diferencia es que aquí se puede ver medido, y en tiempo real.

**Dónde está el desbalance ahora mismo:**

| Categoría | Piden | Ofrecen |
|---|---|---|
| Albergue | 10 | **0** |
| Alimentos | 17 | 4 |
| Aseo | 4 | **0** |
| Cobijas y colchones | 6 | 3 |
| Mano de obra | 10 | 8 |

Nadie está ofreciendo alojamiento ni elementos de aseo, y por cada persona que
ofrece comida hay cuatro pidiéndola.

## 6. Cómo está construido, y por qué importa

Todo el proyecto corre en planes gratuitos y lo mantiene una sola persona. Eso
no es una limitación que se disculpa: es la razón por la que puede sostenerse
sin presupuesto ni convenios, y por la que estuvo en línea el día siguiente al
sismo.

- **El tablero se sirve cacheado.** Mil personas mirándolo producen una
  consulta a la base, no mil. El costo no crece con la difusión.
- **Está pensado para celular y mala red.** El 84 % del tráfico es móvil, en
  una ciudad con la red saturada.
- **Los datos de contacto están protegidos.** Un aviso es público, pero el
  teléfono solo lo ve quien entró con su cuenta. Los avisos individuales no se
  indexan en buscadores: caducan a los siete días, pero la caché de Google no
  caduca, y la dirección de una familia damnificada no tiene por qué seguir
  siendo encontrable dentro de dos años.
- **Cada punto muestra cuándo se confirmó por última vez**, porque en una
  emergencia un dato de ayer manda gente al sitio equivocado.
- **"Lleno por ahora" es un estado reversible**, no un borrado: un punto
  saturado hoy vuelve a recibir mañana.

## 7. Lo que deliberadamente NO hace

Esto importa tanto como lo que sí hace, y es lo primero que conviene aclarar
ante una institución:

- **No recibe ni mueve dinero.** No hay pasarela de pagos, ni cuentas, ni
  botón de donar. El sitio le dice a todo el mundo que nadie debería pedirle
  plata.
- **No gestiona personas desaparecidas.** Remite a las plataformas que ya lo
  hacen y al canal de restablecimiento de contacto familiar de la Cruz Roja.
  Duplicar esa información dispersa las búsquedas y genera falsas esperanzas.
- **No sustituye a los organismos de socorro.** No coordina rescates ni emite
  dictámenes técnicos. Cuando hay rescatistas trabajando, el sitio le dice a la
  gente que no vaya.
- **No verifica automáticamente.** El sello de "verificado" significa que
  alguien del equipo confirmó por teléfono, no que un algoritmo lo aprobó.
- **No compite con las otras plataformas ciudadanas.** Enlaza a los mapas de
  emergencia y a las redes nacionales que ya existen.

## 8. Qué necesita el proyecto

Tres cosas, en orden de impacto:

### a. Datos oficiales, actualizados

Hoy la información se recoge de piezas gráficas que circulan por redes y de
mensajes que llegan por WhatsApp. Se transcriben a mano, se verifican llamando
uno por uno, y se corrigen los errores que traen —incluidos nombres de
medicamentos mal escritos, que hacen que la gente compre lo que no es.

Lo que cambiaría el juego: **una fuente institucional que informe apertura,
cierre y saturación de puntos de acopio y albergues.** Aunque sea un WhatsApp
donde alguien avise "el punto X ya no recibe". El sitio ya está construido para
reflejar ese cambio en segundos.

### b. Alcance

El 91 % del tráfico llega por WhatsApp e Instagram, de persona a persona. Un
canal institucional multiplicaría eso de inmediato, y llegaría a la población
que hoy no está en esas redes.

### c. Validación

Un respaldo institucional le da a la ciudadanía un criterio para distinguir
entre esto y las decenas de mensajes sin origen que circulan en una emergencia.

## 9. Qué gana una institución

- **Un canal que ya tiene ciudadanos dentro.** No hay que construirlo ni
  promocionarlo desde cero.
- **Visibilidad de la demanda real, medida.** Qué se está pidiendo, en qué
  categorías y con qué desbalance. Ninguna encuesta da eso en tiempo real.
- **Menos desperdicio operativo.** Cada persona que no va a un punto saturado
  es una persona que llega a uno que sí necesita ayuda.
- **Cero costo y cero riesgo reputacional por dinero**, porque el proyecto no
  toca dinero.
- **Código abierto y decisiones documentadas**, auditables por cualquiera.

## 10. Datos para citar

Copiar y pegar, con su fecha:

- 1.355 personas en las primeras 24 horas de medición (12–13 ago 2026)
- 84 % del tráfico desde celular
- 91 % desde Colombia
- 148 avisos ciudadanos, 14 resueltos (14 ago 2026)
- 17 puntos curados: 8 acopios, 5 albergues, 3 zonas desatendidas, 1 servicio
- Las necesidades pasaron de 20 a 111 en 48 horas; las ofertas, de 32 a 37
- 10 personas piden albergue, 0 lo ofrecen
- En línea desde el 11 de agosto de 2026, un día después del sismo

## 11. Lo que no se debe afirmar

Guardarraíles para no exagerar. La credibilidad es el activo principal del
proyecto y se pierde una sola vez:

- **No decir que los datos están verificados en bloque.** La mayoría de los
  puntos están sin verificar y el sitio lo muestra tal cual.
- **No atribuir resultados que no se pueden medir.** No sabemos cuántas
  familias recibieron ayuda: sabemos cuántos avisos se marcaron como resueltos,
  que es otra cosa.
- **No presentar las cifras de tráfico como totales.** La medición empezó dos
  días tarde.
- **No hablar en nombre de las organizaciones listadas.** Aparecen porque su
  información es pública, no porque tengan un convenio.
- **No prometer disponibilidad.** Lo sostiene una persona en planes gratuitos.

## 12. Historia del proyecto

| Fecha | Hito |
|---|---|
| 10 ago 2026 | Sismo de magnitud 7,4, epicentro en San José del Palmar, Chocó |
| 11 ago 2026 | Primera versión en línea: publicar, buscar y marcar como resuelto |
| 11 ago 2026 | Revisión de seguridad antes de difundir; diez hallazgos corregidos |
| 12 ago 2026 | Panel de ayudas concretadas, tras detectar que la gente cerraba avisos por error |
| 12 ago 2026 | Puntos de acopio, servicios verificados y guías profesionales |
| 13 ago 2026 | Mapa de la ciudad; analítica; revalidación automática de datos |
| 14 ago 2026 | Albergues; guías sobre reventa de donaciones y cuidado en zona |

## 13. Documentos de referencia

- [Decisiones de arquitectura](adr/) — por qué el tablero se cachea, por qué el
  contacto vive aparte, por qué la moderación es comunitaria
- [Revisión de seguridad](security/revision-seguridad-2026-08-11.md) — diez
  hallazgos con severidad y riesgos aceptados de forma explícita
