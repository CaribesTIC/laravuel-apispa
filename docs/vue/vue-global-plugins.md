# Complementos Globales de Vue

Esta sección explica de qué manera son ordenados y agregados los complementos globales de Vue en nuestra SPA.

Empecemos desde el principio.

## `main`

En el [archivo principal](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/main.ts), ubicado en la raiz del proyecto, tenemos lo siguiente.

```ts
// @/main.ts
import app from '@/plugins/app'
import '@/plugins'
import '@/assets/css/app.css'

app.mount('#app')
```

## `plugins/app`

La primera pregunta que nos viene a la mente es:

- [¿Qué devuelve `@/plugins/app`?](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/plugins/app.ts)

Hechemos un vistazo a este archivo.

```ts
// @/plugins/app.ts
import { createApp } from 'vue'
import App from '../App.vue'

const app = createApp(App)

export default app
```

Observe que primero importamos el método `createApp`, nativo de Vue, para luego instanciar la constante `app`, pasándole el componente principal [`App.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/App.vue). Una vez hecho esto, exportamos la constante `app`.

## `plugins`

Según lo establecido en el [archivo principal](../vue/vue-global-plugins.html#main), la siguiente pregunta que hacemos es:

- [¿Qué devuelve `import '@/plugins'`?](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/plugins/index.ts)

Hechemos un vistazo también a este archivo.

```ts
// @/plugins/index.ts
import './pinia'
import './components'
import './router'
```
Como se puede observar, trata sobre la importación de tres complementos debidamente ordenados, cada uno en su propio módulo. Veamos cada uno de ellos.

## `plugins/pinia`

Empezamos con [plugins/pinia](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/plugins/pinia.ts) el cual nos permitirá manejar el estado global de la aplicación.

```ts{2,10,11,12}
// @/plugins/pinia.ts
import app from '@/plugins/app'
import { createPinia } from 'pinia'
import { PiniaHistoryPlugin } from "@/modules/ShopCart/plugins/PiniaHistoryPlugin";
import FontAwesomePlugin from "@/modules/ShopCart/plugins/FontAwesome";

const pinia = createPinia();
pinia.use(PiniaHistoryPlugin);

app.use(pinia)
app.use(FontAwesomePlugin)
```
Aquí están sucediendo varias cosas que despiertan curiosidad y que serán discutidas más adelante.

Sin embargo, lo importante para reconocer aquí es que primero estamos importando lo que devuelve [`plugins/app`](../vue/vue-global-plugins.html#plugins-app). Luego configuramos los complementos [`pinia`](https://pinia.vuejs.org/) y [`FontAwesomePlugin`](https://fontawesome.com/), pasándolos como complemento a la instancia de `app` a travéz del método `use`.

## `plugins/components`

Continuamos con [los componentes globales](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/plugins/components.ts) de la aplicación.

```ts{2,17,18,19}
// @/plugins/components.ts
import app from '@/plugins/app'
import { defineAsyncComponent } from 'vue'

const EmptyLayout = defineAsyncComponent(
  () => import('@/layouts/EmptyLayout.vue')
)

const DashboardLayout = defineAsyncComponent(
  () => import('@/layouts/DashboardLayout.vue')
)

const AppLink = defineAsyncComponent(
  () => import('@/components/AppLink.vue')
)

app.component('empty-layout', EmptyLayout)
   .component('default-layout', DashboardLayout)
   .component('AppLink', AppLink)
```
Observe que aquí también se está importando primero [`@/plugins/app`](../vue/vue-global-plugins.html#plugins-app). Luego se importan dinámicamente tres componentes respectivamente, los cuales finalmente serán implementados de manera global:

- [`AppLink.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/components/AppLink.vue)
- [`EmptyLayout.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/layouts/EmptyLayout.vue)
- [`DashboardLayout.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/layouts/DashboardLayout.vue)

## `plugins/router`

Y por último, en [este archivo](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/plugins/router.ts), también se importa primero [`@/plugins/app`](../vue/vue-global-plugins.html#plugins-app), para finalmente pasar el [`router`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/router/index.ts) como complemento global.

```ts{2,5}
// @/plugins/router.ts
import app from '@/plugins/app'
import router from '@/router'

app.use(router)
```
Esto es todo lo que necesita saber para entender lo que hace el [archivo principal](../vue/vue-global-plugins.html#main) en cuanto a los complementos.







