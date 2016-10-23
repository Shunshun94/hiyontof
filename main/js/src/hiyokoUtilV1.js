// Written by @Shunshun94

var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.Exception = function(str){
	this.name = 'com.hiyoko.Exception';
	this.message  = str ? str : "";
};

/** 
  * URL のパラメータを取得する関数です。
  * @param {string} paranName     パラメータの名前です
  * @param {string} opt_defaultValue  パラメータが見つからなかった場合に返す値です。指定しない場合は空文字列が返ります。
  * @return {string}              パラメータの値を返します。見つからなかった場合は defaultValue が返ります。
  *
  * 動作説明
  * http://example.com/page.html?test=文字列&exam=もじれつ で実行した場合
  * getParam("test", "どううごくか") ⇒ 文字列
  * getParam("exam") ⇒ もじれつ
  * getParam("unknownParam", "存在しない場合") ⇒ 存在しない場合
  * getParam("unknownParam") ⇒ "" (空文字列)
  */
function getParam(paramName, opt_defaultValue){
   var defaultResult = "";
   if(opt_defaultValue !== undefined){ defaultResult = opt_defaultValue; }
   
   paramName = paramName + "=";
   var params = ((location.search).slice(1)).split("&");
   var paramLength = params.length;
   for(var i = 0; i < paramLength; i++){
      if(params[i].indexOf(paramName) == 0){
         return (params[i].split("="))[1];
      }
   }
   return defaultResult;
}

/** 
  * ランダムな文字列を作成する関数です。
  * @param {string} opt_prefix 返り値の先頭に付く接頭語です
  * @param {number} opt_length 生成される文字列の長さです。接頭語の長さは含まれません
  * @return {String}

  */
function rndString(opt_prefix, opt_length){
	var length = opt_length ? opt_length : 8;
	var randomString = opt_prefix? opt_prefix : '';
	var baseString ='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i=0; i<length; i++) {
		randomString += baseString.charAt( Math.floor( Math.random() * baseString.length));
	}
	return randomString;
}

/**
 * 複数の文字を一斉に置換します。
 * @param {String} expression 置換対象の文字列
 * @param {String} org 削除前の文字列
 * @param {String} dest 削除後の文字列
 * @returns {String} expression に含まれる org をすべて dest にした文字列
 */
function replaceAll(expression, org, dest){  
    return expression.split(org).join(dest);  
}  

/**
 * @param {String} 変換対象の文字列
 * @return {String} 引数に含まれる全角数字をすべて半角にした文字列
 */
function convertHalfChar(str){
	var list = ["０", "１" , "２", "３", "４",
	            "５", "６", "７", "８", "９"];
	for(i = 0; i < 10; i++) {
		str = replaceAll(str, list[i], i);
	}
	return str;
}

/**
 * @param {number} int
 * @return {String}
 */
function intToColor(int){
	if(int == -1){
		return "transparent";
	}
	return "#" + addStuffRight(int.toString(16), 6, "0");
};

/**
 * 
 * @param {String} base
 * @param {number} length
 * @param {String} opt_char
 */
function addStuffRight(base, length, opt_char){
	var char = opt_char ? opt_char : " ";
	return stringTimes(char, length - base.length) + base;
}

/**
 * 
 * @param {String} str
 * @param {number} time
 */
function stringTimes(str, time){
	var text = "";
	for(var i = 0; i < time; i++){
		text += str;
	}
	return text;
}

/**
 * 
 * @param {String} str
 * @param {String} prefix
 * @return {boolean}
 */
function startsWith(str, prefix){
	return str.startsWith(prefix);
}

/**
 * 
 * @param {Array} array
 * @param {function} start
 * @param {function} end
 * @param {function} func
 * @return {Array}
 */
function forEachDuring(array, start, end, func){
	var result = [];
	var i = 0;
	var l = array.length;
	while(! start(array[i], i, array) && i < l){
		i++;
	}
	i++;
	while(! end(array[i], i, array) && i < l){
		result.push(func(array[i], i, array));
		i++;
	}
	return result;
}

/**
 * 
 * @param {Array} array
 * @param {Function} groupBy
 * @return {Array.<Array>}
 */
function splitArray(array, groupBy) {
	var result = [[]];
	var groupId = 0;
	var length = array.length;
	for(var i = 0; i < length; i++){
		if(i !== 0 && groupBy(array[i], i, array)){
			groupId++;
			result.push([]);
		}
		result[groupId].push(array[i]);
	}
	return result;
}

function groupArray(array, groupBy) {
	var result = {};
	var length = array.length;
	for(var i = 0; i < length; i++) {
		groupId = groupBy(array[i], i, array);
		if(! result[groupId]) {
			result[groupId] = [];
		}
		result[groupId].push(array[i]);
	}
	return result;
}

/**
 * 
 * @param {Array} array
 * @param {Function} func
 */
function mapArray(array, func){
	var result = [];
	var length = array.length;
	for(var i = 0; i < length; i++) {
		result.push(func(array[i], i, array));
	}
	return result;
}

/**
 * 
 * @param {Array.<T>} array
 * @param {Function} func
 * @param {T} opt_init
 * @return {T}
 */
function foldArray(array, func, opt_init) {
	if(array.length === 0){return {};}
	var start = opt_init ? 0 : 1;
	var result = opt_init ? opt_init : array[0];
	var length = array.length;
	for(var i = start; i < length; i++) {
		result = func(result, array[i], i, array);
	}
	return result;
}

/**
 * 
 * @param {Array} A
 * @param {Array} B
 * @param {Function} func
 * @return {Array} 
 */
function mergeArray(A, B, func) {
	if(A.length !== B.length){
		throw new com.hiyoko.Exception('arguments of margeArray are not same length.');
	}
	var result = [];
	var length = A.length;
	for(var i = 0; i < length; i++){
		result.push(func(A[i], B[i]));
	}
	return result;
}

/**
 * 
 * @param {String} from
 * @param {Array.<String>} strs
 * @return {Boolean}
 */
function contains(from, strs){
	var length = strs.length;
	for(var i = 0; i < length; i++){
		if(from.indexOf(strs[i]) !== -1){
			return true;
		}
	}
	return false;
}

/**
 * @param {Number} unixTime
 * @returns {Date} date
 */
function unixTimeToDate(unixTime) {
	return new Date(unixTime * 1000);
}

/**
 * 
 * @param {Object} target
 * @param {string} opt_desc
 */
function rejectEmpty(target, opt_desc){
	var desc = opt_desc ? opt_desc : 'Inputed variable is ';
	if(typeof target === 'undefined'){
		throw new com.hiyoko.Exception(desc + ' (undefined)');
	}
	if(target === null){
		throw new com.hiyoko.Exception(desc + ' (null)');
	}
};

/**
 * 今後は以下に利用を差し替えていく
 */

/**
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp */) {
    "use strict";

    if (this == null) throw new TypeError();

    var t = Object(this),
        len = t.length >>> 0;

    if (typeof fun != "function") throw new TypeError();

    var res = [],
        thisp = arguments[1];

    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i]; // fun が this を変化させた場合に備えて
        if (fun.call(thisp, val, i, t)) res.push(val);
      }
    }

    return res;
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}