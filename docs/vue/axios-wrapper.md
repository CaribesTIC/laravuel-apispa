# Envoltorio de Axios

## ¿ Por qué Axios ?

Para la mayoría de nuestras necesidades de comunicación HTTP, [Axios](https://axios-http.com/) proporciona una API fácil de usar en un paquete compacto.

En el caso de proyectos pequeños con sólo unas pocas llamadas a la API, el uso de [fetch()](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch) puede ser una buena solución. Mientras que Axios es una mejor solución para aplicaciones con muchas peticiones HTTP y para aquellas que necesitan un buen manejo de errores o intercepciones HTTP.

Si desea saber más sobre esto consulte [¿ por qué los desarrolladores de JavaScript deberían preferir Axios a Fetch ?](https://www.ma-no.org/es/programacion/javascript/por-que-los-desarrolladores-de-javascript-deberian-preferir-axios-a-fetch)

## El Envoltorio Http

Si bien es cierto que Axios es una buena elección, desacoplarlo de la aplicación es una buena práctica. Para ello contamos con un sencillo envoltorio llamado [Http](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/utils/Http/index.ts).

```ts
// utils/Http/index.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import init from "./init";
// omitted for brevity ...

export class Http {
  private service:AxiosInstance;

  constructor( init: Init ) {    
    this.defaultInit()    
    let service = axios.create({
      // omitted for brevity ...
    });    
    service.interceptors.response.use(
      init.handleSuccess,
      init.handleError
    );
    this.service = service;    
  }
  
  defaultInit () {    
    // omitted for brevity ...
  }
  
  defaultHandleSuccess(response: AxiosResponse) {
    // omitted for brevity ...
  }
  
  defaultHandleError(error: AxiosError) {
    // omitted for brevity ...
  }

  get(path: string) {
    // omitted for brevity ...
  }

  patch(path: string, payload: Paiload) {
    // omitted for brevity ...
  }

  post(path: string, payload: Paiload) {
    // omitted for brevity ...
  }

  put(path: string, payload : Paiload) {
    // omitted for brevity ...
  }

  delete(path: string) {
    // omitted for brevity ...
  }
}

export default new Http( init );
```

En la última línea del código, observe que por defecto, es exportada una instancia de la clase Http la cual recibe el objeto `init`. Este objeto cuenta con los argumentos básicos que crean una instancia de Http para hacer peticiones a la correspondiente API de Laravel.

## Objeto `init`.

El archivo [src/utils/Http/init.ts](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/utils/Http/init.ts) exporta un objeto de configuración que ilustra lo siguiente.

```ts
// utils/Http/init.ts
// omitted for brevity ...

export default<Init> {
  baseURL: process.env.VUE_APP_API_URL,  
  withCredentials: true,
  handleError(error: AxiosError) {
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
Observamos aquí, que básicamente para crear una instancia de Http que haga solicitudes a la correspondiente API de Laravel, necesitamos proporcionarle al objeto `init` las siguientes tres propiedades:

1. `baseURL`: Representa la URL base de nuestra API, la cual está declarada en nuestro [archivo de congiguración de Vite](https://github.com/CaribesTIC/laravuel-spa/blob/main/vite.config.ts).
1. `withCredentials`: Esta propiedad establecida en `true` asegura que tendrá el encabezado _Access-Control-Allow-Credentials_. Se puede leer más sobre esto en la [documentación de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials).
1. `handleError`: Es un simple método personalizado para el manejo de errores. Note que implementa el método [useAuthStore](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/modules/Auth/stores/index.ts).

La declaraciones de tipado del objeto `init` está ciendo exportado desde el archivo [src/utils/Http/Http.ts](https://github.com/CaribesTIC/laravuel-spa/blob/main/src/utils/Http/Http.ts). 

Por otro lado, si por alguna razón no desea crear una instancia `Http` con las características contempladas en el objeto `ìnit` observe que también esta clase está exportada de manera nombrada.

```ts{3}
// utils/Http/index.ts
// omitted for brevity ...
export class Http {
// omitted for brevity ...
}
// omitted for brevity ...
```
Para estos casos, cuando esté implementando Http, su código lucirá algo así:

```ts
import { Http } from "@/utils/Http";
import type { Init } from "./Http"

const otherInit: Init = {
  // omitted for brevity ...
};

const h = new Http( otherInit );

h.get("/api/users");
```
Para la gran mayoría de las peticiones seguramente lo haremos de manera predeterminada.

```ts
import Http from "@/utils/Http";

Http.get("/api/users");
```

Cabe advertir, que si no se pasa ningún objeto de inicialización, el constructor igualmente siempre invocará el método 
`defaultInit()` con sus correspondientes valores predeterminados.

```ts{7,1011,12,13,14,15,16,17,18}
// utils/Http/index.ts
// omitted for brevity ...

export class Http {
  // omitted for brevity ...
  constructor( init: Init ) {    
    this.defaultInit()    
    // omitted for brevity ...
  }
  
  defaultInit () {    
    init.customHeaders = init.customHeaders !== undefined ? init.customHeaders : {}
    init.customParams = init.customParams !== undefined ? init.customParams : {}
    init.baseURL = init.baseURL !== undefined ? init.baseURL : "http://localhost"
    init.withCredentials = init.withCredentials !== undefined ? init.withCredentials : false
    init.handleSuccess = init.handleSuccess !== undefined ? init.handleSuccess : this.defaultHandleSuccess
    init.handleError = init.handleError !== undefined ? init.handleError : this.defaultHandleError
  }
  
  defaultHandleSuccess(response: AxiosResponse ) { return response; }
  
  defaultHandleError(error: AxiosError) { return error; }

  // omitted for brevity ...
}

export default new Http( init );
```
Con estos conceptos claros es suficiente para realizar peticiones exitosas a la respectiva API de Laravel.

:::info
Con Http podemos cambiar de Axios a Fetch sin necesidad de modificar toda la aplicación cuando así se requiera. Incluso facilita optar por envoltorios más elaborados como [Sttp](https://superchargejs.com/docs/3.x/sttp).
:::

