import fs from 'fs'
import path from 'path'
import request from 'request'
import gm from 'gm'
import tesseract from 'node-tesseract'

/**
 * verify captcha
 * @param {String}    src       filepath or uri
 * @param {Object}    option    option for tesseract
 * @param {Function}  convert   gm convert process, return promise
 * @return {Promise}  text
 */
export default function verify(src, option, convert) {
  return getSrc(src)
    .then(reviseImg(convert))
    .then(process(option))
    .then(reviseText)
}

/**
 * return bitmap local path through uri or filepath
 */
function getSrc(src) {
  if (String.includes(src, 'http')) {
    return download(src, 'test/tmp')
  }
  return fs.existsSync(src) ? Promise.resolve(src) : Promise.reject(src + ' not exist.')
}

/**
 * revise bitmap by gm, less noise for better recognition
 * convert bitmap to .jpg for the follow bug
 * http://superuser.com/questions/571002/unable-to-process-gifs-with-tesseract-in-osx
 */
function reviseImg(convert) {
  return function (src) {
    if (convert) {
      return convert(gm)
    }

    return new Promise(
      (resolve, reject) => {
        let output = src.replace(/(\.\w+)$/, '.gm.jpg')
        gm(src)
          .flatten()
          .threshold(21, '%')
          .write(output, err => (err ? reject(err) : resolve(output)))
      }
    )
  }
}

/**
 * verify text by tesseract
 */
function process(arg) {
  let defaultOpt = {
    // config: ['digits'],
    psm: 7
  }

  let option = Object.assign({}, defaultOpt, arg)

  return function (filepath) {
    return new Promise(
      (resolve, reject) => {
        tesseract
          .process(filepath, option, (err, txt) => {
            if (err) {
              return reject(err)
            }
            return resolve(txt)
          })
      }
    )
  }
}

/**
 * revise text, remove white space
 */
function reviseText(txt) {
  return Promise.resolve(txt.replace(' ', ''))
}

/**
 * download image binary from remote address
 */
function download(uri, filepath) {
  return new Promise(
    (resolve, reject) => {
      request.head(uri, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        let contentType = res.headers['content-type'] || 'image/jpg'
        let type = contentType.split('/')[1]
        let basename = path.basename(uri).split('.')[0] + '.' + type
        let output = path.join(filepath, basename)

        request(uri)
          .pipe(fs.createWriteStream(output))
          .on('close', e => (e ? reject(e) : resolve(output)))
      })
    }
  )
}
