var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.App = function(tof) {
	tof.isVisitor(function(isVisitor) {
		var interval = Number(getParam("reload", 0));
		if(interval < 10000) {
			interval = 0;
		}
		
		this.chat = new com.hiyoko.tofclient.Chat(tof, interval, {visitor: isVisitor});
		this.map = new com.hiyoko.tofclient.Map(tof, true);
		this.memo = new com.hiyoko.tofclient.Memo(tof, interval, $("#tofChat-memo"));
		this.table = new com.hiyoko.tofclient.Table(tof, interval, $("#tofChat-table"), true, false);
		this.init = function(){
			$(".tofChat-button").addClass("ui-btn ui-shadow ui-btn-corner-all ui-fullsize ui-btn-block ui-btn-up-f");
			$(".tofChat-button-heavy").addClass("ui-btn ui-shadow ui-btn-corner-all ui-fullsize ui-btn-block");
			$(".tofChat-tab").click(function(e){
				try{
					$('html,body').scrollTop(0);
					$(".tofChat-tabContent").hide();
					$(".tofChat-tab").removeClass("active");
					$(this).addClass("active");
					$("#" + $(this).attr("title")).show();
				}catch(e){
					alert("ERROR @Shunshun94 にこの文字列 (ないし画面) を送ってください: " + e.stack);
				}
			});
	
			$(window).scroll(function(e){
				if($(window).scrollTop() > 42){
					$("#tofChat-tabs").css("top", "0px");
				} else {
					$("#tofChat-tabs").css("top", (42-$(window).scrollTop())+"px");
				}
			});
			
	
		};
	
		this.init();
	});
};