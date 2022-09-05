# Auth: Vistas y Componentes

Aquí hay un desglose de cada uno de los componentes y vistas de Vue que se utilizan para gestionar la autenticación de usuarios, el restablecimiento de contraseñas y la verificación de correo electrónico.

## Vista `Home.vue`

[**`src/modules/Auth/views/Home.vue`**](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/views/Home.vue)
forma parte del módulo `Auth`. Básicamente es una pantalla de bienvenida que se le brinda al usuario con la opción de elegir dos botones en el caso de que no haya iniciado sesión:

1. _"Registrarse"_
1. _"Iniciar sesión"_

Esta vista es muy sencilla, sin embargo, ya tiene sus correspondientes pruebas automatizadas para garantizar siempre su buen funcionamiento.

- [`tests/modules/auth/views/homeMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/views/homeMountedCorrectly.spec.ts)
- [`tests/modules/auth/views/homeLinksWork.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/views/homeLinksWork.ts)


## Vista `Register.vue`

[**`src/modules/Auth/views/Register.vue`**](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/views/Register.vue) permite a los usuarios registrarse para obtener una cuenta si no tienen una. Funciona con el punto final `/register` de Fortify. Solo funciona cuando un usuario no ha iniciado sesión, no puede usarlo para agregar usuarios si ha iniciado sesión. Para agregar usuarios a través de una pantalla de administración, necesitaríamos crear otro punto final de API y modificar este componente para publicarlo también. Por ahora, se mantiene simplemente para registrar nuevos usuarios. Una vez que un usuario se registra correctamente, inicia sesión automáticamente y se le redirige al panel.

Esta vista importa dos archivos:

1. [`src/modules/Auth/components/FormRegister.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/components/FormRegister.vue): Este componente encapsula el formulario para hacer más fácil la prueba de la emisión del evento `submit`.
  
2. [`src/modules/Auth/composables/useRegister.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/composables/useRegister.ts): Este composable mantiene la lógica de negocio separada de la interfaz del usuario.

Y por último las respectivas pruebas automatizadas asociadas a la vista de registro:

- [`tests/modules/auth/views/registerMountedCorrectly.spec.ts `](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/views/registerMountedCorrectly.spec.ts)
- [`tests/modules/auth/services/registerFetchMock.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/services/registerFetchMock.spec.ts)
- [`tests/modules/auth/components/formRegisterInteractingWith.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/components/formRegisterInteractingWith.spec.ts)
- [`tests/modules/auth/components/formRegisterMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/components/formRegisterMountedCorrectly.spec.ts)

## Vista de `Login.vue`

[**`src/modules/Auth/views/Login.vue`**](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/views/Login.vue) funciona con el punto final `/login` de Fortify. Tenga en cuenta que todos los puntos finales de autenticación se mantienen en [`src/modules/Auth/services/index.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/services/index.ts). Una vez que un usuario inicia sesión correctamente, se le redirige al panel de control.

Esta vista importa dos archivos:

1. [`src/modules/Auth/components/FormLogin.vue`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/components/FormLogin.vue): Este componente encapsula el formulario para hacer más fácil la prueba de la emisión del evento `submit`.

1. [`src/modules/Auth/composables/useLogin.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/composables/useLogin.ts): Este composable mantiene la lógica de negocio separada de la interfaz del usuario.

Y por último las respectivas pruebas automatizadas asociadas a la vista de inicio de sesión:

- [`tests/modules/auth/views/loginMountedCorrectly.spec.ts `](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/views/loginMountedCorrectly.spec.ts)
- [`tests/modules/auth/services/loginFetchMock.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/services/loginFetchMock.spec.ts)
- [`tests/modules/auth/components/formLoginInteractingWith.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/components/formLoginInteractingWith.spec.ts)
- [`tests/modules/auth/components/formLoginMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/laravuel-spa/blob/main/tests/modules/auth/components/formLoginMountedCorrectly.spec.ts)

## Componente `Logout.vue`

[**`src/modules/Auth/components/Logout.vue`**](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/components/Logout.vue)
Es un componente simple que funciona con el punto final `/logout` de Fortify. Cuando se cierra la sesión de un usuario, se envía la acción de `authStore.logout()` que borra al usuario del `Store` y lo redirige a la vista de inicio de sesión.

:::warning
Lo que sigue a continuación en este apartado no está aún revisado...
:::

## Dashboard View (Protected Path)

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/views/Dashboard.vue)

This component requires authentication before it can be used. A board could show much more, but the important thing here is that it is protected. A user must be registered to view it.

## Forgot Password View

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/views/ForgotPassword.vue)

The forgot password view can be accessed if a user is not logged in and needs to reset their password. It works with the Fortify /forgot-password endpoint. Once the form is submitted Laravel will check the email is valid and send out a reset password email. The link in this email will have a token and the URL will point to the reset password view in the SPA.

## Reset Password View

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/views/ResetPassword.vue)

The reset password view displays a form where a user can change their password. Importantly it will also have access to the token provided by Laravel. It works with the Fortify /reset-password endpoint. When the form is submitted the users email and token are checked by Laravel. If everything was successful, a message is displayed and the user can log in.

## Update Password Component

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/UpdatePassword.vue)

This form allows a logged-in user to update their password. It works with the Fortify /user/password endpoint.

## Email Verification

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/VerifyEmail.vue)

Laravel provides the ability for a user to verify their email as an added layer of security. This component works with the /email/verification-notification endpoint. To get the email notification working, there is some set up required within the Laravel API. More detail in these instructions.

With this in place, the SPA will check a user is verified using the details in the auth Vuex store. If they are not, a button is displayed, when clicked the verification email will be sent by Laravel. The email will have a link to verify and return the user back to the SPA dashboard.

## Flash Message Component

[View file on GitHub](https://github.com/garethredfern/laravel-vue/blob/main/src/components/FlashMessage.vue)

While the user is interacting with the API via the SPA we need to give them success and error messages. The Laravel API will be handling a lot of these messages, but we can also use catch try/catch blocks to display messages within the SPA. To keep things all in one place there is a FlashMessage component which takes a message and error prop.
