# Setup Laravel API

Make sure you change the following in your .env file:

```php
DB_HOST=127.0.0.1
```
To this:

```php
DB_HOST=mysql
```
or to this:

```php
DB_HOST=pgsql
```

Add a sender address in the .env so that email can be sent.

```php
MAIL_FROM_ADDRESS=test@test.com
```

## Install Sanctum

The full documentation can be found on the [Laravel website](https://laravel.com/docs/9.x/sanctum).

```php
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Sanctum needs some specific set up to enable it to work with a separate SPA. First lets add the following in your .env file:

```php
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SPA_URL=http://localhost:3000
SESSION_DOMAIN=localhost
```

The stateful domain tells Sanctum which domain you are using for the SPA. You can find the full notes and config for this in the config/sanctum.php file. As we are using cookies and sessions for authentication you need to add a session domain. This determines which domain the cookie is available to in your application. Full notes can be found in the config/session.php file and the [official documentation](https://laravel.com/docs/9.x/sanctum#spa-authentication).

Add Sanctum's middleware to your api middleware group within your application's app/Http/Kernel.php file:

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

## Install Fortify

The full documentation can be found on the [Laravel website](https://laravel.com/docs/9.x/fortify).

```php
composer require laravel/fortify
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
php artisan migrate
```

Ensure the FortifyServiceProvider class is registered within the providers array of your application's config/app.php file.

```php
/*
 * Application Service Providers...
 */

App\Providers\FortifyServiceProvider::class,
```

## Database Seeding

Set up a seed for adding a test user, in the DatabaseSeeder.php file add the following:

```php
\App\Models\User::factory(1)->create(
    [
        'name' => 'Luke Skywalker',
        'email' => 'luke@jedi.com',
        'email_verified_at' => null,
    ]
);
```

Run the migrations:

```php
php artisan migrate --seed
```
