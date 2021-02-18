# vue-windicss-preprocess

> A vue loader to compile [tailwindcss](https://github.com/tailwindlabs/tailwindcss) at build time based on [windicss](https://github.com/windicss/windicss) compiler.

## Installation

```sh
npm install vue-windicss-preprocess --save-dev
```

## Configuration

### Vue

Add `vue-windicss-preprocess` to your `webpack.config.js` or `vue.config.js`.

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      // ... other rules omitted
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-windicss-preprocess',
          options: {
            config: "tailwind.config.js",  // tailwind config file path OR config object (optional)
            compile: false,                // false: interpretation mode; true: compilation mode
            globalPreflight: true,         // set preflight style is global or scoped
            globalUtility: true,           // set utility style is global or scoped
            prefix: 'windi-'               // set compilation mode style prefix
          }
        }]
      }
    ]
  },
  // plugin omitted
}
```

```js
// vue.config.js
module.exports = {
  configureWebpack: (config) => {
    config.module.rules.push({
      test: /\.vue$/,
      use: [{
        loader: 'vue-windicss-preprocess',
        options: {
          config: "tailwind.config.js",  // tailwind config file path OR config object (optional)
          compile: false,                // false: interpretation mode; true: compilation mode
          globalPreflight: true,         // set preflight style is global or scoped
          globalUtility: true,           // set utility style is global or scoped
          prefix: 'windi-'               // set compilation mode style prefix
        }
      }]
    })
  }
}
```

### Nuxt

Add `vue-windicss-preprocess` to your `nuxt.config.js`

```js
// nuxt.config.js
export default {
  // ... other configurations omitted
  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    extend(config) {
      config.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-windicss-preprocess',
        options: {
          config: "tailwind.config.js",  // tailwind config file path OR config object (optional)
          compile: false,                // false: interpretation mode; true: compilation mode
          globalPreflight: true,         // set preflight style is global or scoped
          globalUtility: true,           // set utility style is global or scoped
          prefix: 'windi-'               // set compilation mode style prefix
        }
      })
    }
  }
}
```

## Basic Usage

You can write any [tailwindcss](https://github.com/tailwindlabs/tailwindcss) classes in your `.vue` files.

```html
<template>
  <div class="py-8 px-8 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
    <img class="block mx-auto h-24 rounded-full sm:mx-0 sm:flex-shrink-0" src="/img/erin-lindford.jpg" alt="Woman's Face">
    <div class="text-center space-y-2 sm:text-left">
      <div class="space-y-0.5">
        <p class="text-lg text-black font-semibold">
          Erin Lindford
        </p>
        <p class="text-gray-500 font-medium">
          Product Engineer
        </p>
      </div>
      <button class="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">Message</button>
    </div>
  </div>
</template>

<script>
export default {}
</script>
```

### Compilation mode

This is not css-in-js, [windicss](https://github.com/windicss/windicss) only merges and compiles the tailwind classes of each line into a new class. You can try to compile (`npm run build`) and check the generated css file.

```html
<div class="windi-15wa4me">
  <img class="windi-1q7lotv" src="/img/erin-lindford.jpg" alt="Woman's Face">
  <div class="windi-7831z4">
    <div class="windi-x3f008">
      <p class="windi-2lluw6"> Erin Lindford </p>
      <p class="windi-1caa1b7"> Product Engineer </p>
    </div>
    <button class="windi-d2pog2">Message</button>
  </div>
</div>
```

```css
/* ... */
.windi-1q7lotv {
  border-radius: 9999px;
  display: block;
  height: 6rem;
  margin-left: auto;
  margin-right: auto;
}
/* ... */
@media (min-width: 640px) {
  /* ... */
  .windi-1q7lotv {
    flex-shrink: 0;
    margin-left: 0;
    margin-right: 0;
  }
/* ... */
```

### Interpretation mode

Interpretation mode will not modify your classes, it will only compile the original tailwind classes just like [tailwindcss](https://github.com/tailwindlabs/tailwindcss), but it is minimized and has native cross-browser support.

```css
/* ... */
.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
/* ... */
@media (min-width: 640px) {
  /* ... */
  .sm\:items-center {
    align-items: center;
  }
  .sm\:mx-0 {
    margin-left: 0;
    margin-right: 0;
  }
  .sm\:py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  /* ... */
}
```

## Using tailwind directives

```css
<style global>
  .testApply {
    @apply pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7;
  }

  @screen sm {
    ul {
      @apply bg-gray-100 p-2 rounded-lg;
    }
  }
</style>
```

If you are using `Vetur` vscode extension, I believe most people are using it. You will need to add `"vetur.validation.style": false` to your configuration file.

Hit `ctrl-shift-p` or `cmd-shift-p` on mac, type open settings, and select `Preferences: Open Settings (JSON)`. Add `"vetur.validation.style": false` to `settings.json` then save it.

## Features

- `tw` is an optional replacement attribute of `class`, The className in `tw` will be merged into the `class` attribute after compilation.

- Group: You can also write groups in all the attributes mentioned above, such as `class="font-meidum sm:hover:(font-bold bg-gray-200)"`. This is a native feature supported by [windicss](https://github.com/windicss/windicss).

- Unrestricted build: such as `bg-hex-1c1c1e p-3.2 p-3rem p-4px w-10/11 bg-$custom-variable ...`

- [Using tailwind directives], such as `@apply`, `@screen`, `@variants`.

- States attribute: such as `sm md lg xl xxl focus hover dark ...` after applid media rules then also will be merged into the `class` attribute. (Attributes like `sm:hover` are not available because they may be rarely used and slow down the parsing speed.)

- [Customize](https://github.com/windicss/svelte-windicss-preprocess/blob/main/docs/using-tailwind-configuration.md): support `tailwind.config.js`.

- For more details, please refer to [windicss](https://github.com/windicss/windicss).

## Resources

- [Roadmap](https://github.com/windicss/windicss/projects/1)

- [Documents](https://windicss.netlify.app/)

- [Discussions](https://github.com/windicss/windicss/discussions)

- [MIT License](https://github.com/windicss/vue-windicss-preprocess/blob/main/LICENSE)
