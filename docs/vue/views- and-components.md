# Vistas y Componentes

Aquí hay un desglose de cada uno de los componentes y vistas de Vue que se utilizan para gestionar la autenticación de usuarios, el restablecimiento de contraseñas y la verificación de correo electrónico.


## Componente de Registro

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Register/Index.vue)

El componente de registro permite a los usuarios registrarse para obtener una cuenta si no tienen una. Funciona con el punto final `/register` de Fortify. Solo funciona cuando un usuario no ha iniciado sesión, no puede usarlo para agregar usuarios si ha iniciado sesión. Para agregar usuarios a través de una pantalla de administración, necesitaríamos crear otro punto final de API y modificar este componente para publicarlo también. Por ahora, se mantiene simplemente para registrar nuevos usuarios. Una vez que un usuario se registra correctamente, inicia sesión automáticamente y se le redirige al panel.

## Componente de Inicio de Sesión

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Login/Index.vue)

El formulario de inicio de sesión funciona con el punto final `/login` de Fortify. Tenga en cuenta que todos los puntos finales se mantienen en el módulo `AuthService` que se importa en cada `view/component`. Una vez que un usuario inicia sesión correctamente, se le redirige al panel de control.

## Componente de Cierre de Sesión

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/components/Logout.vue)

Un componente simple que funciona con el punto final `/logout` de Fortify. Cuando se cierra la sesión de un usuario, se envía la acción de `authStore.logout()` que borra al usuario del `Store` y lo redirige a la vista de inicio de sesión.


## Vista de Tablero (Ruta Protegida)

[Ver archivo en GitHub](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Dashboard/Index.vue)

Este componente requiere autenticación antes de que pueda verse. Un tablero podría mostrar mucho más, pero lo importante aquí es que está protegido. Un usuario debe estar registrado para verlo.

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
