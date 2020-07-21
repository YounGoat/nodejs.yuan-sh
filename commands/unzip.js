/**
 * 压缩成 zip 包。
 * @author jiangjing@ctrip.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	, AdmZip = require('adm-zip')
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
		// 如果目的地容器目录不存在，更否创建该目录。
		createDir: true,

		// 此参数不可设定，只是用于解释此命令的行为模式。
		keepPath: false,

		// 如果目的地路径（压缩文件）已有内容，是否抹去原有内容？
		clear: false,

		// 默认：不覆盖已有文件，并且不给出任何提示。
		overwrite: false,

		// 默认：保留原始压缩文件。
		keepSource: true

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
	if (options.clear) {
		// 删除。
		rm(targetRealpath);

		// 重建目录。
		mkdir(targetRealpath);
	}	

	// 判断系统命令是否可用。
	var syscmdAvailable = false;
	if (CORE.BASH_AVAILABLE) {
		var ret = child_process.spawnSync('unzip', [ '-h' ]);
		if (ret.status === 0) syscmdAvailable = true;
	}

	if (syscmdAvailable) {
		var cmd, cmdOptions = '';
		cmdOptions += options.overwrite ? 'o' : 'n';
		cmd = yuan.string.format('unzip -%s -d "%s" "%s"', cmdOptions, targetRealpath, sourceRealpath);
		child_process.execSync(cmd, { stdio: 'ignore' });
	}
	else {
		new AdmZip(sourceRealpath).extractAllTo(targetRealpath, options.overwrite);
		// throw [ 3, 'Bash shell unavailable, failed to invoke system command "unzip".'];
	}

	if (!options.keepSource) {
		rm(sourceRealpath);
	}
};
