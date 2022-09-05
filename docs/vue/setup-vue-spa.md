# Configurar Vue SPA

Se supone que tenemos algo de experiencia trabajando con la siguiente tecnología: [Vite](https://vitest.dev), [VueJS](https://vuejs.org), [VueRouter](https://router.vuejs.org), [Pinia](https://pinia.vuejs.org), [Vitest](https://vitest.dev), [Vue Test Utils](https://test-utils.vuejs.org/guide), [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [Axios](https://axios-http.com/).

Básicamente, nuestra SPA está desarrollada en su mayoría con todas ellas. Es decir, en su archivo [package.json](https://github.com/CaribesTIC/laravuel-spa/blob/main/package.json) ya se encuentran debidamente preinstaladas. Solo basta con descargar el código y ejecutar `npm install` dentro de la carpeta del proyecto. Se supone que antes debemos tener instalado [Node](https://nodejs.org/en/) en la computadora. Hay que asegurarse de tener instalados los siguientes archivos de configuración:

- [postcss.config.js](https://github.com/CaribesTIC/laravuel-spa/blob/main/postcss.config.js)
- [tailwind.config.js](https://github.com/CaribesTIC/laravuel-spa/blob/main/tailwind.config.js)
- [tsconfig.json](https://github.com/CaribesTIC/laravuel-spa/blob/main/tsconfig.json)
- [tsconfig.node.json](https://github.com/CaribesTIC/laravuel-spa/blob/main/tsconfig.node.json)
- [vite.config.ts](https://github.com/CaribesTIC/laravuel-spa/blob/main/vite.config.ts)

En este último archivo es donde se especifica la ruta de la API de Laravel a la cual apunta.

```ts{5}
// vite.config.ts
// omitted for brevity ...
define: {
  'process.env': {
    VUE_APP_API_URL: "http://localhost:8000"
  }
}
// omitted for brevity ...
```
