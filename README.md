## verify

Easy sample to verify captcha by tesseract-ocr and gm.

## Dependences
Make sure you have the follow environment.

- [gm](https://github.com/aheckmann/gm#getting-started)
- [tesseract](https://github.com/desmondmorris/node-tesseract#installation)

## Getting Started

```bash
$ npm i git+ssh@github.com:cupools/verify.git
```

```js
import verify from 'verify'

verify('test/fixtures/fjtr.jpg')
  .then(function (txt) {
    console.log(txt)
    // => 'fjtr'
  })
  .catch(function (error) {
    console.log(error)
  })
```

![sample](docs/sample.png)

## Examples

### 1. work with local bitmap

```js
verify('test/fixtures/fjtr.jpg')
```

### 2. work with remote bitmap

```js
verify('https://raw.githubusercontent.com/cupools/verify/master/test/fixtures/fjtr.jpg')
```

### 3. work with custom gm convert

```js
let output = './test/tmp/gm-output.jpg'
let convert = function (src, gm) {
  return new Promise(
    (resolve, reject) => {
      gm(src)
        .threshold(21, '%')
        .write(
          output,
          err => (err ? reject(err) : resolve(output))
        )
    }
  )
}

verify('test/fixtures/fjtr.jpg', null, convert)
```

### 4. work with custom tesscract option
```js
let option = {
  psm: 7,
  config: ['digits']
}
verify('test/fixtures/8552528.png', option)
```

## Test

```bash
$ npm i && npm test
```
