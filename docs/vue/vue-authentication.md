# Autenticación - Vue SPA

## Puntos finales de autenticación y CORS

El archivo [src/modules/Auth/services/index.ts](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/services/index.ts) mantiene todos los puntos finales de autenticación de API en un solo lugar. Los métodos en este archivo interactúan con [los puntos finales de Fortify que hemos configurado previamente](../laravel/laravel-authentication.html#configuracion-de-fortify).

:::info
Es importante resaltar que esto requiere que el SPA y la API compartan el mismo dominio de nivel superior. Sin embargo, pueden colocarse en diferentes subdominios.
:::

## Sesiones, Cookies y CSRF

Para autenticar nuestra SPA, la página de inicio de sesión primero debe realizar una solicitud al extremo `/sanctum/csrf-cookie` para inicializar la protección CSRF para la aplicación:


```ts
await Http.get("/sanctum/csrf-cookie");
```

Esto también se aplica a cualquier otra acción de Fortify que requiera protección CSRF. Téngase en cuenta otras rutas en dicho módulo que también incluyen una solicitud de obtención de la cookie CSRF; `forgotPassword`, `resetPassword`, etc.

Si una solicitud de inicio de sesión tiene éxito, el usuario se autentica y las solicitudes posteriores al SPA se autenticarán automáticamente a través de la cookie de sesión que emite la aplicación Laravel. Además, dado que ya hicimos una solicitud a la ruta `/sanctum/csrf-cookie`, las solicitudes posteriores deberían recibir automáticamente protección CSRF porque Axios envía automáticamente la cookie XSRF-TOKEN en el encabezado X-XSRF-TOKEN.

