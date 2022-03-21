module.exports = {
  title: 'laraVuel(apiSpa)',
  description: 'Just playing around.',
  base: '/', //  The default path during deployment / secondary address / base can be used/
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' }
    ],
    sidebar: [{
        text: 'Getting Started',   // required
        path: '/guide/',      // optional, link of the title, which should be an absolute path and must exist        
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Setup Laravel API', link: '/guide/setup-laravel-api' },
          { text: 'Setup Vue SPA', link: '/guide/setup-vue-spa' }
        ]
      }, {
        text: 'Laravel',   // required
        path: '/laravel/',
        collapsable: false, // optional, defaults to true        
        children: [
          { text: 'Laravel with Postman', link: '/laravel/laravel-with-postman' },
          { text: 'Four', link: '/laravel/four' }
        ]
      }, {
        text: 'Vue',   // required
        path: '/vue/',
        collapsable: false, // optional, defaults to true        
        children: [          
          { text: 'Vue', link: '/vue/tree' }
        ]
      }
    ]
  }
}

