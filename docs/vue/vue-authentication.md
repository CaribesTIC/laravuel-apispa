# Autenticación - Vue SPA

## Puntos finales de autenticación y CORS

Primero eche un vistazo al archivo [Servicios de Autenticación](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/services/index.ts) para mantener todos los puntos finales de autenticación de API en un solo lugar. Los métodos en este archivo interactúan con los puntos finales de Fortify que hemos configurado previamente.

En la parte superior de este archivo, se importa [Http](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/utils/Http/index.ts), el cual es un wrapper de Axios, para manejar la obtención de datos de nuestra API. Note que el wrapper `Http` para ser instanciado debe recibir una configuración [inicial](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/utils/Http/init.ts) global dependiendo del uso.

Para este caso, simplemente estamos configurando solo tres propiedades:

```ts
import { useAuthStore } from '@/modules/Auth/stores'
import { InitInterface } from "./init.interface"

export default<InitInterface> {
  baseURL: process.env.VUE_APP_API_URL,  
  withCredentials: true, 
  handleError(error: any) {
    const storeAuth = useAuthStore()
    
    if (error.response
      && [401, 419].includes(error.response.status)    
      && storeAuth.authUser 
      && !storeAuth.guest
    ) {
      storeAuth.logout();
    }
    
    return Promise.reject(error);
  }
}
```

- `baseURL` contiene el valor de `process.env.VUE_APP_API_URL`, declarada en [vite.config.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/vite.config.ts).
- `withCredentials` debe ser declarada en `true`, ya que una solicitud `XMLHttpRequest` de un dominio diferente no puede establecer valores de cookies para su dominio a menos que esta se establezca en verdadero antes de realizar la solicitud.
- `handleErro` es una función personalizada para el manejo de errores.

:::info
Es importante resaltar que esto requiere que el SPA y la API compartan el mismo dominio de nivel superior. Sin embargo, pueden colocarse en diferentes subdominios.
:::

## Sesiones, Cookies y CSRF

Para autenticar su SPA, la página de inicio de sesión primero debe realizar una solicitud al extremo `/sanctum/csrf-cookie` para inicializar la protección CSRF para la aplicación:


```ts
await authClient.get("/sanctum/csrf-cookie");
```

Esto también se aplica a cualquier otra acción de Fortify que requiera protección CSRF. Tenga en cuenta las otras rutas en el módulo [AuthService](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/services/index.ts) que también incluyen una solicitud de obtención de la cookie CSRF; `forgotPassword`, `resetPassword`, etc.

Si una solicitud de inicio de sesión tiene éxito, el usuario se autentica y las solicitudes posteriores al SPA se autenticarán automáticamente a través de la cookie de sesión que emite la aplicación Laravel. Además, dado que ya hicimos una solicitud a la ruta `/sanctum/csrf-cookie`, las solicitudes posteriores deberían recibir automáticamente protección CSRF porque Axios envía automáticamente la cookie XSRF-TOKEN en el encabezado X-XSRF-TOKEN.

## Protección de Rutas y Mantenimiento del Estado

El método para proteger las rutas de su aplicación es bastante simple. En los archivos de rutas, como el caso del módulo `Auth` hay un metacampo [requiresAuth](https://github.com/garethredfern/laravel-vue/blob/v1.2.7/src/router/index.js), es un valor booleano que se mantiene contra cada ruta que desea proteger. Usando el enrutador Vue antes de cada método, verifique si una ruta tiene un booleano `auth` de verdadero y si hay un usuario autenticado en el [AuthStore](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/stores/index.ts):

```ts
router.beforeEach((to, from, next) => {
  const authUser = store.getters["auth/authUser"];
  const reqAuth = to.matched.some((record) => record.meta.requiresAuth);
  const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

  if (reqAuth && !authUser) {
    store.dispatch("auth/getAuthUser").then(() => {
      if (!store.getters["auth/authUser"]) next(loginQuery);
      else next();
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
authClient.interceptors.response.use(
  (response) => {
    return response;
  },
  function(error) {
    if (error.response.status === 401 || error.response.status === 419) {
      store.dispatch("auth/logout");
    }
    return Promise.reject(error.response);
  }
);
```
## Plantillas de Página (Vistas) y Descripción de Componentes

Aquí hay un desglose de cada uno de los componentes y vistas de Vue que se utilizan para gestionar la autenticación de usuarios, el restablecimiento de contraseñas y la verificación de correo electrónico.


- Componente de Registro

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Register/Index.vue)

El componente de registro permite a los usuarios registrarse para obtener una cuenta si no tienen una. Funciona con el punto final `/register` de Fortify. Solo funciona cuando un usuario no ha iniciado sesión, no puede usarlo para agregar usuarios si ha iniciado sesión. Para agregar usuarios a través de una pantalla de administración, necesitaríamos crear otro punto final de API y modificar este componente para publicarlo también. Por ahora, se mantiene simplemente para registrar nuevos usuarios. Una vez que un usuario se registra correctamente, inicia sesión automáticamente y se le redirige al panel.

- Componente de Inicio de Sesión

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Login/Index.vue)

El formulario de inicio de sesión funciona con el punto final `/login` de Fortify. Tenga en cuenta que todos los puntos finales se mantienen en el módulo `AuthService` que se importa en cada `view/component`. Una vez que un usuario inicia sesión correctamente, se le redirige al panel de control.

- Componente de Cierre de Sesión

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/components/Logout.vue)

Un componente simple que funciona con el punto final `/logout` de Fortify. Cuando se cierra la sesión de un usuario, se envía la acción de `authStore.logout()` que borra al usuario del `Store` y lo redirige a la vista de inicio de sesión.


- Vista de Tablero (Ruta Protegida)

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Dashboard/Index.vue)

Este componente requiere autenticación antes de que pueda verse. Un tablero podría mostrar mucho más, pero lo importante aquí es que está protegido. Un usuario debe estar registrado para verlo.

- Forgot Password View

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/views/ForgotPassword.vue)

The forgot password view can be accessed if a user is not logged in and needs to reset their password. It works with the Fortify /forgot-password endpoint. Once the form is submitted Laravel will check the email is valid and send out a reset password email. The link in this email will have a token and the URL will point to the reset password view in the SPA.

- Reset Password View

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/views/ResetPassword.vue)

The reset password view displays a form where a user can change their password. Importantly it will also have access to the token provided by Laravel. It works with the Fortify /reset-password endpoint. When the form is submitted the users email and token are checked by Laravel. If everything was successful, a message is displayed and the user can log in.

- Update Password Component

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/UpdatePassword.vue)

This form allows a logged-in user to update their password. It works with the Fortify /user/password endpoint.

- Email Verification

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/VerifyEmail.vue)

Laravel provides the ability for a user to verify their email as an added layer of security. This component works with the /email/verification-notification endpoint. To get the email notification working, there is some set up required within the Laravel API. More detail in these instructions.

With this in place, the SPA will check a user is verified using the details in the auth Vuex store. If they are not, a button is displayed, when clicked the verification email will be sent by Laravel. The email will have a link to verify and return the user back to the SPA dashboard.

- Flash Message Component

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/FlashMessage.vue)

While the user is interacting with the API via the SPA we need to give them success and error messages. The Laravel API will be handling a lot of these messages, but we can also use catch try/catch blocks to display messages within the SPA. To keep things all in one place there is a FlashMessage component which takes a message and error prop.
