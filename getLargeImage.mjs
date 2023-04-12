import maxImage from './userscript.user.js'
import iconv from 'iconv-lite'
import request from 'request'

const jar = request.jar()

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
  pragma: 'no-cache',
  'cache-control': 'max-age=0',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'accept-encoding': 'gzip, deflate',
  'accept-language': 'en-US,en;q=0.9'
}

/**
 * Fix headers, remove empty values, lowercase keys
 * @param {object} headers
 */
const fixHeaders = (headers) => {
  Object.keys(headers).forEach(key => {
    if (!headers[key]) delete headers[key]
    headers[key.toLowerCase()] = headers[key]
    delete headers[key]
  })
}

export default async (smallImage) => {
  return await new Promise((resolve, reject) => {
    maxImage(smallImage, {
      fill_object: true,
      iterations: 200,
      use_cache: true,
      urlcache_time: 60 * 60,
      exclude_videos: false,
      include_pastobjs: true,
      force_page: false,
      allow_thirdparty: false,
      filter: () => true,
      do_request: options => {
        if (options.headers) fixHeaders(options.headers)

        console.log('Requesting ', options.url)
        const requestOpts = {
          method: options.method,
          uri: options.url,
          jar,
          headers,
          followRedirect: true,
          gzip: true,
          encoding: null
        }

        if (options.data) requestOpts.body = options.data

        request(requestOpts, (error, response, body) => {
          if (error) console.error(error)
          if (!response) return reject(new Error('No response'))

          let encoding = 'utf8'
          if (options.overrideMimeType) {
            const charsetMatch = options.overrideMimeType.match(/;\s*charset=([^;]*)/)
            if (charsetMatch) encoding = charsetMatch[1]
          }

          const resp = {
            readyState: 4,
            finalUrl: response.caseless.get('location') || response.request.href,
            responseText: iconv.decode(body, encoding),
            status: response.statusCode,
            statusText: response.statusMessage
          }

          options.onload(resp)
        })
      }, // Callback
      cb: result => {
        if (!result) return reject(new Error('No result'))
        if (result.length === 1 && result[0].url === smallImage) return reject(new Error('No larger image was found'))

        try {
          return resolve(result.find(v => !v.is_pagelink).url)
        } catch (e) {
          console.error(e)
          return reject(e)
        }
      }
    })
  })
}
