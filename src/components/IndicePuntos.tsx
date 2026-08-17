import { nombreCorto, type Place } from '@/lib/place-utils';

/**
 * Fila de atajos a los puntos de una sección.
 *
 * Aunque las tarjetas se plieguen, catorce acopios siguen siendo ocho
 * pantallas de desplazamiento. Esto resuelve la otra mitad del problema: quien
 * ya sabe a qué punto va —porque se lo dijeron por WhatsApp o porque lo vio en
 * el mapa— salta directo en vez de pasar por todos los demás.
 *
 * Son anclas `#id` puras: cero JavaScript. Las tarjetas ya traen `id` y
 * `scroll-mt` porque el mapa enlaza a ellas de la misma forma.
 *
 * En fila con desplazamiento horizontal y no en varias líneas: catorce
 * atajos con área táctil de 44 px envueltos ocupan media pantalla, que es
 * justo el espacio que estamos tratando de recuperar.
 */
export function IndicePuntos({
  lugares,
  etiqueta,
}: {
  lugares: Place[];
  etiqueta: string;
}) {
  // Con pocos puntos el índice estorba más de lo que ayuda: se ven todos
  // bajando un poco.
  if (lugares.length < 5) return null;

  return (
    <nav aria-label={etiqueta} className="mb-3">
      <p className="mb-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted">
        {lugares.length} en la lista · toca para ir
      </p>
      {/*
        Una sola fila en todos los tamaños, con desplazamiento lateral y sin
        barra a la vista (`.fila-desplazable`, en globals.css).

        Se probó envolviendo los atajos en escritorio, para no depender del
        desplazamiento: once atajos se van a cuatro renglones y ocupan 199 px
        antes de la primera tarjeta, que es justo el espacio vertical que
        estamos recuperando. La fila cuesta 99 px y no crece con la lista.

        Los márgenes negativos la llevan hasta el borde de la pantalla: ver el
        último atajo cortado es lo que avisa de que hay más a la derecha.
      */}
      <ul className="fila-desplazable -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1">
        {lugares.map((lugar) => (
          <li key={lugar.id} className="snap-start">
            <a
              href={`#${lugar.id}`}
              className={
                lugar.is_full
                  ? 'flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-line px-3 text-sm text-muted opacity-60'
                  : 'flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-line px-3 text-sm font-medium'
              }
            >
              {nombreCorto(lugar.name)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
