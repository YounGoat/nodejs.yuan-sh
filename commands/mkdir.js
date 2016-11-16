/**
 * 创建目录（支持递归创建）。
 * @author youngoat@163.com
 */

'use strict';

var MODULE_REQUIRE
	, fs = require('fs')
	, path = require('path')
	;

module.exports = function foo(dirpath) {
	// 如果目录已经存在，则什么都不需要做。
	if (!fs.existsSync(dirpath)) {

		// 如果上一级目录不存在，则递归创建之。
		var parent = path.resolve(dirpath, '..');
		if (!fs.existsSync(parent)) foo(parent);

		// 创建目录。
		fs.mkdirSync(dirpath);
	}
};
