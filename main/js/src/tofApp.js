var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.App = function(tof, opt_base) {
	tof.isVisitor(function(isVisitor) {
		var interval = Number(getParam("reload", 0));
		if(interval < com.hiyoko.tofclient.App.MIN_UPDATE_INTERVAL * 1000) {
			interval = com.hiyoko.tofclient.App.MIN_UPDATE_INTERVAL * 1000;
		}
		
		var $base = opt_base || $('#tofChat-work');
		var isSilentMode = Boolean(getParam("silent", false));
		
		this.chat = new com.hiyoko.tofclient.Chat(tof, interval, {visitor: isVisitor, html:$("#tofChat-chat"), silent: isSilentMode});
		this.map = new com.hiyoko.tofclient.Map(tof, interval, {isDraggable: true, html:$("#tofChat-map"), debug:getParam("debug", false)});
		this.memo = new com.hiyoko.tofclient.Memo(tof, interval, $("#tofChat-memo"));
		this.table = new com.hiyoko.tofclient.Table(tof, interval, {html:$("#tofChat-table"), table:true, outerImage:tof.getStatus().outerImage , debug:false});
		this.init = function(self){
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
					alert("ERROR @Shunshun94 にこの文字列 (ないし画面) を送ってください\n" + e.stack);
				}
			});
	
			$(window).scroll(function(e){
				if($(window).scrollTop() > 42){
					$("#tofChat-tabs").css("top", "0px");
				} else {
					$("#tofChat-tabs").css("top", (42-$(window).scrollTop())+"px");
				}
			});
			
			$base.on('com.hiyoko.tofclient.Table.DataRequest' , function(e){
				self.table.getValuesAsync(e.promise);
			});
		};
	
		this.init(this);
	});
};

com.hiyoko.tofclient.App.MIN_UPDATE_INTERVAL = 10;