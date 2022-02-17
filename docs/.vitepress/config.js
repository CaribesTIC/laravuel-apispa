module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' }
    ],
    sidebar: [{
        text: 'Foo',   // required
        path: '/foo/',      // optional, link of the title, which should be an absolute path and must exist        
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          { text: 'One', link: '/foo/one' },
          { text: 'Two', link: '/foo/two' }
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

