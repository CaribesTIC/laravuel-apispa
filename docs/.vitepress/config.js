module.exports = {
  title: 'LaraVuel-ApiSpa',
  description: 'Just playing around.',
  base: '/laravuel-apispa/', //  The default path during deployment / secondary address / base can be used/
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía', link: '/guide/' },
      { text: 'GitHub', link: 'https://github.com/CaribesTIC/laravuel-apispa' }      
    ],
    sidebar: [{
        text: 'Comenzar',   // required
        path: '/guide/',      // optional, link of the title, which should be an absolute path and must exist        
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          { text: 'Introducción', link: '/guide/introduction' }          
        ]
      }, {
        text: 'Laravel',   // required
        path: '/laravel/',
        collapsable: false, // optional, defaults to true        
        children: [
          { text: 'Configurar Laravel API', link: '/laravel/setup-laravel-api' },
          { text: 'Laravel con Postman', link: '/laravel/laravel-with-postman' },
          { text: 'Autenticación de Laravel', link: '/laravel/laravel-authentication' }
        ]
      }, {
        text: 'Vue',   // required
        path: '/vue/',
        collapsable: false, // optional, defaults to true        
        children: [          
          { text: 'Configurar Vue SPA', link: '/vue/setup-vue-spa' },
          { text: 'Complementos Globales de Vue', link: '/vue/vue-global-plugins' },
          { text: 'Envoltorio de Axios', link: '/vue/axios-wrapper' },
          { text: 'Autenticación de Vue', link: '/vue/vue-authentication' },          
          { text: 'Usando VueRouter', link: '/vue/using-vuerouter' },
          { text: 'El Middleware', link: '/vue/the-middleware' },
          { text: 'Componentes Genéricos', link: '/vue/generic-components' },
          { text: 'Auth: Vistas y Componentes', link: '/vue/auth-views-and-components' },
          { text: 'CRUD de Usuarios', link: '/vue/users-crud' }
        ]
      }
    ]
  }
}


