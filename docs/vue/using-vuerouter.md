# Usando VueRouter

Una vez instanciado el `router`, es pasado como complemento global a la aplicación. Puede ver más detalles sobre complementos [aquí](../vue/vue-global-plugins.html).

## `router`

Este código ilustra el contenido del archivo [`@/router`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/router/index.ts).

```ts
// @/router
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
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

Veámoslo por parte.

## Arquitectura Modular

Observe que separamos por módulos nuestra aplicación con el propósito de que sea lo más ordenada posible.

```ts
// @/router
// omitted for brevity ...
import AuthRoutes from "@/modules/Auth/routes"
import AuthorizationRoutes from "@/modules/Authorization/routes"
import MessageRoutes from "@/modules/Message/routes"
import ShopCart from "@/modules/ShopCart/routes"
import ThemesRoutes from "@/modules/Themes/routes"
import UserRoutes from "@/modules/User/routes"

// omitted for brevity ...

const routes: Array<RouteRecordRaw> = [
  ...AuthRoutes.map(route => route),
  ...AuthorizationRoutes.map(route => route),
  ...MessageRoutes.map(route => route),
  ...ShopCart.map(route => route),
  ...ThemesRoutes.map(route => route),
  ...UserRoutes.map(route => route)
]

// omitted for brevity ...
```

Por lo que cada módulo exporta sus propias rutas.

Aquí un ejemplo de [`@/modules/User/routes`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/routes/index.ts).

```ts
// @/modules/User/routes
// omitted for brevity ...

export default [{
    path: "/users",
    name: "users",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/Index.vue")
        .then(m => m.default)
}, {
    path: "/users/create",
    name: "userCreate",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/CreateOrEdit.vue")
        .then(m => m.default),
    props: true
}, {
    path: "/users/edit/:id(\\d+)",
    name: "userEdit",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/CreateOrEdit.vue")
        .then(m => m.default),
    props: true
}]
```

## Routes y Layout

En el componente principal [`@/App.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/App.vue) se observa cómo funciona el `layout` según el `routes`.

```vue{6,7,8,12,13}
<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
const defaultLayout = "default"
const { currentRoute } = useRouter()
const layout = computed(
  () => `${currentRoute.value.meta.layout || defaultLayout}-layout`
)
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{Component}">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.path"></component>
      </transition>
    </router-view>
  </component>
</template>

<style lang="css" scoped>
  .fade-enter-active,
  .fade-leave-active{
    transition: opacity 0.3s;
  }
  .fade-enter-from,
  .fade-leave-to{
    opacity:0;
  }
</style>
```

En el archivo [`@/modules/Auth/routes`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/routes/index.ts) hay un buen ejemplo sobre esto.

```ts{6,14,21,28,36}
// omitted for brevity ...

export default [{
  path: "/",
  name: "Home",     
  meta: { middleware: [guest], layout: "empty" },      
  component: () =>
    import("@/modules/Auth/views/Home/Index.vue")
      .then(m => m.default)
}, {
  path: "/login",
  name: "Login",
  meta: { middleware: [guest], layout: "empty" },
  component: () =>
    import("@/modules/Auth/views/Login/Index.vue")
      .then(m => m.default)
}, {
  path: "/register",
  name: "Register",    
  meta: { middleware: [guest], layout: "empty" },
  component: () =>
    import("@/modules/Auth/views/Register/Index.vue")
      .then(m => m.default)
}, {
  path: "/profile",
  name: "profile",
  meta: { middleware: [auth] },
  component: () =>
    import("@/modules/Auth/views/Profile/Index.vue")
      .then(m => m.default),
}, {
  path: "/dashboard",
  name: "dashboard",
  meta: { middleware: [auth], layout: "default" },
  component: () =>
    import("@/modules/Auth/views/Dashboard/Index.vue")
      .then(m => m.default)
},
// omitted for brevity ...
]
```

Observe que en la ruta `profile` se nos olvidó colocar la propiedad `layout`. En estos casos tendrá el valor por defecto.

```ts
{
  path: "/profile",
  name: "profile",
  meta: { middleware: [auth] },
  component: () =>
    import("@/modules/Auth/views/Profile/Index.vue")
      .then(m => m.default),
}
```
