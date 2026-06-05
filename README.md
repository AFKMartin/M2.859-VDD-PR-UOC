# ¿Están los AI Agents transformando el trabajo del desarrollador?
## Demo https://afkmartin.github.io/M2.859-VDD-PR-UOC/

---

## Descripción del proyecto

Este proyecto es un dashboard interactivo de visualización de datos construido con **D3.js**, cuyo objetivo es analizar cómo los desarrolladores de software están adoptando **AI Agents en 2025**, y cómo esta adopción se relaciona con factores como:

- salario y desigualdad geográfica  
- satisfacción laboral y percepción de riesgo  
- herramientas y ecosistema tecnológico  
- habilidades futuras percibidas  

El objetivo no es solo representar datos, sino construir una **historia interactiva basada en datos reales**.

---

## Preguntas de investigación

### P1 - Adopción de AI Agents
¿En qué medida han adoptado los desarrolladores los AI Agents en 2025 y cómo varía esta adopción por país, experiencia, rol e industria?

### P2 - Satisfacción y riesgo laboral
¿Los desarrolladores que usan AI Agents tienen mayor o menor satisfacción laboral?  
¿Existe relación con la percepción de amenaza laboral o intención de cambio de carrera?

### P3 - Herramientas y ecosistema
¿Qué herramientas, frameworks y modelos LLM utilizan los desarrolladores para construir AI Agents y cuáles desean usar en el futuro?

### P4 - Salarios y desigualdad
¿Cómo varía el salario entre países tras normalizarlo por PPP y qué relación tiene con la adopción de IA y el perfil del desarrollador?

### P5 - Habilidades futuras
¿Qué habilidades consideran los desarrolladores que serán más importantes en un futuro dominado por la IA, y cómo varía esta percepción entre usuarios y no usuarios?

---

## Estructura del proyecto

- data/stack-overflow-developer-survey-2025: CSV's originales.

- docs/index.html: Dashboard principal.

- docs/css: stylesheet.

- docs/js/main.js: Código hecho en D3.js.

- docs/data: Archivos JSON.

- notebooks: Notebooks en formato jupyter notebook para explorar los CSV's.

- LICENSE: Licencia del proyecto.
  
---

## Tecnologías utilizadas

- D3.js (visualización de datos)
- Python (Exploración de datos)
- JavaScript (ES6)
- HTML5 / CSS3
- GitHub Pages (despliegue)

---

## Características principales

- Gráficos interactivos (scatter plots, barras, distribuciones)
- Tooltips informativos al pasar el ratón
- Comparación entre países, roles e industrias
- Análisis de salarios y adopción de IA
- Exploración del ecosistema de herramientas LLM

---

## Cómo ejecutar el proyecto

En la carpeta principal, ejecutar el siguiente comando:

```
cd docs
python -m http.server 8080 
```

A continuación abrir el navegador web en el siguiente link:

http://localhost:8080/

---

Sin Python ni instalación ni dependencias adicionales, abrir directamente:

```
docs/index.html
```

---

## Fuente de datos

Datos basados en la **Stack Overflow Developer Survey 2025**, procesados y transformados en múltiples archivos JSON para su visualización.

---

## Licencia

[MIT License](https://github.com/AFKMartin/M2.859-VDD-PR-UOC/blob/main/LICENSE)

---

Javier Martín Acevedo