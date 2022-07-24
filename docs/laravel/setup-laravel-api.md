# Configurar Laravel API

Asegúrese de cambiar lo siguiente en su archivo `.env`:

```php
DB_HOST=127.0.0.1
```
A esto:

```php
DB_HOST=mysql
```
O a esto:

```php
DB_HOST=pgsql
```

Agregue una dirección de remitente en el `.env` para que se pueda enviar el correo electrónico.

```php
MAIL_FROM_ADDRESS=test@test.com
```

## Instalar Sanctum

La documentación completa se puede encontrar en el [sitio web de Laravel](https://laravel.com/docs/9.x/sanctum).

```php
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Sanctum necesita una configuración específica para permitirle trabajar con una SPA separada. Primero agreguemos lo siguiente en su archivo `.env`:

```php
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SPA_URL=http://localhost:5173
SESSION_DOMAIN=localhost
```

El dominio con estado le dice a Sanctum qué dominio está utilizando para el SPA. Puede encontrar las notas completas y la configuración para esto en el archivo `config/sanctum.php`. Como usamos cookies y sesiones para la autenticación, debe agregar un dominio de sesión. Esto determina para qué dominio está disponible la cookie en su aplicación. Las notas completas se pueden encontrar en el archivo `config/session.php` y en la [documentación oficial](https://laravel.com/docs/9.x/sanctum#spa-authentication).

Agregue el middleware de Sanctum a su grupo de middleware api dentro del archivo `app/Http/Kernel.php` de su aplicación:

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

## Instalar Fortify

La documentación completa se puede encontrar en el [sitio web de Laravel](https://laravel.com/docs/9.x/fortify).

```php
composer require laravel/fortify
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
php artisan migrate
```

Asegúrese de que la clase `FortifyServiceProvider` esté registrada dentro de la matriz de proveedores del archivo `config/app.php` de su aplicación.

```php
/*
 * Application Service Providers...
 */

App\Providers\FortifyServiceProvider::class,
```

## Siembra de Base de Datos

Configure a semilla para agregar un usuario de prueba, en el archivo `DatabaseSeeder.php` agregue lo siguiente:


```php
\App\Models\User::factory(1)->create(
    [
        'name' => 'Luke Skywalker',
        'email' => 'luke@jedi.com',
        'email_verified_at' => null,
    ]
);
```

Ejecuta las migraciones:

```php
php artisan migrate --seed
```
## Almacenamiento de Archivos

En el archivo `.env` se declara lo siguiente para el almacenamiento de archivos :

```php
DO_SPACES_PUBLIC=http://localhost:8000/storage/
```
