var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};

com.hiyoko.tofclient.SecretMessageVerify = function(tof, hashValue, opt_logger) {
	var prefixRegexp = /^\(シークレットメッセージ開示\)\n/;
	var suffixRegexp = new RegExp('\nダイジェスト値： ' + hashValue + '\n真正性検証する： .*$');
	var logger = opt_logger ? opt_logger : function(log){console.log(log);};
	
	this.verify = function(msgCand) {
		var msg = '';
		if(Boolean(msgCand.msg)) {
			msg = tof.fixChatMsg(msg).msg.replace(prefixRegexp, '').replace(suffixRegexp, '');;
		} else {
			msg = msgCand.replace(prefixRegexp, '').replace(suffixRegexp, '');;
		}
		logger("HASH VALUE  = " + hashValue);
		logger("BASE VALUE  = " + msg);
		logger("HASHED B.V. = " + CryptoJS.SHA256(msg));
		
		return CryptoJS.SHA256(msg) === hashValue;
	};
	
	this.isVerifyTarget = function(msgCand) {
		var msg = '';
		if(Boolean(msgCand.msg)) {
			msg = tof.fixChatMsg(msg).msg;
		} else {
			msg = msgCand;
		}
		
		return prefixRegexp.test(msg) && suffixRegexp.test(msg);
	};
};