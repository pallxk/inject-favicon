inject-favicon
===========

[![inject-favicon @ npm](https://badgen.net/npm/v/inject-favicon)](https://www.npmjs.com/package/inject-favicon)

A CLI & helper function to inject HTML code snippet for favicons and manifest into an html file.

The following is an example of the code snippet to be inserted as the last item of `<HEAD>`.

```html
<meta name="theme-color" content="#123456">
<meta name="msapplication-TileColor" content="#123456">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#123456">
<link rel="manifest" href="/site.webmanifest">
```


## Install as CLI

```sh
npm i -g inject-favicon
```

### Usage

```
inject-favicon [-s|--search <dir>] [-u|--url <url>] [options] [ [-i|--input]
<input_file> ] [ [-o|--output] <output_file> ]

Options:
  --help              Show help                                        [boolean]
  --version           Show version number                              [boolean]
  -s, --search        Path to search for icons and manifest       [default: "."]
  -u, --url           Hosting path/URL of the icons               [default: "/"]
  -i, --input         Path to input html file            [default: "/dev/stdin"]
  -o, --output        Path to output html file          [default: "/dev/stdout"]
  --color             Default color for theme color, mask icon color and tile
                      color                                             [string]
  --theme-color       Theme color, used by Chrome and others            [string]
  --mask-color        Mask icon color used by Safari pinned tab icon    [string]
  --tile-color        Windows Start Screen pinned site tile color       [string]
  --icon              Glob for traditional favicon
                              [array] [default: ["favicon.png","favicon-*.png"]]
  --apple-touch-icon  Glob for apple touch icon
            [array] [default: ["apple-touch-icon.png","apple-touch-icon-*.png"]]
  --mask-icon         Glob for Safari mask icon
                                    [array] [default: ["safari-pinned-tab.svg"]]
  --manifest          Glob for Web App Manifest
               [array] [default: ["*.manifest","*.webmanifest","manifest.json"]]
```

### Examples

```sh
# Reads stdin and wrties stdout by default
inject-favicon -s /path/to/favicons/dir --color '#123456' < original.html > injected.html
curl -s example.com | inject-favicon -s /path/to/favicons/dir > my.html

# Specify the same file as input and output to make change in-place
inject-favicon -s /path/to/favicons/dir --color '#123456' -i path/to/my/file.html -o path/to/my/file.html

# Disable generation HTML for apple-touch-icon
inject-favicon -s /path/to/favicons/dir --color '#123456' --apple-touch-icon '' -i input.html -o output.html

# Fine tune with more options
inject-favicon \
  --search /path/to/favicons/dir \
  --url 'https://example.com' \
  --color '#123456' \
  --mask-color '#234567' \
  --tile-color '#345678' \
  --icon favicon.ico \
  --apple-touch-icon apple-touch-icon-precomposed.png \
  --apple-touch-icon 'apple-touch-icon-*-precomposed.png' \
  --manifest app.json
```


## Install as package dependency

```sh
npm i inject-favicon
```

### Usage & Examples

#### HTML string as arguments

API:

```js
const { injectFavicon } = require('inject-favicon');
injectFavicon(html, opts);
```

Code Example:

```js
const { injectFavicon } = require('inject-favicon');
const html = '<!doctype html><html><head><title>Hello World</title></head><body>Morning World</body></html>';
(async () => {
  const injectedHTML = await injectFavicon(html, {
    search: '~/favicons',
    color: '#123456',
  });
  console.log(injectedHTML);
})()
```

#### Filename as arguments

API:

```js
const injectFaviconFile = require('inject-favicon/cli');
injectFaviconFile(input, output, opts);
```

Code Example:

```js
const injectFaviconFile = require('inject-favicon/cli');

const inputFilename = 'a.html';
const outputFilename = 'b.html';
injectFaviconFile(inputFilename, outputFilename, {
  search: '~/favicons',
  color: '#123456',
});
```


## LICENSE

[MIT](LICENSE)
