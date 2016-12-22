/**
 * 发现文件夹中的指定内容。
 * 与 fs.readdir() 的根本匹配，在于可以一次完成递归查询，深入多级子目录。
 * @author jiangjing@ctrip.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	;

var CORE = require('../core');

module.exports = function(dirname, options) {
	options = CORE.expand({
		// 默认：查找类型包括目录和普通文件
		//   d = directory
		//   f = regular file
		//   l = symbolic link
		type: 'df',

		// 默认：返回相对路径列表，而不是绝对路径。
		absolute: false,

		// 默认：不排除隐藏文件。
		noHidden: false,

		// 默认：不限制目录深度
		depth: 0

	}, options);

	var TYPES = {
		d: 'Directory',
		f: 'File',
		l: 'SymbolicLink'
	};

	// 参数规范化。

	if (!fs.existsSync(dirname)) throw [ 1, 'Source directory does not exist: ' + dirname ];
	if (!CORE.isDir(dirname)) throw [ 2, 'It is not a directory: ' + dirname ];

	var found = [];
	var find = function FOO(pathname, depth) {
		fs.readdirSync(pathname).forEach(function(name) {
			var matched = true;

			var realpath = path.join(pathname, name);
			var stat = fs.lstatSync(realpath);

			// 只有 matched 状态下，才有必要继续。
			if (matched && options.type != '*') {
				var typeMatched = false;
				for (var i = 0, fnName; i < options.type.length; i++) {
					fnName = 'is' + TYPES[options.type[i]];
					typeMatched = stat[fnName]();
					if (typeMatched) {
						break;
					}
				}
				matched = typeMatched;
			}

			if (matched && options.noHidden) {
				matched = (name.charAt(0) != '.');
			}

			if (matched) {
				found.push(realpath);
			}

			if (stat.isDirectory() && (!options.depth || options.depth > depth)) {
				FOO(realpath, depth + 1);
			}
		});
	};

	find(dirname, 1);

	if (!options.absolute) {
		var l = dirname.length + 1;
		for (var i = 0; i < found.length; i++) {
			found[i] = found[i].substr(l);
		}
	}

	return found;
};
