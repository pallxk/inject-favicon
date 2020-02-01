#!/usr/bin/env node

const fs = require('fs')
const { injectFavicon, iconGlob, appleTouchIconGlob, maskIconGlob, manifestGlob } = require('.')

function injectFaviconFile(input, output, opts) {
  fs.readFile(input, 'utf8', async (er, html) => {
    if (er) throw er

    const outStream = fs.createWriteStream(output)
    outStream.write(await injectFavicon(html, opts))
  })
}

module.exports = injectFaviconFile

if (require.main !== module) {
  // cli.js is required as a dependency
  return
}

const argv = require('yargs')
  .scriptName('inject-favicon')
  .usage('$0 [-s|--search <dir>] [-u|--url <url>] [options] [ [-i|--input] <input_file> ] [ [-o|--output] <output_file> ]')
  .describe('s', 'Path to search for icons and manifest')
  .alias('s', 'search')
  .describe('u', 'Hosting path/URL of the icons')
  .alias('u', 'url')
  .default('u', '/')
  .default('s', '.')
  .describe('i', 'Path to input html file')
  .alias('i', 'input')
  .default('i', '/dev/stdin')
  .describe('o', 'Path to output html file')
  .alias('o', 'output')
  .default('o', '/dev/stdout')
  .describe('color', 'Default color for theme color, mask icon color and tile color')
  .string('color')
  .describe('theme-color', 'Theme color, used by Chrome and others')
  .string('theme-color')
  .describe('mask-color', 'Mask icon color used by Safari pinned tab icon')
  .string('mask-color')
  .describe('tile-color', 'Windows Start Screen pinned site tile color')
  .string('tile-color')
  .describe('icon', 'Glob for traditional favicon')
  .array('icon')
  .default('icon', iconGlob)
  .describe('apple-touch-icon', 'Glob for apple touch icon')
  .array('apple-touch-icon')
  .default('apple-touch-icon', appleTouchIconGlob)
  .describe('mask-icon', 'Glob for Safari mask icon')
  .array('mask-icon')
  .default('mask-icon', maskIconGlob)
  .describe('manifest', 'Glob for Web App Manifest')
  .array('manifest')
  .default('manifest', manifestGlob)
  .argv

if (argv._.length > 2) {
  console.error('Arguments more than needed specified')
  process.exit(1)
}

if (argv._[0]) {
  if (argv.i === '/dev/stdin') {
    argv.i = argv._[0]
  } else {
    console.error('Multiple input files specified')
    process.exit(1)
  }
}

if (argv._[1]) {
  if (argv.o === '/dev/stdout') {
    argv.o = argv._[1]
  } else {
    console.error('Multiple output files specified')
    process.exit(1)
  }
}

injectFaviconFile(argv.i, argv.o, {
  searchDir: argv.search,
  url: argv.url,
  color: argv.color,
  themeColor: argv.themeColor,
  maskColor: argv.maskColor,
  tileColor: argv.tileColor,
  icon: argv.icon,
  appleTouchIcon: argv.appleTouchIcon,
  maskIcon: argv.maskIcon,
  manifest: argv.manifest,
})
