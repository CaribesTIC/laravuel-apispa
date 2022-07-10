import{_ as n,c as s,o as a,d as t}from"./app.8a3924f8.js";const w='{"title":"Usando VueRouter","description":"","frontmatter":{},"headers":[{"level":2,"title":"@/router","slug":"router"}],"relativePath":"vue/using-vuerouter.md"}',o={},p=t(`<h1 id="usando-vuerouter" tabindex="-1">Usando VueRouter <a class="header-anchor" href="#usando-vuerouter" aria-hidden="true">#</a></h1><p>Una vez instanciado el enrutador, es pasado como complemento global a la aplicaci\xF3n. Puede ver m\xE1s detalles sobre complementos <a href="./../vue/vue-global-plugins.html">aqu\xED</a>.</p><h2 id="router" tabindex="-1"><code>@/router</code> <a class="header-anchor" href="#router" aria-hidden="true">#</a></h2><div class="language-ts"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span>createRouter<span class="token punctuation">,</span> createWebHistory<span class="token punctuation">,</span> RouteRecordRaw<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vue-router&#39;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> computed <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;vue&quot;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> useAuthStore <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;@/modules/Auth/stores&#39;</span>
<span class="token keyword">import</span> middlewarePipeline <span class="token keyword">from</span> <span class="token string">&quot;@/router/middlewarePipeline&quot;</span>
<span class="token keyword">import</span> AuthRoutes <span class="token keyword">from</span> <span class="token string">&quot;@/modules/Auth/routes&quot;</span>
<span class="token keyword">import</span> AuthorizationRoutes <span class="token keyword">from</span> <span class="token string">&quot;@/modules/Authorization/routes&quot;</span>
<span class="token keyword">import</span> MessageRoutes <span class="token keyword">from</span> <span class="token string">&quot;@/modules/Message/routes&quot;</span>
<span class="token keyword">import</span> ShopCart <span class="token keyword">from</span> <span class="token string">&quot;@/modules/ShopCart/routes&quot;</span>
<span class="token keyword">import</span> ThemesRoutes <span class="token keyword">from</span> <span class="token string">&quot;@/modules/Themes/routes&quot;</span>
<span class="token keyword">import</span> UserRoutes <span class="token keyword">from</span> <span class="token string">&quot;@/modules/User/routes&quot;</span>

<span class="token keyword">const</span> storeAuth <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">useAuthStore</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token keyword">const</span> routes<span class="token operator">:</span> <span class="token builtin">Array</span><span class="token operator">&lt;</span>RouteRecordRaw<span class="token operator">&gt;</span> <span class="token operator">=</span> <span class="token punctuation">[</span>
  <span class="token operator">...</span>AuthRoutes<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token operator">...</span>AuthorizationRoutes<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token operator">...</span>MessageRoutes<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token operator">...</span>ShopCart<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token operator">...</span>ThemesRoutes<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token operator">...</span>UserRoutes<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>route <span class="token operator">=&gt;</span> route<span class="token punctuation">)</span>
<span class="token punctuation">]</span>

<span class="token keyword">const</span> router <span class="token operator">=</span> <span class="token function">createRouter</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  history<span class="token operator">:</span> <span class="token function">createWebHistory</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">.</span>env<span class="token punctuation">.</span><span class="token constant">BASE_URL</span><span class="token punctuation">)</span><span class="token punctuation">,</span>  
  routes<span class="token punctuation">,</span>
  <span class="token function">scrollBehavior</span><span class="token punctuation">(</span>to<span class="token punctuation">,</span> from<span class="token punctuation">,</span> savedPosition<span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>savedPosition<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> savedPosition<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">{</span> x<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> y<span class="token operator">:</span> <span class="token number">0</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

router<span class="token punctuation">.</span><span class="token function">beforeEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span>to<span class="token punctuation">,</span> from<span class="token punctuation">,</span> next<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> middleware <span class="token operator">=</span> to<span class="token punctuation">.</span>meta<span class="token punctuation">.</span>middleware<span class="token punctuation">;</span>
  <span class="token keyword">const</span> context <span class="token operator">=</span> <span class="token punctuation">{</span> to<span class="token punctuation">,</span> from<span class="token punctuation">,</span> next<span class="token punctuation">,</span> storeAuth <span class="token punctuation">}</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>middleware<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  middleware<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token operator">...</span>context<span class="token punctuation">,</span>
    next<span class="token operator">:</span> <span class="token function">middlewarePipeline</span><span class="token punctuation">(</span>context<span class="token punctuation">,</span> middleware<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> router
</code></pre></div>`,4),e=[p];function c(u,r,l,k,i,d){return a(),s("div",null,e)}var f=n(o,[["render",c]]);export{w as __pageData,f as default};
