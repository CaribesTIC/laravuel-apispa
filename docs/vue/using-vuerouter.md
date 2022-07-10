# Usando VueRouter

Una vez instanciado el enrutador, es pasado como complemento global a la aplicación. Puede ver más detalles sobre complementos [aquí](../vue/vue-global-plugins.html).

## `@/router`

```ts
import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import { computed } from "vue"
import { useAuthStore } from '@/modules/Auth/stores'
import middlewarePipeline from "@/router/middlewarePipeline"
import AuthRoutes from "@/modules/Auth/routes"
import AuthorizationRoutes from "@/modules/Authorization/routes"
import MessageRoutes from "@/modules/Message/routes"
import ShopCart from "@/modules/ShopCart/routes"
import ThemesRoutes from "@/modules/Themes/routes"
import UserRoutes from "@/modules/User/routes"

const storeAuth = computed(() => useAuthStore())

const routes: Array<RouteRecordRaw> = [
  ...AuthRoutes.map(route => route),
  ...AuthorizationRoutes.map(route => route),
  ...MessageRoutes.map(route => route),
  ...ShopCart.map(route => route),
  ...ThemesRoutes.map(route => route),
  ...UserRoutes.map(route => route)
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  
  routes,
  scrollBehavior(to, from, savedPosition): any {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware;
  const context = { to, from, next, storeAuth };

  if (!middleware) {
    return next();
  }

  middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1),
  });
});

export default router
```
