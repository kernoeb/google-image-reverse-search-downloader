import puppeteer from 'puppeteer'
import { access, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { join } from 'node:path'
import getLargeImage from './getLargeImage.mjs'

// Feel free to add your own language here
const LANGS_TEXT = {
  fr: {
    importFile: 'importez un fichier',
    allSizes: 'Toutes les tailles'
  }
}

const LANG = 'fr'

const IMPORT_FILE_SPAN = `//span[contains(., '${LANGS_TEXT[LANG].importFile}')]`
const LINK_SELECTOR = 'a[href^="https://www.google.com/search?tbs=sbi"]'
const ALL_SIZES_SELECTOR = `//a[contains(., '${LANGS_TEXT[LANG].allSizes}')]`
const DATA_UPLOAD_PATH = "div[data-upload-path='/upload?']"

const options = {
  input: { type: 'string', short: 'i' },
  output: { type: 'string', short: 'o' },
  headless: { type: 'string', short: 'h' }
}

const { values: { input, output, headless } } = parseArgs({ options })

let headlessValue = true
if (headless === 'false') headlessValue = false

if (!input) {
  console.error('Please specify an input file')
  process.exit(1)
}

const filePath = join(input.toString())

// check if the input file exists
try {
  await access(filePath)
} catch (e) {
  console.error('Input file does not exist')
  process.exit(1)
}

if (!output) {
  console.error('Please specify an output file')
  process.exit(1)
}

const outputFilePath = join(output.toString())

console.log('Input file:', filePath)
console.log('Output file:', outputFilePath)
console.log('Headless:', headlessValue ? 'true' : 'false')

/**
 * Download an image from a given url and save it to a given path
 * @param {string} url
 * @param {string} path
 * @returns {Promise<void>}
 */
const downloadImage = async (url, path) => {
  const response = await fetch(url)
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await writeFile(path, buffer)
}

// ==========
// PUPPETEER
// ==========

const browser = await puppeteer.launch({ headless: headlessValue })
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })

await page.goto('https://www.google.com/imghp', { waitUntil: 'networkidle2' })

// validate Google cookies popup
const cookiesPopup = await page.$('#L2AGLb')
if (cookiesPopup) await cookiesPopup.click()

console.log('Page loaded, cookies accepted')

// wait for 1 second
await new Promise((resolve) => setTimeout(resolve, 1000))

// wait for the upload icon to be visible, then click on it
await page.waitForSelector(DATA_UPLOAD_PATH, { visible: true })
const uploadIcon = await page.$(DATA_UPLOAD_PATH)
await uploadIcon.click()

// wait for the span with "importez un fichier" to be visible
for (let i = 0; i < 10; i++) {
  try {
    await uploadIcon.click()
    await page.waitForXPath(IMPORT_FILE_SPAN, { visible: true, timeout: 1000 })
  } catch (e) {
  }
}

// click on the span with "importez un fichier"
const [fileImport] = await page.$x(IMPORT_FILE_SPAN)
await fileImport.click()

// upload the file
const inputUploadHandle = await page.$('input[type=file]')
await inputUploadHandle.uploadFile(filePath)

console.log('File uploaded')

// wait for "Voir la source de l'image" <a> to be visible, get the link starting with https://www.google.com/search?tbs=sbi
await page.waitForSelector(LINK_SELECTOR, { visible: true })
const link = await page.$eval(LINK_SELECTOR, (a) => a.href)
await page.goto(link)

console.log('Image source page loaded')

// wait for link containing "Toutes les tailles" to be visible, then click
await page.waitForXPath(ALL_SIZES_SELECTOR, { visible: true })
const [allSizes] = await page.$x(ALL_SIZES_SELECTOR)
await allSizes.click()

console.log('All sizes page loaded')

// wait for 1 second
await new Promise((resolve) => setTimeout(resolve, 1000))

// wait for the first image to be visible and click on it
await page.waitForSelector('h3', { visible: true })

console.log('Clicking on the first image...')

const firstImage = await page.$('h3 + a > div > img')
await firstImage.click()

await new Promise((resolve) => setTimeout(resolve, 2500))

console.log('Image clicked')

// find the image inside a link that opens in a new tab
const IMG_SELECTOR = 'div > * > div > div > div > a[target=_blank] > img'

await page.waitForFunction(`document.querySelector('${IMG_SELECTOR}').src.startsWith('http')`)

console.log('Image src found')

const images = await page.$(IMG_SELECTOR)
let src = await page.evaluate((img) => img.src, images)

console.log('Image src:', src)

try {
  src = await getLargeImage(src)
  console.log('Large image src:', src)
} catch (e) {
  console.error('Could not get large image')
}

// download the image
await downloadImage(src, outputFilePath)

console.log('Image downloaded')

// close the browser
await browser.close()
