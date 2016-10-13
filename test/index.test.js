/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */

import Chai from 'chai'
import ChaiAsPromised from 'chai-as-promised'
import verify from '../src/index'

Chai.should()
Chai.use(ChaiAsPromised)

describe('verify', function () {
  this.timeout(4e3)

  it('should work with local bitmap jpg', function () {
    return verify('test/fixtures/fjtr.jpg').should.be.fulfilled
  })

  it('should work with local bitmap gif', function () {
    return verify('test/fixtures/1ht3.gif').should.be.fulfilled
  })

  it('should work with remote bitmap', function () {
    return verify('http://poolmanual.iwsmembership.ie/images/captcha.png').should.be.fulfilled
  })

  it('should exit for bad filepath', function () {
    return verify('test/fixtures/undefined.png').should.be.rejected
  })
})
