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
