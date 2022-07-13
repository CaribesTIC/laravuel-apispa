# Autenticación - Vue SPA

## Puntos finales de autenticación y CORS

Primero eche un vistazo al archivo [Servicios de Autenticación](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/services/index.ts) para mantener todos los puntos finales de autenticación de API en un solo lugar. Los métodos en este archivo interactúan con los puntos finales de Fortify que hemos configurado previamente.

```ts
// modules/Auth/services/index.ts
import Http from "@/utils/Http";

export const login = async <T>(payload: T) => {
  await Http.get("/sanctum/csrf-cookie");
  return Http.post("/login", payload);
 }

export const logout = () => {
  return Http.post("/logout");
}

export const forgotPassword = async <T>(payload: T) => {
  await Http.get("/sanctum/csrf-cookie");
  return Http.post("/forgot-password", payload);
}

export const getAuthUser = () => {
  return Http.get("/api/users/auth");
}

export const resetPassword = async <T>(payload: T) => {
  await Http.get("/sanctum/csrf-cookie");
  return Http.post("/reset-password", payload);
}

export const updatePassword = <T>(payload: T) => {
  return Http.put("/user/password", payload);
}

export const registerUser = async <T>(payload: T) => {
  await Http.get("/sanctum/csrf-cookie");
  return Http.post("/register", payload);
}

export const sendVerification = <T>(payload: T) => {
  return Http.post("/email/verification-notification", payload);
}

export const updateUser = <T>(payload: T) => {
  return Http.put("/user/profile-information", payload);
}

export const getAuthMenu = () => {
  return Http.get("/api/users/auth-menu");
}
```
:::info
Es importante resaltar que esto requiere que el SPA y la API compartan el mismo dominio de nivel superior. Sin embargo, pueden colocarse en diferentes subdominios.
:::

## Sesiones, Cookies y CSRF

Para autenticar su SPA, la página de inicio de sesión primero debe realizar una solicitud al extremo `/sanctum/csrf-cookie` para inicializar la protección CSRF para la aplicación:


```ts
await Http.get("/sanctum/csrf-cookie");
```

Esto también se aplica a cualquier otra acción de Fortify que requiera protección CSRF. Tenga en cuenta las otras rutas en el módulo `AuthService` que también incluyen una solicitud de obtención de la cookie CSRF; `forgotPassword`, `resetPassword`, etc.

Si una solicitud de inicio de sesión tiene éxito, el usuario se autentica y las solicitudes posteriores al SPA se autenticarán automáticamente a través de la cookie de sesión que emite la aplicación Laravel. Además, dado que ya hicimos una solicitud a la ruta `/sanctum/csrf-cookie`, las solicitudes posteriores deberían recibir automáticamente protección CSRF porque Axios envía automáticamente la cookie XSRF-TOKEN en el encabezado X-XSRF-TOKEN.

## Protección de Rutas y Mantenimiento del Estado

El método para proteger las rutas de su aplicación es bastante simple. En los archivos de rutas, como el caso del módulo `Auth` hay un metacampo [requiresAuth](https://github.com/garethredfern/laravel-vue/blob/v1.2.7/src/router/index.js), es un valor booleano que se mantiene contra cada ruta que desea proteger. Usando el enrutador Vue antes de cada método, verifique si una ruta tiene un booleano `auth` de verdadero y si hay un usuario autenticado en el [AuthStore](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/stores/index.ts):

```ts
router.beforeEach((to, from, next) => {
  const authUser = storeAuth.value.authUser;
  const reqAuth = to.matched.some((record) => record.meta.requiresAuth);
  const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

  if (reqAuth && !authUser) {
    storeAuth.value.getAuthUser().then(() => {
      (!storeAuth.value.authUser) 
        ? next(loginQuery)
          :next();
    });
  } else {
    next(); // make sure to always call next()!
  }
});
```
Algunos escenarios deben manejarse aquí:

1. Si hay un usuario autenticado en estado, la ruta permite cargar la página.
2. Si no hay un usuario autenticado en el estado, haga una llamada a la API de Laravel para verificar si hay un usuario autenticado que se vincule con la sesión. Suponiendo que lo haya, la tienda se completará con los detalles del usuario. El enrutador permite que la página se cargue.
3. Finalmente, si no hay una sesión válida, redirija a la página de inicio de sesión.

Actualizar el navegador enviará una solicitud GET a la API para el usuario autenticado, almacenará los detalles en el estado. Navegar por la aplicación utilizará el estado `auth` para minimizar las solicitudes de API, manteniendo las cosas ágiles. Esto también ayuda con la seguridad. Cada vez que se obtienen datos de la API, Laravel verifica la sesión. Si la sesión deja de ser válida, se envía una respuesta `401` o `419` al SPA. Manejado a través de un interceptor Axios, desconectando al usuario.


```js
auth.interceptors.response.use(
  (response) => { return response; },
  (error) => {
    const storeAuth = useAuthStore()
    
    if (error.response
      && [401, 419].includes(error.response.status)    
      && storeAuth.authUser 
      && !storeAuth.guest
    ) { storeAuth.logout(); }
    
    return Promise.reject(error);
  }
);
```
