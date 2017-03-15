var Uploader = require(process.cwd() + '/lib/uploader.js');
var expect = require('expect.js');

describe('Uploader', function() {
  beforeEach(function() {
    Uploader.createS3 = function() {
      return null;
    };

    this.uploader = new Uploader({
      region: 'test-region',
      bucket: 'test-bucket'
    });

    this.uploader.readFile = function() {};
    this.uploader.uploadObject = function() {};
  });


  describe('upload(params)', function() {
    it('throws an error if path parameter is missing', function() {
      var params = {
        key: 'test-key'
      };
      expect(this.uploader.upload).withArgs(params).to.throwException();
    });

    it('throws an error if key parameter is missing', function() {
      var params = {
        path: 'test-path'
      };
      expect(this.uploader.upload).withArgs(params).to.throwException();
    });

    it('passes correct parameters to uploadObject', function(done) {
      var passedParams = null;

      this.uploader.readFile = function() {
        return Promise.resolve('test-body');
      };

      this.uploader.uploadObject = function(params) {
        passedParams = params;
        return Promise.resolve('test-result');
      };

      var params = {
        path: 'test-path',
        key: 'test-key',
        acl: 'test-acl'
      };

      this.uploader.upload(params).then(function() {
        expect(passedParams).to.eql({
          Bucket: 'test-bucket',
          Key: 'test-key',
          ACL: 'test-acl',
          Body: 'test-body',
          ServerSideEncryption: 'AES256'
        });

        done();
      });
    });
  });
});
