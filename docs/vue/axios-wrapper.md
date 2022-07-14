# Envoltorio de Axios

## ¿ Por qué Axios ?

Para la mayoría de nuestras necesidades de comunicación HTTP, [Axios](https://axios-http.com/) proporciona una API fácil de usar en un paquete compacto.

En el caso de proyectos pequeños con sólo unas pocas llamadas a la API, el uso de [fetch()](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch) puede ser una buena solución. Mientras que Axios es una mejor solución para aplicaciones con muchas peticiones HTTP y para aquellas que necesitan un buen manejo de errores o intercepciones HTTP.

Si desea saber más sobre esto consulte [¿ por qué los desarrolladores de JavaScript deberían preferir Axios a Fetch ?](https://www.ma-no.org/es/programacion/javascript/por-que-los-desarrolladores-de-javascript-deberian-preferir-axios-a-fetch)

## El Envoltorio Http

Si bien es cierto que Axios es una buena elección, desacoplarlo de la aplicación es una buena práctica. Para ello contamos con un sencillo envoltorio llamado [Http](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/utils/Http/index.ts) ubicado en la carpeta [útiles](https://github.com/CaribesTIC/vue-frontend-ts/tree/main/src/utils) del proyecto.

```ts
// utils/Http/index.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import init from "./init";
import type { Init } from "./Http";
import type { Paiload } from "@/utils/Types"

export class Http {
  private service:AxiosInstance;
  constructor( init: Init ) {    
    this.defaultInit()    
    let service = axios.create({
      headers: init.customHeaders,
      params: init.customParams,
      baseURL: init.baseURL,  
      withCredentials: init.withCredentials,
    });    
    service.interceptors.response.use(init.handleSuccess, init.handleError);
    this.service = service;    
  }
  
  defaultInit () {    
    init.customHeaders = init.customHeaders !== undefined ? init.customHeaders : {}
    init.customParams = init.customParams !== undefined ? init.customParams : {}
    init.baseURL = init.baseURL !== undefined ? init.baseURL : "http://localhost"
    init.withCredentials = init.withCredentials !== undefined ? init.withCredentials : false
    init.handleSuccess = init.handleSuccess !== undefined ? init.handleSuccess : this.defaultHandleSuccess
    init.handleError = init.handleError !== undefined ? init.handleError : this.defaultHandleError
  }
  
  defaultHandleSuccess(response: AxiosResponse) { return Promise.resolve(response); }
  
  defaultHandleError(error: AxiosError) { return Promise.reject(error); }

  get(path: string) {
    return this.service.request({
      method: "GET",
      url: path,
      responseType: "json"
    });
  }

  patch(path: string, payload: Paiload) {
    return this.service.request({
      method: "PATCH",
      url: path,
      responseType: "json",
      data: payload
    });
  }

  post(path: string, payload?: Paiload) {
    return this.service.request({
      method: "POST",
      url: path,
      responseType: "json",
      data: payload
    });
  }

  put(path: string, payload : Paiload) {
    return this.service.request({
      method: "PUT",
      url: path,
      responseType: "json",
      data: payload
    });
  }

  delete(path: string) {
    return this.service.request({
      method: "DELETE",
      url: path,
      responseType: "json",
    });
  }
}

export default new Http( init );
```

En la última línea del código, observe que por defecto, es exportada una instancia de la clase Http la cual recibe el objeto `init`. Este objeto cuenta con los argumentos básicos que crean una instancia de Http para hacer peticiones a nuestra API (backend).

## Objeto `init`.

Veamos lo que conforma el objeto `init`.

```ts
// utils/Http/init.ts
import { useAuthStore } from '@/modules/Auth/stores'
import type { Init } from "./Http"
import { AxiosError } from "axios";

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
Observamos aquí, que básicamente para crear una instancia de Http que haga solicitudes a nuestra API, necesitamos proporcionarle al objeto `init` las siguientes tres propiedades:

1. `baseURL`: representa la URL base de nuestra API, la cual está declarada en nuestro [archivo de congiguración de Vite](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/vite.config.ts).
1. `withCredentials`: esta propiedad establecida en `true` asegura que tendrá el encabezado _Access-Control-Allow-Credentials_. Puedes leer más sobre esto en la [documentación de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials).
1. `handleError`: es un simple método personalizado para el manejo de errores. Note que implementa el método `useAuthStore` de nuestro [Store de Auth](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/stores/index.ts).

[Aquí](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/utils/Http/Http.ts) mostramos su declaraciones de tipado:

```ts
// @/utils/Http/Http.ts
import type { GenericObject } from "@/utils/Types"
import { AxiosResponse } from "axios";

export interface Init {  
  baseURL?: string;
  withCredentials?: boolean;
  customHeaders?: GenericObject;
  customParams?: GenericObject | URLSearchParams;  
  handleError?: ((error: any) => any) | undefined;
  handleSuccess?: (value: AxiosResponse<any, any>) =>
    AxiosResponse<any, any> | Promise<AxiosResponse<any, any>>;
}
```

Si por alguna razón no desea crear una instancia `Http` con las características contempladas en el objeto `ìnit` observe que también esta clase está exportada de manera nombrada.

```ts{3}
// utils/Http/index.ts
// omitted for brevity ...
export class Http {
// omitted for brevity ...
}
// omitted for brevity ...
```
Entonces, su código lucirá algo así:

```ts
import { Http } from "@/utils/Http";
import type { Init } from "./Http"

const myInit: Init = {
  // omitted for brevity ...
};

const h = new Http( myInit );

h.get("/api/users");
```
Aunque para la gran mayoría de las peticiones seguramente lo haremos más fácil de manera predeterminada.

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
Ya con estos conceptos claros es suficiente para poder realizar peticiones a nuestra API.

:::info
Con Http podemos cambiar de Axios a Fetch sin necesidad de modificar toda la aplicación cuando así se requiera. Incluso facilita optar por envoltorios más elaborados como [Sttp](https://superchargejs.com/docs/3.x/sttp).
:::

