# El Middleware

## Visión General

A medida que nuestra aplicación crezca, necesitará tener una forma de controlar lo que sucede antes de que se cargue una ruta. Un ejemplo de esto se cubre al [agregar autenticación](../vue/vue-authentication.html#proteccion-de-rutas-y-mantenimiento-del-estado). Usando el enganche del enrutador `beforeEach`, verificamos si una ruta requiere `Auth`, si lo hace, entonces se ejecuta la lógica de autenticación. Esto funciona bien si solo está verificando la autenticación, pero ¿qué sucede si necesita agregar verificaciones adicionales para las rutas de administración? Se verifica un usuario para ver si está autenticado, luego, si va a ver la ruta `/users`, también debe ser administrador. Consulte el ejemplo de autorización básica para repasar esta funcionalidad.

## Protección de Rutas y Mantenimiento del Estado

> Comienzo de un ejemplo anterior...

El método para proteger las rutas de la aplicación es bastante simple. [En el archivos de rutas](https://github.com/garethredfern/laravel-vue/blob/v1.2.7/src/router/index.js), debe haber un metacampo `requiresAuth`, es un valor booleano que se mantiene contra cada ruta que se desea proteger.

```ts{9,10}
// omitted for brevity ...
const routes = [{
    path: "/",
    name: "home",
    component: () => import(/* webpackChunkName: "home" */ "../views/Home"),
  }, {
    path: "/dashboard",
    name: "dashboard",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "../views/Dashboard"),
  }, {
// omitted for brevity ...
```

Usando el VueRouter antes de cada método, se verifica si una ruta tiene un booleano `requiresAuth` establecido en `true` y si hay un usuario autenticado en el `[AuthStore](https://github.com/garethredfern/laravel-vue/blob/v1.2.7/src/store/index.js):

```ts
// omitted for brevity ...
export const getters = {
  authUser: (state) => {
    return state.user;
  },
  // omitted for brevity ...
};
```

Algunos escenarios deben manejarse aquí:

- Si hay un usuario autenticado en estado, la ruta permite cargar la página.
- Si no hay un usuario autenticado en el estado, haga una llamada a la API de Laravel para verificar si hay un usuario autenticado que se vincule con la sesión. Suponiendo que lo haya, la tienda se completará con los detalles del usuario. El enrutador permite que la página se cargue.
- Finalmente, si no hay una sesión válida, redirija a la página de inicio de sesión.

Actualizar el navegador enviará una solicitud GET a la API para el usuario autenticado, almacenará los detalles en el estado. Navegar por la aplicación utilizará el estado `auth` para minimizar las solicitudes de API, manteniendo las cosas ágiles. Esto también ayuda con la seguridad. Cada vez que se obtienen datos de la API, Laravel verifica la sesión. Si la sesión deja de ser válida, se envía una respuesta `401` o `419` al SPA. Manejado a través de un [interceptor Axios](https://github.com/garethredfern/laravel-vue/blob/v1.2.7/src/services/AuthService.js), desconectando al usuario.

```ts
authClient.interceptors.response.use(
  (response) => { 
    return response;
  },
  function (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419)
    ) {
      store.dispatch("auth/logout");
    }
    return Promise.reject(error);
  }
);
```

> ... fin de un ejemplo anterior.

## Refactorizar Middleware de Autenticación

Para proporcionar una solución de agregar múltiples controles en una ruta, podemos usar El Patrón de Diseño de Middleware. Haciendo uso del gancho del enrutador `beforeEach`, podemos encadenar varias funciones `middleware` mientras mantenemos limpio el código de la plantilla del enrutador.

:::info
Tenga en cuenta que este ejemplo es más avanzado que el ejemplo anterior.
:::

Previamente establecimos un atributo meta de `requireAuth` en cualquier ruta que necesitara autenticación:

```ts
{
  path: "/dashboard",
  name: "dashboard",
  meta: { requiresAuth: true }
  //...
}
```

Esto ahora se puede intercambiar para pasar una serie de funciones de `middleware` que se invocarán antes de ingresar la ruta:

```ts
{
  path: "/dashboard",
  name: "dashboard",
  meta: { middleware: [auth] }
}
```

Las funciones del `middleware` se mantendrán juntas en una nueva carpeta [src/middleware](https://github.com/CaribesTIC/vue-frontend-ts/tree/main/src/middleware). Echemos un vistazo a la función del archivo [src/middleware/auth.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/middleware/auth.ts). Debería parecer familiar porque la mayor parte del código se corta del método original `beforeEach` anterior. Consulte el apartado de [Middleware Auth](../vue/the-middleware.html#middleware-auth) para obtener una descripción detallada de este método. Por ahora, solo concéntrese en el patrón para una función de middleware:

```ts
export default function auth({ to, next, store }) {}
```

La función `auth()` toma un objeto de los parámetros que requerimos. Por lo general, será `to` y siempre será `next` que se pasan desde el VueRouter como contexto. Aquí también requerimos acceso al `store` para que también se transfiera.

:::info
No olvide importar cualquier middleware necesario en la parte superior dentro del correspondiente [archivo de rutas](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/routes/index.ts).
```ts
// @/modules/Auth/routes/index.ts
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"
import admin from "@/middleware/admin"

export default [{
    path: "/",
    name: "Home",     
    meta: { middleware: [guest], layout: "empty" },      
    component: () =>
      import("@/modules/Auth/views/Home/Index.vue")
        .then(m => m.default)
}, {
// omitted for brevity ...
```
:::

Ahora veamos lo nuevo del método `beforeEach` dentro del archivo [src/router/index.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/router/index.ts) que representa el `router` y además cómo podemos llamar al método de `middleware[auth]()`.

```ts{9,10,11}
import { computed } from "vue"
import { useAuthStore } from '@/modules/Auth/stores'
import AuthRoutes from "@/modules/Auth/routes"
// omitted for brevity ...
const storeAuth = computed(() => useAuthStore())
// omitted for brevity ...

router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware;
  const context = { to, from, next, storeAuth };

  // Check if no middlware on route
  if (!middleware) {
    return next();
  }

  middleware[0]({
    ...context,    
  });
});

export default router
```

`middleware` y `context` se almacenan como variables:

```ts
const middleware = to.meta.middleware;
```

El objeto `context` contiene las propiedades requeridas en el middleware que se llama:

```ts
const context = { to, from, next, store };
```
Se realiza una verificación para ver si no hay middleware en la ruta que se solicita. Si no lo hay, retorna `next`, lo que permite que la ruta se cargue normalmente.

```ts
if (!middleware) {
  return next();
}
```
Finalmente, llama a la primera función de middleware desde el arreglo `middleware`. Aquí solo tenemos un `auth` para mantener el ejemplo simple:

```ts
return middleware[0]({ ...context });
```

## El Canalización de Middleware.

Hasta ahora, solo ha habido una función de middleware llamada `auth`, veamos cómo podemos llamar a varias funciones de middleware usando una canalización. En la ruta `/users` necesitamos middleware de `auth` y `admin`:

```ts
{
  path: "/users",
  name: "users",
  meta: { middleware: [auth, admin] }
}
```

Podemos revisar la función de [middleware de admin](../vue/the-middleware.html#middleware-admin) en su apartado de middleware.

Veamos cómo podemos llamar a las funciones `middleware[]()` de `auth` y `admin` con el gancho `berforeEach`.


```ts{2,16}
// omitted for brevity ...
import middlewarePipeline from "@/router/middlewarePipeline"
// omitted for brevity ...

router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware;
  const context = { to, from, next, storeAuth };

  if (!middleware) {
    return next();
  }

  middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1)
  });
});
// omitted for brevity ...
```

La única diferencia con el anterior método `beforeEach` es que agregamos esta línea y su respectiva importación:

```ts
next: middlewarePipeline(context, middleware, 1)
```

El método `middlewarePipeline` en la propiedad `next` se llama recursivamente, pasando cualquier `context`, el `middleware` y el `index` para llamar a la siguiente función del arreglo `middleware`.

Echemos un vistazo a la función que devuelve el archivo [src/router/middlewarePipeline.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/router/middlewarePipeline.ts) para desglosarlo y así comprender lo siguiente:

1. Se pasan el `context`, el arreglo `middleware` y el `index` del arreglo actual.
1. Se crea una variable que guarda el siguiente `middleware` para ejecutar. Si hay dos elementos en la matriz de middleware `[auth, admin]` y `auth` acaba de ejecutarse, `nextMiddleware` retendrá a `admin`.
1. Si no hay más elementos en el arreglo `middleware`, la condición `if (!nextMiddleware)` lo busca y regresa `nest`, para que la ruta aún se cargue.
1. Si hay un `middleware` para ejecutar, se devuelve `nextMiddleware` -y luego se llama- pasando el `context` y llamando recursivamente a la función `middlewarePipeline` con el `index` incrementado en `1` para que -si existe- se pueda ejecutar el siguiente `middleware`.

El método `middlewarePipeline` puede tardar un poco en comprenderse. Tratemos de pensar en ello como un método de ayuda para verificar si hay algún `middleware` adicional para llamar y empujarlos a través de la canalización hasta que no haya más. 

## Middleware Auth

El archivo [src/middleware/auth.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/middleware/auth.ts) es un middleware para verificar si un usuario está autenticado antes de mostrar la ruta protegida. Si la autenticación falla, el usuario es redirigido a la página de inicio de sesión.

Para agregar este middleware a cualquier ruta, simplemente impórtelo en su correspondiente archivo de rutas y finalmente, agregue el método `auth` como un parámetro de enrutador de middleware en la propiedad meta:

```ts{2,10,11}
// @/modules/Auth/routes/index.ts
import auth from "@/middleware/auth"
// omitted for brevity ...

export default [{
// omitted for brevity ...
}, {
    path: "/profile",
    name: "profile",
    meta: { middleware: [auth] },
    component: () =>
      import("@/modules/Auth/views/Profile/Index.vue")
        .then(m => m.default)
}, {
// omitted for brevity ...
```

## Middleware Guest

El archivo [src/middleware/guest.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/middleware/guest.ts) es un middleware que verifica si el usuario actual ha iniciado sesión y evita que vea páginas de invitados como el inicio de sesión. Si ha iniciado sesión, no tiene sentido poder ver la vista de inicio de sesión; en su lugar, el usuario es redirigido al `dashboard`.

Para agregar este middleware a cualquier ruta, simplemente impórtelo en su correspondiente archivo de rutas y finalmente, agregue el método `guest` como un parámetro de enrutador de middleware en la propiedad meta:

```ts{3,9,10}
// @/modules/Auth/routes/index.ts
// omitted for brevity ...
import guest from "@/middleware/guest"
// omitted for brevity ...

export default [{
    path: "/",
    name: "Home",     
    meta: { middleware: [guest], layout: "empty" },      
    component: () =>
      import("@/modules/Auth/views/Home/Index.vue")
        .then(m => m.default)
},
// omitted for brevity ...
```

## Middleware Admin

El archivo [src/middleware/admin.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/middleware/admin.ts) es un middleware para verificar si el usuario autenticado es un `admin`. Si no lo es, la ruta se redirige a una vista `404`.

Para agregar este middleware a cualquier ruta, simplemente impórtelo en su correspondiente archivo de rutas y finalmente, agregue el método `admin` como un parámetro de enrutador de middleware en la propiedad meta:

```ts{2,3,8,9}
// @/modules/User/routes/index.ts
import auth from "@/middleware/auth"
import admin from "@/middleware/admin"

export default [{
    path: "/users",
    name: "users",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/Index.vue")
        .then(m => m.default),
}, {
// omitted for brevity ...
```
