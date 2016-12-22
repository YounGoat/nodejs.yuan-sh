/**
 * Shell 内核函数集。
 * @author youngoat@163.com
 */

'use strict';
var MODULE_REQUIRE
	, fs = require('fs')
	, os = require('os')
	, path = require('path')
	;

var CORE = {};

CORE.expand = function(foo, bar) {
	if (bar) {
		for (var name in bar) {
			foo[name] = bar[name];
		}
	}
	return foo;
};

CORE.isDir = function(pathname) {
	var ret = false;
	if (fs.existsSync(pathname)) {
		var stats = fs.statSync(pathname);
		ret = stats.isDirectory();
	}
	return ret;
};

CORE.isRegularFile = function(pathname) {
	var ret = false;
	if (fs.existsSync(pathname)) {
		var stats = fs.lstatSync(pathname);
		ret = stats.isFile();
	}
	return ret;
};

CORE.BASH_AVAILABLE = (
	[ 'darwin', 'linux' ].indexOf(os.platform()) >= 0
);

module.exports = CORE;
