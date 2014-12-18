var assert = require('assert');
var jsonValidator = require('tv4');
var validate = jsonValidator.validateMultiple;
var templates = require('../../lib/templates.json');

// Localization strings
var localeFile = require('../../locale/en_US/mobile-appmaker.json');
var localizedStrings = [];
Object.keys(localeFile).forEach(function (localizedStr) {
	localizedStrings.push(localizedStr.toLowerCase());
});

jsonValidator.addFormat('localized', function (data) {
	if(typeof data === 'string' && localizedStrings.indexOf(data.toLowerCase()) !== -1) {
		// No error
		return null;
	}

	return 'must be localized';
});

/*
 * JSON schemas
 */
// Type schemas
var stringSchema = {
	type: 'string'
};
var nonEmptyStringSchema = {
	type: 'string',
	minLength: 1
};

// Block schemas
var attributeSchema = {
	type: 'object',
	minProperties: 1,
	additionalProperties: {
		type: 'object',
		properties: {
			id: nonEmptyStringSchema,
			label: nonEmptyStringSchema,
			type: nonEmptyStringSchema,
			value: nonEmptyStringSchema
		},
		required: ['label', 'type', 'value']
	}
};
var singleBlockSchema = {
	type: 'object',
	properties: {
		id: {
			enum: ['text', 'image', 'sms', 'phone']
		},
		attributes: attributeSchema
	},
	required: ['id', 'attributes'],
	additionalProperties: false
};
var blocksSchema = {
	type: 'array',
	items: singleBlockSchema,
	uniqueItems: true
};

// Author schema
var authorSchema = {
	type: 'object',
	properties: {
		name: stringSchema,
		location: stringSchema,
		avatar: {
			type: 'string',
			pattern: '(^/images/.*)|'
		}
	},
	required: ['username', 'location', 'avatar']
};

// Template schemas
var singleTemplateSchema = {
	type: 'object',
	properties: {
		id: nonEmptyStringSchema,
		name: nonEmptyStringSchema,
		icon: {
			type: 'string',
			pattern: '^/images/.*'
		},
		iconColor: {
			type: 'string',
			pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})'
		},
		iconImage: {
			type: 'string'
		},
		author: authorSchema,
		blocks: blocksSchema
	},
	required: ['id', 'name', 'icon', 'blocks'],
	additionalProperties: false
};
var templatesSchema = {
	type: 'array',
	uniqueItems: true,
	items: singleTemplateSchema
};

// Localization schema
var localizationSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: {
				format: 'localized'
			}
		}
	}
};

// Format all the errors as a single error message
function getErrorMsg (errors) {
	var message = '';
	var prefix, error;

	for(var i = 0; i < errors.length; i++) {
		prefix = i + 1 + '. ';
		error = errors[i];
		message += prefix + error.message;
		if(error.dataPath.length) {
			message += ' (at ' + error.dataPath + ')';
		}
		message += '\n';
	}

	return message;
}

describe('Templates', function () {
	it('should confine to the valid json schema for templates', function () {
		var result = validate(templates, templatesSchema);

		assert(result.valid, 'Validation failed with the following errors: ' + getErrorMsg(result.errors));
	});

	it('should have their names localized', function () {
		var result = validate(templates, localizationSchema);

		assert(result.valid, 'Validation failed with the following errors: ' + getErrorMsg(result.errors));
	});
});
