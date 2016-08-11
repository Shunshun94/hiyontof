var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};

/**
 * Chat Main Part
 */
com.hiyoko.tofclient.Chat = function(tof, interval, options){
	//TODO ID の直接指定を減らしていく
	var $html = options.html || $("#tofChat-chat");
	renderChat($html);
	
	var isAsking = false;
	var isVisitor = Boolean(options.visitor);

	var subMenu = null;
	var status = null;
	var display = null;
	var inputArea = null;
	
	function isActive() {
		return $html.css('display') !== 'none';
	}
	
	function buildChildComponents() {
		subMenu = new com.hiyoko.tofclient.Chat.SubMenu($("#tofChat-chat-submenu"), tof.getStatus());
		status = new com.hiyoko.tofclient.Chat.Status($("#tofChat-connection-status"));
		display = new com.hiyoko.tofclient.Chat.Display($("#tofChat-log"));
		inputArea = new com.hiyoko.tofclient.Chat.InputArea(
				$("#tofChat-input"), $("#tofChat-parette"), $("#tofChat-inputArea"), isVisitor);
	}

	function renderChat($html) {
		$html.append("<div id='tofChat-chat-submenu'></div>");
	};
	
	function nameSuiter(name) {
		return isVisitor ? name + '@見学' : name;
	}

	function initializeDisplay(serverInfo){
		// TODO これらって com.hiyoko.tofclient.Chat.InputArea の持ち物だよね
		var status = tof.getStatus();
		$("#tofChat-Title").text(isVisitor ? '【見学】' + status.name : status.name);
		$.each(status.tabs, function(ind, tabName){
			if(ind === 0) {return; }
			var newTab = $("<option></option>");
			newTab.text(tabName);
			newTab.val(ind);
			newTab.attr('label', tabName);
			$("#tofChat-input-tablist").append(newTab);
		});
		$.each(serverInfo.diceBotInfos, function(ind, bot){
			var newBot = $("<option></option>");
			newBot.text(bot.name);
			newBot.val(bot.gameType);
			newBot.attr('label', bot.name);
			$("#tofChat-input-dicebot").append(newBot);
		});
	}

	function eventBinds(serverInfo){
		var sendMsg = function(e){
			if(! e.msg) {
				status.set("Empty msg isn't acceptable.");
				return "";
			}
			status.set("Sending...");
			tof.sendMessage(
					function(r){
						getMsg_("Sending...Done! Getting...")
					},
					nameSuiter(e.name), e.msg, e.color, e.tab,e.bot);
		};

		var sendMsgEvent = function(e) {
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

		var $inputArea = $("#tofChat-inputArea");

		$inputArea.on("sendMessage", sendMsg);
		$inputArea.on("sendMessageEvent", sendMsgEvent);
		$inputArea.on("changeTab", function(e){
			display.activeTab = e.tab;
			display.reset();
		});

		$html.click(function(e){
			if($(e.target).attr("id") !== undefined && startsWith($(e.target).attr("id"), "tofChat-chat-submenu")){
				return;
			}
			subMenu.close();
		});

		$("#tofChat-log").on("sendMessage", sendMsg);
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
		$submenu.on("changeDisplayMode", function(e){
			display.isShowAll = e.isShowAll;
			display.reset();
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
				$submenu.css("top", "40px");
			} else {
				$submenu.css("top", (80-$(window).scrollTop())+"px");
			}
		});

		setAutoReload_();
	}

	tof.getServerInfo(function(serverInfo){
		initializeDisplay(serverInfo);
		buildChildComponents();
		eventBinds(serverInfo);	
		getMsg_();
	}, true);

	function getMsg_(msg){
		if(isAsking){return;}
		isAsking = true;
		status.set(msg || "Getting...");
		tof.getMessage(getMsgs, display.lastTime, getMsgsFail);
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
			$('html,body').animate({scrollTop: $("#tofChat-inputArea").offset().top},'slow');
		}catch(e){
			alert("ERROR @Shunshun94 にこの文字列 (ないし画面) を送ってください: " + e.stack);
		}
	}

	function setAutoReload_(){
		if(interval){
			window.setInterval(function(){if(isActive()){getMsg_();}}, interval);
		}
		window.setInterval(function(){
			tof.getLoginUserInfo(afterBeacon, nameSuiter(inputArea.getName()));
		}, 12500);
	}
};

/**
 * Chat Utility Part
 */
com.hiyoko.tofclient.Chat.Util = com.hiyoko.tofclient.Chat.Util || {};

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

com.hiyoko.tofclient.Chat.Util.fixChatMsg = function(chatMsg){
	var message;
	var vote = false;
	var ask = false;
	var ready = false;
	var tab = chatMsg[1].channel;

	if(chatMsg[1].message.indexOf("###CutInCommand:rollVisualDice###") !== -1){
		message = JSON.parse(chatMsg[1].message.replace("###CutInCommand:rollVisualDice###", "")).chatMessage;
	}else{
		message = chatMsg[1].message;
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
	var tabClass = "tofChat-log-tab";

	this.lastTime = 0;
	this.isShowAll = true;
	this.activeTab = 0;

	this.msgToDom = function(msg, tabs) {
		var $dom = $('<p></p>');
		$dom.addClass('log');
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

		if(msg.tab === 0){
			$dom.css('color', '#'+msg.color);

			$name = $('<strong></strong>');
			$name.text(msg.name + ': ');

			if(msg.isReady) {
				msg_class = 'vote-button-ready';
			} else if(msg.isAsk) {
				$msg.append("<span class='vote-button-yes'>賛成</span><span class='vote-button-no'>反対</span>");
			} else if(msg.isVote) {
				msg_class = 'vote-msg';
			}
		} else {
			$dom.addClass('notmain');

			$name = $('<span></span>');
			$name.text(msg.name);

			$noMain = $('<span></span>');
			$noMain.addClass('tabname');
			$noMain.text('[' + tabs[msg.tab] + ']： ');
			$noMain.append($('<br/>'));
			$name.append($noMain);
		}

		$name.addClass('name');
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
		if(responseFromTof.chatMessageDataLog.length !== 0){
			var modifiedTofResponse = mapArray(responseFromTof.chatMessageDataLog, function(l){return com.hiyoko.tofclient.Chat.Util.fixChatMsg(l);});
			var $dom = $('<div></div>');
			$dom.addClass('tofChat-chat-log-msgContainer');
			$.each(modifiedTofResponse, function(index, msg){
				$dom.append(self.msgToDom(msg, tabs));
				this.lastTime = msg.time;
			}.bind(this));
			$html.append($dom);
		}
		this.reset();
		com.hiyoko.tofclient.Chat.Util.checkScroll_(null);
	};

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
			}
		});
	};

	this.reset = function(){
		if(this.isShowAll){
			$(".log").show();
			return;
		}

		$(".log").hide();
		$("."+tabClass+self.activeTab).show();
	};

	this.eventBind_();

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
com.hiyoko.tofclient.Chat.InputArea = function($input, $parette, $parent, isVisitor){
	var inputs = [new com.hiyoko.tofclient.Chat.InputArea.Input($input, isVisitor),
	              new com.hiyoko.tofclient.Chat.InputArea.Parette($parette)];
	var current = 0;
	var self = this;

	function eventBind(){
		$parette.on("EditMessage", function(e){
			self.switchMode();
			inputs[0].setMessage(e);
		});

		$input.on("sendMessage", function(e){
			inputs[1].stackMsg(e);
		});

		$input.on("switch", function(e){self.switchMode();});
		$parette.on("switch", function(e){self.switchMode();});
	}

	this.getName = function(){
		return inputs[0].getName();
	};

	this.switchMode = function(){
		inputs[current].disabled();
		current = 1 - current;
		inputs[current].enabled();
	};
	eventBind();
};

com.hiyoko.tofclient.Chat.InputArea.Input = function($html, isVisitor){
	var id = $html.attr('id');

	this.disabled = function(){$html.hide()};
	this.enabled = function(){$html.show()};
	var $msg = $("#"+id+"-msg");

	function rerendDom(){
		/**
		 * This function must be removed.
		 * The HTML file should be edited instead of this function.
		 */
		$('#'+id+'-sendCallRoll').parent().hide();
		$('#'+id+'-sendQuestion').parent().hide();
		$('#'+id+'-send').parent().removeClass('tofChat-input-short');

		$("#"+id+"-tablist").append("<option value='callroll' label='点呼'>点呼</option>");
		$("#"+id+"-tablist").append("<option value='question' label='投票'>投票</option>");
	}

	if(getParam("newLayout")) {
		rerendDom();
	}
	
	if(isVisitor) {
		// See also rerendDom()
		$('#'+id+'-sendCallRoll').parent().hide();
		$('#'+id+'-sendQuestion').parent().hide();
		$('#'+id+'-send').parent().removeClass('tofChat-input-short');		
	}


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

			localStorage.setItem("color", $("#"+id+"-color").val());
			localStorage.setItem("name",  $("#"+id+"-name").val());

			if($.isNumeric(tabId)){			
				$html.trigger(new $.Event("sendMessage", {
					msg: $msg.val(),
					color: $("#"+id+"-color").val(),
					name: $("#"+id+"-name").val(),
					tab: Number($("#"+id+"-tablist").val()),
					bot: ($("#"+id+"-dicebot").val() !== "default") ? $("#"+id+"-dicebot").val() : false
				}));
			} else {
				$html.trigger(new $.Event("sendMessageEvent", {
					msg: $msg.val(),
					color: $("#"+id+"-color").val(),
					name: $("#"+id+"-name").val(),
					tab: 0,
					action: tabId
				}));
			}
			$msg.val("");
		}); 

		$("#"+id+"-sendQuestion").click(function(e){
			localStorage.setItem("color", $("#"+id+"-color").val());
			localStorage.setItem("name",  $("#"+id+"-name").val());
			$html.trigger(new $.Event("sendMessageEvent", {
				msg: $msg.val(),
				color: $("#"+id+"-color").val(),
				name: $("#"+id+"-name").val(),
				tab: 0,
				action: "question"
			}));
			$msg.val("");
		});

		$("#"+id+"-sendCallRoll").click(function(e){
			localStorage.setItem("color", $("#"+id+"-color").val());
			localStorage.setItem("name",  $("#"+id+"-name").val());
			var event = new $.Event("sendMessageEvent", {
				msg: "",
				color: $("#"+id+"-color").val(),
				name: $("#"+id+"-name").val(),
				tab: 0,
				action: "callroll"
			});
			$html.trigger(event);
		});

		$("#"+id+"-switch").click(function(e){
			$html.trigger(new $.Event("switch"));
		});
	}

	$("#"+id+"-color").val(localStorage.getItem("color"));
	$("#"+id+"-name").val(localStorage.getItem("name"));

	this.getName = function(){
		return $("#"+id+"-name").val();
	};

	this.setMessage = function(e){
		$msg.val(e.msg);
		$("#"+id+"-color").css("background-color", "#" + e.color);
		$("#"+id+"-color").val(e.color);
		$("#"+id+"-name").val(e.name);
	};
	eventBind();
};

com.hiyoko.tofclient.Chat.InputArea.Parette = function($html){
	var store = getStore();
	this.disabled = function(){$html.hide()};
	this.enabled = function(){
		if(store.length === 0){
			$html.trigger(new $.Event("switch"));
			alert("発言履歴が未登録です。何らかの発言をしたうえで再度開いてください");
			return;
		}
		if($(".tofChat-parette-tab").length === 0){
			self.sortMsg();
			drawTabs();
			drawMsgs(0);
		}
		$html.show()
	};

	var $list = $("#tofChat-parette-list");
	var $edit = $("#tofChat-parette-action-edit");
	var $send = $("#tofChat-parette-action-send");
	var self = this;

	function getStore(){
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
		result.m = $("#tofChat-parette-list").val();
		$.each($(".tofChat-parette-tab"), function(i, elem){
			if($(elem).hasClass("active")){
				result.c = i;
			}
		});
		return result;
	}

	function drawTabs(){
		var $tabs = $('<div></div>');
		var $tab;
		$("#tofChat-parette-tabs").empty();
		var storeLength = Math.min(store.length, 6);
		for(var i = 0; i < storeLength; i++){
			$tab = $('<span></span>');
			$tab.addClass('tofChat-parette-tab');
			$tab.text(store[i].name);
			$tabs.append($tab);
		}
		$("#tofChat-parette-tabs").append($tabs.html());
		$(".tofChat-parette-tab:first").addClass("active");


		$(".tofChat-parette-tab").click(function(e){
			$(".tofChat-parette-tab").removeClass("active");
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
		$("#tofChat-parette-list").empty();
		$("#tofChat-parette-list").append(msgList.html());
		$("#tofChat-parette-list > option:first").select();
		$("#tofChat-parette-list").parent().find(".ui-btn-text").text($("#tofChat-parette-list > option:first").text());
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

		$("#tofChat-parette-switch").click(function(e){
			$html.trigger(new $.Event("switch"));
		});

		$("#tofChat-parette-delete").click(function(e){
			if($("#tofChat-parette-list > option").length < 2){
				alert("発言が1つしか登録されていない場合、削除はできません");
				return;
			}
			var num = getSelectedNumber(e);
			if(confirm(getSelected(num).msg + "を削除しますか?")){
				store[num.c].msgs.splice(num.m, 1);
				drawMsgs(num.c);
			}
		});

		$("#tofChat-parette-reload").click(function(e){
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
			store.push({name: e.name, msgs:[]});
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

/**
 * Chat Submenu Part
 */
com.hiyoko.tofclient.Chat.SubMenu = function($html, tofStatus){
	var idBase = $html.attr('id');
	var menuItemClass = idBase + "-list-item";
	var items = {};

	$html.append("<span id='"+idBase + "-button"+"'>MENU</span>" +
			"<div id='"+idBase + "-list"+"'></div>");
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
  {code: 'displayMode', type:'item', label:'タブ毎の表示に切替',
	  click:function(e){
		  var isShowAll = $(e.target).text()==="全表示に切替";
		  $(e.target).text(isShowAll ? "タブ毎の表示に切替" : "全表示に切替");
		  $(e.target).trigger(new $.Event("changeDisplayMode", {isShowAll:isShowAll}))
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  }},
  {code: 'bar2', type:'bar'},
  {code: 'sendAlarm', type:'item', label: 'アラームを送信する',
	  click:function(e){
		  $(e.target).trigger(new $.Event("sendAlarm"))
		  com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent(e.target);
	  }},
  {code: 'bar3', type:'bar'},
  {code: 'lineshare', type:'link', label:'LINE で招待する',
   url:'http://line.me/R/msg/text/?' + encodeURIComponent('ここからどどんとふにアクセス! ' + location.toString())},
  {code: 'bar4', type:'bar', disabled:function(status){return Boolean(status.pass);}},
  {code: 'twittershare', type:'link', label:'Twitter で招待する',
   url:'https://twitter.com/intent/tweet?text=' + encodeURIComponent('ここからどどんとふにアクセス! ' + location.toString()),
      disabled:function(status){return Boolean(status.pass);}}
                                        	  ];

com.hiyoko.tofclient.Chat.SubMenu.List.fireCloseEvent = function($html) {
	$($html).trigger(new $.Event("closeSubMenu"));
};


