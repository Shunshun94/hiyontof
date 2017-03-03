(function(){
	var initData = {
			url: getParam("url", false),
			room: getParam("room", false),
			pass: getParam("pass",false),
			name: getParam("name",false)
	};
	
	var serverListModule = new com.hiyoko.tofclient.ServerList();
	var serverList = serverListModule.getList(startsWith(document.location.protocol, 'https') ? 'https' : '');

	var alertServerList = '';
	var singleServerCandidate = {count:0, url: ''};
	for(var key in serverList) {
		singleServerCandidate.count++;
		singleServerCandidate.url = key;
		alertServerList += '\n＊' + serverList[key];
	}

	if (initData.url) {
		if (! Boolean(serverList[initData.url]) && com.hiyoko.tofclient.ServerList.RESTRICTION) {
			alert('本ひよんとふは以下のサーバにのみアクセスできます。\nそれ以外のどどんとふにはアクセスできません。\n' + alertServerList);
			initData.url = '';
		} else if (initData.url.indexOf('ddntf.museru.com') !== -1) {
			alert('ひよんとふはどどんとふむせるにはアクセスできません');
			initData.url = '';
		}　else if (startsWith(document.location.protocol, 'https') && !startsWith(initData.url, 'https://')) {
			alert('本ひよんとふは  URL が https で始まるどどんとふにのみアクセスできます');
			initData.url = '';
		}
	}
	if(com.hiyoko.tofclient.ServerList.RESTRICTION && singleServerCandidate.count === 1) {
		$("#tofChat-init-url").val(singleServerCandidate.url);
	}
	if (com.hiyoko.tofclient.ServerList.RESTRICTION) {
		$('#tofChat-init-url').attr('placeholder', 'リストからアクセスするどどんとふを選択');
	} else if (startsWith(document.location.protocol, 'https')) {
		$("#tofChat-init-url").attr("placeholder", "[https://～ のみ可] アクセスするどどんとふの URL を入力");
	} else {
		$("#tofChat-init-url").attr("placeholder", "アクセスするどどんとふの URL を入力");
	}


	if(initData.url && initData.room){
		var myTofRoom = new com.hiyoko.tof.room(initData.url, initData.room, initData.pass, function(tof){
			new com.hiyoko.tofclient.App(tof);
			serverListModule.appendListToStorage(initData.url);
		});
	}else{
		$('#tofChat-init-reload').attr('min', com.hiyoko.tofclient.App.MIN_UPDATE_INTERVAL);
		$('#tofChat-go-out').remove();
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
		$("#tofChat-init-name").val(decodeURI(initData.name || localStorage.getItem("name") || 'ななしのひよこ'));
		
		$("#tofChat-init-advanced-toggle").click(function(e){
			if($("#tofChat-init-advanced").css("display") === "block"){
				$("#tofChat-init-advanced-toggle").text("追加メニューを表示▼");
			} else {
				$("#tofChat-init-advanced-toggle").text("追加メニューを隠す▲");
			}
			$("#tofChat-init-advanced").toggle(500);
		});

		$("#tofChat-init-roomlist").click(function(event) {
			document.location = './roomlist.html';
		});
		
		$("#tofChat-init-jump").click(function(event){
			document.location = document.location.protocol + '//' +
			document.location.host +
			document.location.pathname +
			"?url="   + $("#tofChat-init-url").val() +
			"&room="  + $("#tofChat-init-room").val()+
			"&pass="  + $("#tofChat-init-pass").val()+
			"&reload="+ (Number($("#tofChat-init-reload").val())*1000)+
			"&name="+ ($("#tofChat-init-name").val()  || 'ななしのひよこ') +
			"&"+$("#tofChat-init-time input:checked").val()
		});
	}	
})();

