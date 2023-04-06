import{_ as e,c as a,o,N as r}from"./chunks/framework.6a8e5212.js";const n="/vue-tdd/assets/vuetify-color-picker-example.bb967f5e.webm",g=JSON.parse('{"title":"Prueba de Componentes","description":"","frontmatter":{},"headers":[],"relativePath":"cypress-intro/prueba-de-componentes.md"}'),s={name:"cypress-intro/prueba-de-componentes.md"},t=r('<h1 id="prueba-de-componentes" tabindex="-1">Prueba de Componentes <a class="header-anchor" href="#prueba-de-componentes" aria-label="Permalink to &quot;Prueba de Componentes&quot;">​</a></h1><h2 id="escribir-su-primera-prueba-de-componentes" tabindex="-1">Escribir Su Primera Prueba De Componentes <a class="header-anchor" href="#escribir-su-primera-prueba-de-componentes" aria-label="Permalink to &quot;Escribir Su Primera Prueba De Componentes&quot;">​</a></h2><div class="warning custom-block"><p class="custom-block-title">Advertencia</p><p>Cypress Component Testing se encuentra actualmente en versión beta.</p></div><p><em>Cypress Component Testing</em> proporciona un <em><strong>testable component workbench</strong></em> para que usted construya y pruebe rápidamente cualquier componente, sin importar cuán simple o complejo sea.</p><p>El <em>Test Runner</em> está basado en el navegador, lo que le permite probar <strong>los estilos y la API de su componente</strong> y <strong>aislar su componente de la página en la que Cypress lo representará</strong>. La separación de los componentes de su sitio web le permite dividir aún más el trabajo en más manejable trozos y, en última instancia, da como resultado componentes construidos conscientemente.</p><video controls><source src="'+n+'"></video><blockquote><p>Pruebas de <a href="https://vuetifyjs.com/en/components/color-pickers/" target="_blank" rel="noreferrer">Vuetify</a> VColorPicker, después de ser modido a Cypress desde Jest.</p></blockquote><p>Para leer más, Cypress alienta a la gente a consultar la organización <a href="https://www.componentdriven.org/" target="_blank" rel="noreferrer">Component Driven</a>, que habla sobre las ventajas del desarrollo basado en componentes y puede ayudarlo cuando intente averiguar si debe adoptar un enfoque basado en páginas o basado en componentes para la construcción y prueba de una característica determinada.</p><h2 id="component-vs-end-to-end-en-pocas-palabras" tabindex="-1">Component vs. End-to-End en Pocas Palabras <a class="header-anchor" href="#component-vs-end-to-end-en-pocas-palabras" aria-label="Permalink to &quot;Component vs. End-to-End en Pocas Palabras&quot;">​</a></h2><p>Las diferencias entre las pruebas de componentes y de extremo a extremo se cubren en profundidad en la guía <a href="https://docs.cypress.io/guides/core-concepts/testing-types#What-you-ll-learn" target="_blank" rel="noreferrer">Elección de un Tipo de Prueba</a>.</p><p>Pero, en resumen, <em>Cypress Component Testing</em> usa el mismo ejecutor de pruebas, comandos y API para probar componentes en lugar de páginas.</p><p>La principal diferencia es que <em>Cypress Component Testing</em> crea sus componentes utilizando un servidor de desarrollo en lugar de renderizarlos dentro de un sitio web completo, lo que da como resultado pruebas más rápidas y menos dependencias de la infraestructura que las pruebas integrales que cubren las mismas rutas de código.</p><p>Por último, la API de Cypress está centrada en el usuario y está diseñada para probar cosas que se renderizan en la web. Por lo tanto, muchas de sus pruebas aparecerán independientes del framework y accesibles para los desarrolladores de cualquier origen.</p><h2 id="empezando" tabindex="-1">Empezando <a class="header-anchor" href="#empezando" aria-label="Permalink to &quot;Empezando&quot;">​</a></h2><p>¿Preparado para comenzar? Consulte nuestras guías de <a href="./../cypress-vtc/inicio-rapido.html">Inicio rápido: Vue</a>.</p>',15),p=[t];function i(c,d,l,u,m,b){return o(),a("div",null,p)}const _=e(s,[["render",i]]);export{g as __pageData,_ as default};