// Dónde se guarda la práctica en este dispositivo: los récords, lo que cuesta cada tecla y
// el último grupo elegido. localStorage puede fallar (modo privado, datos bloqueados):
// entonces se practica igual, sin recordar nada.
import { GRUPOS, type Grupo } from "./practica";
import { leerDatosPractica, type DatosPractica } from "./records";

const CLAVE_DATOS = "corne-practica";
const CLAVE_GRUPO = "corne-practica-grupo";

export function leerGuardado(): DatosPractica {
  try {
    return leerDatosPractica(JSON.parse(localStorage.getItem(CLAVE_DATOS) ?? "null"));
  } catch {
    return leerDatosPractica(null);
  }
}

export function guardar(datos: DatosPractica): void {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento solo se pierde el recuerdo
  }
}

export function leerGrupo(): Grupo {
  try {
    const grupo = localStorage.getItem(CLAVE_GRUPO);
    return GRUPOS.find((g) => g === grupo) ?? "letras";
  } catch {
    return "letras";
  }
}

export function guardarGrupo(grupo: Grupo): void {
  try {
    localStorage.setItem(CLAVE_GRUPO, grupo);
  } catch {
    // Igual que arriba
  }
}
