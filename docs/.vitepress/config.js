module.exports = {
  title: 'LARAVEL - más allá de crud',
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
          { text: 'Prologo', link: '/guide/prologo' },
          { text: 'Prefacio', link: '/guide/prefacio' }          
        ]
      }, {
        text: 'LARAVEL MÁS ALLÁ DE CRUD',   // required
        path: '/laravel-mas-alla-de-crud/',
        collapsable: false, // optional, defaults to true        
        children: [
          { text: 'Laravel orientado al dominio', link: '/laravel-mas-alla-de-crud/laravel-orientado-al-dominio' },
          { text: 'Trabajar con datos', link: '/laravel-mas-alla-de-crud/trabajar-con-datos' }
        ]
      }
    ]
  }
}

