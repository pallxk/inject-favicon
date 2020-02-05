const fs = require('fs')
const os = require('os')
const path = require('path')
const { promisify } = require('util')

const cheerio = require('cheerio')
const glob = promisify(require('glob'))
const imageSize = promisify(require('image-size'))

const iconGlob = exports.iconGlob = ['favicon.png', 'favicon-*.png']
const addIcon = exports.addIcon = addIconFactory(
  iconGlob,
  (file, sizes, type) => `<link rel="icon" type="image/${type}" sizes=${sizes} href="${file}">`)

/**
 * https://realfavicongenerator.net/blog/how-ios-scales-the-apple-touch-icon/
 * https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
 */
const appleTouchIconGlob = exports.appleTouchIconGlob = ['apple-touch-icon.png', 'apple-touch-icon-*.png']
const addAppleTouchIcon = exports.addAppleTouchIcon = addIconFactory(
  appleTouchIconGlob,
  (file, sizes) => `<link rel="apple-touch-icon" sizes="${sizes}" href="${file}">`)

/**
 * https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/pinnedTabs/pinnedTabs.html
 */
const maskIconGlob = exports.maskIconGlob = ['safari-pinned-tab.svg']
const addMaskIcon = exports.addMaskIcon = function (globDirectory, globPatterns, url = '/', color = '#777777') {
  return addIconFactory(
    maskIconGlob,
    file => `<link rel="mask-icon" href="${file}" color="${color}">`)(globDirectory, globPatterns, url)
}

const manifestGlob = exports.manifestGlob = ['*.manifest', '*.webmanifest', 'manifest.json']
const addManifest = exports.addManifest = addFileFactory(
  manifestGlob,
  file => `<link rel="manifest" href="${file}">`)

const addThemeColor = exports.addThemeColor = function (color = '#777777') {
  return `<meta name="theme-color" content="${color}">`
}

const addMsApplicationTileColor = exports.addMsApplicationTileColor = function (color = '#777777') {
  return `<meta name="msapplication-TileColor" content="${color}">`
}

function addFileFactory(patterns, template) {
  return async function (globDirectory = '.', globPatterns = patterns, url = '/') {
    for (const pattern of globPatterns) {
      const files = await glob(pattern, { cwd: globDirectory, absolute: true })
      for (const f of files) {
        return template(calcHref(url, globDirectory, f))
      }
    }
    return []
  }
}

function addIconFactory(patterns, template) {
  return async function (globDirectory = '.', globPatterns = patterns, url = '/') {
    const links = []

    for (const pattern of globPatterns) {
      const files = await glob(pattern, { cwd: globDirectory, absolute: true })
      for (const f of files) {
        const result = await imageSize(f)
        let sizes = ''
        if (result.images) {
          sizes = images.map(s => `${s.width}x${s.height}`).join(' ')
        } else {
          sizes = `${result.width}x${result.height}`
        }
        links.push(template(calcHref(url, globDirectory, f), sizes, result.type))
      }
    }

    return links
  }
}

function calcHref(base, from, to) {
  return path.posix.join(
    base,
    path.posix.relative(from, to)
  )
}

async function readManifest(dir, glob = manifestGlob) {
  return await addFileFactory(glob, file => {
    const manifest = JSON.parse(fs.readFileSync(file))
    return manifest
  })(dir, glob, dir)
}

async function injectFavicon(html = '', opts = {}) {
  let { searchDir: searchDir, color: color, url: url } = opts

  // Guess color from manifest if not specified explicitly
  if (!color) {
    const manifest = await readManifest(searchDir, opts.manifest)
    color = manifest.theme_color
  }

  const $ = cheerio.load(html)
  let themeColor = $('meta[name="theme-color" i]').attr('content') || opts.themeColor || color
  let tileColor = $('meta[name="msapplication-TileColor" i]').attr('content') || opts.tileColor || color
  let maskColor = $('link[rel="mask-icon" i]').attr('color') || opts.maskColor || color
  themeColor = themeColor || tileColor || maskColor
  tileColor = tileColor || themeColor || maskColor
  maskColor = maskColor || themeColor || tileColor

  const snippet = [
    themeColor ? addThemeColor(themeColor) : [],
    tileColor ? addMsApplicationTileColor(tileColor): [],
    await addIcon(searchDir, opts.icon, url),
    await addAppleTouchIcon(searchDir, opts.appleTouchIcon, url),
    await addMaskIcon(searchDir, opts.maskIcon, url, maskColor),
    await addManifest(searchDir, opts.manifest, url),
  ].flat().join(os.EOL)
  $('head').append(snippet)
  // If input html is empty, we simply output the content of <head>
  return html ? $.html() : $('head').html()
}

exports.injectFavicon = injectFavicon
