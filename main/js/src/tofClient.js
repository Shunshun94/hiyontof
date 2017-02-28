var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tof = function(urlInput) {
	var url  = com.hiyoko.tof.urlNomalizer(urlInput);
	this.getRoom = function(room, pass, callback){
		return new com.hiyoko.tof.room(url, room, pass, callback);
	};

	this.getBusyInfo = function(callback){
		var sendMsg = "webif=getBusyInfo";
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){callback(result);});
	};

	this.getServerInfo = function(callback, opt_diceActive, opt_cardActive){
		var sendMsg = "webif=getServerInfo";
		if(opt_diceActive){
			sendMsg += "&dice=" + opt_diceActive;
		}
		if(opt_cardActive){
			sendMsg += "&card=" + opt_cardActive;
		}
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){callback(result);});
	};

	this.getRoomList = function(callback, opt_roomfirst, opt_roomlast){
		var sendMsg = "webif=getRoomList";
		if(opt_roomfirst){
			sendMsg += "&minRoom=" + opt_roomfirst;
		}
		if(opt_roomlast){
			sendMsg += "&maxRoom=" + opt_roomlast;
		}
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){callback(result);});
	};
};
com.hiyoko.tof.urlNomalizer = function(url) {
	var swf = "DodontoF.swf";
	var rb = "DodontoFServer.rb?";
	
	if(! startsWith(url, 'https://') && ! startsWith(url, 'http://')){
		url = 'http://' + url;
	}
	
	if(url.indexOf(rb) === url.length - rb.length) {
		// DodontoF/DodontoFServer.rb?
		return url;
	}
	if(url.slice(-3) === ".rb") {
		// DodontoF/DodontoFServer.rb
		return url + "?";
	}
	if(url.indexOf(swf) === url.length - swf.length ) {
		// DodontoF/DodontoF.swf
		return url.replace(swf, rb);
	}
	if(url.slice(-1) === "/") {
		// DodontoF/DodontoF.swf
		return url + rb;
	}
	if(url.indexOf(swf + '?') !== -1) {
		// DodontoF/DodontoF.swf?loginInfo
		return url.split(swf)[0] + rb;
	}
	// DodontoF
	return url + "/" + rb;
};

com.hiyoko.tof.room = function(urlInput, roomInput, passInput, callback){
	var me = this;
	var url  = com.hiyoko.tof.urlNomalizer(urlInput);
	var room = roomInput;
	var pass = passInput;
	var game;
	var name;
	var tabs;
	var counters;
	var outerImage;
	var visitable = false;
	var members = [];
	var userId;

	this.toString = function(){
		return name + " room No. " + room;
	};

	this.setStatus = function(response){
		game = response.game;
		name = response.roomName;
		tabs = response.chatTab;
		counters = response.counter;
		visitable = response.canVisit;
		outerImage = response.outerImage;
	};

	this.getStatus = function(){
		return {
			url:url, room:room, pass:pass, game:game, name:name, tabs:tabs,
			counters:counters, members: members, outerImage: outerImage};
	}

	this.setGame = function(gameInput){
		game = gameInput;
	}
	
	this.changeRoomName = function(newName, opt_callback) {
		var sendMsg = url + "webif=setRoomInfo&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		sendMsg += '&roomName=' + newName;
		
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			statusCode:{
				105:function(result){alert('どどんとふサーバの確認に失敗しました。URL を再度確認してください。');}
			},
			dataType:'jsonp'}
		).done(function(result){
			name = newName;
			if(opt_callback) {
				opt_callback(result);
			}
		});
	};
	
	this.isVisitor = function(callback) {
		var sendMsg = url + "webif=setRoomInfo&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			statusCode:{
				105:function(result){alert('どどんとふサーバの確認に失敗しました。URL を再度確認してください。');}
			},
			dataType:'jsonp'}
		).done(function(result){
			if(result.result === 'OK') {
				callback(false);
			} else {
				callback(true);
			}
		});
		
	};
	
	this.getServerVersion = function(callback) {
		var sendMsg = url + "webif=getBusyInfo";
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			statusCode:{
				105:function(result){alert('どどんとふサーバの確認に失敗しました。URL を再度確認してください。');}
			},
			dataType:'jsonp'}
		).done(function(result){
			var version = result.version.match(/Ver\.(\d+)\.(\d+)\.(\d+)/);
			var result = {
				major: Number(version[1]),
				minor: Number(version[2]),
				patch: Number(version[3]),
				string: version[0]
			};
			result.number = result.major * 100000 + result.minor * 100 + result.patch;
			
			callback(result);
		});		
	};

	this.getRoomInfo = function(callback, opt_failCallBack){
		var sendMsg = url + "webif=getRoomInfo&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			statusCode:{
				105:function(result){alert('どどんとふサーバの確認に失敗しました。URL を再度確認してください。');}
			},
			dataType:'jsonp'}
		).done(function(result){
			if(result.result === "passwordMismatch") {
				if(opt_failCallBack){
					opt_failCallBack(result);
				} else {
					(new com.hiyoko.tof(url)).getRoomList(function(r){
						var targetRoom = r.playRoomStates[Number(room)];
						alert("入室パスワードが違います。\nパスワードまたは、部屋番号が正しいか\n再確認してください\n\n＊＊部屋情報＊＊\n"+
								  "部屋名：" + targetRoom.playRoomName + "\n" +
								  "ダイス：" + targetRoom.gameType + "\n" +
								  "部屋No：" + targetRoom.index);
					});

				}
				return;
			}
			if(result.result.indexOf("作成されていません") !== -1) {
				if(opt_failCallBack){
					opt_failCallBack(result);
				} else {
					alert(result.result + "\n\n"+urlInput+" にパソコンからアクセスし、部屋を作成してください。")
				}
				return;
			}
			callback(result);
		}).fail(function(result){
			console.log(result);
			if(opt_failCallBack){
				opt_failCallBack(result);
			} else {
				alert("どどんとふへの接続に失敗しました。\nURL を再度ご確認ください");
			}
		});
	};
	
	this.moveCharacter = function(characterName, x, y, opt_callback){
		var sendMsg = url + "webif=changeCharacter&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		sendMsg += "&targetName=" + characterName;
		sendMsg += "&x=" + x + "&y=" + y;
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){if(opt_callback){opt_callback(result);}});
	};

	this.sendMessage = function(callback, name, msg, color, targetTab, botName ){
		var sendMsg = "webif=talk&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		sendMsg += "&name=" + encodeURIComponent(name);
		sendMsg += "&message=" + encodeURIComponent(msg);
		if(Boolean(color) && color[0] === "#"){color = color.slice(1);}
		sendMsg += "&color=" + color;
		if(botName){
			sendMsg += "&bot=" + encodeURIComponent(botName);
		}else if(game){
			sendMsg += "&bot=" + encodeURIComponent(game);
		}
		if(targetTab){
			sendMsg += "&channel="+targetTab;
		}

		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);});	
	};
	
	this.setAlarm = function(params) {
		var sec = params.sec;
		if( ! $.isNumeric(sec)){
			console.error('setAlarm requires numeber as sec. Ex. dotonfotRoomClient.setAlarm({sec:8, name:"myName"});');
			return;
		}
		
		var callback = params.callback || function(){};
		var name = params.name || '';
		var msg = params.msg || '';
		var color = params.color || '000000';
		
		this.sendMessage(callback, name, '[アラーム発生：（全員）]:./sound/alarm.mp3:'+sec+'秒後\n' + msg, color);
	};

	this.fixChatMsg = function(chatMsg){
		var VOTES_ANSWERS = ["",
                            "賛成",
                            "反対",
                            "",
                            "READY"];
		
		var parseCommand = function(msg, header) {
			return JSON.parse(msg.replace("\n", "").replace(header, "").replace(/}.* : /, "}"));
		};

		var parseVoteAnswer = function(msg) {
			// parseCommand で置換する
			var value = JSON.parse(msg.replace("\n", "").replace("###vote_replay_readyOK###", "").replace(/}.* : /, "}"));
			return VOTES_ANSWERS[value.voteReplay];
		};

		var parseVoteRequest = function(msg) {
			try{
				// parseCommand で置換する
				var value = JSON.parse(msg.replace("\n", "").replace("###vote###", "").replace(/}.* : /, "}"));
			}catch(e){
				return {message:"無効な質問", ready:true};
			}
			var text = value.question;
			if(value.isCallTheRoll){
				text = "準備できたらクリック";		
			}
			return {message:text, ready:value.isCallTheRoll};
		};
		
		var message;
		var vote = false;
		var ask = false;
		var ready = false;
		var tab = chatMsg[1].channel;

		// TODO ここのコードが最高にダサい。直す
		if(chatMsg[1].message.indexOf("###CutInCommand:rollVisualDice###") !== -1){
			message = JSON.parse(chatMsg[1].message.replace("###CutInCommand:rollVisualDice###", "")).chatMessage;
		}else{
			message = chatMsg[1].message;
		}
		if(startsWith(message, "###vote_replay_readyOK###")){
			message = parseVoteAnswer(message);
			vote = true;
			tab = 0;
		}
		if(startsWith(message, "###vote###")){
			var parsedMsg = parseVoteRequest(message);
			vote = true;
			ask = true;
			message = parsedMsg.message;
			ready = parsedMsg.ready;
			tab = 0;
		}

		return ({
			time:chatMsg[0],
			msg:message,
			color:chatMsg[1].color,
			name:chatMsg[1].senderName,
			tab:tab,
			isVote: vote,
			isAsk: ask,
			isReady: ready
		});
	};

	this.getMessage = function(callback, opt_sinceUnixTime, opt_failCallBack){
		var sinceUnixTime = opt_sinceUnixTime || 0;
		var sendMsg = "webif=chat&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}

		sendMsg += "&time=" + sinceUnixTime;

		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);}
		).fail(function(result){
			console.log(result);
			if(opt_failCallBack){
				opt_failCallBack(result);
			} else {
				alert(result.statusText);
			}
		});
	};

	this.getServerInfo = function(callback, opt_diceActive, opt_cardActive){
		var sendMsg = "webif=getServerInfo";
		if(opt_diceActive){
			sendMsg += "&dice=" + opt_diceActive;
		}
		if(opt_cardActive){
			sendMsg += "&card=" + opt_cardActive;
		}
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);});
	};

	this.getCharacterBuilder = function(name){
		var sendMsg = url + "&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		return new com.hiyoko.tof.room.CharacterBuilder(sendMsg, name, counters);
	};
	
	this.generateCharacterFromResult = function(cdata) {
		var counter = [];
		for(key in cdata.counters){
			counter.push({
				name: key,
				value:cdata.counters[key]
			});
		}
		
		var roomUrl = url + "&room="+room;
		if(pass != ""){
			roomUrl += "&password=" + pass;
		}
		
		return new com.hiyoko.tof.room.Character(cdata.name, roomUrl, counter, cdata.initiative, cdata.info);
	};

	this.getRefresh = function(callback, characters, map, time, effects, roomInfo, chat, chatLastTime, opt_failCallBack){
		var sendMsg = "webif=refresh&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		if(characters){
			sendMsg += "&characters=0";
		}
		if(map){
			sendMsg += "&map=0";
		}
		if(time){
			sendMsg += "&time=0";
		}
		if(effects){
			sendMsg += "&effects=0";
		}
		if(roomInfo){
			sendMsg+= "&roomInfo=0";
		}
		if(chat){
			sendMsg += "&chat=0"
		}
		if(chatLastTime){
			sendMsg += "&chatLastTime=" + chatLastTime;
		}

		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);}
		).fail(function(result){
			console.log(result);
			if(opt_failCallBack){
				opt_failCallBack(result);
			} else {
				alert(result.statusText);
			}
		});
	};

	this.appendMemo = function(content, callback){
		var sendMsg = "webif=addMemo&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		sendMsg += "&message=" + encodeURIComponent(content);
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);});
	};
	
	this.changeMemo = function(content, target_id, opt_callback){
		var sendMsg = "webif=changeMemo&room="+room;
		if(pass != ""){
			sendMsg += "&password="+pass;
		}
		sendMsg += "&message=" + encodeURIComponent(content);
		sendMsg += "&targetId=" + target_id;
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){
			if(result.result !== "OK"){
				throw new com.hiyoko.tof.Exception(result.result);
			}
			if(opt_callback){callback(result);}});
	};
	
	this.getLoginInfo = function(callback) {
		var sendMsg = "webif=getLoginInfo&room=" + room;
		if(pass != ""){
			sendMsg += "&password=" + pass;
		}
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){callback(result);});	
	};
	
	this.getLoginUserInfo = function(callback, name){
		var sendMsg = "webif=getLoginUserInfo&room=" + room;
		if(pass != ""){
			sendMsg += "&password=" + pass;
		}
		sendMsg += "&uniqueId=" + userId;
		sendMsg += "&name=" + name;
		sendMsg = url + sendMsg;
		$.ajax({
			type:'get',
			url: sendMsg,
			async:false,
			dataType:'jsonp'}
		).done(function(result){
					members = result;
					callback(result);
				});
	};

	this.getRoomInfo(function(result){
		me.setStatus(result);
		if(callback){callback(me);};
	});
	this.getLoginInfo(function(result){
		userId = result.uniqueId;
	});
};

com.hiyoko.tof.room.CharacterBuilder = function(getRoomUrl, getName, counters){
	var roomUrl = getRoomUrl;
	var name = getName;
	var initiative = 0;
	var counters = mapArray(counters, function(counter){ return {name:counter, value:"0"}});
	var info = "";
	var size = 1;
	var x = 0;
	var y = 0;
	var rotation = 0;
	var image = ""; // optional
	var statusAlias = [];
	var dogTag = ""; // optional
	var draggable = "true";
	var isHide = "false";
	var url = "";

	this.name = function(input){
		name = input;
		return this;
	};

	this.initiative = function(input){
		initiative = input;
		return this;
	};

	this.counter = function(input_name, input_value){
		$.each(counters, function(ind, pair){
			if(pair.name === input_name){
				pair.value = input_value;
			}
		});
		return this;
	};

	this.info = function(input){
		info = input;
		return this;
	};

	this.x = function(input){
		x = input;
		return this;
	};

	this.y = function(input){
		y = input;
		return this;
	};

	this.size = function(input){
		size = input;
		return this;
	}

	this.rotation = function(input){
		rotation = input;
		return this;
	};

	this.image = function(input){
		image = input;
		return this;
	};

	this.statusAlias = function(input_name, input_alias){
		statusAlias.push({name:input_name, value:input_alias});
		return this;
	};

	this.unDraggable = function(){
		draggable = "false";
		return this;
	};

	this.hide = function(){
		isHide = "true";
		return this;
	};

	this.url = function(input){
		url = input;
		return this;
	};

	this.build = function(opt_callback){
		var sendMsg = roomUrl + "&webif=addCharacter";
		sendMsg += "&name=" + name;
		sendMsg += "&counters=" +
		mapArray(counters, function(counter){return counter.name + ":" + counter.value}).join(",");
		sendMsg += "&initiative=" + initiative;
		sendMsg += "&info=" + info;
		sendMsg += "&x=" + x;
		sendMsg += "&y=" + y;

		if(image){
			sendMsg += "&image=" + image;
		}
		sendMsg += "&size=" + size;
		sendMsg += "&url=" + url;
		sendMsg += "&rotation" + rotation;
		sendMsg += "&statusAlias=" +
		mapArray(statusAlias, function(counter){return counter.name + ":" + counter.value}).join(",");
		if(dogTag !== ""){
			sendMsg += "&dogTag=" + dogTag;
		}
		sendMsg += "&draggable=" + draggable;
		sendMsg += "&isHide=" + isHide;
		sendMsg += "&url=" + url;
		
		var resultCharacter = new com.hiyoko.tof.room.Character(name, roomUrl, counters, initiative, info);
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){
			if(result.result !== "OK"){
				throw new com.hiyoko.tof.Exception(result.result);
			}
			if(opt_callback){
				opt_callback(resultCharacter);
			}
		});
		return 
	};
};

com.hiyoko.tof.room.Character = function(targetName_input, url_input, counters_input, _initiative, _info){
	var targetName = targetName_input;
	var url = url_input;
	var counters = counters_input;
	var initiative = _initiative;
	var info = _info;

	this.getName = function(){return targetName;};

	this.reload = function(opt_callback) {
		var sendMsg = url + "&webif=refresh&characters=0";
		$.ajax({
			type: 'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){
			$.each(result.characters, function(ind, charCandidate) {
				if(charCandidate.type === "characterData" && charCandidate.name === targetName) {
					counters = [];
					for(key in charCandidate.counters){
						counters.push({
							name: key,
							value:charCandidate.counters[key]
						});
					}
					if(opt_callback) {
						opt_callback(charCandidate);
					}
				}
			});
		});
	};
	
	this.move = function(x, y, opt_callback){
		var sendMsg = url + "&webif=changeCharacter";
		sendMsg += "&targetName=" + targetName;
		sendMsg += "&x=" + x + "&y=" + y;
		$.ajax({
			type:'get',
			url: sendMsg,
			dataType:'jsonp'}
		).done(function(result){if(opt_callback){opt_callback(result);}});
	};
	
	this.getValue = function(name) {
		if(['initiative', 'イニシアティブ', 'イニシアチブ'].includes(name)) {
			return initiative;
		}
		if(['info', 'その他'].includes(name)) {
			return info;
		}
		
		for(var i = 0; i < counters.length; i++) {
			if(counters[i].name === name){
				return counters[i].value;
			}
		}
	};

	this.setValue = function(name, value, opt_callback){
		this.reload(function(dum) {
			var sendMsg = url + "&webif=changeCharacter";
			sendMsg += "&targetName=" + targetName;


			if(name === "initiative") {
				sendMsg += "&initiative=" + value;
				initiative = value;
			} else if(name ==="info") {
				sendMsg += "&info=" + value;
				info = value;
			} else if(name === 'image') {
				sendMsg += '&image=' + value;
			}else {
				$.each(counters, function(ind, pair){
					if(pair.name === name){
						counters[ind].value = value;
					}
				});
				sendMsg += "&counters=" + 
				mapArray(counters, function(counter){return counter.name + ":" + counter.value}).join(",");
			}
			$.ajax({
				type:'get',
				url: sendMsg,
				dataType:'jsonp'}
			).done(function(result){
				if(result.result !== "OK"){
					console.log(result.result);
					throw new com.hiyoko.tof.Exception(result.result);
				} else {
					if(opt_callback){
						opt_callback(counters)
					}
				}
			});
		});
	};
};

com.hiyoko.tof.Exception = function(str) {
	this.name = "com.hiyoko.tof.Exception";
	this.message = str ? str : '';
};

com.hiyoko.tof.parseResourceUrl = function(picUrl, urlBase){
	if(startsWith(picUrl, "http")){
		return picUrl;
	}
	if(startsWith(picUrl, "../") || startsWith(picUrl, "/")){
		return urlBase.replace("DodontoFServer.rb?", picUrl);				
	}
	if(startsWith(picUrl, "./")){
		return urlBase.replace("DodontoFServer.rb?", picUrl.substring(1));		
	}
	return urlBase.replace("DodontoFServer.rb?", "/" + picUrl);
};

com.hiyoko.tof.getImageJsonUrl = function(url, opt_crossDomain) {
	var host = location.host;
	var urlParsed = new URL(url);
	if((urlParsed.host !== host) && (! opt_crossDomain)) {
		return false;
	}
	
	if(com.hiyoko.tof.IMAGEJSONURL) {
		return com.hiyoko.tof.IMAGEJSONURL;
	}
	
	if(url.endsWith('/DodontoF/DodontoFServer.rb?')) {
		return url.replace('/DodontoF/DodontoFServer.rb?', '/imageUploadSpace/imageInfo.json');
	}
	
	var officialRegExc = /\/DodontoF(.*)\/DodontoFServer.rb\?$/;
	if(officialRegExc.test(url)) {
		var execResult = officialRegExc.exec(url);
		return url.replace(execResult[0], '/imageUploadSpace' + execResult[1] + '/imageInfo.json');
	}
	
	if(url === urlParsed.origin + '/DodontoFServer.rb?') {
		return urlParsed.origin + '/imageUploadSpace/imageInfo.json';
	}
	
	return false;
};
