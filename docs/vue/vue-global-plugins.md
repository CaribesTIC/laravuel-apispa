# Complementos Globales de Vue

Esta sección explica de qué manera son ordenados y agregados los complementos globales de Vue en nuestra SPA.

Empecemos desde el principio.

## `main`

En el archivo principal, ubicado en la raiz del proyecto, tenemos lo siguiente.

```ts
// @/main.ts
import app from '@/plugins/app'
import '@/plugins'
import '@/assets/css/app.css'

app.mount('#app')
```

## `plugins/app`

La primera pregunta que nos hacemos es ¿qué devuelve `'@/plugins/app'`? Hechemos un vistazo a este archivo.

```ts
// @/plugins/app.ts
import { createApp } from 'vue'
import App from '../App.vue'

const app = createApp(App)

export default app
```

Observe que primero importamos el método `createApp`, nativo de Vue, para luego instanciarlo pasándole el componente principal `App.vue`. Una vez hecho esto, exportamos lo que esto devuelve a travez de la constante `app`.

## `plugins`

La siguiente pregunta que nos hacemos, según lo establecido en el [archivo principal](../vue/vue-global-plugins.html#main), es ¿qué devuelve `import '@/plugins'`? Hechemos un vistazo también a este archivo.

```ts
// @/plugins/index.ts
import './pinia'
import './components'
import './router'
```
Como se puede observar, trata sobre la importación de tres complementos debidamente ordenados, cada uno en su propio módulo. Veamos cada uno de ellos.

## `plugins/pinia`

Empezamos con el complemento que nos permitirá manejar el estado global de la aplicación.

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
Aquí están sucediendo varias cosas que despiertan curiosidad y que serán discutidas más adelante. Sin embargo, lo importante a reconocer aquí es que estamos importando [app](../vue/vue-global-plugins.html#plugins-app). Luego configuramos `pinia` y `FontAwesomePlugin`, pasándolos como complemento a la instancia de `app` a travéz del método `use`.

## `plugins/components`

Continuemos con los componentes globales de la aplicación.

```ts{2,18,19,20}
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
Observe que aquí también se está importando [app](../vue/vue-global-plugins.html#plugins-app), para luego importar dinamicamente tres componentes (`EmptyLayout.vue`, `DashboardLayout.vue` y `AppLink.vue`) respectivamente, los cuales finalmente serán implementados de manera global.

## `plugins/router`

Y por último aquí también se importa [app](../vue/vue-global-plugins.html#plugins-app) para finalmente también pasar el `router` como complemento global.

```ts{2,5}
// @/plugins/router.ts
import app from '@/plugins/app'
import router from '@/router'

app.use(router)
```
Esto es todo lo que necesita saber para entender lo que hace el [archivo principal](../vue/vue-global-plugins.html#main) en cuanto a los complementos.







