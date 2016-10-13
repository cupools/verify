/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */

import Chai from 'chai'
import ChaiAsPromised from 'chai-as-promised'
import verify from '../src/index'

Chai.should()
Chai.use(ChaiAsPromised)

describe('verify', function () {
  this.timeout(5e3)

  it('should work with local bitmap jpg', function () {
    return verify('test/fixtures/fjtr.jpg').should.become('fjtr')
  })

  it('should work with local bitmap gif', function () {
    return verify('test/fixtures/4u5t.gif').should.become('4u5t')
  })

  it('should work with remote bitmap', function () {
    return verify('https://raw.githubusercontent.com/cupools/verify/master/test/fixtures/fjtr.jpg').should.become('fjtr')
  })

  it('should exit for bad filepath', function () {
    return verify('test/fixtures/undefined.png').should.be.rejected
  })

  it('should work with custom gm convert', function () {
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

    return verify('test/fixtures/fjtr.jpg', null, convert).should.become('fjtr')
  })

  it('should work with custom tesseract option', function () {
    let option = {
      psm: 7,
      config: ['digits']
    }
    return verify('test/fixtures/8552528.png', option).should.become('8552598')
  })
})
