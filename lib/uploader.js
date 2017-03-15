var AWS = require('aws-sdk');
var Options = require('@markonis/options');
var fs = require('fs');

module.exports = (function() {
  var Uploader = function(params) {
    var options = new Options(params, {
      region: process.env['AWS_REGION'],
      bucket: process.env['AWS_S3_BUCKET']
    });

    var s3 = Uploader.createS3(options);

    this.getS3 = function() {
      return s3;
    };

    this.getBucket = function() {
      return options.get('bucket');
    };
  };

  Uploader.createS3 = function(options) {
    return new AWS.S3({
      region: options.get('region'),
      sslEnabled: true
    });
  };

  Uploader.prototype.readFile = function(path) {
    return new Promise(function(resolve, reject) {
      fs.readFile(path, function(err, data) {
        if (err) {
          reject(err);
        }
        else if (data) {
          resolve(data);
        }
      });
    });
  };

  Uploader.prototype.uploadObject = function(params) {
    var s3 = this.getS3();

    return new Promise(function(resolve, reject) {
      s3.upload(params, function(err, data) {
        if (err) {
          reject(err);
        }
        else if (data) {
          resolve(data);
        }
      });
    });
  };

  Uploader.prototype.upload = function(params) {
    var self = this;

    var options = new Options(params, {
      path: null,
      key: null,
      acl: 'private'
    });

    return this.readFile(options.get('path')).then(function(buffer) {
      return self.uploadObject({
        Bucket: self.getBucket(),
        Key: options.get('key'),
        ACL: options.get('acl'),
        Body: buffer,
        ServerSideEncryption: 'AES256'
      });
    });
  };

  return Uploader;
}());
