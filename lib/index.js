(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('url'), require('http'), require('https'), require('stream'), require('assert'), require('zlib'), require('uuid')) :
  typeof define === 'function' && define.amd ? define(['exports', 'url', 'http', 'https', 'stream', 'assert', 'zlib', 'uuid'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RpsEngine = {}, global.require$$0, global.require$$1, global.require$$2, global.require$$3, global.require$$4, global.require$$8, global.uuidv4));
})(this, (function (exports, require$$0, require$$1, require$$2, require$$3, require$$4, require$$8, uuid) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
  var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
  var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
  var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
  var require$$4__default = /*#__PURE__*/_interopDefaultLegacy(require$$4);
  var require$$8__default = /*#__PURE__*/_interopDefaultLegacy(require$$8);

  var helpers$3 = {};

  var uri = require$$0__default["default"];

  var ValidationError = helpers$3.ValidationError = function ValidationError (message, instance, schema, path, name, argument) {
    if(Array.isArray(path)){
      this.path = path;
      this.property = path.reduce(function(sum, item){
        return sum + makeSuffix(item);
      }, 'instance');
    }else if(path !== undefined){
      this.property = path;
    }
    if (message) {
      this.message = message;
    }
    if (schema) {
      var id = schema.$id || schema.id;
      this.schema = id || schema;
    }
    if (instance !== undefined) {
      this.instance = instance;
    }
    this.name = name;
    this.argument = argument;
    this.stack = this.toString();
  };

  ValidationError.prototype.toString = function toString() {
    return this.property + ' ' + this.message;
  };

  var ValidatorResult$2 = helpers$3.ValidatorResult = function ValidatorResult(instance, schema, options, ctx) {
    this.instance = instance;
    this.schema = schema;
    this.options = options;
    this.path = ctx.path;
    this.propertyPath = ctx.propertyPath;
    this.errors = [];
    this.throwError = options && options.throwError;
    this.throwFirst = options && options.throwFirst;
    this.throwAll = options && options.throwAll;
    this.disableFormat = options && options.disableFormat === true;
  };

  ValidatorResult$2.prototype.addError = function addError(detail) {
    var err;
    if (typeof detail == 'string') {
      err = new ValidationError(detail, this.instance, this.schema, this.path);
    } else {
      if (!detail) throw new Error('Missing error detail');
      if (!detail.message) throw new Error('Missing error message');
      if (!detail.name) throw new Error('Missing validator type');
      err = new ValidationError(detail.message, this.instance, this.schema, this.path, detail.name, detail.argument);
    }

    this.errors.push(err);
    if (this.throwFirst) {
      throw new ValidatorResultError$1(this);
    }else if(this.throwError){
      throw err;
    }
    return err;
  };

  ValidatorResult$2.prototype.importErrors = function importErrors(res) {
    if (typeof res == 'string' || (res && res.validatorType)) {
      this.addError(res);
    } else if (res && res.errors) {
      Array.prototype.push.apply(this.errors, res.errors);
    }
  };

  function stringizer (v,i){
    return i+': '+v.toString()+'\n';
  }
  ValidatorResult$2.prototype.toString = function toString(res) {
    return this.errors.map(stringizer).join('');
  };

  Object.defineProperty(ValidatorResult$2.prototype, "valid", { get: function() {
    return !this.errors.length;
  } });

  helpers$3.ValidatorResultError = ValidatorResultError$1;
  function ValidatorResultError$1(result) {
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, ValidatorResultError$1);
    }
    this.instance = result.instance;
    this.schema = result.schema;
    this.options = result.options;
    this.errors = result.errors;
  }
  ValidatorResultError$1.prototype = new Error();
  ValidatorResultError$1.prototype.constructor = ValidatorResultError$1;
  ValidatorResultError$1.prototype.name = "Validation Error";

  /**
   * Describes a problem with a Schema which prevents validation of an instance
   * @name SchemaError
   * @constructor
   */
  var SchemaError$2 = helpers$3.SchemaError = function SchemaError (msg, schema) {
    this.message = msg;
    this.schema = schema;
    Error.call(this, msg);
    Error.captureStackTrace(this, SchemaError);
  };
  SchemaError$2.prototype = Object.create(Error.prototype,
    {
      constructor: {value: SchemaError$2, enumerable: false},
      name: {value: 'SchemaError', enumerable: false},
    });

  var SchemaContext$1 = helpers$3.SchemaContext = function SchemaContext (schema, options, path, base, schemas) {
    this.schema = schema;
    this.options = options;
    if(Array.isArray(path)){
      this.path = path;
      this.propertyPath = path.reduce(function(sum, item){
        return sum + makeSuffix(item);
      }, 'instance');
    }else {
      this.propertyPath = path;
    }
    this.base = base;
    this.schemas = schemas;
  };

  SchemaContext$1.prototype.resolve = function resolve (target) {
    return uri.resolve(this.base, target);
  };

  SchemaContext$1.prototype.makeChild = function makeChild(schema, propertyName){
    var path = (propertyName===undefined) ? this.path : this.path.concat([propertyName]);
    var id = schema.$id || schema.id;
    var base = uri.resolve(this.base, id||'');
    var ctx = new SchemaContext$1(schema, this.options, path, base, Object.create(this.schemas));
    if(id && !ctx.schemas[base]){
      ctx.schemas[base] = schema;
    }
    return ctx;
  };

  var FORMAT_REGEXPS = helpers$3.FORMAT_REGEXPS = {
    'date-time': /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])[tT ](2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])(\.\d+)?([zZ]|[+-]([0-5][0-9]):(60|[0-5][0-9]))$/,
    'date': /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])$/,
    'time': /^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/,

    'email': /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/,
    'ip-address': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'ipv6': /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,

    // TODO: A more accurate regular expression for "uri" goes:
    // [A-Za-z][+\-.0-9A-Za-z]*:((/(/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?)?)?#(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|(/(/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~])|/?%[0-9A-Fa-f]{2}|[!$&-.0-;=?-Z_a-z~])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*(#(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*)?|/(/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+(:\d*)?|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?:\d*|\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)?)?
    'uri': /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]*$/,
    'uri-reference': /^(((([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|([A-Za-z][+\-.0-9A-Za-z]*:?)?)|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|(\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?)?))#(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|(([A-Za-z][+\-.0-9A-Za-z]*)?%[0-9A-Fa-f]{2}|[!$&-.0-9;=@_~]|[A-Za-z][+\-.0-9A-Za-z]*[!$&-*,;=@_~])(%[0-9A-Fa-f]{2}|[!$&-.0-9;=@-Z_a-z~])*((([/?](%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*)?#|[/?])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*)?|([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+(:\d*)?|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?:\d*|\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)?|[A-Za-z][+\-.0-9A-Za-z]*:?)?$/,

    'color': /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/,

    // hostname regex from: http://stackoverflow.com/a/1420225/5628
    'hostname': /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/,
    'host-name': /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/,

    'alpha': /^[a-zA-Z]+$/,
    'alphanumeric': /^[a-zA-Z0-9]+$/,
    'utc-millisec': function (input) {
      return (typeof input === 'string') && parseFloat(input) === parseInt(input, 10) && !isNaN(input);
    },
    'regex': function (input) {
      var result = true;
      try {
        new RegExp(input);
      } catch (e) {
        result = false;
      }
      return result;
    },
    'style': /\s*(.+?):\s*([^;]+);?/,
    'phone': /^\+(?:[0-9] ?){6,14}[0-9]$/,
  };

  FORMAT_REGEXPS.regexp = FORMAT_REGEXPS.regex;
  FORMAT_REGEXPS.pattern = FORMAT_REGEXPS.regex;
  FORMAT_REGEXPS.ipv4 = FORMAT_REGEXPS['ip-address'];

  helpers$3.isFormat = function isFormat (input, format, validator) {
    if (typeof input === 'string' && FORMAT_REGEXPS[format] !== undefined) {
      if (FORMAT_REGEXPS[format] instanceof RegExp) {
        return FORMAT_REGEXPS[format].test(input);
      }
      if (typeof FORMAT_REGEXPS[format] === 'function') {
        return FORMAT_REGEXPS[format](input);
      }
    } else if (validator && validator.customFormats &&
        typeof validator.customFormats[format] === 'function') {
      return validator.customFormats[format](input);
    }
    return true;
  };

  var makeSuffix = helpers$3.makeSuffix = function makeSuffix (key) {
    key = key.toString();
    // This function could be capable of outputting valid a ECMAScript string, but the
    // resulting code for testing which form to use would be tens of thousands of characters long
    // That means this will use the name form for some illegal forms
    if (!key.match(/[.\s\[\]]/) && !key.match(/^[\d]/)) {
      return '.' + key;
    }
    if (key.match(/^\d+$/)) {
      return '[' + key + ']';
    }
    return '[' + JSON.stringify(key) + ']';
  };

  helpers$3.deepCompareStrict = function deepCompareStrict (a, b) {
    if (typeof a !== typeof b) {
      return false;
    }
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      return a.every(function (v, i) {
        return deepCompareStrict(a[i], b[i]);
      });
    }
    if (typeof a === 'object') {
      if (!a || !b) {
        return a === b;
      }
      var aKeys = Object.keys(a);
      var bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      return aKeys.every(function (v) {
        return deepCompareStrict(a[v], b[v]);
      });
    }
    return a === b;
  };

  function deepMerger (target, dst, e, i) {
    if (typeof e === 'object') {
      dst[i] = deepMerge(target[i], e);
    } else {
      if (target.indexOf(e) === -1) {
        dst.push(e);
      }
    }
  }

  function copyist (src, dst, key) {
    dst[key] = src[key];
  }

  function copyistWithDeepMerge (target, src, dst, key) {
    if (typeof src[key] !== 'object' || !src[key]) {
      dst[key] = src[key];
    }
    else {
      if (!target[key]) {
        dst[key] = src[key];
      } else {
        dst[key] = deepMerge(target[key], src[key]);
      }
    }
  }

  function deepMerge (target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
      target = target || [];
      dst = dst.concat(target);
      src.forEach(deepMerger.bind(null, target, dst));
    } else {
      if (target && typeof target === 'object') {
        Object.keys(target).forEach(copyist.bind(null, target, dst));
      }
      Object.keys(src).forEach(copyistWithDeepMerge.bind(null, target, src, dst));
    }

    return dst;
  }

  helpers$3.deepMerge = deepMerge;

  /**
   * Validates instance against the provided schema
   * Implements URI+JSON Pointer encoding, e.g. "%7e"="~0"=>"~", "~1"="%2f"=>"/"
   * @param o
   * @param s The path to walk o along
   * @return any
   */
  helpers$3.objectGetPath = function objectGetPath(o, s) {
    var parts = s.split('/').slice(1);
    var k;
    while (typeof (k=parts.shift()) == 'string') {
      var n = decodeURIComponent(k.replace(/~0/,'~').replace(/~1/g,'/'));
      if (!(n in o)) return;
      o = o[n];
    }
    return o;
  };

  function pathEncoder (v) {
    return '/'+encodeURIComponent(v).replace(/~/g,'%7E');
  }
  /**
   * Accept an Array of property names and return a JSON Pointer URI fragment
   * @param Array a
   * @return {String}
   */
  helpers$3.encodePath = function encodePointer(a){
    // ~ must be encoded explicitly because hacks
    // the slash is encoded by encodeURIComponent
    return a.map(pathEncoder).join('');
  };


  /**
   * Calculate the number of decimal places a number uses
   * We need this to get correct results out of multipleOf and divisibleBy
   * when either figure is has decimal places, due to IEEE-754 float issues.
   * @param number
   * @returns {number}
   */
  helpers$3.getDecimalPlaces = function getDecimalPlaces(number) {

    var decimalPlaces = 0;
    if (isNaN(number)) return decimalPlaces;

    if (typeof number !== 'number') {
      number = Number(number);
    }

    var parts = number.toString().split('e');
    if (parts.length === 2) {
      if (parts[1][0] !== '-') {
        return decimalPlaces;
      } else {
        decimalPlaces = Number(parts[1].slice(1));
      }
    }

    var decimalParts = parts[0].split('.');
    if (decimalParts.length === 2) {
      decimalPlaces += decimalParts[1].length;
    }

    return decimalPlaces;
  };

  helpers$3.isSchema = function isSchema(val){
    return (typeof val === 'object' && val) || (typeof val === 'boolean');
  };

  var helpers$2 = helpers$3;

  /** @type ValidatorResult */
  var ValidatorResult$1 = helpers$2.ValidatorResult;
  /** @type SchemaError */
  var SchemaError$1 = helpers$2.SchemaError;

  var attribute$1 = {};

  attribute$1.ignoreProperties = {
    // informative properties
    'id': true,
    'default': true,
    'description': true,
    'title': true,
    // arguments to other properties
    'additionalItems': true,
    'then': true,
    'else': true,
    // special-handled properties
    '$schema': true,
    '$ref': true,
    'extends': true,
  };

  /**
   * @name validators
   */
  var validators$2 = attribute$1.validators = {};

  /**
   * Validates whether the instance if of a certain type
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {ValidatorResult|null}
   */
  validators$2.type = function validateType (instance, schema, options, ctx) {
    // Ignore undefined instances
    if (instance === undefined) {
      return null;
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(this.testType.bind(this, instance, schema, options, ctx))) {
      var list = types.map(function (v) {
        if(!v) return;
        var id = v.$id || v.id;
        return id ? ('<' + id + '>') : (v+'');
      });
      result.addError({
        name: 'type',
        argument: list,
        message: "is not of a type(s) " + list,
      });
    }
    return result;
  };

  function testSchemaNoThrow(instance, options, ctx, callback, schema){
    var throwError = options.throwError;
    var throwAll = options.throwAll;
    options.throwError = false;
    options.throwAll = false;
    var res = this.validateSchema(instance, schema, options, ctx);
    options.throwError = throwError;
    options.throwAll = throwAll;

    if (!res.valid && callback instanceof Function) {
      callback(res);
    }
    return res.valid;
  }

  /**
   * Validates whether the instance matches some of the given schemas
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {ValidatorResult|null}
   */
  validators$2.anyOf = function validateAnyOf (instance, schema, options, ctx) {
    // Ignore undefined instances
    if (instance === undefined) {
      return null;
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var inner = new ValidatorResult$1(instance, schema, options, ctx);
    if (!Array.isArray(schema.anyOf)){
      throw new SchemaError$1("anyOf must be an array");
    }
    if (!schema.anyOf.some(
      testSchemaNoThrow.bind(
        this, instance, options, ctx, function(res){inner.importErrors(res);}
      ))) {
      var list = schema.anyOf.map(function (v, i) {
        var id = v.$id || v.id;
        if(id) return '<' + id + '>';
        return (v.title && JSON.stringify(v.title)) || (v['$ref'] && ('<' + v['$ref'] + '>')) || '[subschema '+i+']';
      });
      if (options.nestedErrors) {
        result.importErrors(inner);
      }
      result.addError({
        name: 'anyOf',
        argument: list,
        message: "is not any of " + list.join(','),
      });
    }
    return result;
  };

  /**
   * Validates whether the instance matches every given schema
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null}
   */
  validators$2.allOf = function validateAllOf (instance, schema, options, ctx) {
    // Ignore undefined instances
    if (instance === undefined) {
      return null;
    }
    if (!Array.isArray(schema.allOf)){
      throw new SchemaError$1("allOf must be an array");
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var self = this;
    schema.allOf.forEach(function(v, i){
      var valid = self.validateSchema(instance, v, options, ctx);
      if(!valid.valid){
        var id = v.$id || v.id;
        var msg = id || (v.title && JSON.stringify(v.title)) || (v['$ref'] && ('<' + v['$ref'] + '>')) || '[subschema '+i+']';
        result.addError({
          name: 'allOf',
          argument: { id: msg, length: valid.errors.length, valid: valid },
          message: 'does not match allOf schema ' + msg + ' with ' + valid.errors.length + ' error[s]:',
        });
        result.importErrors(valid);
      }
    });
    return result;
  };

  /**
   * Validates whether the instance matches exactly one of the given schemas
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null}
   */
  validators$2.oneOf = function validateOneOf (instance, schema, options, ctx) {
    // Ignore undefined instances
    if (instance === undefined) {
      return null;
    }
    if (!Array.isArray(schema.oneOf)){
      throw new SchemaError$1("oneOf must be an array");
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var inner = new ValidatorResult$1(instance, schema, options, ctx);
    var count = schema.oneOf.filter(
      testSchemaNoThrow.bind(
        this, instance, options, ctx, function(res) {inner.importErrors(res);}
      ) ).length;
    var list = schema.oneOf.map(function (v, i) {
      var id = v.$id || v.id;
      return id || (v.title && JSON.stringify(v.title)) || (v['$ref'] && ('<' + v['$ref'] + '>')) || '[subschema '+i+']';
    });
    if (count!==1) {
      if (options.nestedErrors) {
        result.importErrors(inner);
      }
      result.addError({
        name: 'oneOf',
        argument: list,
        message: "is not exactly one from " + list.join(','),
      });
    }
    return result;
  };

  /**
   * Validates "then" or "else" depending on the result of validating "if"
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null}
   */
  validators$2.if = function validateIf (instance, schema, options, ctx) {
    // Ignore undefined instances
    if (instance === undefined) return null;
    if (!helpers$2.isSchema(schema.if)) throw new Error('Expected "if" keyword to be a schema');
    var ifValid = testSchemaNoThrow.call(this, instance, options, ctx, null, schema.if);
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var res;
    if(ifValid){
      if (schema.then === undefined) return;
      if (!helpers$2.isSchema(schema.then)) throw new Error('Expected "then" keyword to be a schema');
      res = this.validateSchema(instance, schema.then, options, ctx.makeChild(schema.then));
      result.importErrors(res);
    }else {
      if (schema.else === undefined) return;
      if (!helpers$2.isSchema(schema.else)) throw new Error('Expected "else" keyword to be a schema');
      res = this.validateSchema(instance, schema.else, options, ctx.makeChild(schema.else));
      result.importErrors(res);
    }
    return result;
  };

  function getEnumerableProperty(object, key){
    // Determine if `key` shows up in `for(var key in object)`
    // First test Object.hasOwnProperty.call as an optimization: that guarantees it does
    if(Object.hasOwnProperty.call(object, key)) return object[key];
    // Test `key in object` as an optimization; false means it won't
    if(!(key in object)) return;
    while( (object = Object.getPrototypeOf(object)) ){
      if(Object.propertyIsEnumerable.call(object, key)) return object[key];
    }
  }

  /**
   * Validates propertyNames
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null|ValidatorResult}
   */
  validators$2.propertyNames = function validatePropertyNames (instance, schema, options, ctx) {
    if(!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var subschema = schema.propertyNames!==undefined ? schema.propertyNames : {};
    if(!helpers$2.isSchema(subschema)) throw new SchemaError$1('Expected "propertyNames" to be a schema (object or boolean)');

    for (var property in instance) {
      if(getEnumerableProperty(instance, property) !== undefined){
        var res = this.validateSchema(property, subschema, options, ctx.makeChild(subschema));
        result.importErrors(res);
      }
    }

    return result;
  };

  /**
   * Validates properties
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null|ValidatorResult}
   */
  validators$2.properties = function validateProperties (instance, schema, options, ctx) {
    if(!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var properties = schema.properties || {};
    for (var property in properties) {
      var subschema = properties[property];
      if(subschema===undefined){
        continue;
      }else if(subschema===null){
        throw new SchemaError$1('Unexpected null, expected schema in "properties"');
      }
      if (typeof options.preValidateProperty == 'function') {
        options.preValidateProperty(instance, property, subschema, options, ctx);
      }
      var prop = getEnumerableProperty(instance, property);
      var res = this.validateSchema(prop, subschema, options, ctx.makeChild(subschema, property));
      if(res.instance !== result.instance[property]) result.instance[property] = res.instance;
      result.importErrors(res);
    }
    return result;
  };

  /**
   * Test a specific property within in instance against the additionalProperties schema attribute
   * This ignores properties with definitions in the properties schema attribute, but no other attributes.
   * If too many more types of property-existence tests pop up they may need their own class of tests (like `type` has)
   * @private
   * @return {boolean}
   */
  function testAdditionalProperty (instance, schema, options, ctx, property, result) {
    if(!this.types.object(instance)) return;
    if (schema.properties && schema.properties[property] !== undefined) {
      return;
    }
    if (schema.additionalProperties === false) {
      result.addError({
        name: 'additionalProperties',
        argument: property,
        message: "is not allowed to have the additional property " + JSON.stringify(property),
      });
    } else {
      var additionalProperties = schema.additionalProperties || {};

      if (typeof options.preValidateProperty == 'function') {
        options.preValidateProperty(instance, property, additionalProperties, options, ctx);
      }

      var res = this.validateSchema(instance[property], additionalProperties, options, ctx.makeChild(additionalProperties, property));
      if(res.instance !== result.instance[property]) result.instance[property] = res.instance;
      result.importErrors(res);
    }
  }

  /**
   * Validates patternProperties
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null|ValidatorResult}
   */
  validators$2.patternProperties = function validatePatternProperties (instance, schema, options, ctx) {
    if(!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var patternProperties = schema.patternProperties || {};

    for (var property in instance) {
      var test = true;
      for (var pattern in patternProperties) {
        var subschema = patternProperties[pattern];
        if(subschema===undefined){
          continue;
        }else if(subschema===null){
          throw new SchemaError$1('Unexpected null, expected schema in "patternProperties"');
        }
        try {
          var regexp = new RegExp(pattern, 'u');
        } catch(_e) {
          // In the event the stricter handling causes an error, fall back on the forgiving handling
          // DEPRECATED
          regexp = new RegExp(pattern);
        }
        if (!regexp.test(property)) {
          continue;
        }
        test = false;

        if (typeof options.preValidateProperty == 'function') {
          options.preValidateProperty(instance, property, subschema, options, ctx);
        }

        var res = this.validateSchema(instance[property], subschema, options, ctx.makeChild(subschema, property));
        if(res.instance !== result.instance[property]) result.instance[property] = res.instance;
        result.importErrors(res);
      }
      if (test) {
        testAdditionalProperty.call(this, instance, schema, options, ctx, property, result);
      }
    }

    return result;
  };

  /**
   * Validates additionalProperties
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null|ValidatorResult}
   */
  validators$2.additionalProperties = function validateAdditionalProperties (instance, schema, options, ctx) {
    if(!this.types.object(instance)) return;
    // if patternProperties is defined then we'll test when that one is called instead
    if (schema.patternProperties) {
      return null;
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    for (var property in instance) {
      testAdditionalProperty.call(this, instance, schema, options, ctx, property, result);
    }
    return result;
  };

  /**
   * Validates whether the instance value is at least of a certain length, when the instance value is a string.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.minProperties = function validateMinProperties (instance, schema, options, ctx) {
    if (!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var keys = Object.keys(instance);
    if (!(keys.length >= schema.minProperties)) {
      result.addError({
        name: 'minProperties',
        argument: schema.minProperties,
        message: "does not meet minimum property length of " + schema.minProperties,
      });
    }
    return result;
  };

  /**
   * Validates whether the instance value is at most of a certain length, when the instance value is a string.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.maxProperties = function validateMaxProperties (instance, schema, options, ctx) {
    if (!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var keys = Object.keys(instance);
    if (!(keys.length <= schema.maxProperties)) {
      result.addError({
        name: 'maxProperties',
        argument: schema.maxProperties,
        message: "does not meet maximum property length of " + schema.maxProperties,
      });
    }
    return result;
  };

  /**
   * Validates items when instance is an array
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {String|null|ValidatorResult}
   */
  validators$2.items = function validateItems (instance, schema, options, ctx) {
    var self = this;
    if (!this.types.array(instance)) return;
    if (!schema.items) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    instance.every(function (value, i) {
      var items = Array.isArray(schema.items) ? (schema.items[i] || schema.additionalItems) : schema.items;
      if (items === undefined) {
        return true;
      }
      if (items === false) {
        result.addError({
          name: 'items',
          message: "additionalItems not permitted",
        });
        return false;
      }
      var res = self.validateSchema(value, items, options, ctx.makeChild(items, i));
      if(res.instance !== result.instance[i]) result.instance[i] = res.instance;
      result.importErrors(res);
      return true;
    });
    return result;
  };

  /**
   * Validates minimum and exclusiveMinimum when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.minimum = function validateMinimum (instance, schema, options, ctx) {
    if (!this.types.number(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (schema.exclusiveMinimum && schema.exclusiveMinimum === true) {
      if(!(instance > schema.minimum)){
        result.addError({
          name: 'minimum',
          argument: schema.minimum,
          message: "must be greater than " + schema.minimum,
        });
      }
    } else {
      if(!(instance >= schema.minimum)){
        result.addError({
          name: 'minimum',
          argument: schema.minimum,
          message: "must be greater than or equal to " + schema.minimum,
        });
      }
    }
    return result;
  };

  /**
   * Validates maximum and exclusiveMaximum when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.maximum = function validateMaximum (instance, schema, options, ctx) {
    if (!this.types.number(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (schema.exclusiveMaximum && schema.exclusiveMaximum === true) {
      if(!(instance < schema.maximum)){
        result.addError({
          name: 'maximum',
          argument: schema.maximum,
          message: "must be less than " + schema.maximum,
        });
      }
    } else {
      if(!(instance <= schema.maximum)){
        result.addError({
          name: 'maximum',
          argument: schema.maximum,
          message: "must be less than or equal to " + schema.maximum,
        });
      }
    }
    return result;
  };

  /**
   * Validates the number form of exclusiveMinimum when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.exclusiveMinimum = function validateExclusiveMinimum (instance, schema, options, ctx) {
    // Support the boolean form of exclusiveMinimum, which is handled by the "minimum" keyword.
    if(typeof schema.exclusiveMaximum === 'boolean') return;
    if (!this.types.number(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var valid = instance > schema.exclusiveMinimum;
    if (!valid) {
      result.addError({
        name: 'exclusiveMinimum',
        argument: schema.exclusiveMinimum,
        message: "must be strictly greater than " + schema.exclusiveMinimum,
      });
    }
    return result;
  };

  /**
   * Validates the number form of exclusiveMaximum when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.exclusiveMaximum = function validateExclusiveMaximum (instance, schema, options, ctx) {
    // Support the boolean form of exclusiveMaximum, which is handled by the "maximum" keyword.
    if(typeof schema.exclusiveMaximum === 'boolean') return;
    if (!this.types.number(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var valid = instance < schema.exclusiveMaximum;
    if (!valid) {
      result.addError({
        name: 'exclusiveMaximum',
        argument: schema.exclusiveMaximum,
        message: "must be strictly less than " + schema.exclusiveMaximum,
      });
    }
    return result;
  };

  /**
   * Perform validation for multipleOf and divisibleBy, which are essentially the same.
   * @param instance
   * @param schema
   * @param validationType
   * @param errorMessage
   * @returns {String|null}
   */
  var validateMultipleOfOrDivisbleBy = function validateMultipleOfOrDivisbleBy (instance, schema, options, ctx, validationType, errorMessage) {
    if (!this.types.number(instance)) return;

    var validationArgument = schema[validationType];
    if (validationArgument == 0) {
      throw new SchemaError$1(validationType + " cannot be zero");
    }

    var result = new ValidatorResult$1(instance, schema, options, ctx);

    var instanceDecimals = helpers$2.getDecimalPlaces(instance);
    var divisorDecimals = helpers$2.getDecimalPlaces(validationArgument);

    var maxDecimals = Math.max(instanceDecimals , divisorDecimals);
    var multiplier = Math.pow(10, maxDecimals);

    if (Math.round(instance * multiplier) % Math.round(validationArgument * multiplier) !== 0) {
      result.addError({
        name: validationType,
        argument:  validationArgument,
        message: errorMessage + JSON.stringify(validationArgument),
      });
    }

    return result;
  };

  /**
   * Validates divisibleBy when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.multipleOf = function validateMultipleOf (instance, schema, options, ctx) {
    return validateMultipleOfOrDivisbleBy.call(this, instance, schema, options, ctx, "multipleOf", "is not a multiple of (divisible by) ");
  };

  /**
   * Validates multipleOf when the type of the instance value is a number.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.divisibleBy = function validateDivisibleBy (instance, schema, options, ctx) {
    return validateMultipleOfOrDivisbleBy.call(this, instance, schema, options, ctx, "divisibleBy", "is not divisible by (multiple of) ");
  };

  /**
   * Validates whether the instance value is present.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.required = function validateRequired (instance, schema, options, ctx) {
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (instance === undefined && schema.required === true) {
      // A boolean form is implemented for reverse-compatibility with schemas written against older drafts
      result.addError({
        name: 'required',
        message: "is required",
      });
    } else if (this.types.object(instance) && Array.isArray(schema.required)) {
      schema.required.forEach(function(n){
        if(getEnumerableProperty(instance, n)===undefined){
          result.addError({
            name: 'required',
            argument: n,
            message: "requires property " + JSON.stringify(n),
          });
        }
      });
    }
    return result;
  };

  /**
   * Validates whether the instance value matches the regular expression, when the instance value is a string.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.pattern = function validatePattern (instance, schema, options, ctx) {
    if (!this.types.string(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var pattern = schema.pattern;
    try {
      var regexp = new RegExp(pattern, 'u');
    } catch(_e) {
      // In the event the stricter handling causes an error, fall back on the forgiving handling
      // DEPRECATED
      regexp = new RegExp(pattern);
    }
    if (!instance.match(regexp)) {
      result.addError({
        name: 'pattern',
        argument: schema.pattern,
        message: "does not match pattern " + JSON.stringify(schema.pattern.toString()),
      });
    }
    return result;
  };

  /**
   * Validates whether the instance value is of a certain defined format or a custom
   * format.
   * The following formats are supported for string types:
   *   - date-time
   *   - date
   *   - time
   *   - ip-address
   *   - ipv6
   *   - uri
   *   - color
   *   - host-name
   *   - alpha
   *   - alpha-numeric
   *   - utc-millisec
   * @param instance
   * @param schema
   * @param [options]
   * @param [ctx]
   * @return {String|null}
   */
  validators$2.format = function validateFormat (instance, schema, options, ctx) {
    if (instance===undefined) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!result.disableFormat && !helpers$2.isFormat(instance, schema.format, this)) {
      result.addError({
        name: 'format',
        argument: schema.format,
        message: "does not conform to the " + JSON.stringify(schema.format) + " format",
      });
    }
    return result;
  };

  /**
   * Validates whether the instance value is at least of a certain length, when the instance value is a string.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.minLength = function validateMinLength (instance, schema, options, ctx) {
    if (!this.types.string(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var hsp = instance.match(/[\uDC00-\uDFFF]/g);
    var length = instance.length - (hsp ? hsp.length : 0);
    if (!(length >= schema.minLength)) {
      result.addError({
        name: 'minLength',
        argument: schema.minLength,
        message: "does not meet minimum length of " + schema.minLength,
      });
    }
    return result;
  };

  /**
   * Validates whether the instance value is at most of a certain length, when the instance value is a string.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.maxLength = function validateMaxLength (instance, schema, options, ctx) {
    if (!this.types.string(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    // TODO if this was already computed in "minLength", use that value instead of re-computing
    var hsp = instance.match(/[\uDC00-\uDFFF]/g);
    var length = instance.length - (hsp ? hsp.length : 0);
    if (!(length <= schema.maxLength)) {
      result.addError({
        name: 'maxLength',
        argument: schema.maxLength,
        message: "does not meet maximum length of " + schema.maxLength,
      });
    }
    return result;
  };

  /**
   * Validates whether instance contains at least a minimum number of items, when the instance is an Array.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.minItems = function validateMinItems (instance, schema, options, ctx) {
    if (!this.types.array(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!(instance.length >= schema.minItems)) {
      result.addError({
        name: 'minItems',
        argument: schema.minItems,
        message: "does not meet minimum length of " + schema.minItems,
      });
    }
    return result;
  };

  /**
   * Validates whether instance contains no more than a maximum number of items, when the instance is an Array.
   * @param instance
   * @param schema
   * @return {String|null}
   */
  validators$2.maxItems = function validateMaxItems (instance, schema, options, ctx) {
    if (!this.types.array(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!(instance.length <= schema.maxItems)) {
      result.addError({
        name: 'maxItems',
        argument: schema.maxItems,
        message: "does not meet maximum length of " + schema.maxItems,
      });
    }
    return result;
  };

  /**
   * Deep compares arrays for duplicates
   * @param v
   * @param i
   * @param a
   * @private
   * @return {boolean}
   */
  function testArrays (v, i, a) {
    var j, len = a.length;
    for (j = i + 1, len; j < len; j++) {
      if (helpers$2.deepCompareStrict(v, a[j])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validates whether there are no duplicates, when the instance is an Array.
   * @param instance
   * @return {String|null}
   */
  validators$2.uniqueItems = function validateUniqueItems (instance, schema, options, ctx) {
    if (schema.uniqueItems!==true) return;
    if (!this.types.array(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!instance.every(testArrays)) {
      result.addError({
        name: 'uniqueItems',
        message: "contains duplicate item",
      });
    }
    return result;
  };

  /**
   * Validate for the presence of dependency properties, if the instance is an object.
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {null|ValidatorResult}
   */
  validators$2.dependencies = function validateDependencies (instance, schema, options, ctx) {
    if (!this.types.object(instance)) return;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    for (var property in schema.dependencies) {
      if (instance[property] === undefined) {
        continue;
      }
      var dep = schema.dependencies[property];
      var childContext = ctx.makeChild(dep, property);
      if (typeof dep == 'string') {
        dep = [dep];
      }
      if (Array.isArray(dep)) {
        dep.forEach(function (prop) {
          if (instance[prop] === undefined) {
            result.addError({
              // FIXME there's two different "dependencies" errors here with slightly different outputs
              // Can we make these the same? Or should we create different error types?
              name: 'dependencies',
              argument: childContext.propertyPath,
              message: "property " + prop + " not found, required by " + childContext.propertyPath,
            });
          }
        });
      } else {
        var res = this.validateSchema(instance, dep, options, childContext);
        if(result.instance !== res.instance) result.instance = res.instance;
        if (res && res.errors.length) {
          result.addError({
            name: 'dependencies',
            argument: childContext.propertyPath,
            message: "does not meet dependency required by " + childContext.propertyPath,
          });
          result.importErrors(res);
        }
      }
    }
    return result;
  };

  /**
   * Validates whether the instance value is one of the enumerated values.
   *
   * @param instance
   * @param schema
   * @return {ValidatorResult|null}
   */
  validators$2['enum'] = function validateEnum (instance, schema, options, ctx) {
    if (instance === undefined) {
      return null;
    }
    if (!Array.isArray(schema['enum'])) {
      throw new SchemaError$1("enum expects an array", schema);
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!schema['enum'].some(helpers$2.deepCompareStrict.bind(null, instance))) {
      result.addError({
        name: 'enum',
        argument: schema['enum'],
        message: "is not one of enum values: " + schema['enum'].map(String).join(','),
      });
    }
    return result;
  };

  /**
   * Validates whether the instance exactly matches a given value
   *
   * @param instance
   * @param schema
   * @return {ValidatorResult|null}
   */
  validators$2['const'] = function validateEnum (instance, schema, options, ctx) {
    if (instance === undefined) {
      return null;
    }
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    if (!helpers$2.deepCompareStrict(schema['const'], instance)) {
      result.addError({
        name: 'const',
        argument: schema['const'],
        message: "does not exactly match expected constant: " + schema['const'],
      });
    }
    return result;
  };

  /**
   * Validates whether the instance if of a prohibited type.
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @return {null|ValidatorResult}
   */
  validators$2.not = validators$2.disallow = function validateNot (instance, schema, options, ctx) {
    var self = this;
    if(instance===undefined) return null;
    var result = new ValidatorResult$1(instance, schema, options, ctx);
    var notTypes = schema.not || schema.disallow;
    if(!notTypes) return null;
    if(!Array.isArray(notTypes)) notTypes=[notTypes];
    notTypes.forEach(function (type) {
      if (self.testType(instance, schema, options, ctx, type)) {
        var id = type && (type.$id || type.id);
        var schemaId = id || type;
        result.addError({
          name: 'not',
          argument: schemaId,
          message: "is of prohibited type " + schemaId,
        });
      }
    });
    return result;
  };

  var attribute_1 = attribute$1;

  var scan = {};

  var urilib$1 = require$$0__default["default"];
  var helpers$1 = helpers$3;

  scan.SchemaScanResult = SchemaScanResult;
  function SchemaScanResult(found, ref){
    this.id = found;
    this.ref = ref;
  }

  /**
   * Adds a schema with a certain urn to the Validator instance.
   * @param string uri
   * @param object schema
   * @return {Object}
   */
  scan.scan = function scan(base, schema){
    function scanSchema(baseuri, schema){
      if(!schema || typeof schema!='object') return;
      // Mark all referenced schemas so we can tell later which schemas are referred to, but never defined
      if(schema.$ref){
        var resolvedUri = urilib$1.resolve(baseuri, schema.$ref);
        ref[resolvedUri] = ref[resolvedUri] ? ref[resolvedUri]+1 : 0;
        return;
      }
      var id = schema.$id || schema.id;
      var ourBase = id ? urilib$1.resolve(baseuri, id) : baseuri;
      if (ourBase) {
        // If there's no fragment, append an empty one
        if(ourBase.indexOf('#')<0) ourBase += '#';
        if(found[ourBase]){
          if(!helpers$1.deepCompareStrict(found[ourBase], schema)){
            throw new Error('Schema <'+ourBase+'> already exists with different definition');
          }
          return found[ourBase];
        }
        found[ourBase] = schema;
        // strip trailing fragment
        if(ourBase[ourBase.length-1]=='#'){
          found[ourBase.substring(0, ourBase.length-1)] = schema;
        }
      }
      scanArray(ourBase+'/items', (Array.isArray(schema.items)?schema.items:[schema.items]));
      scanArray(ourBase+'/extends', (Array.isArray(schema.extends)?schema.extends:[schema.extends]));
      scanSchema(ourBase+'/additionalItems', schema.additionalItems);
      scanObject(ourBase+'/properties', schema.properties);
      scanSchema(ourBase+'/additionalProperties', schema.additionalProperties);
      scanObject(ourBase+'/definitions', schema.definitions);
      scanObject(ourBase+'/patternProperties', schema.patternProperties);
      scanObject(ourBase+'/dependencies', schema.dependencies);
      scanArray(ourBase+'/disallow', schema.disallow);
      scanArray(ourBase+'/allOf', schema.allOf);
      scanArray(ourBase+'/anyOf', schema.anyOf);
      scanArray(ourBase+'/oneOf', schema.oneOf);
      scanSchema(ourBase+'/not', schema.not);
    }
    function scanArray(baseuri, schemas){
      if(!Array.isArray(schemas)) return;
      for(var i=0; i<schemas.length; i++){
        scanSchema(baseuri+'/'+i, schemas[i]);
      }
    }
    function scanObject(baseuri, schemas){
      if(!schemas || typeof schemas!='object') return;
      for(var p in schemas){
        scanSchema(baseuri+'/'+p, schemas[p]);
      }
    }

    var found = {};
    var ref = {};
    scanSchema(base, schema);
    return new SchemaScanResult(found, ref);
  };

  var urilib = require$$0__default["default"];

  var attribute = attribute_1;
  var helpers = helpers$3;
  var scanSchema = scan.scan;
  var ValidatorResult = helpers.ValidatorResult;
  var ValidatorResultError = helpers.ValidatorResultError;
  var SchemaError = helpers.SchemaError;
  var SchemaContext = helpers.SchemaContext;
  //var anonymousBase = 'vnd.jsonschema:///';
  var anonymousBase = '/';

  /**
   * Creates a new Validator object
   * @name Validator
   * @constructor
   */
  var Validator$1 = function Validator () {
    // Allow a validator instance to override global custom formats or to have their
    // own custom formats.
    this.customFormats = Object.create(Validator.prototype.customFormats);
    this.schemas = {};
    this.unresolvedRefs = [];

    // Use Object.create to make this extensible without Validator instances stepping on each other's toes.
    this.types = Object.create(types);
    this.attributes = Object.create(attribute.validators);
  };

  // Allow formats to be registered globally.
  Validator$1.prototype.customFormats = {};

  // Hint at the presence of a property
  Validator$1.prototype.schemas = null;
  Validator$1.prototype.types = null;
  Validator$1.prototype.attributes = null;
  Validator$1.prototype.unresolvedRefs = null;

  /**
   * Adds a schema with a certain urn to the Validator instance.
   * @param schema
   * @param urn
   * @return {Object}
   */
  Validator$1.prototype.addSchema = function addSchema (schema, base) {
    var self = this;
    if (!schema) {
      return null;
    }
    var scan = scanSchema(base||anonymousBase, schema);
    var ourUri = base || schema.$id || schema.id;
    for(var uri in scan.id){
      this.schemas[uri] = scan.id[uri];
    }
    for(var uri in scan.ref){
      // If this schema is already defined, it will be filtered out by the next step
      this.unresolvedRefs.push(uri);
    }
    // Remove newly defined schemas from unresolvedRefs
    this.unresolvedRefs = this.unresolvedRefs.filter(function(uri){
      return typeof self.schemas[uri]==='undefined';
    });
    return this.schemas[ourUri];
  };

  Validator$1.prototype.addSubSchemaArray = function addSubSchemaArray(baseuri, schemas) {
    if(!Array.isArray(schemas)) return;
    for(var i=0; i<schemas.length; i++){
      this.addSubSchema(baseuri, schemas[i]);
    }
  };

  Validator$1.prototype.addSubSchemaObject = function addSubSchemaArray(baseuri, schemas) {
    if(!schemas || typeof schemas!='object') return;
    for(var p in schemas){
      this.addSubSchema(baseuri, schemas[p]);
    }
  };



  /**
   * Sets all the schemas of the Validator instance.
   * @param schemas
   */
  Validator$1.prototype.setSchemas = function setSchemas (schemas) {
    this.schemas = schemas;
  };

  /**
   * Returns the schema of a certain urn
   * @param urn
   */
  Validator$1.prototype.getSchema = function getSchema (urn) {
    return this.schemas[urn];
  };

  /**
   * Validates instance against the provided schema
   * @param instance
   * @param schema
   * @param [options]
   * @param [ctx]
   * @return {Array}
   */
  Validator$1.prototype.validate = function validate (instance, schema, options, ctx) {
    if((typeof schema !== 'boolean' && typeof schema !== 'object') || schema === null){
      throw new SchemaError('Expected `schema` to be an object or boolean');
    }
    if (!options) {
      options = {};
    }
    // This section indexes subschemas in the provided schema, so they don't need to be added with Validator#addSchema
    // This will work so long as the function at uri.resolve() will resolve a relative URI to a relative URI
    var id = schema.$id || schema.id;
    var base = urilib.resolve(options.base||anonymousBase, id||'');
    if(!ctx){
      ctx = new SchemaContext(schema, options, [], base, Object.create(this.schemas));
      if (!ctx.schemas[base]) {
        ctx.schemas[base] = schema;
      }
      var found = scanSchema(base, schema);
      for(var n in found.id){
        var sch = found.id[n];
        ctx.schemas[n] = sch;
      }
    }
    if(options.required && instance===undefined){
      var result = new ValidatorResult(instance, schema, options, ctx);
      result.addError('is required, but is undefined');
      return result;
    }
    var result = this.validateSchema(instance, schema, options, ctx);
    if (!result) {
      throw new Error('Result undefined');
    }else if(options.throwAll && result.errors.length){
      throw new ValidatorResultError(result);
    }
    return result;
  };

  /**
  * @param Object schema
  * @return mixed schema uri or false
  */
  function shouldResolve(schema) {
    var ref = (typeof schema === 'string') ? schema : schema.$ref;
    if (typeof ref=='string') return ref;
    return false;
  }

  /**
   * Validates an instance against the schema (the actual work horse)
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @private
   * @return {ValidatorResult}
   */
  Validator$1.prototype.validateSchema = function validateSchema (instance, schema, options, ctx) {
    var result = new ValidatorResult(instance, schema, options, ctx);

    // Support for the true/false schemas
    if(typeof schema==='boolean') {
      if(schema===true){
        // `true` is always valid
        schema = {};
      }else if(schema===false){
        // `false` is always invalid
        schema = {type: []};
      }
    }else if(!schema){
      // This might be a string
      throw new Error("schema is undefined");
    }

    if (schema['extends']) {
      if (Array.isArray(schema['extends'])) {
        var schemaobj = {schema: schema, ctx: ctx};
        schema['extends'].forEach(this.schemaTraverser.bind(this, schemaobj));
        schema = schemaobj.schema;
        schemaobj.schema = null;
        schemaobj.ctx = null;
        schemaobj = null;
      } else {
        schema = helpers.deepMerge(schema, this.superResolve(schema['extends'], ctx));
      }
    }

    // If passed a string argument, load that schema URI
    var switchSchema = shouldResolve(schema);
    if (switchSchema) {
      var resolved = this.resolve(schema, switchSchema, ctx);
      var subctx = new SchemaContext(resolved.subschema, options, ctx.path, resolved.switchSchema, ctx.schemas);
      return this.validateSchema(instance, resolved.subschema, options, subctx);
    }

    var skipAttributes = options && options.skipAttributes || [];
    // Validate each schema attribute against the instance
    for (var key in schema) {
      if (!attribute.ignoreProperties[key] && skipAttributes.indexOf(key) < 0) {
        var validatorErr = null;
        var validator = this.attributes[key];
        if (validator) {
          validatorErr = validator.call(this, instance, schema, options, ctx);
        } else if (options.allowUnknownAttributes === false) {
          // This represents an error with the schema itself, not an invalid instance
          throw new SchemaError("Unsupported attribute: " + key, schema);
        }
        if (validatorErr) {
          result.importErrors(validatorErr);
        }
      }
    }

    if (typeof options.rewrite == 'function') {
      var value = options.rewrite.call(this, instance, schema, options, ctx);
      result.instance = value;
    }
    return result;
  };

  /**
  * @private
  * @param Object schema
  * @param SchemaContext ctx
  * @returns Object schema or resolved schema
  */
  Validator$1.prototype.schemaTraverser = function schemaTraverser (schemaobj, s) {
    schemaobj.schema = helpers.deepMerge(schemaobj.schema, this.superResolve(s, schemaobj.ctx));
  };

  /**
  * @private
  * @param Object schema
  * @param SchemaContext ctx
  * @returns Object schema or resolved schema
  */
  Validator$1.prototype.superResolve = function superResolve (schema, ctx) {
    var ref = shouldResolve(schema);
    if(ref) {
      return this.resolve(schema, ref, ctx).subschema;
    }
    return schema;
  };

  /**
  * @private
  * @param Object schema
  * @param Object switchSchema
  * @param SchemaContext ctx
  * @return Object resolved schemas {subschema:String, switchSchema: String}
  * @throws SchemaError
  */
  Validator$1.prototype.resolve = function resolve (schema, switchSchema, ctx) {
    switchSchema = ctx.resolve(switchSchema);
    // First see if the schema exists under the provided URI
    if (ctx.schemas[switchSchema]) {
      return {subschema: ctx.schemas[switchSchema], switchSchema: switchSchema};
    }
    // Else try walking the property pointer
    var parsed = urilib.parse(switchSchema);
    var fragment = parsed && parsed.hash;
    var document = fragment && fragment.length && switchSchema.substr(0, switchSchema.length - fragment.length);
    if (!document || !ctx.schemas[document]) {
      throw new SchemaError("no such schema <" + switchSchema + ">", schema);
    }
    var subschema = helpers.objectGetPath(ctx.schemas[document], fragment.substr(1));
    if(subschema===undefined){
      throw new SchemaError("no such schema " + fragment + " located in <" + document + ">", schema);
    }
    return {subschema: subschema, switchSchema: switchSchema};
  };

  /**
   * Tests whether the instance if of a certain type.
   * @private
   * @param instance
   * @param schema
   * @param options
   * @param ctx
   * @param type
   * @return {boolean}
   */
  Validator$1.prototype.testType = function validateType (instance, schema, options, ctx, type) {
    if(type===undefined){
      return;
    }else if(type===null){
      throw new SchemaError('Unexpected null in "type" keyword');
    }
    if (typeof this.types[type] == 'function') {
      return this.types[type].call(this, instance);
    }
    if (type && typeof type == 'object') {
      var res = this.validateSchema(instance, type, options, ctx);
      return res === undefined || !(res && res.errors.length);
    }
    // Undefined or properties not on the list are acceptable, same as not being defined
    return true;
  };

  var types = Validator$1.prototype.types = {};
  types.string = function testString (instance) {
    return typeof instance == 'string';
  };
  types.number = function testNumber (instance) {
    // isFinite returns false for NaN, Infinity, and -Infinity
    return typeof instance == 'number' && isFinite(instance);
  };
  types.integer = function testInteger (instance) {
    return (typeof instance == 'number') && instance % 1 === 0;
  };
  types.boolean = function testBoolean (instance) {
    return typeof instance == 'boolean';
  };
  types.array = function testArray (instance) {
    return Array.isArray(instance);
  };
  types['null'] = function testNull (instance) {
    return instance === null;
  };
  types.date = function testDate (instance) {
    return instance instanceof Date;
  };
  types.any = function testAny (instance) {
    return true;
  };
  types.object = function testObject (instance) {
    // TODO: fix this - see #15
    return instance && (typeof instance === 'object') && !(Array.isArray(instance)) && !(instance instanceof Date);
  };

  var validator$2 = Validator$1;

  var Validator_1;

  Validator_1 = validator$2;

  const schemaValidator = new Validator_1();
  const evidenceSchema = {
    id: '/Evidence',
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      value: {
        type: 'string'
      }
    },
    required: ['name', 'value']
  };
  schemaValidator.addSchema(evidenceSchema, '/Evidence');
  const evidencesSchema = {
    id: '/Evidences',
    type: 'array',
    items: {
      '$ref': '/Evidence'
    },
    minItems: 1
  };
  schemaValidator.addSchema(evidencesSchema, '/Evidences');
  const extendedEvidencesSchema = {
    id: '/ExtendedEvidences',
    oneOf: [{
      '$ref': '/Evidences'
    }, {
      type: 'object',
      patternProperties: {
        '.+': {
          type: 'String'
        }
      },
      minProperties: 1
    }]
  };
  schemaValidator.addSchema(extendedEvidencesSchema, '/ExtendedEvidences');
  const instanceSchema = {
    id: '/Instance',
    type: 'object',
    properties: {
      className: {
        type: 'string'
      },
      propertyName: {
        type: 'string'
      },
      value: {
        type: 'any'
      },
      dependencyContext: {
        type: 'object',
        properties: {
          evidences: {
            '$ref': '/Evidences'
          }
        }
      }
    },
    required: ['className', 'propertyName', 'value']
  };
  schemaValidator.addSchema(instanceSchema, '/Instance');
  const inputInstancesSchema = {
    id: '/InputInstances',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        className: {
          type: 'string'
        },
        propertyName: {
          type: 'string'
        },
        value: {
          type: 'any'
        }
      },
      required: ['className', 'propertyName'],
      minItems: 1
    }
  };
  schemaValidator.addSchema(inputInstancesSchema, '/InputInstances');
  const instancesSchema = {
    id: '/Instances',
    type: 'array',
    items: {
      '$ref': '/Instance'
    },
    minItems: 1
  };
  schemaValidator.addSchema(instancesSchema, '/Instances');
  const contextSchema = {
    id: '/Context',
    type: 'object',
    properties: {
      guid: {
        type: 'string'
      },
      evidences: {
        '$ref': '/Evidences'
      }
    },
    required: ['guid', 'evidences']
  };
  schemaValidator.addSchema(contextSchema, '/Context');
  const inputContextSchema = {
    id: '/InputContext',
    type: 'object',
    properties: {
      evidences: {
        '$ref': '/ExtendedEvidences'
      }
    },
    required: ['evidences']
  };
  schemaValidator.addSchema(inputContextSchema, '/InputContext');
  const rightsContextsSchema = {
    id: '/RightsContexts',
    type: 'Array',
    items: {
      '$ref': '/Context'
    },
    minItems: 1
  };
  schemaValidator.addSchema(rightsContextsSchema, '/RightsContexts');
  const processingContextsSchema = {
    id: '/ProcessingContexts',
    type: 'Array',
    items: {
      '$ref': '/Context'
    },
    minItems: 0
  };
  schemaValidator.addSchema(processingContextsSchema, '/ProcessingContexts');
  const requestsSchema = {
    id: '/Requests',
    type: 'Array',
    items: {
      type: 'object',
      properties: {
        guid: {
          type: 'string'
        },
        rightsContext: {
          type: 'string'
        },
        processingContext: {
          type: 'string'
        },
        instances: {
          '$ref': '/Instances'
        }
      },
      required: ['guid', 'rightsContext', 'instances']
    },
    minItems: 1
  };
  schemaValidator.addSchema(requestsSchema, '/Requests');
  const requestDataSchema = {
    id: 'RequestData',
    type: 'object',
    properties: {
      processingContexts: {
        '$ref': '/ProcessingContexts'
      },
      rightsContexts: {
        '$ref': '/RightsContexts'
      },
      requests: {
        '$ref': '/Requests'
      }
    },
    required: ['rightsContexts', 'requests']
  };
  schemaValidator.addSchema(requestDataSchema, '/RequestData');
  const requestInputDataSchema = {
    id: 'RequestInputData',
    type: 'object',
    properties: {
      processingContext: {
        '$ref': '/InputContext'
      },
      rightsContext: {
        '$ref': '/InputContext'
      },
      instances: {
        '$ref': 'InputInstances'
      }
    },
    required: ['rightsContext', 'instances']
  };
  schemaValidator.addSchema(requestInputDataSchema, '/RequestInputData');

  class Validator {
    constructor(rules) {
      this.rules = rules;
      this.errors = [];
    }

    validate() {
      this.errors = this.rules.filter(({
        rule
      }) => !rule).map(({
        message
      }) => message);
      return this.errors.length === 0;
    }

    validateWithThrowError() {
      const isValid = this.validate();
      const error = this.errors.join('\r\n');

      if (!isValid) {
        throw new Error(error);
      } else {
        return isValid;
      }
    }

  }

  class RPSEvidence {
    /**
     * Evidence class
     *
     * @param {object} evidence - {name: 'name', value: 'value}
     * @param {string} evidence.name - evidence name
     * @param {string} evidence.value - evidence value
     */
    constructor({
      name,
      value
    }) {
      RPSEvidence.validateEvidence({
        name,
        value
      });
      this.name = name;
      this.value = value;
    }

    static validateEvidence(evidence, throwError = true) {
      const result = schemaValidator.validate(evidence, {
        $ref: '/Evidence'
      });
      const validator = new Validator([{
        rule: result.valid,
        message: `Invalid "evidence" format/structure`
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }

  }

  const isObject$1 = object => object != null && typeof object === 'object';
  const deepEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject$1(val1) && isObject$1(val2);

      if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
        return false;
      }
    }

    return true;
  };
  const makeDictionary = (arr, keyProp, valueProp) => {
    return arr.reduce((acc, item) => ({ ...acc,
      [item[keyProp]]: item[valueProp]
    }), {});
  };
  const makeArrayFromDictionary = (dictionary = {}, keyProp = 'name', valueProp = 'value') => {
    return Object.entries(dictionary).reduce((acc, [key, value]) => [...acc, {
      [keyProp]: key,
      [valueProp]: value
    }], []);
  };

  var utils$f = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isObject: isObject$1,
    deepEqual: deepEqual,
    makeDictionary: makeDictionary,
    makeArrayFromDictionary: makeArrayFromDictionary
  });

  class RPSValue {
    /**
     * RPSValue class
     *
     * @param {string} className - required
     * @param {string} propertyName - required
     * @param {*} value - required, can be empty, but undefined is not valid
     * @param {object} dependencies - not required, e.g. {name: 'value', name2: 'value2'}
     *
     */
    constructor({
      className,
      propertyName,
      value,
      dependencies = null
    } = {}) {
      RPSValue.validateValue({
        className,
        propertyName,
        value
      });
      this.className = className;
      this.propertyName = propertyName;
      this.value = value;
      this.dependencies = isObject$1(dependencies) ? dependencies : null;
      this.error = null;
      this.transformed = null;
    }

    get original() {
      return this.value;
    }

    setError(error) {
      this.error = error;
    }

    setTransformedValue(transformedValue) {
      this.transformed = transformedValue;
    }

    static validateValue(params, throwError = true) {
      const {
        className,
        propertyName,
        value
      } = params;
      const result = schemaValidator.validate(params, {
        $ref: '/Instance'
      });
      const validator = new Validator([{
        rule: !!className,
        message: `Required property "className" is missing or empty`
      }, {
        rule: !!propertyName,
        message: `Required property "propertyName" is missing or empty`
      }, {
        rule: typeof value !== 'undefined',
        message: `Required property "value" is undefined`
      }, {
        rule: result.valid,
        message: `Invalid "requestData" format/structure`
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }

  }

  class RPSContext {
    /**
     * Context class with evidences as dictionary or list
     *
     * @param {object|object[]} evidences - Array of evidences like [{name: 'name', value: 'value}] or dictionary like {name: value}
     */
    constructor(evidences) {
      RPSContext.validateEvidences(evidences);
      this.evidences = evidences;
    }

    static validateEvidences(evidences, throwError = true) {
      const result = schemaValidator.validate(evidences, {
        $ref: '/ExtendedEvidences'
      });
      const validator = new Validator([{
        rule: !!evidences,
        message: `Required parameter "evidences" is missing`
      }, {
        rule: result.valid,
        message: `Invalid "evidences" format/structure`
      }]);
      return !throwError ? validator.validate() : validator.validateWithThrowError();
    }

  }

  function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

    return _classApplyDescriptorGet(receiver, descriptor);
  }

  function _classPrivateFieldSet(receiver, privateMap, value) {
    var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

    _classApplyDescriptorSet(receiver, descriptor, value);

    return value;
  }

  function _classExtractFieldDescriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to " + action + " private field on non-instance");
    }

    return privateMap.get(receiver);
  }

  function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
    _classCheckPrivateStaticAccess(receiver, classConstructor);

    _classCheckPrivateStaticFieldDescriptor(descriptor, "get");

    return _classApplyDescriptorGet(receiver, descriptor);
  }

  function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
    _classCheckPrivateStaticAccess(receiver, classConstructor);

    return method;
  }

  function _classApplyDescriptorGet(receiver, descriptor) {
    if (descriptor.get) {
      return descriptor.get.call(receiver);
    }

    return descriptor.value;
  }

  function _classApplyDescriptorSet(receiver, descriptor, value) {
    if (descriptor.set) {
      descriptor.set.call(receiver, value);
    } else {
      if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
      }

      descriptor.value = value;
    }
  }

  function _classCheckPrivateStaticAccess(receiver, classConstructor) {
    if (receiver !== classConstructor) {
      throw new TypeError("Private static access of wrong provenance");
    }
  }

  function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
    if (descriptor === undefined) {
      throw new TypeError("attempted to " + action + " private static field before its declaration");
    }
  }

  function _classPrivateMethodGet(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
      throw new TypeError("attempted to get private field on non-instance");
    }

    return fn;
  }

  function _checkPrivateRedeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
      throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
  }

  function _classPrivateFieldInitSpec(obj, privateMap, value) {
    _checkPrivateRedeclaration(obj, privateMap);

    privateMap.set(obj, value);
  }

  function _classPrivateMethodInitSpec(obj, privateSet) {
    _checkPrivateRedeclaration(obj, privateSet);

    privateSet.add(obj);
  }

  var axios$2 = {exports: {}};

  var bind$2 = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  var bind$1 = bind$2;

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (isPlainObject(result[key]) && isPlainObject(val)) {
        result[key] = merge(result[key], val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  var utils$e = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM
  };

  var utils$d = utils$e;

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL$3 = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils$d.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils$d.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils$d.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils$d.forEach(val, function parseValue(v) {
          if (utils$d.isDate(v)) {
            v = v.toISOString();
          } else if (utils$d.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  var utils$c = utils$e;

  function InterceptorManager$1() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager$1.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager$1.prototype.forEach = function forEach(fn) {
    utils$c.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager$1;

  var utils$b = utils$e;

  var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
    utils$b.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError$3 = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    };
    return error;
  };

  var enhanceError$2 = enhanceError$3;

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError$3 = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError$2(error, config, code, request, response);
  };

  var createError$2 = createError$3;

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle$2 = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError$2(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  var utils$a = utils$e;

  var cookies$1 = (
    utils$a.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils$a.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils$a.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils$a.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL$1 = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  var isAbsoluteURL = isAbsoluteURL$1;
  var combineURLs = combineURLs$1;

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath$2 = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  var utils$9 = utils$e;

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders$1 = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils$9.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils$9.trim(line.substr(0, i)).toLowerCase();
      val = utils$9.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var utils$8 = utils$e;

  var isURLSameOrigin$1 = (
    utils$8.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
        function resolveURL(url) {
          var href = url;

          if (msie) {
          // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils$8.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel$4(message) {
    this.message = message;
  }

  Cancel$4.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel$4.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel$4;

  var utils$7 = utils$e;
  var settle$1 = settle$2;
  var cookies = cookies$1;
  var buildURL$2 = buildURL$3;
  var buildFullPath$1 = buildFullPath$2;
  var parseHeaders = parseHeaders$1;
  var isURLSameOrigin = isURLSameOrigin$1;
  var createError$1 = createError$3;
  var defaults$5 = defaults_1;
  var Cancel$3 = Cancel_1;

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      var responseType = config.responseType;
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }

      if (utils$7.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath$1(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL$2(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
          request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle$1(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError$1('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError$1('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
        var transitional = config.transitional || defaults$5.transitional;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError$1(
          timeoutErrorMessage,
          config,
          transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils$7.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$7.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils$7.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = config.responseType;
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (!request) {
            return;
          }
          reject(!cancel || (cancel && cancel.type) ? new Cancel$3('canceled') : cancel);
          request.abort();
          request = null;
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
        }
      }

      if (!requestData) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var followRedirects = {exports: {}};

  var debug$1;

  var debug_1 = function () {
    if (!debug$1) {
      try {
        /* eslint global-require: off */
        debug$1 = require("debug")("follow-redirects");
      }
      catch (error) { /* */ }
      if (typeof debug$1 !== "function") {
        debug$1 = function () { /* */ };
      }
    }
    debug$1.apply(null, arguments);
  };

  var url$1 = require$$0__default["default"];
  var URL = url$1.URL;
  var http$1 = require$$1__default["default"];
  var https$1 = require$$2__default["default"];
  var Writable = require$$3__default["default"].Writable;
  var assert = require$$4__default["default"];
  var debug = debug_1;

  // Create handlers that pass events from native requests
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events.forEach(function (event) {
    eventHandlers[event] = function (arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });

  // Error types with codes
  var RedirectionError = createErrorType(
    "ERR_FR_REDIRECTION_FAILURE",
    ""
  );
  var TooManyRedirectsError = createErrorType(
    "ERR_FR_TOO_MANY_REDIRECTS",
    "Maximum number of redirects exceeded"
  );
  var MaxBodyLengthExceededError = createErrorType(
    "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
    "Request body larger than maxBodyLength limit"
  );
  var WriteAfterEndError = createErrorType(
    "ERR_STREAM_WRITE_AFTER_END",
    "write after end"
  );

  // An HTTP(S) request that can be redirected
  function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];

    // Attach a callback if passed
    if (responseCallback) {
      this.on("response", responseCallback);
    }

    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function (response) {
      self._processResponse(response);
    };

    // Perform the first request
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);

  RedirectableRequest.prototype.abort = function () {
    abortRequest(this._currentRequest);
    this.emit("abort");
  };

  // Writes buffered data to the current native request
  RedirectableRequest.prototype.write = function (data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
      throw new WriteAfterEndError();
    }

    // Validate input and shift parameters if necessary
    if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }

    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data: data, encoding: encoding });
      this._currentRequest.write(data, encoding, callback);
    }
    // Error when we exceed the maximum body length
    else {
      this.emit("error", new MaxBodyLengthExceededError());
      this.abort();
    }
  };

  // Ends the current native request
  RedirectableRequest.prototype.end = function (data, encoding, callback) {
    // Shift parameters if necessary
    if (typeof data === "function") {
      callback = data;
      data = encoding = null;
    }
    else if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }

    // Write data if needed and end
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    }
    else {
      var self = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function () {
        self._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };

  // Sets a header value on the current native request
  RedirectableRequest.prototype.setHeader = function (name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };

  // Clears a header value on the current native request
  RedirectableRequest.prototype.removeHeader = function (name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };

  // Global timeout for all underlying requests
  RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
    var self = this;

    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }

    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
      if (self._timeout) {
        clearTimeout(self._timeout);
      }
      self._timeout = setTimeout(function () {
        self.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }

    // Stops a timeout from triggering
    function clearTimer() {
      if (self._timeout) {
        clearTimeout(self._timeout);
        self._timeout = null;
      }
      if (callback) {
        self.removeListener("timeout", callback);
      }
      if (!self.socket) {
        self._currentRequest.removeListener("socket", startTimer);
      }
    }

    // Attach callback if passed
    if (callback) {
      this.on("timeout", callback);
    }

    // Start the timer if or when the socket is opened
    if (this.socket) {
      startTimer(this.socket);
    }
    else {
      this._currentRequest.once("socket", startTimer);
    }

    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.once("response", clearTimer);
    this.once("error", clearTimer);

    return this;
  };

  // Proxy all other public ClientRequest methods
  [
    "flushHeaders", "getHeader",
    "setNoDelay", "setSocketKeepAlive",
  ].forEach(function (method) {
    RedirectableRequest.prototype[method] = function (a, b) {
      return this._currentRequest[method](a, b);
    };
  });

  // Proxy all public ClientRequest properties
  ["aborted", "connection", "socket"].forEach(function (property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function () { return this._currentRequest[property]; },
    });
  });

  RedirectableRequest.prototype._sanitizeOptions = function (options) {
    // Ensure headers are always present
    if (!options.headers) {
      options.headers = {};
    }

    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
      // Use hostname if set, because it has precedence
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }

    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      }
      else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };


  // Executes the next native request (initial or redirect)
  RedirectableRequest.prototype._performRequest = function () {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      this.emit("error", new TypeError("Unsupported protocol " + protocol));
      return;
    }

    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
      var scheme = protocol.substr(0, protocol.length - 1);
      this._options.agent = this._options.agents[scheme];
    }

    // Create the native request
    var request = this._currentRequest =
          nativeProtocol.request(this._options, this._onNativeResponse);
    this._currentUrl = url$1.format(this._options);

    // Set up event handlers
    request._redirectable = this;
    for (var e = 0; e < events.length; e++) {
      request.on(events[e], eventHandlers[events[e]]);
    }

    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
      // Write the request entity and end.
      var i = 0;
      var self = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        // Only write if this request has not been redirected yet
        /* istanbul ignore else */
        if (request === self._currentRequest) {
          // Report any write errors
          /* istanbul ignore if */
          if (error) {
            self.emit("error", error);
          }
          // Write the next buffer if there are still left
          else if (i < buffers.length) {
            var buffer = buffers[i++];
            /* istanbul ignore else */
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          }
          // End the request if `end` has been called on us
          else if (self._ended) {
            request.end();
          }
        }
      }());
    }
  };

  // Processes a response from the current native request
  RedirectableRequest.prototype._processResponse = function (response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode: statusCode,
      });
    }

    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.
    var location = response.headers.location;
    if (location && this._options.followRedirects !== false &&
        statusCode >= 300 && statusCode < 400) {
      // Abort the current request
      abortRequest(this._currentRequest);
      // Discard the remainder of the response to avoid waiting for data
      response.destroy();

      // RFC7231§6.4: A client SHOULD detect and intervene
      // in cyclical redirections (i.e., "infinite" redirection loops).
      if (++this._redirectCount > this._options.maxRedirects) {
        this.emit("error", new TooManyRedirectsError());
        return;
      }

      // RFC7231§6.4: Automatic redirection needs to done with
      // care for methods not known to be safe, […]
      // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
      // the request method from POST to GET for the subsequent request.
      if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
          // RFC7231§6.4.4: The 303 (See Other) status code indicates that
          // the server is redirecting the user agent to a different resource […]
          // A user agent can perform a retrieval request targeting that URI
          // (a GET or HEAD request if using HTTP) […]
          (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        // Drop a possible entity and headers related to it
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
      }

      // Drop the Host header, as the redirect might lead to a different host
      var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
        url$1.parse(this._currentUrl).hostname;

      // Create the redirected request
      var redirectUrl = url$1.resolve(this._currentUrl, location);
      debug("redirecting to", redirectUrl);
      this._isRedirect = true;
      var redirectUrlParts = url$1.parse(redirectUrl);
      Object.assign(this._options, redirectUrlParts);

      // Drop the Authorization header if redirecting to another host
      if (redirectUrlParts.hostname !== previousHostName) {
        removeMatchingHeaders(/^authorization$/i, this._options.headers);
      }

      // Evaluate the beforeRedirect callback
      if (typeof this._options.beforeRedirect === "function") {
        var responseDetails = { headers: response.headers };
        try {
          this._options.beforeRedirect.call(null, this._options, responseDetails);
        }
        catch (err) {
          this.emit("error", err);
          return;
        }
        this._sanitizeOptions(this._options);
      }

      // Perform the redirected request
      try {
        this._performRequest();
      }
      catch (cause) {
        var error = new RedirectionError("Redirected request failed: " + cause.message);
        error.cause = cause;
        this.emit("error", error);
      }
    }
    else {
      // The response is not a redirect; return it as-is
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);

      // Clean up
      this._requestBodyBuffers = [];
    }
  };

  // Wraps the key/value object of protocols with redirect functionality
  function wrap(protocols) {
    // Default settings
    var exports = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024,
    };

    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function (scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

      // Executes a request, following redirects
      function request(input, options, callback) {
        // Parse parameters
        if (typeof input === "string") {
          var urlStr = input;
          try {
            input = urlToOptions(new URL(urlStr));
          }
          catch (err) {
            /* istanbul ignore next */
            input = url$1.parse(urlStr);
          }
        }
        else if (URL && (input instanceof URL)) {
          input = urlToOptions(input);
        }
        else {
          callback = options;
          options = input;
          input = { protocol: protocol };
        }
        if (typeof options === "function") {
          callback = options;
          options = null;
        }

        // Set defaults
        options = Object.assign({
          maxRedirects: exports.maxRedirects,
          maxBodyLength: exports.maxBodyLength,
        }, input, options);
        options.nativeProtocols = nativeProtocols;

        assert.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }

      // Executes a GET request, following redirects
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }

      // Expose the properties on the wrapped protocol
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true },
      });
    });
    return exports;
  }

  /* istanbul ignore next */
  function noop() { /* empty */ }

  // from https://github.com/nodejs/node/blob/master/lib/internal/url.js
  function urlToOptions(urlObject) {
    var options = {
      protocol: urlObject.protocol,
      hostname: urlObject.hostname.startsWith("[") ?
        /* istanbul ignore next */
        urlObject.hostname.slice(1, -1) :
        urlObject.hostname,
      hash: urlObject.hash,
      search: urlObject.search,
      pathname: urlObject.pathname,
      path: urlObject.pathname + urlObject.search,
      href: urlObject.href,
    };
    if (urlObject.port !== "") {
      options.port = Number(urlObject.port);
    }
    return options;
  }

  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue;
  }

  function createErrorType(code, defaultMessage) {
    function CustomError(message) {
      Error.captureStackTrace(this, this.constructor);
      this.message = message || defaultMessage;
    }
    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;
    CustomError.prototype.name = "Error [" + code + "]";
    CustomError.prototype.code = code;
    return CustomError;
  }

  function abortRequest(request) {
    for (var e = 0; e < events.length; e++) {
      request.removeListener(events[e], eventHandlers[events[e]]);
    }
    request.on("error", noop);
    request.abort();
  }

  // Exports
  followRedirects.exports = wrap({ http: http$1, https: https$1 });
  followRedirects.exports.wrap = wrap;

  var data = {
    "version": "0.23.0"
  };

  var utils$6 = utils$e;
  var settle = settle$2;
  var buildFullPath = buildFullPath$2;
  var buildURL$1 = buildURL$3;
  var http = require$$1__default["default"];
  var https = require$$2__default["default"];
  var httpFollow = followRedirects.exports.http;
  var httpsFollow = followRedirects.exports.https;
  var url = require$$0__default["default"];
  var zlib = require$$8__default["default"];
  var VERSION$1 = data.version;
  var createError = createError$3;
  var enhanceError$1 = enhanceError$3;
  var defaults$4 = defaults_1;
  var Cancel$2 = Cancel_1;

  var isHttps = /https:?/;

  /**
   *
   * @param {http.ClientRequestArgs} options
   * @param {AxiosProxyConfig} proxy
   * @param {string} location
   */
  function setProxy(options, proxy, location) {
    options.hostname = proxy.host;
    options.host = proxy.host;
    options.port = proxy.port;
    options.path = location;

    // Basic proxy authorization
    if (proxy.auth) {
      var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
      options.headers['Proxy-Authorization'] = 'Basic ' + base64;
    }

    // If a proxy is used, any redirects must also pass through the proxy
    options.beforeRedirect = function beforeRedirect(redirection) {
      redirection.headers.host = redirection.host;
      setProxy(redirection, proxy, redirection.href);
    };
  }

  /*eslint consistent-return:0*/
  var http_1 = function httpAdapter(config) {
    return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }
      var resolve = function resolve(value) {
        done();
        resolvePromise(value);
      };
      var reject = function reject(value) {
        done();
        rejectPromise(value);
      };
      var data = config.data;
      var headers = config.headers;
      var headerNames = {};

      Object.keys(headers).forEach(function storeLowerName(name) {
        headerNames[name.toLowerCase()] = name;
      });

      // Set User-Agent (required by some servers)
      // See https://github.com/axios/axios/issues/69
      if ('user-agent' in headerNames) {
        // User-Agent is specified; handle case where no UA header is desired
        if (!headers[headerNames['user-agent']]) {
          delete headers[headerNames['user-agent']];
        }
        // Otherwise, use specified value
      } else {
        // Only set header if it hasn't been set in config
        headers['User-Agent'] = 'axios/' + VERSION$1;
      }

      if (data && !utils$6.isStream(data)) {
        if (Buffer.isBuffer(data)) ; else if (utils$6.isArrayBuffer(data)) {
          data = Buffer.from(new Uint8Array(data));
        } else if (utils$6.isString(data)) {
          data = Buffer.from(data, 'utf-8');
        } else {
          return reject(createError(
            'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
            config
          ));
        }

        // Add Content-Length header if data exists
        if (!headerNames['content-length']) {
          headers['Content-Length'] = data.length;
        }
      }

      // HTTP basic authentication
      var auth = undefined;
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        auth = username + ':' + password;
      }

      // Parse url
      var fullPath = buildFullPath(config.baseURL, config.url);
      var parsed = url.parse(fullPath);
      var protocol = parsed.protocol || 'http:';

      if (!auth && parsed.auth) {
        var urlAuth = parsed.auth.split(':');
        var urlUsername = urlAuth[0] || '';
        var urlPassword = urlAuth[1] || '';
        auth = urlUsername + ':' + urlPassword;
      }

      if (auth && headerNames.authorization) {
        delete headers[headerNames.authorization];
      }

      var isHttpsRequest = isHttps.test(protocol);
      var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

      var options = {
        path: buildURL$1(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
        method: config.method.toUpperCase(),
        headers: headers,
        agent: agent,
        agents: { http: config.httpAgent, https: config.httpsAgent },
        auth: auth
      };

      if (config.socketPath) {
        options.socketPath = config.socketPath;
      } else {
        options.hostname = parsed.hostname;
        options.port = parsed.port;
      }

      var proxy = config.proxy;
      if (!proxy && proxy !== false) {
        var proxyEnv = protocol.slice(0, -1) + '_proxy';
        var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
        if (proxyUrl) {
          var parsedProxyUrl = url.parse(proxyUrl);
          var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
          var shouldProxy = true;

          if (noProxyEnv) {
            var noProxy = noProxyEnv.split(',').map(function trim(s) {
              return s.trim();
            });

            shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
              if (!proxyElement) {
                return false;
              }
              if (proxyElement === '*') {
                return true;
              }
              if (proxyElement[0] === '.' &&
                  parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
                return true;
              }

              return parsed.hostname === proxyElement;
            });
          }

          if (shouldProxy) {
            proxy = {
              host: parsedProxyUrl.hostname,
              port: parsedProxyUrl.port,
              protocol: parsedProxyUrl.protocol
            };

            if (parsedProxyUrl.auth) {
              var proxyUrlAuth = parsedProxyUrl.auth.split(':');
              proxy.auth = {
                username: proxyUrlAuth[0],
                password: proxyUrlAuth[1]
              };
            }
          }
        }
      }

      if (proxy) {
        options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
        setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
      }

      var transport;
      var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
      if (config.transport) {
        transport = config.transport;
      } else if (config.maxRedirects === 0) {
        transport = isHttpsProxy ? https : http;
      } else {
        if (config.maxRedirects) {
          options.maxRedirects = config.maxRedirects;
        }
        transport = isHttpsProxy ? httpsFollow : httpFollow;
      }

      if (config.maxBodyLength > -1) {
        options.maxBodyLength = config.maxBodyLength;
      }

      if (config.insecureHTTPParser) {
        options.insecureHTTPParser = config.insecureHTTPParser;
      }

      // Create the request
      var req = transport.request(options, function handleResponse(res) {
        if (req.aborted) return;

        // uncompress the response body transparently if required
        var stream = res;

        // return the last request in case of redirects
        var lastRequest = res.req || req;


        // if no content, is HEAD request or decompress disabled we should not decompress
        if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
          switch (res.headers['content-encoding']) {
          /*eslint default-case:0*/
          case 'gzip':
          case 'compress':
          case 'deflate':
          // add the unzipper to the body stream processing pipeline
            stream = stream.pipe(zlib.createUnzip());

            // remove the content-encoding in order to not confuse downstream operations
            delete res.headers['content-encoding'];
            break;
          }
        }

        var response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          config: config,
          request: lastRequest
        };

        if (config.responseType === 'stream') {
          response.data = stream;
          settle(resolve, reject, response);
        } else {
          var responseBuffer = [];
          var totalResponseBytes = 0;
          stream.on('data', function handleStreamData(chunk) {
            responseBuffer.push(chunk);
            totalResponseBytes += chunk.length;

            // make sure the content length is not over the maxContentLength if specified
            if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
              stream.destroy();
              reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
                config, null, lastRequest));
            }
          });

          stream.on('error', function handleStreamError(err) {
            if (req.aborted) return;
            reject(enhanceError$1(err, config, null, lastRequest));
          });

          stream.on('end', function handleStreamEnd() {
            var responseData = Buffer.concat(responseBuffer);
            if (config.responseType !== 'arraybuffer') {
              responseData = responseData.toString(config.responseEncoding);
              if (!config.responseEncoding || config.responseEncoding === 'utf8') {
                responseData = utils$6.stripBOM(responseData);
              }
            }

            response.data = responseData;
            settle(resolve, reject, response);
          });
        }
      });

      // Handle errors
      req.on('error', function handleRequestError(err) {
        if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
        reject(enhanceError$1(err, config, null, req));
      });

      // Handle request timeout
      if (config.timeout) {
        // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
        var timeout = parseInt(config.timeout, 10);

        if (isNaN(timeout)) {
          reject(createError(
            'error trying to parse `config.timeout` to int',
            config,
            'ERR_PARSE_TIMEOUT',
            req
          ));

          return;
        }

        // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
        // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
        // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
        // And then these socket which be hang up will devoring CPU little by little.
        // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
        req.setTimeout(timeout, function handleRequestTimeout() {
          req.abort();
          var transitional = config.transitional || defaults$4.transitional;
          reject(createError(
            'timeout of ' + timeout + 'ms exceeded',
            config,
            transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            req
          ));
        });
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (req.aborted) return;

          req.abort();
          reject(!cancel || (cancel && cancel.type) ? new Cancel$2('canceled') : cancel);
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
        }
      }


      // Send the request
      if (utils$6.isStream(data)) {
        data.on('error', function handleStreamError(err) {
          reject(enhanceError$1(err, config, null, req));
        }).pipe(req);
      } else {
        req.end(data);
      }
    });
  };

  var utils$5 = utils$e;
  var normalizeHeaderName = normalizeHeaderName$1;
  var enhanceError = enhanceError$3;

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils$5.isUndefined(headers) && utils$5.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = http_1;
    }
    return adapter;
  }

  function stringifySafely(rawValue, parser, encoder) {
    if (utils$5.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$5.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  var defaults$3 = {

    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    },

    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');

      if (utils$5.isFormData(data) ||
        utils$5.isArrayBuffer(data) ||
        utils$5.isBuffer(data) ||
        utils$5.isStream(data) ||
        utils$5.isFile(data) ||
        utils$5.isBlob(data)
      ) {
        return data;
      }
      if (utils$5.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$5.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils$5.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
        setContentTypeIfUnset(headers, 'application/json');
        return stringifySafely(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      var transitional = this.transitional || defaults$3.transitional;
      var silentJSONParsing = transitional && transitional.silentJSONParsing;
      var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

      if (strictJSONParsing || (forcedJSONParsing && utils$5.isString(data) && data.length)) {
        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw enhanceError(e, this, 'E_JSON_PARSE');
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    }
  };

  utils$5.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults$3.headers[method] = {};
  });

  utils$5.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults$3.headers[method] = utils$5.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults$3;

  var utils$4 = utils$e;
  var defaults$2 = defaults_1;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData$1 = function transformData(data, headers, fns) {
    var context = this || defaults$2;
    /*eslint no-param-reassign:0*/
    utils$4.forEach(fns, function transform(fn) {
      data = fn.call(context, data, headers);
    });

    return data;
  };

  var isCancel$1 = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var utils$3 = utils$e;
  var transformData = transformData$1;
  var isCancel = isCancel$1;
  var defaults$1 = defaults_1;
  var Cancel$1 = Cancel_1;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new Cancel$1('canceled');
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest$1 = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData.call(
      config,
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils$3.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );

    utils$3.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults$1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  var utils$2 = utils$e;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig$2 = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};

    function getMergedValue(target, source) {
      if (utils$2.isPlainObject(target) && utils$2.isPlainObject(source)) {
        return utils$2.merge(target, source);
      } else if (utils$2.isPlainObject(source)) {
        return utils$2.merge({}, source);
      } else if (utils$2.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (!utils$2.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      } else if (!utils$2.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(prop) {
      if (prop in config2) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    var mergeMap = {
      'url': valueFromConfig2,
      'method': valueFromConfig2,
      'data': valueFromConfig2,
      'baseURL': defaultToConfig2,
      'transformRequest': defaultToConfig2,
      'transformResponse': defaultToConfig2,
      'paramsSerializer': defaultToConfig2,
      'timeout': defaultToConfig2,
      'timeoutMessage': defaultToConfig2,
      'withCredentials': defaultToConfig2,
      'adapter': defaultToConfig2,
      'responseType': defaultToConfig2,
      'xsrfCookieName': defaultToConfig2,
      'xsrfHeaderName': defaultToConfig2,
      'onUploadProgress': defaultToConfig2,
      'onDownloadProgress': defaultToConfig2,
      'decompress': defaultToConfig2,
      'maxContentLength': defaultToConfig2,
      'maxBodyLength': defaultToConfig2,
      'transport': defaultToConfig2,
      'httpAgent': defaultToConfig2,
      'httpsAgent': defaultToConfig2,
      'cancelToken': defaultToConfig2,
      'socketPath': defaultToConfig2,
      'responseEncoding': defaultToConfig2,
      'validateStatus': mergeDirectKeys
    };

    utils$2.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
      var merge = mergeMap[prop] || mergeDeepProperties;
      var configValue = merge(prop);
      (utils$2.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  };

  var VERSION = data.version;

  var validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  var deprecatedWarnings = {};

  /**
   * Transitional option validator
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return function(value, opt, opts) {
      if (validator === false) {
        throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  /**
   * Assert object's properties type
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    var keys = Object.keys(options);
    var i = keys.length;
    while (i-- > 0) {
      var opt = keys[i];
      var validator = schema[opt];
      if (validator) {
        var value = options[opt];
        var result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new TypeError('option ' + opt + ' must be ' + result);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw Error('Unknown option ' + opt);
      }
    }
  }

  var validator$1 = {
    assertOptions: assertOptions,
    validators: validators$1
  };

  var utils$1 = utils$e;
  var buildURL = buildURL$3;
  var InterceptorManager = InterceptorManager_1;
  var dispatchRequest = dispatchRequest$1;
  var mergeConfig$1 = mergeConfig$2;
  var validator = validator$1;

  var validators = validator.validators;
  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios$1(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios$1.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }

    config = mergeConfig$1(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    var transitional = config.transitional;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    // filter out skipped interceptors
    var requestInterceptorChain = [];
    var synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    var promise;

    if (!synchronousRequestInterceptors) {
      var chain = [dispatchRequest, undefined];

      Array.prototype.unshift.apply(chain, requestInterceptorChain);
      chain = chain.concat(responseInterceptorChain);

      promise = Promise.resolve(config);
      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    }


    var newConfig = config;
    while (requestInterceptorChain.length) {
      var onFulfilled = requestInterceptorChain.shift();
      var onRejected = requestInterceptorChain.shift();
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected(error);
        break;
      }
    }

    try {
      promise = dispatchRequest(newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }

    return promise;
  };

  Axios$1.prototype.getUri = function getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios$1;

  var Cancel = Cancel_1;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;

    // eslint-disable-next-line func-names
    this.promise.then(function(cancel) {
      if (!token._listeners) return;

      var i;
      var l = token._listeners.length;

      for (i = 0; i < l; i++) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = function(onfulfilled) {
      var _resolve;
      // eslint-disable-next-line func-names
      var promise = new Promise(function(resolve) {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Subscribe to the cancel signal
   */

  CancelToken.prototype.subscribe = function subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  };

  /**
   * Unsubscribe from the cancel signal
   */

  CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    var index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  var isAxiosError = function isAxiosError(payload) {
    return (typeof payload === 'object') && (payload.isAxiosError === true);
  };

  var utils = utils$e;
  var bind = bind$2;
  var Axios = Axios_1;
  var mergeConfig = mergeConfig$2;
  var defaults = defaults_1;

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios(defaultConfig);
    var instance = bind(Axios.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  var axios$1 = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios$1.Axios = Axios;

  // Expose Cancel & CancelToken
  axios$1.Cancel = Cancel_1;
  axios$1.CancelToken = CancelToken_1;
  axios$1.isCancel = isCancel$1;
  axios$1.VERSION = data.version;

  // Expose all/spread
  axios$1.all = function all(promises) {
    return Promise.all(promises);
  };
  axios$1.spread = spread;

  // Expose isAxiosError
  axios$1.isAxiosError = isAxiosError;

  axios$2.exports = axios$1;

  // Allow use of default import syntax in TypeScript
  axios$2.exports.default = axios$1;

  var axios = axios$2.exports;

  var _setInterceptors = /*#__PURE__*/new WeakMap();

  var _errorHandlerInterceptor = /*#__PURE__*/new WeakMap();

  class HttpClientCreator {
    /**
     * Generates new axios client with interceptors
     *
     * @param {object} config - axios config
     * @param {function} errorHandler - custom error handler
     *
     */
    constructor({
      config: _config = {},
      errorHandler = () => {}
    }) {
      _classPrivateFieldInitSpec(this, _setInterceptors, {
        writable: true,
        value: httpClient => {
          httpClient.interceptors.request.use(_classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _startTimeInterceptor));
          httpClient.interceptors.request.use(_classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _loggerInterceptor));
          httpClient.interceptors.response.use(response => _classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _addDurationInterceptor).call(HttpClientCreator, response, 'success'), error => _classStaticPrivateFieldSpecGet(HttpClientCreator, HttpClientCreator, _addDurationInterceptor).call(HttpClientCreator, error, 'error'));
          httpClient.interceptors.request.use(config => config, _classPrivateFieldGet(this, _errorHandlerInterceptor));
          httpClient.interceptors.response.use(response => response, _classPrivateFieldGet(this, _errorHandlerInterceptor));
        }
      });

      _classPrivateFieldInitSpec(this, _errorHandlerInterceptor, {
        writable: true,
        value: error => {
          const errorFullInfo = error || {};
          const errorResponse = errorFullInfo.response || {};
          const errorData = { ...errorFullInfo,
            ...errorResponse.data,
            status: errorResponse.status
          };
          this.errorHandler(errorData);
          return Promise.reject(errorData);
        }
      });

      this.config = _config;
      this.axiosClient = null;
      this.errorHandler = errorHandler;
    }

    create() {
      this.axiosClient = axios.create(this.config);

      _classPrivateFieldGet(this, _setInterceptors).call(this, this.axiosClient);

      return this.axiosClient;
    }

  }

  var _startTimeInterceptor = {
    writable: true,
    value: config => ({ ...config,
      metadata: {
        startTime: new Date()
      }
    })
  };
  var _addDurationInterceptor = {
    writable: true,
    value: (resOrErr, type = 'success') => {
      resOrErr.config.metadata.endTime = new Date();
      resOrErr.duration = resOrErr.config.metadata.endTime - resOrErr.config.metadata.startTime;
      return type === 'success' ? resOrErr : Promise.reject(resOrErr);
    }
  };
  var _loggerInterceptor = {
    writable: true,
    value: config => config
  };

  var _httpClient$1 = /*#__PURE__*/new WeakMap();

  var _clientSecret = /*#__PURE__*/new WeakMap();

  var _data = /*#__PURE__*/new WeakMap();

  var _setSecrets = /*#__PURE__*/new WeakSet();

  class TokenProvider {
    /**
     * TokenProvider class
     *
     * @param {object} params - an object with all data necessary to init TokenProvider, required
     * @param {string} params.engineAuthEndpoint - authorization endpoint, required
     * @param {string} params.clientId - configuration clientId, not required, but then must be passed into "generateToken(secrets)" or "getToken(secrets)"
     * @param {string} params.clientSecret - configuration clientSecret, not required, but then must be passed into "generateToken(secrets)" or "getToken(secrets)"
     * @param {string} params.token - token, not required
     * @param {string} params.tokenType - tokenType, not required
     *
     */
    constructor({
      engineAuthEndpoint,
      clientId: _clientId,
      clientSecret: _clientSecret2,
      token,
      tokenType
    } = {}) {
      _classPrivateMethodInitSpec(this, _setSecrets);

      _classPrivateFieldInitSpec(this, _data, {
        get: _get_data,
        set: void 0
      });

      _classPrivateFieldInitSpec(this, _httpClient$1, {
        writable: true,
        value: void 0
      });

      _classPrivateFieldInitSpec(this, _clientSecret, {
        writable: true,
        value: void 0
      });

      const config = {
        baseURL: engineAuthEndpoint,
        json: true
      };

      _classStaticPrivateMethodGet(TokenProvider, TokenProvider, _validateTokenProvider).call(TokenProvider, engineAuthEndpoint);

      this.token = token;
      this.tokenType = tokenType;

      _classPrivateFieldSet(this, _httpClient$1, new HttpClientCreator({
        config
      }).create());

      this.clientId = _clientId;

      _classPrivateFieldSet(this, _clientSecret, _clientSecret2);
    }

    get isAuthorized() {
      const {
        tokenType,
        token
      } = this;
      return tokenType && token;
    }

    async getToken(secrets) {
      if (this.isAuthorized) {
        const {
          tokenType,
          token
        } = this;
        return {
          tokenType,
          token
        };
      } else {
        return this.generateToken(secrets);
      }
    }

    async generateToken(secrets) {
      if (!!secrets) _classPrivateMethodGet(this, _setSecrets, _setSecrets2).call(this, secrets);

      try {
        _classStaticPrivateMethodGet(TokenProvider, TokenProvider, _validateGenerateToken).call(TokenProvider, this);

        const response = await _classPrivateFieldGet(this, _httpClient$1).call(this, {
          method: 'post',
          data: _classPrivateFieldGet(this, _data)
        });
        const {
          access_token: token,
          expires_in: expiresIn,
          token_type: tokenType,
          scope
        } = (response === null || response === void 0 ? void 0 : response.data) || {};
        return {
          token,
          expiresIn,
          tokenType,
          scope
        };
      } catch (e) {
        return Promise.reject(e);
      }
    }

  }

  function _get_data() {
    return `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${_classPrivateFieldGet(this, _clientSecret)}`;
  }

  function _setSecrets2({
    clientSecret,
    clientId
  } = {}) {
    if (clientId) this.clientId = clientId;
    if (clientSecret) _classPrivateFieldSet(this, _clientSecret, clientSecret);
  }

  function _validateTokenProvider(engineAuthEndpoint) {
    const validator = new Validator([{
      rule: !!engineAuthEndpoint,
      message: `"engineAuthEndpoint" is required field, must be defined`
    }]);
    validator.validateWithThrowError();
  }

  function _validateGenerateToken(secrets) {
    const validator = new Validator([{
      rule: !!secrets.clientId,
      message: `"clientId" is required field, must be defined`
    }, {
      rule: !!_classPrivateFieldGet(secrets, _clientSecret),
      message: `"clientSecret" is required field, must be defined`
    }]);
    validator.validateWithThrowError();
  }

  var _httpClient = /*#__PURE__*/new WeakMap();

  var _tokenProvider = /*#__PURE__*/new WeakMap();

  var _returnOriginalResponse = /*#__PURE__*/new WeakMap();

  var _secondAttempt = /*#__PURE__*/new WeakMap();

  var _handleErrors = /*#__PURE__*/new WeakSet();

  class EngineClient {
    /**
     * EngineClient class
     *
     * @param {object} config - axios config, 'baseURL' property is required
     * @param {string} config.baseURL - httpClient baseURL, required
     * @param {function} errorHandler - custom error handler, not required
     * @param {boolean} returnOriginalResponse - if true, the original response will be returned by default, not required, default value: false
     * @param {TokenProvider} tokenProvider - external TokenProvider, not required if "authorizationParams" defined
     * @param {object} authorizationParams - params for build-in TokenProvider, not required if "tokenProvider" defined
     * @param {string} authorizationParams.engineAuthEndpoint - authorization endpoint, required
     * @param {string} authorizationParams.clientId - configuration clientId, not required, but then must be passed into "transform(requestsData, secrets)"
     * @param {string} authorizationParams.clientSecret - configuration clientSecret, not required, but then must be passed into "transform(requestsData, secrets)"
     * @param {string} authorizationParams.token - token, not required
     * @param {string} authorizationParams.tokenType - tokenType, not required
     *
     */
    constructor({
      config = {
        baseURL: '',
        json: true
      },
      returnOriginalResponse = false,
      errorHandler = () => {},
      tokenProvider,
      authorizationParams
    } = {}) {
      _classPrivateMethodInitSpec(this, _handleErrors);

      _classPrivateFieldInitSpec(this, _httpClient, {
        writable: true,
        value: void 0
      });

      _classPrivateFieldInitSpec(this, _tokenProvider, {
        writable: true,
        value: void 0
      });

      _classPrivateFieldInitSpec(this, _returnOriginalResponse, {
        writable: true,
        value: false
      });

      _classPrivateFieldInitSpec(this, _secondAttempt, {
        writable: true,
        value: false
      });

      _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateClient).call(EngineClient, {
        config,
        tokenProvider,
        authorizationParams
      });

      _classPrivateFieldSet(this, _returnOriginalResponse, returnOriginalResponse);

      _classPrivateFieldSet(this, _tokenProvider, tokenProvider instanceof TokenProvider ? tokenProvider : new TokenProvider(authorizationParams));

      _classPrivateFieldSet(this, _httpClient, new HttpClientCreator({
        config,
        errorHandler
      }).create());
    }

    async transformPostRequest(requestData, tokenInfo) {
      const headers = _classStaticPrivateMethodGet(EngineClient, EngineClient, _genHeaders).call(EngineClient, tokenInfo);

      return _classPrivateFieldGet(this, _httpClient).post('transform', requestData, {
        headers
      });
    }
    /**
     * Transform request data
     *
     * @param {object} requestData - request data object, built with RequestBuilder
     * @param {{returnOriginal: boolean}} config - optional config of transform
     * @param {object} config.secrets - configuration secrets
     * @param {string} config.secrets.clientId - configuration clientId
     * @param {string} config.secrets.clientSecret - configuration clientSecret
     * @param {boolean} config.returnOriginal - if true, the original response will be returned
     *
     */


    async transform(requestData, config = {}) {
      const {
        secrets = null,
        returnOriginal = false
      } = config || {};

      try {
        _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateRequest$1).call(EngineClient, requestData);

        const tokenInfo = await _classPrivateFieldGet(this, _tokenProvider).getToken(secrets);
        const originalResponse = await this.transformPostRequest(requestData, tokenInfo);

        _classPrivateFieldSet(this, _secondAttempt, false);

        return _classPrivateFieldGet(this, _returnOriginalResponse) || returnOriginal ? originalResponse : _classStaticPrivateMethodGet(EngineClient, EngineClient, _processResponse).call(EngineClient, originalResponse, requestData);
      } catch (error) {
        return _classPrivateMethodGet(this, _handleErrors, _handleErrors2).call(this, error, requestData);
      }
    }

  }

  function _handleErrors2(error, requestData) {
    if (error.status === 401 && !_classPrivateFieldGet(this, _secondAttempt)) {
      _classPrivateFieldSet(this, _secondAttempt, true);

      return this.transform(requestData);
    } else {
      _classPrivateFieldSet(this, _secondAttempt, false);

      return Promise.reject(error);
    }
  }

  function _validateClient({
    tokenProvider,
    config,
    authorizationParams
  }) {
    const validator = new Validator([{
      rule: !!(config !== null && config !== void 0 && config.baseURL),
      message: `"config.baseURL" is required field, must be defined`
    }, {
      rule: tokenProvider instanceof TokenProvider || !!(authorizationParams !== null && authorizationParams !== void 0 && authorizationParams.engineAuthEndpoint),
      message: `For external TokenProvider "tokenProvider" must be defined as instance of TokenProvider;
        For build-in TokenProvider "authorizationParams.engineAuthEndpoint" is required field.`
    }]);
    validator.validateWithThrowError();
  }

  function _validateReferences(requestData) {
    const {
      requests = [],
      processingContexts = [],
      rightsContexts = []
    } = requestData || {};

    const checkReference = (contexts, guid) => contexts.find(c => c.guid === guid);

    const isValid = requests.every(({
      processingContext,
      rightsContext
    }) => {
      return (typeof processingContext === 'undefined' || checkReference(processingContexts, processingContext)) && checkReference(rightsContexts, rightsContext);
    });
    const validator = new Validator([{
      rule: isValid,
      message: `"requestData" contains requests with invalid processing/rights context references`
    }]);
    validator.validateWithThrowError();
  }

  function _validateSchema(requestData) {
    const result = schemaValidator.validate(requestData, {
      $ref: '/RequestData'
    });
    const validator = new Validator([{
      rule: result.valid,
      message: `Invalid "requestData" format/structure`
    }]);
    validator.validateWithThrowError();
  }

  function _validateRequest$1(requestData) {
    _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateSchema).call(EngineClient, requestData);

    _classStaticPrivateMethodGet(EngineClient, EngineClient, _validateReferences).call(EngineClient, requestData);
  }

  function _genHeaders({
    tokenType,
    token
  }) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `${tokenType} ${token}`
    };
  }

  function _processResponse(originalResponse, requestData) {
    const {
      responses = []
    } = (originalResponse === null || originalResponse === void 0 ? void 0 : originalResponse.data) || {};
    const processedResponses = responses.map(response => {
      const request = requestData.requests.find(({
        guid
      }) => guid === response.request);
      return { ...response,
        instances: response.instances.map(({
          className,
          propertyName,
          value: transformed,
          error
        }, instanceIndex) => {
          const baseInstance = {
            className,
            propertyName,
            transformed,
            original: request.instances[instanceIndex].value
          };
          return !!error ? { ...baseInstance,
            error
          } : baseInstance;
        })
      };
    });
    return { ...originalResponse,
      data: {
        responses: processedResponses
      }
    };
  }

  var _getOrAddContextKey = /*#__PURE__*/new WeakSet();

  class RequestBuilder {
    constructor() {
      _classPrivateMethodInitSpec(this, _getOrAddContextKey);

      this.rightsContextsDictionary = {};
      this.processingContextsDictionary = {};
      this.requests = [];
    }

    get rightsContexts() {
      return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildContextsStructure).call(RequestBuilder, this.rightsContextsDictionary);
    }

    get processingContexts() {
      return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildContextsStructure).call(RequestBuilder, this.processingContextsDictionary);
    }
    /**
     * Generates a Request
     *
     * @param {object[]} instances - Array of instances: [{className: 'className', propertyName: 'propertyName', value: 'value', dependencies(optional): {name: 'value'}}]
     * @param {object} rightsContext - Object of rightsContext with evidences: {evidences: {name: 'value'}}]
     * @param {object|undefined} processingContext - Object of processingContext with evidences: {evidences: {name: 'value'}}]
     *
     */


    addRequest({
      instances,
      rightsContext,
      processingContext
    }) {
      _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateRequest).call(RequestBuilder, {
        instances,
        rightsContext,
        processingContext
      });

      const rightsContextKey = _classPrivateMethodGet(this, _getOrAddContextKey, _getOrAddContextKey2).call(this, 'rights', rightsContext);

      const processingContextKey = processingContext ? _classPrivateMethodGet(this, _getOrAddContextKey, _getOrAddContextKey2).call(this, 'processing', processingContext) : undefined;

      const processedInstances = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _processInstances).call(RequestBuilder, instances);

      const existingRequest = this.requests.find(r => {
        return r.rightsContext === rightsContextKey && r.processingContext === processingContextKey;
      });

      if (!existingRequest) {
        this.requests.push({
          guid: uuid.v4(),
          rightsContext: rightsContextKey,
          processingContext: processingContextKey,
          instances: processedInstances
        });
      } else {
        existingRequest.instances = [...existingRequest.instances, ...processedInstances];
      }

      return this;
    }

    build() {
      _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateBuild).call(RequestBuilder, this);

      const {
        rightsContexts,
        processingContexts,
        requests
      } = this;
      return {
        rightsContexts,
        processingContexts,
        requests
      };
    }

  }

  function _getOrAddContextKey2(type, context) {
    const processedEvidences = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _processEvidences).call(RequestBuilder, type, context === null || context === void 0 ? void 0 : context.evidences);

    const contexts = this[`${type}ContextsDictionary`];
    const existingContext = Object.entries(contexts).find(([guid, evidences]) => deepEqual(processedEvidences, evidences));
    const guid = !existingContext ? uuid.v4() : existingContext[0];
    if (!existingContext) contexts[guid] = processedEvidences;
    return guid;
  }

  function _buildEvidencesStructure(evidences) {
    return makeArrayFromDictionary(evidences);
  }

  function _buildContextsStructure(contextsDictionary) {
    return Object.entries(contextsDictionary).reduce((acc, [guid, evidences]) => {
      return [...acc, {
        guid,
        evidences: _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _buildEvidencesStructure).call(RequestBuilder, evidences)
      }];
    }, []);
  }

  function _processEvidences(type, evidences) {
    if (Array.isArray(evidences) && evidences.length > 0) {
      return makeDictionary(evidences, 'name', 'value');
    } else if (isObject$1(evidences) && Object.keys(evidences).length > 0) {
      return evidences;
    } else {
      throw new Error(`Empty evidences or invalid evidences structure in "${type}Context"`);
    }
  }

  function _getDependencyContext({
    dependencyContext: context,
    evidences,
    dependencies
  }) {
    const trueContext = context || evidences || dependencies;

    if (!trueContext) {
      return null;
    } else if (Array.isArray(trueContext) && trueContext.length > 0) {
      return {
        evidences: trueContext
      };
    } else if (isObject$1(trueContext) && Object.keys(trueContext).length > 0) {
      if (!!trueContext.evidences && (Array.isArray(trueContext.evidences) || isObject$1(trueContext.evidences))) {
        return _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _getDependencyContext).call(RequestBuilder, trueContext);
      } else {
        return {
          evidences: makeArrayFromDictionary(trueContext)
        };
      }
    } else {
      return null;
    }
  }

  function _validateRequest(requestInputData) {
    const result = schemaValidator.validate(requestInputData, {
      $ref: '/RequestInputData'
    });
    const validator = new Validator([{
      rule: result.valid,
      message: `Invalid format/structure of input params`
    }]);
    validator.validateWithThrowError();
  }

  function _processInstances(instances) {
    _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _validateInstances).call(RequestBuilder, instances);

    return instances.filter(({
      value
    }) => typeof value !== 'undefined').map(instance => {
      const {
        className,
        propertyName,
        value
      } = instance;

      const dependencyContext = _classStaticPrivateMethodGet(RequestBuilder, RequestBuilder, _getDependencyContext).call(RequestBuilder, instance);

      const baseInstance = {
        className,
        propertyName,
        value
      };
      const instanceWithDependencyContext = { ...baseInstance,
        dependencyContext
      };
      return dependencyContext ? instanceWithDependencyContext : baseInstance;
    });
  }

  function _validateInstances(instances) {
    const validator = new Validator([{
      rule: instances.some(instance => RPSValue.validateValue(instance)),
      message: `Must be at least one valid instance object in "instances"`
    }]);
    validator.validateWithThrowError();
  }

  function _validateBuild({
    rightsContexts,
    requests
  }) {
    const validator = new Validator([{
      rule: requests.length > 0,
      message: `Use "addRequest" method for generating request`
    }, {
      rule: rightsContexts.length > 0,
      message: `"rightsContexts" is empty`
    }]);
    validator.validateWithThrowError();
  }

  exports.EngineClient = EngineClient;
  exports.RPSContext = RPSContext;
  exports.RPSEvidence = RPSEvidence;
  exports.RPSValue = RPSValue;
  exports.RequestBuilder = RequestBuilder;
  exports.TokenProvider = TokenProvider;
  exports.utils = utils$f;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
