# Autenticación - API de Laravel

## Configuración de CORS

Si no configura CORS correctamente, puede ser la causa (perdón por el juego de palabras) de una gran frustración. Lo primero que debe recordar es que su SPA y API deben ejecutarse en el mismo dominio de nivel superior. Sin embargo, pueden colocarse en diferentes subdominios. Al ejecutarse localmente, con `php artisan serve` la API se ejecutará en `http://localhost:8000`. Y el SPA, que usa Vite, normalmente se ejecutará con `npm run dev` en `http://localhost:3000` (el puerto puede variar, pero está bien).

Con esto en su lugar, solo necesitamos agregar las rutas que se permitirán a través de CORS. La mayoría de los puntos finales de la API se realizarán a través de `api/*`, pero Fortify tiene varios puntos finales que debe agregar junto con la obtención de `'sanctum/csrf-cookie'`, agregue lo siguiente en su archivo `config/cors.php`:

```php
'paths' => [
  'api/*',
  'login',
  'logout',
  'register',
  'user/password',
  'forgot-password',
  'reset-password',
  'sanctum/csrf-cookie',
  'user/profile-information',
  'email/verification-notification',
],
```

Mientras esté en el archivo `config/cors.php`, configure lo siguiente:

```php
'supports_credentials' => true,
```

Lo anterior asegura que tiene el encabezado `Access-Control-Allow-Credentials` con un valor de `true` establecido. Puedes leer más sobre esto en la [documentación de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials). Pasaremos este encabezado a través del SPA, pero [hablaremos más de eso cuando pasemos a configurarlo](../vue/setup-vue-spa.html#).

## Configuración de Fortify

Fortify también tiene un archivo de configuración (`config/fortify.php`) que necesitará algunos cambios. Primero configure la variable `home` para que apunte a la URL de SPA, esto se puede hacer a través de la variable `.env`. Aquí es donde la API se redirige durante la autenticación o el restablecimiento de contraseña cuando las operaciones son exitosas y el usuario está autenticado.

```php
'home' => env('SPA_URL') . '/dashboard',
```

A continuación, apague el uso de cualquier vista de Laravel para las funciones de autenticación, el SPA se encarga de todo esto.

```php
'views' => false,
```

Finalmente, active las funciones de autenticación que le gustaría usar:

```php
'features' => [
  Features::registration(),
  Features::resetPasswords(),
  Features::emailVerification(),
  Features::updateProfileInformation(),
  Features::updatePasswords(),
],
```

## Redirigir si está Autenticado

Laravel proporciona un middleware `RedirectIfAuthenticated` que intentará y lo redirigirá a la vista `home` si ya está autenticado. Para que el SPA funcione, puede agregar lo siguiente, que simplemente enviará un mensaje de éxito 200 en una respuesta JSON. Luego manejaremos la redirección a la página de inicio del SPA utilizando el enrutamiento VueJS.

```php
foreach ($guards as $guard) {
    if (Auth::guard($guard)->check()) {
      if ($request->expectsJson()) {
        return response()->json(['error' => 'Already authenticated.'], 200);
      }
      return redirect(RouteServiceProvider::HOME);
    }
}
```

## Verificación de Email

Laravel puede manejar la verificación de correo electrónico como lo haría normalmente, pero con un pequeño ajuste en el middleware de autenticación. Primero. Asegurémonos de que su `App\Models\User` implemente el contrato `MustVerifyEmail`:

```php
class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    //...
}
```

En el middleware `Authenticate`, cambie el método `redirectTo` para redirigir a la URL de SPA en lugar de a una vista de Laravel:

```php
protected function redirectTo($request)
{
    if (! $request->expectsJson()) {
        return url(env('SPA_URL') . '/login');
    }
}
```

Con esto en su lugar, Laravel ahora enviará el correo electrónico de verificación y cuando un usuario haga clic en el enlace de verificación, realizará las comprobaciones de seguridad necesarias y lo redirigirá a la URL de su SPA.

## Restablecer la Contraseña

Configurar la funcionalidad de restablecimiento de contraseña en la API es tan simple como seguir los [documentos oficiales](https://laravel.com/docs/8.x/passwords#reset-link-customization). Como referencia, esto es lo que debe hacer.

Agregue lo siguiente en la parte superior de `App\Providers\AuthServiceProvider`

```php
use Illuminate\Auth\Notifications\ResetPassword;
```

Agregue lo siguiente en el método `boot` de `AuthServiceProvider`, esto creará la URL que se usa en el SPA con un token generado:


```php
ResetPassword::createUrlUsing(function ($user, string $token) {
    return env('SPA_URL') . '/reset-password?token=' . $token;
});
```

Para que todo esto funcione, necesitaremos tener una vista de restablecimiento de contraseña en el SPA que maneje el token y devuelva la nueva contraseña de los usuarios. Esto se explica, con un enlace al componente, en la página de [autenticación de Vue](../vue/setup-vue-spa.html#) bajo el encabezado Reset Password View.

## Rutas API

Una vez que tenga toda la autenticación en su lugar, cualquier ruta protegida deberá usar la protección de middleware `auth:sanctum`. Esto garantizará que el usuario se haya autenticado antes de que pueda ver los datos solicitados de la API. Aquí hay un ejemplo simple de cómo se verían esos puntos finales.

```php
use App\Models\User;

Route::middleware(['auth:sanctum'])->group(function () {
  //...
    Route::get('/users/{id}', function ($id) {
      return User::findOrFail($id);
  });
});
```
