var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};

/**
 * Chat Main Part
 */
com.hiyoko.tofclient.Chat = function(tof, interval, serverInfo, options){
	//TODO ID の直接指定を減らしていく
	var $html = options.html || $("#tofChat-chat");
	var id = $html.attr('id');
	com.hiyoko.tofclient.Chat.Util.TofURL = tof.getStatus().url;
	var isAsking = false;
	var isVisitor = Boolean(options.visitor);

	var subMenu = null;
	var status = null;
	var display = null;
	var inputArea = null;
	
	function isActive() {
		return $html.css('display') !== 'none';
	}
	
	function buildChildComponents(serverInfo) {
		subMenu = new com.hiyoko.tofclient.Chat.SubMenu($("#" + id + "-submenu"), tof.getStatus());
		status = new com.hiyoko.tofclient.Chat.Status($("#tofChat-connection-status"));
		display = new com.hiyoko.tofclient.Chat.Display($("#" + id + "-log"));
		inputArea = new com.hiyoko.tofclient.Chat.InputArea($("#tofChat-inputArea"),
				{	talk:$("#tofChat-input"), 
					simple:$("#" + id + "-input-simple"),
					history:$("#" + id + "-input-history"),
					secret:$("#" + id + "-input-secret"),
					chatparette:$("#" + id + "-input-chatparette")},
				isVisitor,
				serverInfo, tof.getStatus());
		
		var isBgmActivate = Boolean(Number(localStorage.getItem("com.hiyoko.tofclient.Chat.Display.bgm")));
		display.isLoadBGM = isBgmActivate;
		subMenu.updateItem('bgmMode', isBgmActivate);
		
		var isStandPicActiveLS = localStorage.getItem("com.hiyoko.tofclient.Chat.Display.standPic");
		var isStandPicActive = Boolean(Number(isStandPicActiveLS) || isStandPicActiveLS === null);
		display.isStandPic = isStandPicActive;
		subMenu.updateItem('standPicMode', isStandPicActive);
		
		var isTabColoredLS = localStorage.getItem("com.hiyoko.tofclient.Chat.Display.ColoredTab");
		var isTabColored = Boolean(Number(isTabColoredLS) || isTabColoredLS === null);
		display.isTabColored = isTabColored;
		subMenu.updateItem('tabColoredMode', isTabColored);
	}
	
	function nameSuiter(name) {
		var newName = name ? name : 'ななしのひよこ';
		return isVisitor ? newName + '@見学' : newName;
	}

	function initializeDisplay(serverInfo){
		var status = tof.getStatus();
		$("#tofChat-Title-roomName").text('部屋名：' + (isVisitor ? '【見学】' + status.name : status.name));
	}

	function eventBinds(serverInfo){
		var $inputArea = $("#tofChat-inputArea");
		
		$html.on("sendMessage", sendMsg);
		$inputArea.on("sendMessageEvent", sendMsgEvent);
		$inputArea.on("changeTab", function(e){
			display.activeTab = e.tab;
			display.reset();
		});
		
		$inputArea.on('sendSecretEvent', function(e){
			onSendSecretEvent(e);
		});

		$html.click(function(e){
			if($(e.target).attr("id") !== undefined && startsWith($(e.target).attr("id"), "tofChat-chat-submenu")){
				return;
			}
			subMenu.close();
		});

		$("#tofChat-input-get").click(function(){getMsg_("Getting...")});
		$("#tofChat-jump > p").click(jumpToBottom_);
		$(window).scroll(com.hiyoko.tofclient.Chat.Util.checkScroll_);

		var $submenu = $("#tofChat-chat-submenu");
		$submenu.on("requestMembersList", function(e){
			var str = "＊＊＊入室中の人＊＊＊"
				$.each(tof.getStatus().members, function(i, m){
					str += "\n- " + m.userName + ' さん';
				});
			alert(str);
		});
		
		// この辺の設定系、共通のクラス作ってそいつに任せた方が良いのでは?
		$submenu.on("changeDisplayMode", function(e){
			display.isShowAll = e.isShowAll;
			display.reset();
		});
		
		$submenu.on("changeBgmMode", function(e){
			display.isLoadBGM = e.isLoadBGM;
			localStorage.setItem("com.hiyoko.tofclient.Chat.Display.bgm", e.isLoadBGM ? 1 : 0);
		});
		
		$submenu.on("changeStandPic", function(e){
			display.isStandPic = e.isStandPic;
			localStorage.setItem("com.hiyoko.tofclient.Chat.Display.standPic", e.isStandPic ? 1 : 0);
		});
		
		$submenu.on("changeTabColor", function(e){
			display.is = e.isTabColored;
			localStorage.setItem("com.hiyoko.tofclient.Chat.Display.ColoredTab", e.isTabColored ? 1 : 0);
		});
		
		$submenu.on("sendAlarm", function(e){
			var timerCount = window.prompt("何秒後にアラームを鳴らしますか?", 60);
			tof.setAlarm({
				sec:timerCount,
				name:nameSuiter(inputArea.getName())
			});
		});
		
		$(window).scroll(function(e){
			if($(window).scrollTop() > 40){
				$submenu.css("top", "50px");
			} else {
				$submenu.css("top", (90-$(window).scrollTop())+"px");
			}
		});  
		
		function preventGoOut(e){
			return '退室してよろしいですか?';
		}
		
		$(window).on('beforeunload', preventGoOut);
		
		$('#tofChat-go-out').click(function(e){
			if(window.confirm('退室してよろしいですか?')) {
				var name = inputArea.getName();
				sendMsg({
					name: 'ひよんとふ',
					msg: '「' + name +'」がログアウトしました。',
					color: '00AA00'
				});
				$(window).off('beforeunload', preventGoOut);
				document.location = document.location.protocol + '//' +
				document.location.host +
				document.location.pathname;
			}
		});

		setAutoReload_();
	}
	
	function onSendSecretEvent(e) {
		tof.sendMessage(
				function(r){
					tof.getMessage(function(re) {
						var key = e.key;
						var msgs = re.chatMessageDataLog.reverse();
						var len = msgs.length;
						for(var i = 0; i < len; i++) {
							var msg = com.hiyoko.tofclient.Chat.Util.fixChatMsg(msgs[i]);
							if( msg.msg.indexOf(key) !== -1) {
								var hashValue = inputArea.stackSecret(msg, key);
								sendMsg({
									name: inputArea.getName(),
									msg: '非公開発言を送信しました\nダイジェスト値： ' + hashValue,
									color: inputArea.getColor()
								});
								return;
							}
						}
					});
				},
				nameSuiter(e.name), e.msg, e.color, e.tab, inputArea.getBot());
	}

	function sendMsg(e){
		if(! e.msg) {
			status.set("Empty msg isn't acceptable.");
			return "";
		}
		status.set("Sending...");
		tof.sendMessage(
				function(r){
					getMsg_("Sending...Done! Getting...")
				},
				nameSuiter(e.name || inputArea.getName()), e.msg,
				(e.color || inputArea.getColor()), e.tab,
				(e.bot || inputArea.getBot()));
	};

	function sendMsgEvent(e) {
		var requiredCountStr = window.prompt("何人に答えてもらいますか? (初期値: あなたを除く全員)", (tof.getStatus().members.length - 1));
		var requiredCount = Number(requiredCountStr);
		if(requiredCountStr === "" || requiredCountStr == null || requiredCount.toString() === "NaN" || requiredCount === 0) {
			alert("有効な値が入力されなかったため、キャンセルします");
			return;
		}
		if(requiredCount > tof.getStatus().members.length){
			alert("在卓人数より多いため、キャンセルします");
			return;
		}

		if(e.action === "question") {
			e.msg = '###vote###{"callerId":"nonId","question":"' + e.msg.replace(/"/g, '\\"') + '","isCallTheRoll":false,"requiredCount":'+requiredCount+'}';
		}
		if(e.action === "callroll") {
			e.msg = '###vote###{"callerId":"nonId","question":"","isCallTheRoll":true,"requiredCount":'+requiredCount+'}';
		}
		sendMsg(e);
	};
	
	function getMsg_(msg){
		if(isAsking){return;}
		isAsking = true;
		status.set(msg || "Getting...");
		tof.getRefresh(getMsgs, display.isStandPic, false, false, display.isStandPic, false, true, display.lastTime, getMsgsFail);
	}

	function getMsgs(response){
		var tabs = tof.getStatus().tabs;
		display.append(response, tabs);
		status.add("Done!");
		isAsking = false;
	}

	function afterBeacon(response){
		subMenu.updateItem("members", {count:response.length})
	}

	function getMsgsFail(result){
		status.add("Please try again; " + result.statusText);
		isAsking = false;
	}

	function jumpToBottom_(e){
		try{
			// http://kachibito.net/snippets/footer-starter
			$('html,body').animate({scrollTop: $("#tofChat-version").offset().top},'slow');
		}catch(e){
			alert("ERROR @Shunshun94 にこの文字列 (ないし画面) を送ってください: " + e.stack);
		}
	}

	function setAutoReload_(){
		if(interval){
			window.setInterval(function(){if(com.hiyoko.tofclient.Chat.UpdateAllTime || isActive()){getMsg_();}}, interval);
		}
		if(! options.silent) {
			window.setInterval(function(){
				tof.getLoginUserInfo(afterBeacon, nameSuiter(inputArea.getName()));
			}, 12500);
		}
	}
	
	initializeDisplay(serverInfo);
	buildChildComponents(serverInfo);
	eventBinds(serverInfo);	
	var name = nameSuiter(inputArea.getName());
	if(! options.silent){
		sendMsg({
			name: 'ひよんとふ',
			msg: '「' + name +'」がひよんとふからログインしました。',
			color: '00AA00'
		});
	}
	getMsg_();
	tof.getLoginUserInfo(afterBeacon, nameSuiter(inputArea.getName()));
};

com.hiyoko.tofclient.Chat.UpdateAllTime = true;

/**
 * Chat Utility Part
 */
com.hiyoko.tofclient.Chat.Util = com.hiyoko.tofclient.Chat.Util || {};

com.hiyoko.tofclient.Chat.Util.TofURL;

com.hiyoko.tofclient.Chat.Util.colorChange = function(target){

};

com.hiyoko.tofclient.Chat.Util.VOTES_ANSWERS = ["",
                                                "賛成",
                                                "反対",
                                                "",
                                                "READY"];

com.hiyoko.tofclient.Chat.Util.parseVoteAnswer = function(msg) {
	var value = JSON.parse(msg.replace("\n", "").replace("###vote_replay_readyOK###", "").replace(/}.* : /, "}"));
	return com.hiyoko.tofclient.Chat.Util.VOTES_ANSWERS[value.voteReplay];
};

com.hiyoko.tofclient.Chat.Util.parseVoteRequest = function(msg) {
	try{
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

com.hiyoko.tofclient.Chat.Util.parseCommand = function(msg, header) {
	return JSON.parse(msg.replace("\n", "").replace(header, "").replace(/}.* : /, "}"));
};

com.hiyoko.tofclient.Chat.Util.fixChatMsg = function(chatMsg, store){
	var message;
	var vote = false;
	var ask = false;
	var ready = false;
	var cutin = false;
	var name;
	var status = '通常';
	var tab = chatMsg[1].channel;

	if(chatMsg[1].message.indexOf("###CutInCommand:rollVisualDice###") !== -1){
		message = JSON.parse(chatMsg[1].message.replace("###CutInCommand:rollVisualDice###", "")).chatMessage;
	}else{
		message = chatMsg[1].message;
	}
	
	if(startsWith(message, '###Language:secretDice###')) {
		message = 'シークレットダイスを振りました';
	}
	
	if(startsWith(message, '###CutInCommand:getDiceBotInfos###{}')) {
		message = 'ダイスボットを編集しました';
	}
	
	if(startsWith(message, "###vote_replay_readyOK###")){
		message = com.hiyoko.tofclient.Chat.Util.parseVoteAnswer(message);
		vote = true;
		tab = 0;
	}
	if(startsWith(message, "###vote###")){
		var parsedMsg = com.hiyoko.tofclient.Chat.Util.parseVoteRequest(message);
		vote = true;
		ask = true;
		message = parsedMsg.message;
		ready = parsedMsg.ready;
		tab = 0;
	}
	if(startsWith(message, '###CutInMovie###')) {
		var parsedMsg = com.hiyoko.tofclient.Chat.Util.parseCommand(message.replace(/\t/gm, '  '), '###CutInMovie###');
		
		message = parsedMsg.message;
		cutin = {
			bgm: parsedMsg.soundSource,
			loop: parsedMsg.isSoundLoop,
			pic: parsedMsg.source,
			volume: parsedMsg.volume
		};
	} else if(store) {
		cutin = store.getTailCutIn(message);
	}
	
	var TAIL_NAME_REGEXP_1 = /@([^ \f\n\r\t\v​\u00a0\u1680​\u180e\u2000-\u200a​\u2028\u2029​\u202f\u205f​\u3000\ufeff@]*)$/;
	
	var tailNameMatch_1 = TAIL_NAME_REGEXP_1.exec(message);
	if(tailNameMatch_1){
		try{
			var swapedName = chatMsg[1].senderName.split('\t');
			var swapedMsg = message;
			
			var TAIL_NAME_REGEXP_2 = new RegExp('@([^ \f\n\r\t\v​\u00a0\u1680​\u180e\u2000-\u200a​\u2028\u2029​\u202f\u205f​\u3000\ufeff@]*)@' + tailNameMatch_1[1] + '$');
			var tailNameMatch_2 = TAIL_NAME_REGEXP_2.exec(message);
			if(tailNameMatch_2){
				name = tailNameMatch_2[1].replace('@' + tailNameMatch_1[1], '');
				status = tailNameMatch_1[1];
				message = message.replace(tailNameMatch_2[0], '');
			} else {
				name = tailNameMatch_1[1];
				message = message.replace(tailNameMatch_1[0], '');
			}
			
			if(! Boolean(store.get(name))) {
				throw('Not name');
			}
			
		} catch(e) {
			var name_status = chatMsg[1].senderName.split('\t');
			name = name_status[0];
			status = name_status[1] ? name_status[1] : '通常';
			message = swapedMsg;
		}
	} else {
		var name_status = chatMsg[1].senderName.split('\t');
		name = name_status[0];
		status = name_status[1] ? name_status[1] : '通常';
	}
	
	

	return ({
		time:chatMsg[0],
		msg:message,
		color:chatMsg[1].color,
		name:name,
		status:status,
		tab:tab,
		isVote: vote,
		isAsk: ask,
		isReady: ready,
		isCutIn: cutin
	});
};

com.hiyoko.tofclient.Chat.Util.checkScroll_ = function(e){
	var scrollHeight = $(document).height();
	var scrollPosition = $(window).height() + $(window).scrollTop();
	if ( (scrollHeight - scrollPosition) / scrollHeight <= 0.02) {
		$("#tofChat-jump > p").hide();
	} else {
		$("#tofChat-jump > p").show();
	}
};

/**
 * Chat Display Part
 */
com.hiyoko.tofclient.Chat.Display = function($html){
	var self = this;
	var isAddTimeStamp = Boolean(getParam("time"));
	var id = $html.attr('id');
	var tabClass = id + '-tab';
	var store = new com.hiyoko.tofclient.Chat.Display.PicStore();
	var sound_updateLog = com.hiyoko.tofclient.Chat.Display.UpdatePushActive ? 
			new Audio("./sound/com-hiyoko-tofclient-chat-display-updateLog.mp3") :
			{play:function(){$html.trigger(new $.Event('com.hiyoko.tofclient.Chat.GetNewMessage',{}));}};
	
	this.lastTime = 0;
	this.isShowAll = true;
	this.isLoadBGM = false;
	this.isStandPic = false;
	this.isTabColored = false;
	this.activeTab = 0;
	
	this.loopBgmStop = function() {
		var $bgm = $('.' + id + '-cutin-bgm-loop-active');
		if($bgm.length) {
			$bgm[0].pause();
			$bgm.removeClass(id + '-cutin-bgm-loop-active');
		};
	};
	
	this.msgToDom = function(msg, tabs, noMainTabColored) {
		var $dom = $('<p></p>');
		$dom.addClass(id + '-log');
		$dom.addClass(tabClass + msg.tab);

		var $name;
		var $noMain = $();

		var $msg = $('<span></span>');
		$msg.text(msg.msg);
		$msg.html($msg.html()
				.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/img,
						function(url){return "<a href='"+url+"'>"+url+"</a>"})
				.replace(/\n/gm, '<br/>'));
		
		var msg_class = 'msg';
		if(msg.tab < 0 || msg.tab >= tabs.length) {
			return "";
		} else if(msg.tab === 0){
			$dom.css('color', '#'+msg.color);

			$name = $('<strong></strong>');
			$name.text(msg.name + ': ');

			if(msg.isReady) {
				msg_class = 'vote-button-ready';
			} else if(msg.isAsk) {
				$msg.append("<span class='vote-button-yes'>賛成</span><span class='vote-button-no'>反対</span>");
			} else if(msg.isVote) {
				msg_class = 'vote-msg';
			} else if(msg.isCutIn) {
				if(msg.isCutIn.bgm) {
					var $audio = self.isLoadBGM ? $('<audio class="' + id + '-cutin-bgm" controls>') : $('<span>（BGM 再生は現在無効です。名前入力欄右の MENU から有効にできます）</span>');
					$audio.attr('src', com.hiyoko.tof.parseResourceUrl(msg.isCutIn.bgm, com.hiyoko.tofclient.Chat.Util.TofURL));
					$audio.attr('volume', msg.isCutIn.volume);
					if(self.isLoadBGM && msg.isCutIn.loop) {
						$audio.attr('loop', '1');
						$audio.addClass(id + '-cutin-bgm-loop');
						
						$audio.on('play', function(e){
							self.loopBgmStop();
							$(e.target).addClass(id + '-cutin-bgm-loop-active');
						});
						
						$audio.on('pause', function(e){
							$(e.target).removeClass(id + '-cutin-bgm-loop-active');
						});
					}
					$msg.append($audio);
				}
				if(msg.isCutIn.pic) {
					var $pic = $('<span class="' + id + '-cutin-pic">カットイン画像を表示</span>');
					$pic.attr('title', com.hiyoko.tof.parseResourceUrl(msg.isCutIn.pic, com.hiyoko.tofclient.Chat.Util.TofURL));
					$msg.append($pic);
				}
			}
		} else {
			$dom.addClass('notmain');
			$dom.css('color', noMainTabColored(msg));
			
			$name = $('<span></span>');
			$name.text(msg.name);

			$noMain = $('<span></span>');
			$noMain.addClass('tabname');
			$noMain.text('[' + tabs[msg.tab] + ']： ');
			$noMain.append($('<br/>'));
			$name.append($noMain);
		}

		$name.addClass('name');
		$name.addClass(id + '-log-name');
		
		if(self.isStandPic) {
			$msg.css('margin-left', '5px');
			$name.addClass(id + '-log-name-pic-inner');
			var $nameContain = $name;
			
			$name = $('<div></div>');
			$name.append($nameContain);
			$name.css("background-image",
					"url('" + (store.get(msg.name, msg.status) || './image/noimage.png') + "')");
			$name.addClass(id + '-log-name-pic');
		}
		
		$msg.addClass(msg_class);

		$dom.append($name);
		$dom.append($msg);

		if(isAddTimeStamp){
			var date = unixTimeToDate(msg.time);
			var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
			$dom.append($("<br/><small>["+ time +"]</small>"));
		};

		return $dom;
	};

	this.append = function(responseFromTof, opt_tabs){
		var tabs = opt_tabs || ["", "雑談"];
		
		if(self.isStandPic){
			store.stack(responseFromTof);
		}
		
		if(responseFromTof.chatMessageDataLog.length !== 0){
			var modifiedTofResponse = mapArray(responseFromTof.chatMessageDataLog, function(l){return com.hiyoko.tofclient.Chat.Util.fixChatMsg(l, store);});
			var $dom = $('<div></div>');
			$dom.addClass('tofChat-chat-log-msgContainer');
			var noMainTabColored = self.isTabColored ? function(m){return '#'+m.color} : function(m){return 'black';};
			$.each(modifiedTofResponse, function(index, msg){
				$dom.append(self.msgToDom(msg, tabs, noMainTabColored));
				this.lastTime = msg.time;
			}.bind(this));
			$html.append($dom);
			sound_updateLog.play();
		}
		this.reset();
		com.hiyoko.tofclient.Chat.Util.checkScroll_(null);
	};
	
	function adjustCutInPic(pic) {
		var win = {
				width: $(window).width(),
				height: $(window).height()
		};
		
		if(win.width >= pic.width && win.height >= pic.height) {
			return pic;
		};
		
		var rate = {
				width: win.width/pic.width,
				height: win.height/pic.height
		};
		
		if(rate.width < rate.height) {
			return {
				width: win.width,
				height: pic.height * rate.width
			};
		} else {
			return {
				width: pic.width * rate.height,
				height: win.height
			};
		}
	}
	

	this.eventBind_ = function(){
		var msgs = {
				'vote-button-ready':"###vote_replay_readyOK###{\"isCallTheRoll\":true,\"voteReplay\":4}",
				'vote-button-yes':"###vote_replay_readyOK###{\"isCallTheRoll\":false,\"voteReplay\":1}",
				'vote-button-no':"###vote_replay_readyOK###{\"isCallTheRoll\":false,\"voteReplay\":2}"
		};


		$html.click(function(e){
			var classStr = ($(e.target).attr('class'));
			var msg = msgs[classStr];
			if(msg){
				$html.trigger(new $.Event("sendMessage", {
					msg: msgs[classStr],
					color: $("#tofChat-input-color").val(),
					name: $("#tofChat-input-name").val(),
					tab: 0,
					bot: false
				}));
				return;
			}
			
			$('#' + id + '-cutin').hide();
			$('#' + id + '-cutin-pic').hide();
			
			if(classStr === id + '-cutin-pic') {
				//http://webnonotes.com/javascript-2/jquerypopup/
				var img = new Image();
				var imgsrc = $(e.target).attr('title');
				
				$(img).load(function(){
					var picSize = {
							width: img.width,
							height: img.height
					};
					
					picSize = adjustCutInPic(picSize);
					
					$('#' + id + '-cutin-pic').css('margin-left', -picSize.width / 2);
					$('#' + id + '-cutin-pic').attr({
						'src': imgsrc,
						'widht': picSize.width,
						'height': picSize.height});
					$('#' + id + '-cutin').show();
					$('#' + id + '-cutin-pic').show();
				});
				img.src = imgsrc;
			}
		});
	};

	this.reset = function(){
		if(this.isShowAll){
			$('.' + id + '-log').show();
			return;
		}

		$('.' + id + '-log').hide();
		$("."+tabClass+self.activeTab).show();
	};

	this.eventBind_();

};

com.hiyoko.tofclient.Chat.Display.UpdatePushActive = false;

com.hiyoko.tofclient.Chat.Display.PicStore = function(){
	var lastCharacterUpdate = 0;
	var lastEffectUpdate = 0;
	
	var store = {};
	var tailCutIn = {};
	
	this.stack = function(response) {
		var lastUpdates = response.lastUpdateTimes;
		
		if(lastUpdates.characters > lastCharacterUpdate || lastUpdates.effects > lastEffectUpdate) {
			updateByCharacter(response.characters);
			updateByEffect(response.effects);
			lastCharacterUpdate = lastUpdates.characters;
			lastEffectUpdate = lastUpdates.effects;
		}
	};
	
	var updateByCharacter = function(characters){
		$.each(characters, function(i, v){
			if(v.type === 'characterData') {
				store[v.name] = store[v.name] || {};
				store[v.name]['通常'] = com.hiyoko.tof.parseResourceUrl(v.imageName, com.hiyoko.tofclient.Chat.Util.TofURL);
			}
		});
	};
	
	var updateByEffect = function(effects){
		$.each(effects, function(i, v){
			if(v.type === 'standingGraphicInfos') {
				store[v.name] = store[v.name] || {};
				store[v.name][v.state] = com.hiyoko.tof.parseResourceUrl(v.source, com.hiyoko.tofclient.Chat.Util.TofURL);
			} else if(v.isTail) {
				tailCutIn[v.message] = {
						bgm: v.soundSource,
						loop: v.isSoundLoop,
						pic: v.source,
						volume: v.volume
				};
			}
		});
	};
	
	this.getTailCutIn = function(text) {
		for(var key in tailCutIn) {
			if(text.endsWith(key)) {
				return tailCutIn[key];
			}
		}
		return false;
	};
	
	this.getStandPic = function(name, opt_status) {
		return this.get(name, opt_status);
	}
	
	this.get = function(name, opt_status) {
		var status = opt_status || '通常';
		
		var character = store[name];
		if(! character){
			return '';
		}
		
		var result = character[status];
		if(result){
			return result;
		} else {
			return character['通常'];
		}
	};
};

/**
 * Chat Status Part
 */
com.hiyoko.tofclient.Chat.Status = function($html){
	var text = "";

	this.set = function(msg){
		text = msg;
		$html.text(text);
	};

	this.add = function(msg){
		text += msg;
		$html.text(text);
	};

	this.get = function(){
		return $html.text();
	};

	this.set(text);
};

/**
 * Chat User Console Part
 */
com.hiyoko.tofclient.Chat.InputArea = function($parent, children, isVisitor, serverInfo, tofStatus){
	var inputs = {talk:new com.hiyoko.tofclient.Chat.InputArea.Input(children.talk, isVisitor, tofStatus),
				  simple:new com.hiyoko.tofclient.Chat.InputArea.Simple(children.simple),
	              history:new com.hiyoko.tofclient.Chat.InputArea.History(children.history),
	              secret:new com.hiyoko.tofclient.Chat.InputArea.Secret(children.secret),
	              parette:new com.hiyoko.tofclient.Chat.InputArea.ChatParette(children.chatparette)};
	var current = 0;
	var self = this;
	var systemInfo = {};
	
	var $switcher = $('#tofChat-chat-input-switch');
	var $bot = $("#tofChat-input-dicebot");
	var $botHelp = $("#tofChat-chat-input-shared-dicebot-help");
	var $showBase = $('#tofChat-inputArea-showButtonBase');
	var $hideBase = $('#tofChat-inputArea-hideButtonBase');
	var $inputArea = $('#tofChat-inputArea-display');
	
	function eventBind(){
		$showBase.find('span').click(function(e){
			$showBase.hide();
			$hideBase.show();
			$inputArea.show();
		});
		
		$hideBase.find('span').click(function(e){
			$hideBase.hide();
			$showBase.show();
			$inputArea.hide();
		});
		
		$parent.on("EditMessage", function(e){
			inputs.talk.setMessage(e);
			self.hideAll();
			inputs.talk.enabled();
			self.changeSwitcherEventless('talk');
		});

		children.talk.on("sendMessage", function(e){
			inputs.history.stackMsg(e);
		});
		
		children.secret.on('openSecretMessage', function(e){
			var event = new $.Event('sendMessage', {
				msg: e.msg,
				name: self.getName(),
				color: self.getColor()
			});
			$parent.trigger(event);
		});
		
		$switcher.change(function(e){
			self.hideAll();
			inputs[$(e.target).val()].enabled();
		});
		
		$botHelp.click(function(e){
			var system = inputs.talk.getDiceBot();
			var title = $bot.find('[value="' + system + '"]').text();
			$.each(systemInfo[system].split('\n\n'), function(i, v){
				alert(title + 'のダイスボット\n-------\n'　+ v);
			});
		});
	}
	
	this.changeSwitcherEventless = function(key){
		var $selected = $switcher.children('[value="'+ key +'"]');
		var caption = $selected.text();
		$switcher.val(key);
		$($switcher.parent().find('span>span')[0]).text(caption);
	};

	this.getName = function(){
		return inputs.talk.getName();
	};
	
	this.getColor = function(){
		return inputs.talk.getColor();
	};
	
	this.getBot = function(){
		return inputs.talk.getDiceBot();
	};
	
	this.stackSecret = function(msg, key){
		return inputs.secret.stack(msg, key);
	};

	this.hideAll = function(){
		for(var key in inputs) {
			inputs[key].disabled();
		}
	};
	$.each(serverInfo.diceBotInfos, function(ind, bot){
		var newBot = $("<option></option>");
		newBot.text(bot.name);
		newBot.val(bot.gameType);
		newBot.attr('label', bot.name);
		$bot.append(newBot);
		systemInfo[bot.gameType] = bot.info;
	});
	
	eventBind();
	this.hideAll();
	inputs.talk.enabled();
};

com.hiyoko.tofclient.Chat.InputArea.Input = function($html, isVisitor, tofStatus){
	var id = $html.attr('id');

	this.disabled = function(){$html.hide()};
	this.enabled = function(){$html.show()};
	
	var $msg = $("#tofChat-chat-input-input-msg");
	var $name_color = $('#tofChat-chat-input-input-name');
	var $color = $("#"+id+"-color");
	var $name = $("#"+id+"-name");
	var $tabs = $("#"+id+"-tablist")
	
	var $hideLeft = $('#tofChat-chat-input-input-name-hide-left');
	var $hideRight = $('#tofChat-chat-input-input-name-hide-right');
	var $showLeft = $('#tofChat-chat-input-input-show-name-left');
	var $showRight = $('#tofChat-chat-input-input-show-name-right');
	var $showNameColor = $('.tofChat-chat-input-input-name-show');
	
	var self = this;
	
	if(isVisitor) {
		$('#'+id+'-sendCallRoll').parent().hide();
		$('#'+id+'-sendQuestion').parent().hide();
		$('#'+id+'-send').parent().removeClass('tofChat-input-short');		
	}
	
	$.each(tofStatus.tabs, function(ind, tabName){
		if(ind === 0) {return; }
		var newTab = $("<option></option>");
		newTab.text(tabName);
		newTab.val(ind);
		newTab.attr('label', tabName);
		$tabs.append(newTab);
	});


	function eventBind(){
		$("#"+id+"-tablist").change(function(e){
			var tabId = $("#"+id+"-tablist").val();
			if($.isNumeric(tabId)){
				$html.trigger(new $.Event("changeTab",
						{tab:Number(tabId)}));
			} else {
				$html.trigger(new $.Event("changeTab",
						{tab:0}));				
			}
		});

		$("#"+id+"-initByparentheses").click(function(e){
			$msg.val("「」");
			$msg.focus();
			$msg.get()[0].setSelectionRange(1, 1);
		});
		$("#"+id+"-send").click(function(e){
			var tabId = $("#"+id+"-tablist").val();

			localStorage.setItem("color", self.getColor());
			localStorage.setItem("name",  self.getName());

			if($.isNumeric(tabId)){			
				$html.trigger(new $.Event("sendMessage", {
					msg: $msg.val(),
					color: self.getColor(),
					name: self.getName(),
					tab: Number($("#"+id+"-tablist").val()),
					bot: self.getDiceBot()
				}));
			} else {
				$html.trigger(new $.Event("sendMessageEvent", {
					msg: $msg.val(),
					color: self.getColor(),
					name: self.getName(),
					tab: 0,
					action: tabId
				}));
			}
			$msg.val("");
		}); 

		$("#"+id+"-sendQuestion").click(function(e){
			localStorage.setItem("color", self.getColor());
			localStorage.setItem("name",  self.getName());
			$html.trigger(new $.Event("sendMessageEvent", {
				msg: $msg.val(),
				color: self.getColor(),
				name: self.getName(),
				tab: 0,
				action: "question"
			}));
			$msg.val("");
		});

		$("#"+id+"-sendCallRoll").click(function(e){
			localStorage.setItem("color", self.getColor());
			localStorage.setItem("name",  self.getName());
			var event = new $.Event("sendMessageEvent", {
				msg: "",
				color: self.getColor(),
				name: self.getName(),
				tab: 0,
				action: "callroll"
			});
			$html.trigger(event);
		});
		
		$hideLeft.click(function(e) {
			$name_color.hide();
			$msg.css('width', '87%');
			$showLeft.css('display', 'inline-block');
		});
		
		$hideRight.click(function(e) {
			$name_color.hide();
			$msg.css('width', '87%');
			$showRight.css('display', 'inline-block');
		});
		
		$showNameColor.click(function(e) {
			$name_color.show();
			$showNameColor.hide();
			$msg.css('width', '97%');
		});
	}

	this.getDiceBot = function() {
		return ($("#"+id+"-dicebot").val() !== "default") ? $("#"+id+"-dicebot").val() : tofStatus.game;
	};

	this.getName = function(){
		return $name.val();
	};
	
	this.getColor = function(){
		return $color.val();
	};

	this.setMessage = function(e){
		$msg.val(e.msg);
		$color.css("background-color", "#" + e.color);
		$color.val(e.color);
		$name.val(e.name);
	};
	
	// Initialize
	$color.val(localStorage.getItem("color") || '000000');
	$name.val(decodeURI(getParam("name")) || localStorage.getItem("name") || 'ななしのひよこ');
	eventBind();
	$color.css("background-color", "#" + self.getColor());
};

com.hiyoko.tofclient.Chat.InputArea.Simple = function($html) {
	this.disabled = function(){$html.hide();};
	this.enabled = function(){$html.show();adjustHeight();};
	var id = $html.attr('id');
	var $t = $('#' + id + '-text');
	var $s = $('#' + id + '-send');
	
	function adjustHeight() {
		$t.css('height', '22px');
	}
	
	function eventBinds() {
		$s.click(function(e) {
			$html.trigger(new $.Event("sendMessage", {
				msg: $t.val(),
				tab: 0
			}));
			adjustHeight();
			$t.val('');
		});
	}
	
	eventBinds();
};

com.hiyoko.tofclient.Chat.InputArea.History = function($html){
	var store = getStore();
	this.disabled = function(){$html.hide()};
	this.enabled = function(){
		if(store.length === 0){
			$html.trigger(new $.Event("switch"));
			alert("発言履歴が未登録です。何らかの発言をしたうえで再度開いてください");
			return;
		}
		if($(".tofChat-chat-input-history-tab").length === 0){
			self.sortMsg();
			drawTabs();
			drawMsgs(0);
		}
		$html.show()
	};

	var $list = $("#tofChat-chat-input-history-list");
	var $edit = $("#tofChat-chat-input-history-action-edit");
	var $send = $("#tofChat-chat-input-history-action-send");
	var self = this;

	function getStore(){
		// 歴史的経緯の localStorage Key
		var tmp = localStorage.getItem("com.hiyoko.tofclient.Chat.InputArea.Parette.Store");
		if(tmp === null){
			return [];
		}else{
			return JSON.parse(tmp);
		}
	}

	function getSelected(num){
		var result = {
				msg: store[num.c].msgs[num.m].msg,
				color: store[num.c].color,
				name: store[num.c].name,
				tab: 0,
				bot: store[num.c].bot
		};
		return result;
	}

	function getSelectedNumber(e){
		var result = {c:0, m:-1};
		result.m = $("#tofChat-chat-input-history-list").val();
		$.each($(".tofChat-chat-input-history-tab"), function(i, elem){
			if($(elem).hasClass("active")){
				result.c = i;
			}
		});
		return result;
	}

	function drawTabs(){
		var $tabs = $('<div></div>');
		var $tab;
		$("#tofChat-chat-input-history-tabs").empty();
		var storeLength = Math.min(store.length, 6);
		for(var i = 0; i < storeLength; i++){
			$tab = $('<span></span>');
			$tab.addClass('tofChat-chat-input-history-tab');
			$tab.text(store[i].name + '　');
			$tabs.append($tab);
		}
		$("#tofChat-chat-input-history-tabs").append($tabs.html());
		$(".tofChat-chat-input-history-tab:first").addClass("active");


		$(".tofChat-chat-input-history-tab").click(function(e){
			$(".tofChat-chat-input-history-tab").removeClass("active");
			$(this).addClass("active");
			drawMsgs((getSelectedNumber()).c);
		});
	}

	function drawMsgs(charNum){
		var msgList = $('<div></div>');
		$.each(store[charNum].msgs, function(i, v){
			var $option = $('<option></option>');
			$option.val(i);
			$option.text(v.msg);
			msgList.append($option)
		});
		$("#tofChat-chat-input-history-list").empty();
		$("#tofChat-chat-input-history-list").append(msgList.html());
		$("#tofChat-chat-input-history-list > option:first").select();
		$("#tofChat-chat-input-history-list").parent().find(".ui-btn-text").text($("#tofChat-chat-input-history-list > option:first").text());
	}

	function eventBind(){
		$edit.click(function(e){
			var num = getSelectedNumber(e);
			var msg = getSelected(num);
			$html.trigger(new $.Event("EditMessage", msg));
			self.updateMsg(num.c, num.m);
		});

		$send.click(function(e){
			var num = getSelectedNumber(e);
			var msg = getSelected(num);
			$html.trigger(new $.Event("sendMessage", msg));
			self.updateMsg(num.c, num.m);
		});

		$("#tofChat-chat-input-history-delete").click(function(e){
			if($("#tofChat-chat-input-history-list > option").length < 2){
				alert("発言が1つしか登録されていない場合、削除はできません");
				return;
			}
			var num = getSelectedNumber(e);
			if(confirm(getSelected(num).msg + "を削除しますか?")){
				store[num.c].msgs.splice(num.m, 1);
				drawMsgs(num.c);
			}
		});

		$("#tofChat-chat-input-history-reload").click(function(e){
			self.sortMsg();
			drawTabs();
			drawMsgs(0);
		});
	}

	this.stackMsg = function(e){
		if(e.msg === ""){
			return;
		}
		var index = this.searchMsg(e);

		if(index.c === -1){
			index.c = store.length;
			store.push({name: e.name ? e.name : 'ななしのひよこ', msgs:[]});
		}

		store[index.c].color = e.color;
		store[index.c].bot = e.bot;

		if(index.m === -1){
			index.m = store[index.c].msgs.length;
			(store[index.c].msgs).push({
				msg:e.msg,
				time:0
			});
		}
		this.updateMsg(index.c, index.m);
	};

	this.searchMsg = function(e){
		var result = {c:-1, m:-1};

		var cLen = store.length;
		var cIndex = 0;
		for(cIndex = 0 ; cIndex < cLen; cIndex++){
			if(store[cIndex].name === e.name){
				break;
			}
		}

		if(cIndex === cLen){
			return result;
		}
		result.c = cIndex;

		var mLen = store[cIndex].msgs.length;
		var mIndex = 0;
		for(mIndex = 0; mIndex < mLen; mIndex++){
			if(store[cIndex].msgs[mIndex].msg === e.msg){
				break;
			}
		}
		if(mIndex === mLen){
			return result;
		}
		result.m = mIndex;

		return result;
	};

	this.updateMsg = function(cIndex, mIndex){
		((store[cIndex]).msgs[mIndex]).time++;
		((store[cIndex]).msgs[mIndex]).lastUpdate = Math.floor(Date.now() / 100000);
		store[cIndex].lastUpdate = Math.floor(Date.now() / 100000);
		localStorage.setItem("com.hiyoko.tofclient.Chat.InputArea.Parette.Store",  JSON.stringify(store));	
	};

	this.sortMsg = function(opt_charSort, opt_msgSort){
		var charSort = opt_charSort || function(a, b){ return b.lastUpdate - a.lastUpdate};
		var msgSort = opt_msgSort || function(a, b){ return b.lastUpdate - a.lastUpdate};

		$.each(store, function(i, char){
			store[i].msgs = store[i].msgs.sort(msgSort);
			store[i].msgs = store[i].msgs.slice(0, 10);
		});
		store.sort(charSort);

		store = store.slice(0, 10);
		localStorage.setItem("com.hiyoko.tofclient.Chat.InputArea.Parette.Store",  JSON.stringify(store));	
	};


	function init(){
		if(store.length !== 0){
			drawTabs();
			drawMsgs(0);
		}
		eventBind();		
	}
	init();
};

com.hiyoko.tofclient.Chat.InputArea.ChatParette = function($html) {
	var id = $html.attr('id');
	this.disabled = function(){$html.hide()};
	this.enabled = function(){
		$.each($tab, function(i, v) {
			$($tab[i]).text(load(i).name);
		});
		$html.show();
	};
	
	var RE_VAL = /^\/\/\s*(.+)\s*=\s*(\d+)/;

	var $list = $("#" + id + "-list");
	var $edit = $("#" + id + "-edit");
	var $editfinish = $("#" + id + "-editfinish");
	var $send = $("#" + id + "-action-send");
	var $editSender = $("#" + id + "-action-edit");
	var $clear = $("#" + id + "-clear");
	
	var $nameEditor = $("#" + id + "-nameEditor");
	var $colorEditor = $("#" + id + "-colorEditor");
	var $commandEditor = $("#" + id + "-commandEditor");
	
	var $tab = $("." + id + "-tab");
	
	var $umode = $("#" + id + "-usemode");
	var $emode = $("#" + id + "-editmode");
	var self = this;
	
	this.parseMessage = function(text, vars, initTable) {
		var regexp = /{([^}]*)}/;
		var word;
		var execResult;
		var flag = true;
		while(flag){
			execResult = regexp.exec(text);
			
			flag = Boolean(execResult);
			if(flag){
				word = execResult[1];
				if(vars[word]) {
					text = text.replace(execResult[0], vars[word]);
				} else {
					var val = initTable.getValue(word);
					if(val !== undefined) {
						text = text.replace(execResult[0], val);
					} else {
						text = text.replace(execResult[0], word);
					}
				}
			}
		}
		
		return text;
	};
	
	function sendParsedMessage(text, json, eventType) {
		var asyncEvent = new $.Event('com.hiyoko.tofclient.Table.DataRequest', {
			promise: function(result) {
				cData = result[json.name] || {getValue:function(){return false;}};
				var parsedText = self.parseMessage(text, json.vars, cData);
				
				
				$html.trigger(new $.Event(eventType, {
					msg: parsedText,
					color: json.color,
					name: json.name,
					tab: 0
				}));	
			}
		});
		
		$html.trigger(asyncEvent);
	}
	
	function activate(num) {
		load(num);
	}
	
	function load(num) {
		var json = localStorage.getItem("com.hiyoko.tofclient.Chat.InputArea.ChatParette.Store_" + num);
		
		if(json) {
			return JSON.parse(json);
		}
		
		if(num === 0) {
			return {
				name: 'SAMPLE',
				list: ['サンプルデータ', '2d6+{攻撃} ' + num,'{HP}-3d6', '{イニシアティブ}+10', '「{その他}」'],
				vars: {'攻撃':'32'}
			};			
		} else {
			return {
				name: '　',
				list: [],
				vars: {}
			};
		}
	}
	
	function save(json, num) {
		localStorage.setItem("com.hiyoko.tofclient.Chat.InputArea.ChatParette.Store_" + num,  JSON.stringify(json));
	}
	
	function reverseCompile(json) {
		var result = {
				name: json.name || 'ななしのひよこ',
				color: json.color || '000000',
				text: ''
		};
		$.each(json.list, function(i, v){
			result.text += v + '\n';
		});
		for(var key in json.vars) {
			result.text += '//' + key + '=' + json.vars[key] + '\n';
		}
		
		return result;
	}
	
	function parse(lines, name, color) {
		var result = {
				name: name || 'ななしのひよこ',
				color: color || '000000',
				list: [],
				vars: {}
			};

		
		$.each(lines.split('\n'), function(i, v){
			var text = v.trim();
			if(text === '') {
				return;
			}
			var varCand = RE_VAL.exec(text);
			if(varCand){
				result.vars[varCand[1]] = varCand[2];
				return;
			}
			result.list.push(text);
		});
		return result;
	}
	
	function edit(json) {
		
	}
	
	function tabByNum(num) {
		return $($tab[Number(num)]);
	}
	
	function getActiveNum() {
		for(var i = 0; i < 6; i++) { // TAB はマックス6個なので6決めうち
			if($($tab[i]).hasClass('active')) {
				return i;
			}
		}
	}
	
	function apply(json, $tab) {
		$tab.text(json.name || '　');
		$list.empty();
		$.each(json.list, function(i,v){
			var $opt = $('<option></option>');
			
			$opt.text(v);
			$opt.val(v);
			
			$list.append($opt);
		});
		var caption = json.list.length ? json.list[0] : '';
		$list.val(caption);
		$($list.parent().find('span>span')[0]).text(caption);
	}
	
	function onClickTab(num){
		var json = load(num);
		apply(json, tabByNum(num));
	}
	
	function startEdit(){
		var data = reverseCompile(load(getActiveNum()));
		$commandEditor.val(data.text);
		$nameEditor.val(data.name);
		$colorEditor.val(data.color);
		$colorEditor.css("background-color", "#" + data.color);
		$umode.hide();
		$emode.show();
	}
	
	function endEdit() {
		$umode.show();
		$emode.hide();
		var num = getActiveNum();
		var json = parse($commandEditor.val(), $nameEditor.val(), $colorEditor.val());
		save(json, num);
		apply(json, $($tab[num]));
	}
	
	function clear(){
		var num = getActiveNum();
		if(confirm(load(num).name + 'のチャットパレットを削除します。よろしいですか?')){
			save({list:[]} , num);
			apply({list:[]}, $($tab[num]));
		}
	}
	
	function eventBind(){
		$edit.click(function(e){
			startEdit();
		});
		$editfinish.click(function(e){
			endEdit();
		});
		
		$tab.click(function(e){
			$tab.removeClass('active');
			$(e.target).addClass('active');
			onClickTab(getActiveNum());
		});
		
		$clear.click(function(e){
			clear();
		});
		
		$editSender.click(function(e){
			sendParsedMessage($list.val(), load(getActiveNum()), "EditMessage");
		});
		
		$send.click(function(e){
			sendParsedMessage($list.val(), load(getActiveNum()), "sendMessage");
		});
	}
	
	eventBind();
	onClickTab(getActiveNum());
};

com.hiyoko.tofclient.Chat.InputArea.Secret = function($html) {
	var id = $html.attr('id');
	var self = this;

	var $add = $("#" + id + "-add");
	var $msg = $("#" + id + "-msg");
	
	var $send = $("#" + id + "-send");
	var $clear = $("#" + id + "-clear");
	var $stack = $("#" + id + "-stack");
	var $stackHead = $("#" + id + "-stack-head");
	
	var $help = $("#" + id + "-help");
	
	this.disabled = function(){$html.hide()};
	this.enabled = function(){$html.show()};
	
	this.eventBind = function(){
		$add.click(function(e) {
			if($msg.val() === '') {
				alert('内容を入力してください');
				return;
			}
			var key_ = rndString('#');
			$html.trigger(new $.Event('sendSecretEvent', {
				msg: $msg.val() + ' ' + key_, tab: -1, key: key_,
				name: 'ひよんとふ非公開発言'}));
			$msg.val('');
		});
		
		$send.click(function(e) {
			if($stack.val() === '') {return;}
			$html.trigger(new $.Event('openSecretMessage', {msg: '(非公開発言開示)\n' + $stack.val()}));
		});
		
		$clear.click(function(e) {
			if(confirm('現在保存されている非公開発言をすべて削除します。\nよろしいですか?')) {
				$stackHead.selected = true;
				$($stack.parent().find('span>span')[0]).text('リストから選択');
				$('.' + id + '-stack-item').remove();
			}
		});
	};
	
	this.stack = function(msg, key){
		var stackedMsg = msg.msg.replace(' ' + key, '');
		var hashValue = CryptoJS.SHA256(stackedMsg);
		var $option = $('<option class="' + id + '-stack-item"></option>');
		var str = stackedMsg + '\nダイジェスト値： ' + hashValue + '\n真正性検証する： ' +
					location.protocol + '//' + location.hostname +
					(function(path){
						var paths = location.pathname.split('/');
						paths[paths.length - 1] = 'verify.html';
						return paths.join('/');})(location.path) +
					location.search + '&digest=' + hashValue;
		$option.text(str);
		$option.attr('value', str);
		$stack.append($option);
		return hashValue;
	};
	
	this.eventBind();
};


/**
 * Chat Submenu Part
 */
com.hiyoko.tofclient.Chat.SubMenu = function($html, tofStatus){
	var idBase = $html.attr('id');
	var menuItemClass = idBase + "-list-item";
	var items = {};

	var $menu = $("#" + idBase + "-list");

	function initializeList() {
		var index = 0;
		$.each(com.hiyoko.tofclient.Chat.SubMenu.List, function(i, v){
			if(Boolean(v.disabled) && v.disabled(tofStatus)){
				return;
			}
			var $dom = '';
			if(v.type === 'item') {
				$dom = $('<span></span>');
				$dom.addClass(menuItemClass);
				$dom.text(v.label);
				$menu.append($dom);
				$("."+menuItemClass+":last").click(v.click);
				v.index = index;
				index++;
				items[v.code] = v;
			}
			if(v.type === 'bar') {
				$dom = "<hr/>";
				$menu.append($dom);
			}
			if(v.type === 'link') {
				$dom = $('<span></span>');
				$dom.addClass(menuItemClass);
				
				var link = $('<a></a>');
				link.attr({
					href:v.url,
					target:'_blank'
				});
				link.text(v.label);
				
				$dom.append(link);
				$menu.append($dom);
			}
			
		});
	}

	function eventBind() {
		$("#"+idBase + "-button").click(function(e){
			$menu.toggle(100);
		});

		$menu.on("closeSubMenu", function(e){
			$menu.hide(100);
		});
	}

	this.updateItem = function(code, data){
		var targetItem = items[code];
		if(! targetItem) {
			console.warn("Menu Item " + code + " is not defined.");
			return;
		}
		targetItem.update($($("."+menuItemClass)[targetItem.index]), data);
	};

	this.close = function() {
		$menu.hide(100);
	};

	initializeList();
	eventBind();
};

com.hiyoko.tofclient.Chat.SubMenu.List = [
  {code: 'bar1', type:'bar'},
  {code: 'members', type:'item', label:'在席者数',
	  click:function(e){
		  $(e.target).trigger(new $.Event("requestMembersList"));
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  },
	  update:function($html, data){
		  $html.text("室内に" + data.count + "人います");
	  }},
  {code: 'bar2', type:'bar'},
  {code: 'displayMode', type:'item', label:'タブ毎に表示する',
	  click:function(e){
		  var isShowAll = $(e.target).text()==="全タブを表示する";
		  $(e.target).text(isShowAll ? "タブ毎に表示する" : "全タブを表示する");
		  $(e.target).trigger(new $.Event("changeDisplayMode", {isShowAll:isShowAll}))
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  }},
  {code: 'tabColoredMode', type:'item', label:'全タブをカラフルに',
		  click:function(e){
			  var isTabColored = $(e.target).text()==="全タブをカラフルに";
			  $(e.target).text(isTabColored ? "メインだけカラフルに" : "全タブをカラフルに");
			  $(e.target).trigger(new $.Event("changeTabColor", {isTabColored:isTabColored}));
			  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
		  },
		  update:function($html, data){
			  $html.text(data ? "メインだけカラフルに" : "全タブをカラフルに");
		  }},
　　{code: 'bgmMode', type:'item', label:'BGM を再生する',
	  click:function(e){
		  var isLoadBGM = $(e.target).text()==="BGM を再生する";
		  $(e.target).text(isLoadBGM ? "BGM を再生しない" : "BGM を再生する");
		  $(e.target).trigger(new $.Event("changeBgmMode", {isLoadBGM:isLoadBGM}))
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  },
	  update:function($html, data){
		  $html.text(data ? "BGM を再生しない" : "BGM を再生する");
	  }},
  {code: 'standPicMode', type:'item', label:'立ち絵を表示する',
	  click:function(e){
		  alert('※推奨※\n見た目の統一のために\nひよんとふの再読み込みをおすすめします');
		  var isStandPic = $(e.target).text()==="立ち絵を表示する";
		  $(e.target).text(isStandPic ? "立ち絵を表示しない" : "立ち絵を表示する");
		  $(e.target).trigger(new $.Event("changeStandPic", {isStandPic:isStandPic}));
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  },
	  update:function($html, data){
		  $html.text(data ? "立ち絵を表示しない" : "立ち絵を表示する");
	  }},
  {code: 'bar3', type:'bar'},
  {code: 'sendAlarm', type:'item', label: 'アラームを送信する',
	  click:function(e){
		  $(e.target).trigger(new $.Event("sendAlarm"))
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  }},
  {code: 'bar4', type:'bar'},
  {code: 'lineshare', type:'link', label:'LINE で招待する',
   url:'http://line.me/R/msg/text/?' + encodeURIComponent('ここからどどんとふにアクセス! ' + location.toString())},
  {code: 'twittershare', type:'link', label:'Twitter で招待する',
   url:'https://twitter.com/intent/tweet?text=' + encodeURIComponent('ここからどどんとふにアクセス! ' + location.toString()),
      disabled:function(status){return Boolean(status.pass);}}
                                        	  ];

com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent = function($html) {
	$($html).trigger(new $.Event("closeSubMenu"));
};


