

$("#tofChat-version").text("ひよこどどんとふクライアント Ver. 20160702");

(function(){
	var initData = {
			url: getParam("url", false),
			room: getParam("room", false),
			pass: getParam("pass",false),
	};
	
	$('div[data-role=footer]>p').append('<br/><small><a href="http://shunshun94.web.fc2.com/material/hiyontof-libs.html">Libraries List</a></small>');
	
	var serverList = new com.hiyoko.tofclient.ServerList();

	if(initData.url && initData.room){
		var myTofRoom = new com.hiyoko.tof.room(initData.url, initData.room, initData.pass, function(tof){
			new com.hiyoko.tofclient.App(tof);
			serverList.appendListToStorage(initData.url);
		});
	}else{
		var list = serverList.getList();
		$("#tofChat-init-url").attr("placeholder", "どどんとふの URL を入力");
		for(var key in list){
			$("#tofChat-init-url-list").append(
					"<option value=\""+key+"\">"+list[key]+"</option>"
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

