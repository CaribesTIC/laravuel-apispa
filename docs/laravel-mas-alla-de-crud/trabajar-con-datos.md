# Trabajar con datos

Me gusta pensar en esa idea simple de agrupar el código en dominios, que expliqué en el capítulo anterior, como una base conceptual que podemos usar para construir. Notará que a lo largo de la primera parte de este libro, esta idea central volverá una y otra vez.

El primer bloque de construcción que colocaremos sobre esta base, es una vez más tan simple en su núcleo, pero tan poderoso: vamos a modelar datos de una manera estructurada; vamos a hacer de los datos un ciudadano de primera clase de nuestra base de código.

Probablemente notó la importancia del modelado de datos al comienzo de casi todos los proyectos que realiza: no comienza a construir controladores y trabajos, comienza creando, lo que Laravel llama, modelos. Los proyectos grandes se benefician al hacer ERD y otros tipos de diagramas para conceptualizar qué datos manejará la aplicación. Solo cuando esté claro, puede comenzar a crear los puntos de entrada y los enlaces que funcionan con sus datos.

El objetivo de este capítulo es enseñarle la importancia de ese flujo de datos. Ni siquiera vamos a hablar de modelos. En su lugar, vamos a ver datos sencillos y sencillos para empezar, y el objetivo es que todos los desarrolladores de su equipo puedan escribir código que interactúe con estos datos de una manera predecible y segura.

Para apreciar realmente todos los beneficios que obtendremos al aplicar un patrón simple orientado a datos, primero debemos sumergirnos en el sistema de tipos de PHP.

## Teoría de tipos

No todo el mundo está de acuerdo con el vocabulario utilizado cuando se habla de sistemas de tipos. Entonces, aclaremos algunos términos en la forma en que los usaré aquí.

La fuerza de un sistema de tipos (tipos fuertes o débiles) define si una variable puede cambiar su tipo después de que se definió. Un ejemplo simple: dada una variable de cadena `$a = 'test'`; un sistema de tipo débil le permite reasignar esa variable a otro tipo, por ejemplo `$a = 1`, un número entero.

PHP es un lenguaje débilmente tipificado. Veamos lo que eso significa en la práctica.

```
$id = '1'; // E.g. an id retrieved from the URL

function find(int $id): Model
{
    // The input '1' will automatically be cast to an int
}

find($id);
```
Para ser claros: tiene sentido que PHP tenga un sistema de tipo débil. Al ser un lenguaje que trabaja principalmente con una solicitud HTTP, todo es básicamente una cadena.

Podría pensar que en PHP moderno, puede evitar este tipo de cambio detrás de escena (malabarismo de tipos) utilizando la función de tipos estrictos, pero eso no es completamente cierto. La declaración de tipos estrictos evita que se pasen otros tipos a una función, pero aún puede cambiar el valor de la variable en la función misma.

```
declare(strict_types=1);

function find(int $id): Model
{
    $id = '' . $id;

    /*
    * This is perfectly allowed in PHP
    * `$id` is a string now.
    */

    // ...
}

find('1'); // This would trigger a TypeError.

find(1); // This would be fine.
```
Incluso con tipos estrictos y sugerencias de tipos, el sistema de tipos de PHP es débil. Las sugerencias de tipo solo aseguran el tipo de una variable en ese momento, sin una garantía sobre cualquier valor futuro que pueda tener esa variable.

Como dije antes: tiene sentido que PHP tenga un sistema de tipo débil, ya que todas las entradas con las que tiene que lidiar comienzan como una cadena. Sin embargo, hay una propiedad interesante para los tipos fuertes: vienen con algunas garantías. Si una variable tiene un tipo que no se puede modificar, toda una gama de comportamientos inesperados ya no pueden ocurrir.

Verá, es matemáticamente demostrable que si se compila un programa fuertemente tipado, es imposible que ese programa tenga una variedad de errores que podrían existir en lenguajes débilmente tipificados. En otras palabras, los tipos fuertes le dan al programador una mejor seguridad de que el código realmente se comporta como se supone que debe hacerlo.

Como nota al margen: ¡esto no significa que un lenguaje fuertemente tipado no pueda tener errores! Eres perfectamente capaz de escribir una implementación con errores. Pero cuando un programa fuertemente tipado se compila con éxito, está seguro de que cierto conjunto de errores y errores relacionados con el tipo no pueden ocurrir en ese programa.

---
Los sistemas de tipo fuerte permiten a los desarrolladores tener mucha más información sobre el programa al escribir el código, en lugar de tener que ejecutarlo.
---

Hay un concepto más que debemos analizar: sistemas de tipos estáticos y dinámicos, y aquí es donde las cosas comienzan a ponerse interesantes.

Como probablemente sepa, PHP es un lenguaje interpretado, lo que significa que un script PHP se traduce a código de máquina en tiempo de ejecución. Cuando envía una solicitud a un servidor que ejecuta PHP, tomará esos archivos .php simples y analizará ese texto en algo que el procesador pueda ejecutar.

Una vez más, esta es una de las fortalezas de PHP: la simplicidad de escribir un script, actualizar la página y todo está ahí. Esa es una gran diferencia en comparación con un lenguaje que debe compilarse antes de poder ejecutarse.

Obviamente, existen mecanismos de almacenamiento en caché que optimizan esto, por lo que la declaración anterior es una simplificación excesiva, pero es lo suficientemente buena como para pasar al siguiente punto.

Ese punto es que, una vez más, hay una desventaja en el enfoque de PHP: dado que solo verifica sus tipos en tiempo de ejecución, puede haber errores de tipo que bloqueen el programa mientras se ejecuta. Es posible que tenga un error claro para depurar, pero aún así el programa se bloqueó.

Esta verificación de tipo en tiempo de ejecución hace que PHP sea un lenguaje de tipo dinámico. Por otro lado, un lenguaje tipificado estáticamente tendrá todas sus comprobaciones de tipo realizadas antes de que se ejecute el código, generalmente durante el tiempo de compilación.

A partir de PHP 7.0, su sistema de tipos se ha mejorado bastante. Tanto es así que herramientas como PHPStan, Phan y Psalm comenzaron a ser muy populares últimamente. Estas herramientas toman el lenguaje dinámico que es PHP, pero ejecutan un montón de análisis estáticos en su código.

Estas bibliotecas opcionales pueden ofrecer una gran cantidad de información sobre su código, sin tener que ejecutarlo ni ejecutar pruebas unitarias. Además, un IDE como PhpStorm también tiene muchas de estas comprobaciones estáticas integradas.

Con toda esta información de fondo en mente, es hora de volver al núcleo de nuestra aplicación: los datos.

## Estructuración de datos no estructurados

¿Alguna vez ha tenido que trabajar con una "serie de cosas" que en realidad era más que una simple lista? ¿Utilizó las claves de matriz como campos? ¿Y sentiste el dolor de no saber exactamente qué había en esa matriz? ¿Qué tal si no está seguro de si los datos que contiene son realmente lo que espera que sean o qué campos están disponibles?

Visualicemos de lo que estoy hablando: trabajar con las solicitudes de Laravel. Piense en este ejemplo como una operación CRUD básica para actualizar un cliente existente.

```
function store(CustomerRequest $request, Customer $customer)
{
    $validated = $request->validated();

    $customer->name = $validated['name'];
    $customer->email = $validated['email'];

    // ...
}
```
Es posible que ya vea surgir el problema: no sabemos exactamente qué datos están disponibles en la matriz $validated. Si bien las matrices en PHP son una estructura de datos versátil y poderosa, tan pronto como se usan para representar algo más que "una lista de cosas", hay mejores formas de resolver su problema.

Antes de buscar soluciones, esto es lo que podría hacer para lidiar con esta situación:

- Leer el código fuente
- Lea la documentación
- Dump $validado para inspeccionarlo
- O use un depurador para inspeccionarlo

Resulta que los sistemas fuertemente tipados en combinación con el análisis estático pueden ser de gran ayuda para comprender a qué nos enfrentamos exactamente. Lenguajes como Rust, por ejemplo, resuelven este problema limpiamente:

```
struct CustomerData {
    name: String,
    email: String,
    birth_date: Date,
}
```
En realidad, una estructura es exactamente lo que necesitamos, pero desafortunadamente PHP no tiene estructuras; tiene matrices y objetos, y eso es todo.

Sin embargo... los objetos y las clases pueden ser suficientes.

```
class CustomerData
{
    public string $name;
    public string $email;
    public Carbon $birth_date;
}
```
Es un poco más detallado, pero básicamente hace lo mismo. Este simple objeto podría usarse así.

```
function store(CustomerRequest $request, Customer $customer)
{
    $validated = CustomerData::fromRequest($request);

    $customer->name = $validated->name;
    $customer->email = $validated->email;
    $customer->birth_date = $validated->birth_date;

    // ...
}
```
El analizador estático integrado en su IDE siempre podrá decirnos con qué datos estamos tratando.

Este patrón de envolver datos no estructurados en tipos, para que podamos usar esos datos de manera confiable, se denomina "objetos de transferencia de datos". Es el primer patrón concreto que le recomiendo que use en sus proyectos de Laravel más grandes que el promedio.

Cuando discuta este libro con sus colegas, amigos o dentro de la comunidad de Laravel, es posible que se encuentre con personas que no comparten la misma visión sobre los sistemas de tipos fuertes. De hecho, hay mucha gente que prefiere abrazar el lado dinámico/débil de PHP, y definitivamente hay algo que decir al respecto.

Sin embargo, en mi experiencia, hay más ventajas en el enfoque fuertemente tipado cuando se trabaja con un equipo de varios desarrolladores en un proyecto durante mucho tiempo. Tienes que aprovechar cada oportunidad que puedas para reducir la carga cognitiva. No desea que los desarrolladores tengan que comenzar a depurar su código cada vez que quieran saber qué hay exactamente en una variable. La información debe estar al alcance de la mano, para que los desarrolladores puedan concentrarse en lo importante: crear la aplicación.

Por supuesto, el uso de DTO tiene un precio: no solo existe la sobrecarga de definir estas clases; también necesita mapear, por ejemplo, solicitar datos en un DTO. Pero los beneficios de usar DTO definitivamente superan este costo adicional: cualquier tiempo que pierda inicialmente escribiendo este código, lo recuperará a largo plazo.

Sin embargo, la pregunta sobre la construcción de DTO a partir de datos "externos" aún necesita respuesta.

## Fábricas DTO

DTO factories

