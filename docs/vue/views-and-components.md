# Vistas y Componentes

Aquí hay un desglose de cada uno de los componentes y vistas de Vue que se utilizan para gestionar la autenticación de usuarios, el restablecimiento de contraseñas y la verificación de correo electrónico.

## Vista Home

[`src/modules/Auth/views/Home.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Home.vue)
forma parte del módulo `Auth`. Básicamente es una pantalla de bienvenida que se le brinda al usuario con la opción de elegir dos botones en el caso de que no haya iniciado sesión:

- Registro de Usuario
- Inicio de Sesión

```vue
<script setup lang="ts">
  import IconApple from "./IconApple.vue"
</script>

<template>  
  <div class="relative mt-20 lg:px-4 max-w-md mx-auto sm:px-3">
    <div class="flex justify-center pt-4 sm:justify-start sm:pt-0 w-1/2 y-1/2 h-auto m-auto">       
      <IconApple/>
    </div>      
    <div class="flex justify-center text-lg mt-10 space-x-5">      
      <AppLink 
        to="/login" 
        class="btn btn-primary"        
        data-testid="login-link"
      >
        Iniciar sesión
      </AppLink>
      <AppLink
        to="/register"
        class="btn btn-default"
        data-testid="register-link"
      >
        Registrarse
      </AppLink>      
    </div>
  </div>  
</template>
```
Como podemos observear, es muy sencillo. Sin embargo, ya tiene sus pruebas automatizadas para garantizar siempre su buen funcionamiento.

[`tests/modules/auth/views/homeMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/views/homeMountedCorrectly.spec.ts)
```ts
import { shallowMount, flushPromises } from "@vue/test-utils"
import router from "../router"
import AppLink from "@/components/AppLink.vue"
import Home from "@/modules/Auth/views/Home/Index.vue"

beforeEach(() => { window.scrollTo = vi.fn() })
afterEach(() => { vi.clearAllMocks() })

test("component must be mounted correctly", async () => {

  const wrapper = shallowMount(Home, {
    global: {
      plugins: [ router ],
      components: { AppLink }
    }
  }) 
   
  expect(wrapper.find('[data-testid="login-link"]').exists()).toBe(true)   
  expect(wrapper.find('[data-testid="register-link"]').exists()).toBe(true)
  
})
```
[`tests/modules/auth/views/homeLinksWork.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/views/homeLinksWork.ts)
```ts
// tests/modules/auth/views/homeLinksWork.spec.ts
import { mount, flushPromises } from "@vue/test-utils"
import { createPinia } from "pinia"
import router from "../router"
import AppLink from "@/components/AppLink.vue"
import Home from "@/modules/Auth/views/Home.vue"

const FlashMessage = { }

beforeEach(() => { window.scrollTo = vi.fn() })
afterEach(() => { vi.clearAllMocks() })

const factory = () => {
  return mount(Home, {
    global: {
      plugins: [createPinia(), router],
      stubs: { FlashMessage: true },
      components: { AppLink }
    }
  })
}

describe("@/modules/Auth/views/Home.vue", () => {

  it("this should go to the register page", async () => {

    const wrapper = factory()

    router.push('/')
    await router.isReady()

    await wrapper.get('[data-testid="register-link"]').trigger('click')

    await flushPromises()

    expect(global.location.pathname).toBe('/register')
    //expect(wrapper.html()).toContain('Registrarse')
  })

  it("this should go to the login page", async () => {

    const wrapper = factory()

    router.push("/")
    await router.isReady()

    await wrapper.get('[data-testid="login-link"]').trigger("click")

    await flushPromises()  

    expect(global.location.pathname).toBe("/login")
    //expect(wrapper.html()).toContain("Inicio de Sesión")

  })
})
```

## Vista de Registro

[`src/modules/Auth/views/Register.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Register.vue) permite a los usuarios registrarse para obtener una cuenta si no tienen una. Funciona con el punto final `/register` de Fortify. Solo funciona cuando un usuario no ha iniciado sesión, no puede usarlo para agregar usuarios si ha iniciado sesión. Para agregar usuarios a través de una pantalla de administración, necesitaríamos crear otro punto final de API y modificar este componente para publicarlo también. Por ahora, se mantiene simplemente para registrar nuevos usuarios. Una vez que un usuario se registra correctamente, inicia sesión automáticamente y se le redirige al panel.

```vue{2,3}
<script setup lang="ts">
  import FormRegister from "../components/FormRegister.vue"
  import { useRegister } from "../composables/useRegister"

  const { register, sending, error } = useRegister()
</script>

<template>
  <div class="p-5 m-auto w-full sm:w-4/12">
    <h2 class="mb-4 text-xl text-center">Regístrerse</h2>
    <FormRegister
      class="p-5 bg-white border rounded shadow"
      @submit='register'      
      :sending='sending'
      :error='error'
    />
    <p class="mt-2 text-center text-gray-500">
      <AppLink
        to="/login"
        class="text-gray-500 transition hover:text-gray-600"
        data-testid="login-link"
      >
        ¿Ya registrado?
      </AppLink>
    </p>
  </div>
</template>
```

Esta vista importa dos archivos:

1. [`src/modules/Auth/components/FormRegister.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/components/FormRegister.vue): Este componente encapsula el formulario para probar la emisión del evento `submit`.
  
```vue
<script setup lang="ts">
  import { ref } from "vue"  
  import AppBtn from "@/components/AppBtn.vue"
  import AppInput from "@/components/AppInput.vue"  
  import FlashMessage from "@/components/FlashMessage.vue"  
  defineProps({
    error: [Object, String],
    sending: Boolean
  })  
  const emit = defineEmits(['submit'])   
  const name = ref(null)
  const email = ref(null)
  const password = ref(null)
  const passwordConfirm = ref(null)
  const submit = async () => {
    emit('submit', {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value
    })
  }
</script>

<template>
  <form @submit.prevent="submit">  
    <AppInput
      type="text"
      label="Nombre completo"
      name="name"
      v-model="name"
      placeholder="Full name"
      class="mb-2"
      data-testid="name-input"
    />
    <AppInput
      type="email"
      label="Correo"
      name="email"
      v-model="email"
      placeholder="email@domain.ext"
      class="mb-2"
      data-testid="email-input"
    />
    <AppInput
      type="password"
      label="Clave"
      name="password"
      v-model="password"
      placeholder="Password"
      class="mb-2"
      data-testid="password-input"
    />
    <AppInput
      type="password"
      label="Confirmar clave"
      name="password-confirm"
      v-model="passwordConfirm"
      placeholder="Confirm password"
      class="mb-4"
      data-testid="confirm-password-input"
    />    
    <AppBtn
        type="submit"
        :text="sending ? 'Registrándose...' : 'Registrarse'"
        :isDisabled='sending'
        data-testid="submit-btn"
    />    
    <FlashMessage :error="error" />
  </form>
</template>
```
  
2. [`src/modules/Auth/composables/useRegister.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/composables/useRegister.ts): Este composable mantiene la lógica de negocio separada de la Interfaz del Usuario.

```ts
import { ref } from "vue"
import { useRouter } from 'vue-router';
import * as AuthService from "@/modules/Auth/services";
import { getError } from "@/utils/helpers.js";

interface UserAuthRegister{
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export function useRegister() {
  const router = useRouter();
  const error = ref(null)
  const sending = ref(false)
  
  const register = async (form: UserAuthRegister) => {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.passwordConfirm
    };
    error.value = null;
    sending.value = true;  
    AuthService.registerUser(payload)
      .then(() => router.push("/dashboard"))
      .catch((e) => error.value = getError(e))
      .finally(() => sending.value = false);
  }

  return {
    register,
    sending,
    error
  }
}
```

Y por último las respectivas pruebas asociadas a la vista de registro:

[`tests/modules/auth/views/registerMountedCorrectly.spec.ts `](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/views/registerMountedCorrectly.spec.ts)
```ts
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import router from '@/router'
import AppLink from "@/components/AppLink.vue"
import RegisterIndex from '@/modules/Auth/views/Register.vue'

beforeEach(() => { window.scrollTo = vi.fn() })
afterEach(() => { vi.clearAllMocks() })

test('component must be mounted correctly', () => {

  const wrapper = shallowMount(RegisterIndex, {
    global: {
      plugins: [createPinia(), router],
      components: { AppLink }
    }
  })
  
  //expect(wrapper.html()).toContain('Regístrerse')
  expect(wrapper.html()).toContain('form-register-stub')     
  expect(wrapper.find('[data-testid="login-link"]').exists()).toBe(true)

  const loginLink = wrapper.find('[data-testid="login-link"]')
  expect(loginLink.exists()).toBe(true)  
  expect(loginLink.html()).toContain('to="/login"') 
  
})
```

[`tests/modules/auth/services/registerFetchMock.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/services/registerFetchMock.spec.ts)
```ts
import Http from "@/utils/Http";
import {getAuthUser, registerUser} from "@/modules/Auth/services";

test("should fetch login-auth-user via http-auth-service", () => {
    const payload = [{
      name: "John Doe",
      email: "user@email.ext",
      password: "password",
      password_confirmation: "password"
    }];
    const respRegister = "";
    const respAuth = {
      id: 1,
      name: "John Doe",
      email: "user@email.ext",
      isAdmin:	false,
      role_id:	2,
      emailVerified: null      
    };
  
    Http.get = vi.fn().mockResolvedValue();
    Http.post = vi.fn().mockResolvedValue(respRegister);  
    registerUser(payload).then(
      (data) => expect(data).toEqual(respRegister)
    );

    Http.get = vi.fn().mockResolvedValue(respAuth);
    getAuthUser().then(
      (data) => expect(data).toEqual(respAuth)
    );
});
```

[`tests/modules/auth/components/formRegisterInteractingWith.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/components/formRegisterInteractingWith.spec.ts)
```ts
import { mount } from '@vue/test-utils'
import FormRegister from '@/modules/Auth/components/FormRegister.vue'

describe('ModuleAuthComponentFormRegister.vue', () => {

  it('sets the value and emits the input to its parent', async () => {
    const wrapper = mount(FormRegister)

    const inputName = wrapper.find('[data-testid="name-input"] input')
    const inputEmail = wrapper.find('[data-testid="email-input"] input')
    const inputPassword = wrapper.find('[data-testid="password-input"] input')
    const inputConfirmPassword = wrapper.find('[data-testid="confirm-password-input"] input')
    
    await inputName.setValue('John Doe')
    await inputEmail.setValue('user@email.ext')
    await inputPassword.setValue('password')
    await inputConfirmPassword.setValue('password')
    
    expect(inputName.element.value).toBe('John Doe')
    expect(inputEmail.element.value).toBe('user@email.ext')
    expect(inputPassword.element.value).toBe('password')
    expect(inputConfirmPassword.element.value).toBe('password')
  
    await wrapper.trigger('submit.prevent')

    expect(wrapper.emitted('submit')[0][0].name).toBe('John Doe')
    expect(wrapper.emitted('submit')[0][0].email).toBe('user@email.ext')
    expect(wrapper.emitted('submit')[0][0].password).toBe('password')
    expect(wrapper.emitted('submit')[0][0].passwordConfirm).toBe('password')  
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted()).toHaveProperty('submit')
  })
})
```

[`tests/modules/auth/components/formRegisterMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/components/formRegisterMountedCorrectly.spec.ts)
```ts
import { shallowMount } from '@vue/test-utils'
import FormRegister from '@/modules/Auth/components/FormRegister.vue'

const FlashMessage = {}

test('component must be mounted correctly', () => {
  const wrapper = shallowMount(FormRegister, {
    global: {
      stubs: { FlashMessage: true }
    }    
  })

  const form = wrapper.find('form')
  const submitBtn = wrapper.find('[data-testid="submit-btn"]');
  const nameInput = wrapper.find('[data-testid="name-input"]');
  const emailInput = wrapper.find('[data-testid="email-input"]');
  const passwordInput = wrapper.find('[data-testid="password-input"]');
  const confirmPasswordInput = wrapper.find('[data-testid="confirm-password-input"]');
  
  expect(form.exists()).toBe(true)     
  expect(submitBtn.exists()).toBe(true)
  expect(submitBtn.html()).toContain('type="submit"')
  expect(nameInput.exists()).toBe(true)
  expect(emailInput.exists()).toBe(true)
  expect(passwordInput.exists()).toBe(true)
  expect(confirmPasswordInput.exists()).toBe(true)  
})
```

## Vista de Inicio de Sesión

[`src/modules/Auth/views/Login.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/views/Login.vue) funciona con el punto final `/login` de Fortify. Tenga en cuenta que todos los puntos finales de autenticación se mantienen en [`src/modules/Auth/services/index.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/services/index.ts). Una vez que un usuario inicia sesión correctamente, se le redirige al panel de control.

```vue
<script setup lang="ts">  
import FormLogin from "../components/FormLogin.vue";  
import { useLogin } from '../composables/useLogin'

const { login, sending, error } = useLogin()
</script>

<template>
  <div class="p-5 m-auto w-full sm:w-4/12">
    <h2 class="mb-4 text-xl text-center">Inicio de Sesión</h2>
    <FormLogin
      class="p-5 bg-white border rounded shadow"
      @submit='login($event)'      
      :sending='sending'
      :error='error'
    />
    <p class="mt-2 text-center text-gray-500">
      <AppLink
        to="/register"
        class="text-gray-500 transition hover:text-gray-600"
        data-testid="register-link"
      >
        Regístrese para obtener una cuenta
      </AppLink><br>
      <AppLink
        to="/forgot-password"
        class="underline text-sm text-gray-600 hover:text-gray-900"
        data-testid="forgot-password-link"
      >
        ¿Olvidaste tu contraseña?
      </AppLink>
    </p>
  </div>
</template>
```

Esta vista importa dos archivos:

1. [`src/modules/Auth/components/FormLogin.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/components/FormLogin.vue): Este componente encapsula el formulario para probar la emisión del evento `submit`.

```ts
<script setup lang="ts">
import { ref } from "vue"  
import AppBtn from "@/components/AppBtn.vue"
import AppInput from '@/components/AppInput.vue'
import FlashMessage from "@/components/FlashMessage.vue"
  
defineProps({
  error: [Object, String],
  sending: Boolean
})  
const emit = defineEmits(['submit'])  
const email = ref(null)  
const password = ref(null)  
const submit = async () => {
  emit('submit', {
    email: email.value,
    password: password.value
  })
}
</script>

<template>
  <form @submit.prevent="submit">
    <AppInput
      type="email"
      label="Correo Electrónico"
      name="email"
      v-model="email"
      autocomplete="email"
      placeholder="email@domain.ext"      
      class="mb-2"
      data-testid="email-input"      
    />
    <AppInput
      type="password"
      label="Contraseña"
      name="password"
      placeholder="password"
      v-model="password"
      class="mb-4"
      data-testid="password-input"
    />    

    <div class="flex items-center justify-between mt-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50i mb-4"
          name="remember">
          <span class="ml-2 mb-3 text-sm text-gray-600">
            Recuérdame
          </span>
      </label>
      <AppBtn
        type="submit"
        :text="sending ? 'Iniciando sesión...' : 'Iniciar sesión'"
        :isDisabled='sending'
        data-testid="submit-btn"
      />
    </div>
    <FlashMessage :error='error' />
  </form>
</template>
```

2. [`src/modules/Auth/composables/useLogin.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/composables/useLogin.ts): Este composable mantiene la lógica de negocio separada de la Interfaz del Usuario.

```ts
import { ref } from "vue"
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/Auth/stores'
import { getError } from "@/utils/helpers";
import * as AuthService from "@/modules/Auth/services";
import type { FormLogin, StandaloneLogin } from '@/modules/Auth/types/Auth'

export function useLogin(): StandaloneLogin {
  const router = useRouter();
  const auth = useAuthStore()
  const error = ref(null)
  const sending = ref(false)

  const login = async (form: FormLogin) => {
    const payload = {
      email: form.email,
      password: form.password,
    }
    error.value = null;
    try {
      sending.value = true;
      await AuthService.login(payload);
      const authUser = await auth.getAuthUser();
      if (authUser) {
        auth.setGuest({ value: "isNotGuest" });
        await router.push("/dashboard");
      } else {
        const err = Error(
          "Unable to fetch user after login, check your API settings."
        );
        err.name = "Fetch User";
        throw err;
      }
    } catch (err) {
      error.value = getError(err);
    } finally {
      sending.value = false;
    }
  }

  return {
    login,
    sending,
    error
  }
}
```

Y por último las respectivas pruebas asociadas a la Inicio de Sesión:

[`tests/modules/auth/views/loginMountedCorrectly.spec.ts `](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/views/loginMountedCorrectly.spec.ts)
```ts
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import router from '@/router'
import AppLink from "@/components/AppLink.vue"
import Login from '@/modules/Auth/views/Login.vue'

beforeEach(() => { window.scrollTo = vi.fn() })
afterEach(() => { vi.clearAllMocks() })

test('component must be mounted correctly', async () => {

  const wrapper = shallowMount(Login, {
    global: {
      plugins: [createPinia(), router],
      components: { AppLink }
    }
  })
  
  expect(wrapper.html()).toContain('Inicio de Sesión')
  expect(wrapper.html()).toContain('form-login-stub')     
  expect(wrapper.find('[data-testid="register-link"]').exists()).toBe(true)

  const forgotPasswordLink = wrapper.find('[data-testid="forgot-password-link"]')
  expect(forgotPasswordLink.exists()).toBe(true)  
  expect(forgotPasswordLink.html()).toContain('to="/forgot-password"') 
  
})
```

[`tests/modules/auth/services/loginFetchMock.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/services/loginFetchMock.spec.ts)
```ts
import { test, vi, expect } from 'vitest'
import Http from '@/utils/Http';
import { getAuthUser, login } from '@/modules/Auth/services';

test('should fetch login-auth-user via http-auth-service', () => {
  const payload = [{
    email: 'user@email.ext',
    password: 'password'
  }];
  const respLogin = {
    two_factor: false
  };
  const respAuth = {
    id: 1,
    name: 'John Doe',
    email: 'user@email.ext',
    isAmin: 1
  };

  Http.get = vi.fn();
  Http.post = vi.fn().mockResolvedValue(respLogin);  
  login(payload).then(
    (data) => expect(data).toEqual(respLogin)
  );

  Http.get = vi.fn().mockResolvedValue(respAuth);
  getAuthUser().then(
    (data) => expect(data).toEqual(respAuth)
  );
});
```

[`tests/modules/auth/components/formLoginInteractingWith.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/components/formLoginInteractingWith.spec.ts)
```ts
import { mount } from '@vue/test-utils'
import FormLogin from '@/modules/Auth/components/FormLogin.vue'

describe('ModuleAuthComponentFormLogin.vue', () => {
  it('sets the value', async () => {
    const wrapper = mount(FormLogin)
  
    const input = wrapper.find('[data-testid="email-input"] input')
    await input.setValue('user@email.ext')

    expect(input.element.value).toBe('user@email.ext')
  })

  it('emits the input to its parent', async () => {
    const wrapper = mount(FormLogin)

    await wrapper.find('[data-testid="email-input"] input').setValue('user@email.ext')
    expect(wrapper.vm.email).toBe('user@email.ext')
  
    await wrapper.trigger('submit.prevent')

    expect(wrapper.emitted('submit')[0][0].email).toBe('user@email.ext')  
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted()).toHaveProperty('submit')
  })
})
```

[`tests/modules/auth/components/formLoginMountedCorrectly.spec.ts`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/tests/modules/auth/components/formLoginMountedCorrectly.spec.ts)
```ts
import { shallowMount } from '@vue/test-utils'
import FormLogin from '@/modules/Auth/components/FormLogin.vue'

const FlashMessage = {}

test('component must be mounted correctly', async () => {

  const wrapper = shallowMount(FormLogin, {
    global: {
      stubs: { FlashMessage: true }
    }    
  })

  const form = wrapper.find('form')
  const submitBtn = wrapper.find('[data-testid="submit-btn"]');
  const emailInput = wrapper.find('[data-testid="email-input"]');
  const passwordInput = wrapper.find('[data-testid="password-input"]');
  
  expect(form.exists()).toBe(true)     
  expect(submitBtn.exists()).toBe(true)
  expect(submitBtn.html()).toContain('type="submit"')
  expect(emailInput.exists()).toBe(true)
  expect(passwordInput.exists()).toBe(true)
  
})
```

## Componente de Cierre de Sesión

[`src/modules/Auth/components/Logout.vue`](https://github.com/CaribesTIC/vue-frontend-ts/blob/main/src/modules/Auth/components/Logout.vue)
Un componente simple que funciona con el punto final `/logout` de Fortify. Cuando se cierra la sesión de un usuario, se envía la acción de `authStore.logout()` que borra al usuario del `Store` y lo redirige a la vista de inicio de sesión.

```vue
<script setup lang="ts">
import { computed } from "vue"
import { useAuthStore } from '@/modules/Auth/stores'
import LogoutIcon from "@/modules/Auth/icons/LogoutIcon.vue";
const authStore = computed(() => useAuthStore())
const logout = () => authStore.value.logout()
</script>

<template>
  <button
    type="button"
    @click="logout"
    class="inline-flex items-center space-x-2"
  >
    <span class="hidden sm:inline">Logout</span>
    <LogoutIcon class="w-6 h-6 text-white" />
  </button>
</template>
```


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
