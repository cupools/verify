'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _includes = require('babel-runtime/core-js/string/includes');

var _includes2 = _interopRequireDefault(_includes);

exports.default = verify;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _gm = require('gm');

var _gm2 = _interopRequireDefault(_gm);

var _nodeTesseract = require('node-tesseract');

var _nodeTesseract2 = _interopRequireDefault(_nodeTesseract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * verify captcha
 * @param {String}    src       filepath or uri
 * @param {Object}    option    option for tesseract
 * @param {Function}  convert   gm convert process, return promise
 * @return {Promise}  text
 */
function verify(src, option, convert) {
  return getSrc(src).then(reviseImg(convert)).then(process(option)).then(reviseText);
}

/**
 * return bitmap local path through uri or filepath
 */
function getSrc(src) {
  if ((0, _includes2.default)(src, 'http')) {
    return download(src, 'test/tmp');
  }
  return _fs2.default.existsSync(src) ? _promise2.default.resolve(src) : _promise2.default.reject(src + ' not exist.');
}

/**
 * revise bitmap by gm, less noise for better recognition
 * convert bitmap to .jpg for the follow bug
 * http://superuser.com/questions/571002/unable-to-process-gifs-with-tesseract-in-osx
 */
function reviseImg(convert) {
  return function (src) {
    if (convert) {
      return convert(src, _gm2.default);
    }

    return new _promise2.default(function (resolve, reject) {
      var output = src.replace(/(\.\w+)$/, '.gm.jpg');
      (0, _gm2.default)(src).flatten().threshold(21, '%').write(output, function (err) {
        return err ? reject(err) : resolve(output);
      });
    });
  };
}

/**
 * verify text by tesseract
 */
function process(arg) {
  var defaultOpt = {
    psm: 7
  };

  var option = (0, _assign2.default)({}, defaultOpt, arg);

  return function (filepath) {
    return new _promise2.default(function (resolve, reject) {
      _nodeTesseract2.default.process(filepath, option, function (err, txt) {
        if (err) {
          return reject(err);
        }
        return resolve(txt);
      });
    });
  };
}

/**
 * revise text, remove white space
 */
function reviseText(txt) {
  return _promise2.default.resolve(txt.replace(/\s/g, '').replace(/\\n/g, ''));
}

/**
 * download image binary from remote address
 */
function download(uri, filepath) {
  return new _promise2.default(function (resolve, reject) {
    _request2.default.head(uri, function (err, res) {
      if (err) {
        reject(err);
        return;
      }

      var contentType = res.headers['content-type'] || 'image/jpg';
      var type = contentType.split('/')[1];
      var basename = _path2.default.basename(uri).split('.')[0] + '.' + type;
      var output = _path2.default.join(filepath, basename);

      (0, _request2.default)(uri).pipe(_fs2.default.createWriteStream(output)).on('close', function (e) {
        return e ? reject(e) : resolve(output);
      });
    });
  });
}