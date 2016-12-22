/**
 * 发现文件夹中的指定内容。
 * @author jiangjing@ctrip.com
 */

'use strict';

var MODULE_REQUIRE
	, crypto = require('crypto')
	, fs = require('fs')
	;

var CORE = require('../core');

module.exports = function(filename, options) {
	options = CORE.expand({
		// 默认：不加盐。
		salt: null,

		// 默认：输出十六进制编码。
		encoding: 'hex'
	}, options);

	// 参数规范化。

	if (!fs.existsSync(filename)) throw [ 1, 'File does not exist: ' + filename ];
	if (CORE.isDir(filename)) throw [ 2, 'It is a directory while a regular file expected: ' + filename ];

	var hash = crypto.createHash('md5');
	var buf = fs.readFileSync(filename);

	var salt;
	if (options.salt) {
		if (options.salt instanceof Buffer) {
			salt = options.salt;
		}
		else if (typeof options.salt == 'string') {
			salt = new Buffer(options.salt);
		}
		else {
			throw [ 3, 'options.salt SHOULD be a buffer or string (utf8-encoded)' ];
		}

		buf = Buffer.concat([ buf, salt ]);
	}

	hash.update(buf);
	return hash.digest(options.encoding);
};
