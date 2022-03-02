module.exports = {
  title: 'laravelVue(apiSpa)',
  description: 'Just playing around.',
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
        text: 'Bar',   // required
        path: '/bar/',
        collapsable: false, // optional, defaults to true        
        children: [
          { text: 'Tree', link: '/bar/tree' },
          { text: 'Four', link: '/bar/four' }
        ]
      }
    ]
  }
}

