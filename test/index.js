var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')
	, fs = require('fs')
	, path = require('path')

	/* NPM */

	/* in-package */
	, CORE = require('../core')
	, ysh = require('../index')
	;

var TEMPATH = path.join(__dirname, 'tmp');

if (fs.existsSync(TEMPATH)) {
	ysh('rm', TEMPATH);
}
fs.mkdirSync(TEMPATH);

/**
 * + foo
 *   + bar
 *     . quz.md
 *   . bar.md
 * + foo.md
 */
var init = function(name) {
	var root = path.join(TEMPATH, name);

	// ./root/
	fs.mkdirSync(root);

	// ./root/foo
	fs.mkdirSync(path.join(root, 'foo'));

	// ./root/foo/bar
	fs.mkdirSync(path.join(root, 'foo', 'bar'));

	// ./root/foo/.bar
	fs.mkdirSync(path.join(root, 'foo', '.bar'));

	// ./root/foo/.bar/quz.md
	fs.writeFileSync(path.join(root, 'foo', '.bar', 'quz.md'), 'helloworld');

	// ./root/foo/bar/quz.md
	fs.writeFileSync(path.join(root, 'foo', 'bar', 'quz.md'), 'helloworld');

	// ./root/foo/bar.md
	fs.writeFileSync(path.join(root, 'foo', 'bar.md'), 'helloworld');

	// ./root/foo.md
	fs.writeFileSync(path.join(root, 'foo.md'), 'helloworld');

	return root;
};


// ---------------------------
// Start test.

describe('clear-dir', () => {
	var root = init('clear-dir');

	it('directory cleared', () => {
		var source = path.join(root, 'foo');
		ysh('clear-dir', source);

		assert(fs.existsSync(source));
		assert.equal(0, fs.readdirSync(source).length);
	});

	it('refused to clear file', () => {
		var source = path.join(root, 'foo.md');
		var ret = ysh('clear-dir', source);

		assert(ret.status);
	});
});

describe('cp - copy', () => {
	var root = init('cp');
	var source = path.join(root, 'foo');
	var target = path.join(root, 'L1', 'L2', 'L3');

	ysh('cp', source, target);
	it('new directory created', () => {
		assert(fs.existsSync(target));
	});
});

describe('extract', () => {
	var root = init('extract');

	var dirname = path.join(root, 'foo');
	var expects = fs.readdirSync(dirname);
	ysh('extract', dirname);

	it('expected items found in parent folder', () => {
		var found = 0;
		expects.forEach(function(name) {
			if (fs.existsSync(path.join(root, name))) found++;
		});
		assert(expects.length, found);
	});
});

describe('find', () => {
	var root = init('find');

	var ret = ysh('find', root);
	it('all descendant found', function() {
		assert.equal(7, ret.response.length);
	});
});

describe('mkdir - make directory', () => {
	var pathname = path.join(TEMPATH, 'mkdir', 'foo', 'bar', 'quz');
	var cmd = ysh('mkdir', pathname);

	it('new diretory created', () => {
		assert(fs.existsSync(pathname));
	});

	it('returned status 0', () => {
		assert.equal(0, cmd.status);
	});
});

describe('mv - move', () => {
	var root = init('mv');

	var source = path.join(root, 'foo');
	var target = path.join(root, 'L1', 'L2', 'L3');
	ysh('mv', source, target);

	it('new diretory created', () => {
		assert(fs.existsSync(target));
	});
});

describe('rm - remove', () => {
	var root = init('rm');

	var source = path.join(root, 'foo');
	ysh('rm', source);
	it('folder removed', () => {
		assert(!fs.existsSync(source));
	});
});

describe('zip,unzip', () => {
	var root = init('zip');

	it('compress folder with name preserved', () => {
		var source = path.join(root, 'foo');
		var target = path.join(root, 'foo.withname.zip');
		ysh('zip', source, target);

		assert(fs.existsSync(target));

		var newsource = path.join(root, 'foo.withname');
		ysh('unzip', target, newsource);

		assert(fs.existsSync(newsource));
		assert(fs.existsSync(path.join(newsource, 'foo')));
		assert(fs.existsSync(path.join(newsource, 'foo', 'bar')));
		assert(fs.existsSync(path.join(newsource, 'foo', 'bar', 'quz.md')));
		assert(fs.existsSync(path.join(newsource, 'foo', 'bar.md')));
	});

	it('compress children of folder', () => {
		var source = path.join(root, 'foo');
		var target = path.join(root, 'foo.without_name.zip');
		ysh('zip', source, target, { unshell: true });

		assert(fs.existsSync(target));

		var newsource = path.join(root, 'foo.without_name');
		ysh('unzip', target, newsource);

		assert(fs.existsSync(newsource));
		assert(fs.existsSync(path.join(newsource, 'bar')));
		assert(fs.existsSync(path.join(newsource, 'bar', 'quz.md')));
		assert(fs.existsSync(path.join(newsource, 'bar.md')));
		assert(!fs.existsSync(path.join(newsource, 'foo')));
	});
});

process.on('exit', function() {
	// ysh('rm', TEMPATH);
});
