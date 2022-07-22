# CRUD de Usuarios

El CRUD de Usuarios es un módulo con rutas protegidas desde el [**`router`**](../vue/the-middleware.html#proteccion-de-rutas-y-mantenimiento-del-estado) de uso exclusivo del administrador. Su diseño es un excelente andamiaje para desarrollar cualquier CRUD básico.

Está conformado por dos vistas ubicadas dentro de la carpeta [**`src/modules/User/views/`**](https://github.com/CaribesTIC/vue-frontend-ts/tree/main/src/modules/User/views):

- Vista `Index.vue`
- Vista `CreateOrEdit.vue`

## Vista `Index.vue`

Esta vista [**`src/modules/User/views/Index.vue`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/views/Index.vue) es la encargada de mostrar la lista de todos los usuarios que han sido registrados en la base de datos de la API de Laravel. Si no hay usuarios registrados entonces mostrará el mensaje `Usuarios no encontrados.`

Ella importa los siguientes componentes genéricos:
- [AppBtn.vue](../vue/generic-components.html#appbtn-vue)
- [AppPageHeader.vue](../vue/generic-components.html#apppageheader-vue)
- [AppPaginationB.vue](../vue/generic-components.html#apppaginationb-vue)

Además, esta vista importa el componible personalizado [**`src/modules/User/composables/useIndex.ts`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/composables/useIndex.ts) -
Dentro de este componible se encuentra la regla de negocio, separándola de su interfaz de usuario.

Este componible importa de Vue la función [reactive](https://vuejs.org/api/reactivity-core.html#reactive) y el gancho [onMounted](https://vuejs.org/api/composition-api-lifecycle.html#onmounted). Mientras que de VueRouter importa el gancho [onBeforeRouteUpdate](https://router.vuejs.org/api/#onbeforerouteupdate). Tambíen importa los siguientes componibles genéricos:

- [useHttp](../vue/generic-composables.html#usehttp-ts)
- [useTableGrid](../vue/generic-composables.html#usetablegrid-ts)

A su vez, este componible necesita importar:
- [**`src/modules/User/services/index.ts`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/services/index.ts), con el alias `UserService`. Aquí es donde están disponibles los puntos hacia la API de Laravel para consumir los correspondientes métodos `getUsers` y `deleteUser`.

## Vista `CreateOrEdit.vue`

Esta vista [**`src/modules/User/views/CreateOrEdit.vue`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/views/CreateOrEdit.vue), como su nombre lo indica, cumple dos funciones simultaneamente: 

- Crear un registro nuevo.
- Modificar un registro existente. 

Esta vista además de importar el componente genérico [AppPageHeader.vue](../vue/generic-components.html#apppageheader-vue), tamién importa:

- [**`src/modules/User/components/FormCreateOrEdit.vue`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/components/FormCreateOrEdit.vue). Este componente personalizado encapsula el formulario para hacer más fácil la prueba de la emisión del evento `submit`.
- [**`src/modules/User/composables/useCreateOrEdit.ts `**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/composables/useCreateOrEdit.ts). Este composable personalizado mantiene la lógica de negocio separada de la interfaz del usuario.

**Cuándo Crea o cúando Edita**

En el archivo de rutas del módulo de usuarios [**`src/modules/User/routes/index.ts`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/routes/index.ts) se observa como ambas rutas (`userCreate` y `userEdit`) importan el mismo componente. 
```ts{7,16}
// omitted for brevity ...
{
    path: "/users/create",
    name: "userCreate",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/CreateOrEdit.vue")
        .then(m => m.default),
    props: true
}, {
    path: "/users/edit/:id(\\d+)",
    name: "userEdit",
    meta: { middleware: [auth, admin] },
    component: () =>
      import("@/modules/User/views/CreateOrEdit.vue")
        .then(m => m.default),
    props: true
}
// omitted for brevity ...
```

Lo que marca la gran diferencia es que sólamente se le pása el ID del usuario a la ruta `userEdit`.

```ts{6}
// omitted for brevity ...
{
    path: "/users/create",
    // omitted for brevity ...
}, {
    path: "/users/edit/:id(\\d+)",
    // omitted for brevity ...
}
// omitted for brevity ...
```

De esta forma, cuando se envía la propiedad ID se le está diciendo al la vista [**`CreateOrEdit.vue`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/views/CreateOrEdit.vue) que se editará un registro existente, de lo contrario se creará nuevo registro.

```vue{4,8,9,13,14,20}
<script setup lang="ts">
// omitted for brevity ...

const props = defineProps<{ id?: string }>()

const {
  // omitted for brevity ...
} = useCreateOrEdit(props.id)
</script>

<template>
  <div>
    <AppPageHeader>Usuarios / {{ !props.id ? "Crear" : "Editar" }}</AppPageHeader>
    <!-- omitted for brevity ... -->
    
      <FormCreateOrEdit
        class="p-5 bg-white border rounded shadow"
        @submit='submit'
        :id="props.id"
        :user='user'
        :sending='sending'
        :errors='errors'
        :roles="roles"            
      />
      
    <!-- omitted for brevity ... -->
    
  <div>
</template>
```

Lo mismo sucede en el componente [**`FormCreateOrEdit.vue`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/components/FormCreateOrEdit.vue)

```vue{5,10,11,19}
<script setup lang="ts">
// omitted for brevity

const props = defineProps<{
  id?: string
  // omitted for brevity
}>()

const emit = defineEmits<{
  (e: 'submit', user: User, userId?: string): void
}>()

const form: User = reactive(props.user)

const submit = async () => {
  emit('submit', {
    // omitted for brevity
  }, props.id)
}
</script>

<template>
  <!-- omitted for brevity -->  
</template>
```
Finalmente, la magia sucede en el componible [**`useCreateOrEdit.ts`**](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/User/composables/useCreateOrEdit.ts).

```ts{3,7,9,24,26,39,41,53,54,55,61}
// omitted for brevity

export default (userId?: string) => {
  // omitted for brevity 
  
  onMounted(async () => {
    if (userId) {
      loading.value = true
      UserService.getUser(userId)
        .then((response) => {                
          // omitted for brevity
        })
        .catch((err) => {        
          errors.value = getError(err)
        })
        .finally(() => {
          loading.value = false;
        })
    }
    // omitted for brevity
  })

  const insertUser = async (user: User) => {  
    sending.value = true
    return UserService.insertUser(user)
      .then((response) => {         
        // omitted for brevity
      })
      .catch((err) => {                
        // omitted for brevity
      })
      .finally(() => {
        sending.value = false
      })
  }

  const updateUser = async (user: User, userId: string) => {
    sending.value= true
    return UserService.updateUser(userId, user)
      .then((response) => {
        // omitted for brevity
      })
      .catch((err) => {                
        // omitted for brevity
      })
      .finally(() => {
        sending.value = false
      })
  }
  
  const submit = (user: User, userId?: string) => {  
    !userId ? insertUser(user)  : updateUser(user, userId)
  }

  return {
    // omitted for brevity

    submit    
  }

}
```

El método `submit` es quien finalmente hace la mágia, dependiendo si `userId` existe o no invocará a `updateUser(user, userId)` o a `insertUser(user)` respectivamente.
