module.exports = {
  title: 'LaraVuel-ApiSpa',
  description: 'Just playing around.',
  base: '/', //  The default path during deployment / secondary address / base can be used/
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía', link: '/guide/' },
      { text: 'GH-Laravel', link: 'https://github.com/CaribesTIC/laravel-backend' },
      { text: 'GH-Vue', link: 'https://github.com/CaribesTIC/vue-frontend-ts' }
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
          { text: 'Configurar Vue SPA', link: '/vue/setup-vue-spa' }
        ]
      }
    ]
  }
}


