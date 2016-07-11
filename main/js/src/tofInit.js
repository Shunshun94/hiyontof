(function(){
	var initData = {
			url: getParam("url", false),
			room: getParam("room", false),
			pass: getParam("pass",false),
	};
	
	var serverListModule = new com.hiyoko.tofclient.ServerList();
	var serverList = serverListModule.getList();
	var alertServerList = '';
	var singleServerCandidate = {count:0, url: ''};
	for(var key in serverList) {
		singleServerCandidate.count++;
		singleServerCandidate.url = key;
		alertServerList += '\n＊' + serverList[key];
	}
	if (com.hiyoko.tofclient.ServerList.RESTRICTION) {
		$('#tofChat-init-url').attr('placeholder', 'リストからアクセスするどどんとふを選択');
		if (initData.url && ! Boolean(serverList[initData.url])) {
			alert('本ひよんとふは以下のサーバにのみアクセスできます。\nそれ以外のどどんとふにはアクセスできません。\n' + alertServerList);
			initData.url = '';
		}
		if(singleServerCandidate.count === 1) {
			$("#tofChat-init-url").val(singleServerCandidate.url);
		}
	} else {
		$("#tofChat-init-url").attr("placeholder", "アクセスするどどんとふの URL を入力");
	}
	
	if(initData.url && initData.room){
		var myTofRoom = new com.hiyoko.tof.room(initData.url, initData.room, initData.pass, function(tof){
			new com.hiyoko.tofclient.App(tof);
			serverListModule.appendListToStorage(initData.url);
		});
	}else{
		for(var key in serverList) {
			$("#tofChat-init-url-list").append(
					"<option value=\""+key+"\">"+serverList[key]+"</option>"
			);
		}
		$("#tofChat-init").show();
		$("#tofChat-work").hide();
		$("#tofChat-tabs").hide();
		if(initData.url ){$("#tofChat-init-url").val(initData.url);  }
		if(initData.room){$("#tofChat-init-room").val(initData.room);}
		if(initData.pass){$("#tofChat-init-pass").val(initData.pass);}
		$("#tofChat-init-advanced-toggle").click(function(e){
			if($("#tofChat-init-advanced").css("display") === "block"){
				$("#tofChat-init-advanced-toggle").text("追加メニューを表示▼");
			} else {
				$("#tofChat-init-advanced-toggle").text("追加メニューを隠す▲");
			}
			$("#tofChat-init-advanced").toggle(500);
		});

		$("#tofChat-init-jump").click(function(event){
			document.location = document.location.protocol + '//' +
			document.location.host +
			document.location.pathname +
			"?url="   + $("#tofChat-init-url").val() +
			"&room="  + $("#tofChat-init-room").val()+
			"&pass="  + $("#tofChat-init-pass").val()+
			"&reload="+ (Number($("#tofChat-init-reload").val())*1000)+
			"&"+$("#tofChat-init-time input:checked").val()
		});
	}	
})();

