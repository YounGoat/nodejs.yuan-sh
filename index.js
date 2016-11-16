'use strict';

var MODULE_REQUIRE
	, util = require('util')
	;

/**
 * @return {Object}   command
 * @return {Number}   command.status	   - 0 = 执行成功；>0 = 执行失败
 * @return {String}   command.errorName
 * @return {String}   command.errorMessage
 * @return {String}   command.errorStack
 *
 * e.g.
 *   command = sh(commandName, args, ...)
 */
module.exports = function(name /*, args */) {
	var command = require('./commands/' + name);

	var args = [];
	for (var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	try {
		var data = command.apply(null, args);
		return {
			status   : 0,
			response : data
		};
	} catch(ex) {
		var status = 1, name = 'Error', message, stack, error;
		if (util.isArray(ex)) {
			status  = ex[0];
			message = ex[1];
			error   = ex[1];
		}
		else if (util.isNumber(ex)) {
			status  = ex;
		}
		else if (util.isString(ex)) {
			status  = 1;
			message = ex;
			error   = ex;
		}
		else if (util.isError(ex)){
			error   = ex;
			name	= ex.name;
			message = ex.message;
			stack   = ex.stack;
		}

		return {
			status	   : status,
			error		: error,
			errorName	: name,
			errorMessage : message,
			errorStack   : stack
		}
	}
};
