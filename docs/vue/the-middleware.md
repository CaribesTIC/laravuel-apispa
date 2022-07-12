# El Middleware

## Visión General

A medida que nuestra aplicación crezca, necesitará tener una forma de controlar lo que sucede antes de que se cargue una ruta. Un ejemplo de esto se cubre al [agregar autenticación](../vue/vue-authentication.html#proteccion-de-rutas-y-mantenimiento-del-estado). Usando el enganche del enrutador `beforeEach`, verificamos si una ruta requiere `Auth`, si lo hace, entonces se ejecuta la lógica de autenticación. Esto funciona bien si solo está verificando la autenticación, pero ¿qué sucede si necesita agregar verificaciones adicionales para las rutas de administración? Se verifica un usuario para ver si está autenticado, luego, si va a ver la ruta `/users`, también debe ser administrador. Consulte el ejemplo de autorización básica para repasar esta funcionalidad.

## Refactorización de Autenticación para Middleware

Para proporcionar una solución de agregar múltiples controles en una ruta, podemos usar El Patrón de Diseño de Middleware. Haciendo uso del gancho del enrutador `beforeEach`, podemos encadenar varias funciones de middleware mientras mantenemos limpio el código de la plantilla del enrutador.

:::info
Tenga en cuenta que este ejemplo es más avanzado que los ejemplos anteriores.
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

Esto ahora se puede intercambiar para pasar una serie de funciones de middleware que se invocarán antes de ingresar la ruta:

```ts
{
  path: "/dashboard",
  name: "dashboard",
  meta: { middleware: [auth] }
}
```

Las funciones del middleware se mantendrán juntas en una nueva carpeta [`src/middleware`](https://github.com/CaribesTIC/vue-frontend-ts/tree/main/src/middleware). Echemos un vistazo a la función de [autenticación](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/middleware/auth.ts). Debería parecer familiar porque la mayor parte del código se corta del método original `beforeEach` que creamos.

```ts
export default function auth({ to, next, storeAuth }) {
  const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

  if (!storeAuth.value.authUser) {
    storeAuth.value.getAuthUser().then(() => {
      if (!storeAuth.value.authUser) next(loginQuery);
      else next();
    });
  } else {
    next();
  }
}
```

Consulte el apartado de Middleware de Autenticación para obtener una descripción detallada de este método. Por ahora, solo concéntrese en el patrón para una función de middleware:

```ts
export default function auth({ to, next, store }) {}
```

La función `auth` toma un objeto de los parámetros que requerimos. Por lo general, será `to` y siempre será `next` que se pasan desde el VueRouter como contexto. Aquí también requerimos acceso al `store` para que también se transfiera.

:::info
No olvide importar cualquier middleware necesario en el respectivo archivo de rutas, en la parte superior.
```ts
// @/modules/Auth/routes/index.ts
import auth from "@/middleware/auth"
import guest from "@/middleware/guest"
import admin from "@/middleware/admin"

export default [{
    path: "/",
    name: "Home",     
    meta: { middleware: [guest], layout: "empty" },      
    component: () => import("@/modules/Auth/views/Home/Index.vue").then(m => m.default)
}, {
// omitted for brevity ...
```
:::

Ahora veamos el nuevo método de enrutador `beforeEach` y cómo podemos llamar al método de middleware `auth`.

```ts{11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26}
import { computed } from "vue"
import { useAuthStore } from '@/modules/Auth/stores'
import middlewarePipeline from "@/router/middlewarePipeline"
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
    // omitted for brevity ...
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

Podemos revisar la función de [middleware de admin](../vue/the-middleware.html#middleware-admin) en su apartado de middleware. Veamos cómo podemos llamar a las funciones de middleware de `auth` y `admin` con el gancho `berforeEach`.


```ts{22}
import { computed } from "vue"
import { useAuthStore } from '@/modules/Auth/stores'
import middlewarePipeline from "@/router/middlewarePipeline"
import AuthRoutes from "@/modules/Auth/routes"
// omitted for brevity ...

const storeAuth = computed(() => useAuthStore())

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

export default router
```

La única diferencia con el anterior método `beforeEach` es que agregamos esta línea:

```ts
next: middlewarePipeline(context, middleware, 1)
```

El método `middlewarePipeline` en la propiedad `next` se llama recursivamente, pasando en cualquier contexto, el middleware y el `index` para llamar a la siguiente función del arreglo `middleware`. Creemos un nuevo archivo `@/router/middlewarePipeline.ts` y agreguemos lo siguiente:

```ts
export default function middlewarePipeline(context, middleware, index) {
  const nextMiddleware = middleware[index];
  if (!nextMiddleware) {
    return context.next;
  }
  return () => {
    nextMiddleware({
      ...context,
      next: middlewarePipeline(context, middleware, index + 1),
    });
  };
}
```

Desglosando la función `middlewarePipeline`:


1. Se pasan el `context`, el arreglo `middleware` y el `index` del arreglo actual.
1. Se crea una variable que guarda el siguiente middleware para ejecutar. Si hay dos elementos en la matriz de middleware `[auth, admin]` y `auth` acaba de ejecutarse, `nextMiddleware` retendrá a `admin`.
1. Si no hay más elementos en el arreglo `middleware`, la condición `if (!nextMiddleware)` lo busca y regresa `nest`, para que la ruta aún se cargue.
1. Si hay un middleware para ejecutar, se devuelve `nextMiddleware` (y luego se llama) pasando el `context` y llamando recursivamente a la función `middlewarePipeline` con el `index` incrementado en 1 para que se pueda ejecutar el siguiente middleware (si existe).

La canalización de middleware puede tardar un poco en comprenderse. Tratemos de pensar en ello como un método de ayuda para verificar si hay algún middleware adicional para llamar y empujarlos a través de la canalización hasta que no haya más. 

## Middleware Auth 

Es un middleware para verificar si un usuario está autenticado antes de mostrar la ruta protegida. Si la autenticación falla, el usuario es redirigido a la página de inicio de sesión.

```ts
export default function auth({ to, next, storeAuth }) {
  const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

  if (!storeAuth.value.authUser) {
    storeAuth.value.getAuthUser().then(() => {
      if (!storeAuth.value.authUser) next(loginQuery);
      else next();
    });
  } else {
    next();
  }
}
```

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

Es un middleware que verifica si el usuario actual ha iniciado sesión y evita que vea páginas de invitados como el inicio de sesión. Si ha iniciado sesión, no tiene sentido poder ver la vista de inicio de sesión; en su lugar, el usuario es redirigido al `dashboard`.

```ts
export default function guest({ next, storeAuth }) {
  const storageItem = window.localStorage.getItem("guest");
  if (storageItem === "isNotGuest" && !storeAuth.value.authUser) {
    storeAuth.value.getAuthUser().then(() => {
      if (storeAuth.value.authUser) {
        next({ name: "dashboard" });
      } else {
        storeAuth.value.setGuest({ value: "isGuest" });
        next();
      }
    });
  } else {
    next();
  }
}
```

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

Es un middleware para verificar si el usuario autenticado es un `admin`. Si no lo es, la ruta se redirige a una vista 404.

```js
export default function admin({ next, storeAuth }) {
  storeAuth.value.isAdmin
    ? next()
      : next({ path: "not-found-page" });
}
```
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
