# Revisión visual — 14 octubre 2026

## Cambios

- Eliminada la máscara persistente de la entrada de BUILD. La tipografía tiene una caja de línea suficiente y espacio para los remates de la cursiva.
- Hero responsive: escala según altura en laptop; altura determinada por el contenido en móvil; separación entre el texto y las letras decorativas en desktop.
- Banda tipográfica continua, tres composiciones gráficas originales para los proyectos, entradas escalonadas y desplazamientos suaves con scroll.
- Símbolos animados de capacidades, órbitas en Perfil y una flecha animada en Contacto.
- Botón de pausa con preferencia de sesión y soporte de prefers-reduced-motion. Las animaciones de entrada dejan el contenido visible al pausar o recargar.
- Canvas asociado a su escena real dentro de la isla React; bucle continuo detenido fuera del hero y con la pestaña oculta.
- Navegación móvil con Escape y etiquetas en EN/ES; ancla Contacto dirigida al bloque de contacto.
- Corregido el conflicto de CSS que aplicaba el layout de una fila completa a las flechas de proyectos.
- Corrección del hero y movimiento básico sincronizados con el prototipo original del puerto 4173; su footer enlaza al sitio completo del puerto 4321.

## Verificación realizada

Navegador integrado de Codex, con viewports de 1440×900, 1280×720, 768×1024, 700×600, 390×844 y 320×568. Se inspeccionaron capturas y límites del DOM en inglés/español, incluyendo el breakpoint de 700 px con texto extendido. Sin desbordamiento horizontal en los tamaños revisados.

Se revisaron hero, proyectos, capacidades, Perfil y Contacto. Se comprobó la navegación de anclas, cambio de idioma, menú móvil y Escape, pausa/reanudación y persistencia tras recarga. La pausa conserva BUILD visible. El navegador no registró errores de consola en la revisión final.

- `git diff --check`: correcto.
- `npm run check`: 0 errores, 0 warnings, 2 hints preexistentes por `z.string().url()` deprecado.
- `npm run build`: correcto, 5 páginas estáticas.

La preferencia de movimiento reducido tiene cobertura en CSS y JavaScript; no se cambió la preferencia del sistema operativo para simularla. Esta revisión no equivale a QA en Safari/Firefox o dispositivos físicos.

Las portadas de los proyectos son composiciones tipográficas, no capturas de sus interfaces. Las capturas JPG guardadas aquí muestran el estado visual; el movimiento se revisa en el sitio local.
