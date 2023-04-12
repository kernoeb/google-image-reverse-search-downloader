import maximage from './userscript.user.js'
import iconv from 'iconv-lite'
import request from 'request'

const jar = request.jar()

export default async (smallimage) => {
  return await new Promise((resolve, reject) => {
    maximage(smallimage, {
      fill_object: true,
      iterations: 200,
      use_cache: true,
      urlcache_time: 60 * 60,
      exclude_videos: false,
      include_pastobjs: true,
      force_page: false,
      allow_thirdparty: false,
      filter: function () {
        return true
      },
      do_request: function (options) {
        const headers = {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
          pragma: 'no-cache',
          'cache-control': 'max-age=0',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.9'
        }

        if (options.headers) {
          for (const header in options.headers) {
            const headername = header.toLowerCase()
            const value = options.headers[headername]
            if (value) headers[headername] = value
            else delete headers[headername]
          }
        }

        console.log('Requesting ', options.url)

        const requestopts = {
          method: options.method,
          uri: options.url,
          jar,
          headers,
          followRedirect: true,
          gzip: true,
          encoding: null
        }

        if (options.data) {
          requestopts.body = options.data
        }

        request(requestopts, function (error, response, body) {
          if (error) {
            console.error(error)
          // console.log(requestopts);
          }

          if (!response) {
            console.error('Unable to get response')
            return
          }

          let loc = response.caseless.get('location')
          if (!loc) loc = response.request.href

          let encoding = 'utf8'
          if (options.overrideMimeType) {
            const charsetmatch = options.overrideMimeType.match(/;\s*charset=([^;]*)/)
            if (charsetmatch) {
              encoding = charsetmatch[1]
            }
          }

          body = iconv.decode(body, encoding)

          const resp = {
            readyState: 4,
            finalUrl: loc,
            responseText: body,
            status: response.statusCode,
            statusText: response.statusMessage
          }

          options.onload(resp)
        })
      },
      // Callback
      cb: function (result) {
        if (!result) {
          console.log('No result')
          return reject(new Error('No result'))
        }

        if (result.length === 1 && result[0].url === smallimage) {
          console.log('No larger image was found')
          // No larger image was found
          return reject(new Error('No larger image was found'))
        }

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
