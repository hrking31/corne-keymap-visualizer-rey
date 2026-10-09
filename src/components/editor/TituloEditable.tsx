import { useState } from "react";
import { LIMITES } from "../../teclados/validar";

type Props = {
  nombre: string;
  // Móvil (mitades apiladas): rótulo corto, «Nombre»
  apilado: boolean;
  onNombre: (n: string) => void;
};

// En modo edición, el título se escribe en su sitio: «Corne [Rey] ZMK». La caja tiene la
// letra del título y se guarda al salir de ella o con Enter (también al pulsar «Listo»,
// que le quita el foco). Así en el móvil no hace falta otra línea para el nombre.
// Siempre parpadea un cursor dibujado, para recordar que el nombre se puede cambiar: delante
// del rótulo si está vacía, detrás del nombre si ya tiene uno (en el móvil, enfocar la caja
// de verdad abriría el teclado del teléfono).
export default function TituloEditable({ nombre, apilado, onNombre }: Props) {
  const [borrador, setBorrador] = useState(nombre);
  const rotulo = apilado ? "Nombre" : "Nombre teclado";

  return (
    <>
      Corne{" "}
      <span className="titulo-envoltura" data-cursor={borrador ? "detras" : "delante"}>
        <input
          className="titulo-campo"
          value={borrador}
          maxLength={LIMITES.nombre}
          placeholder={rotulo}
          aria-label="Nombre del teclado"
          // Letra de ancho fijo: la caja mide justo lo que lleva escrito (o el rótulo)
          size={Math.max(borrador.length || rotulo.length, 1)}
          onChange={(e) => setBorrador(e.target.value)}
          onBlur={() => borrador !== nombre && onNombre(borrador)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
      </span>{" "}
      ZMK
    </>
  );
}
