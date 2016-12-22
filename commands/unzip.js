/**
 * 压缩成 zip 包。
 * @author jiangjing@ctrip.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	, archiver = require('archiver')
	, yuan = require('yuan')
	;

var CORE = require('../core');
var rm = require('./rm');
var mkdir = require('./mkdir');
var cp = require('./cp');

/**
 * @param {String} source
 * @param {String} target
 */
module.exports = function(source, target, options) {
	options = CORE.expand({
		// 如果目的地容器目录（压缩文件所在目录）不存在，更否创建该目录。
		createDir: true,

		// 此参数不可设定，只是用于解释此命令的行为模式。
		keepPath: false,

		// 如果目的地路径（压缩文件）已有内容，是否抹去原有内容？
		clear: false,

		// 默认：不覆盖已有文件，并且不给出任何提示。
		overwrite: false,

		// 默认：保留原始压缩文件。
		keepSource: true,

		// 此参数只有当源路径代表目录时有效。
		// 若设为 true，则将源目录下的内容直接放到压缩包根目录下，而抛弃源目录本身。
		unshell: false

	}, options);

	// 路径规范化。
	var sourceRealpath = path.resolve(source);
	var targetRealpath = path.resolve(target);

	// 源路径不存在。
	if (!CORE.isRegularFile(sourceRealpath)) throw [ 1, 'Source path does not exist or is not a regular file: ' + sourceRealpath ];

	// 创建目的地容器。
	if (!fs.existsSync(targetRealpath)) {
		if (options.createDir) mkdir(targetRealpath);
		else throw [ 2, 'Target directory does not exist: ' + targetRealpath ];
	}

	// 目标路径已存在，且允许清场。
	if (fs.existsSync(targetRealpath)) {
		if (options.clear) rm(targetRealpath);
	}
	// 强制创建目录。
	mkdir(targetRealpath);

	if (CORE.BASH_AVAILABLE) {
		var cmd, cmdOptions = '';
		cmdOptions += options.overwrite ? 'o' : 'n';
		cmd = yuan.string.format('unzip -%s -d "%s" "%s"', cmdOptions, targetRealpath, sourceRealpath);
		child_process.execSync(cmd);
	}
	else {
		throw [ 3, 'Bash shell unavailable, failed to invoke system command "unzip".'];
	}

	if (!options.keepSource) {
		rm(sourceRealpath);
	}
};
