var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Memo = function(tof, interval, opt_$html){
	var $html = opt_$html ? opt_$html : $("#tofChat-memo");
	var $disp = $("#tofChat-memo-display");
	var $read = $("#tofChat-memo-reload");
	var $cont = $("#tofChat-memo-content");
	var $send = $("#tofChat-memo-append");
	var $update = $("#tofChat-memo-lastupdate");
	
	var list = {};
	
	var MemoClass = com.hiyoko.tofclient.Memo.TabedMemo;
	
	function isActive() {
		return $html.css('display') !== 'none';
	}
	
	var init = function(version){
		if (version.number < 104815) {
			MemoClass = com.hiyoko.tofclient.Memo.SimpleMemo;
		}
		
		$read.click(function(e){
			loadMemo();
		});
		$send.click(function(e){
			tof.appendMemo($cont.val(), loadMemo);
			$cont.val("");
		});
		
		$disp.on("updateMemo", function(e) {
			tof.changeMemo(e.memo.getText(), e.memo.getId());
		});

		if(interval){
			window.setInterval(function(){
				if(!isActive() || $(document.activeElement).hasClass('tofChat-memo-text')) {
					return;
				}
				$read.click();
			}, interval);
		}
		$read.click();
	};
	
	var displayMemos = function(result){
		var noMemo = true;
		var time = result.lastUpdateTimes.characters;
		
		$.each(result.characters, function(ind, memo){
			if(memo.type !== "Memo"){return;}
			noMemo = false;
			
			if(Boolean(list[memo.imgId])) {
				list[memo.imgId].setText(memo.message);	
			} else {
				list[memo.imgId] = new MemoClass(memo);
				$disp.append(list[memo.imgId].rend());				
			}
			list[memo.imgId].updateTime = time;
		});
		if(noMemo) {
			$disp.append("<p>表示すべきメモがありません</p>");
		}
		
		for(var key in list) {
			if(list[key].updateTime !== time) {
				list[key].$elem.remove();
				list[key] = null;
			}
		}
	};
	
	var loadMemo = function(){
		tof.getRefresh(function(result){displayMemos(result)}, true);
		var now = new Date();
		$update.text('Memo Last Update： ' + now.getHours() + '：' + now.getMinutes() + '：' + now.getSeconds());
	};
	
	tof.getServerVersion(function(version){init(version);});	
};

com.hiyoko.tofclient.Memo.TabedMemo = function(data) {
	var id = data.imgId;
	var texts = data.message.split('\t|\t');
	var self = this;
	var activeTab = 0;
	
	this.$elem = $("<div class='tofChat-memo-tabledmemo'></div>");
	this.$tabs = $("<div class='tofChat-memo-tabledmemo-tab'></div>");
	this.$text = $("<div class='tofChat-memo-tabledmemo-text tofChat-memo-text' contenteditable='true'></div>");
	
	this.updateTime;
	
	this.getId = function(){
		return id;
	};
	
	this.getText = function(){
		return texts.join('\t|\t');
	};
	
	this.setText = function(text){
		self.$text.text(text);
		self.$text.html(self.$text.html().replace(/[\n\r]/gm, '<br/>'));
		texts[activeTag] = text;
	};
	
	this.rend = function() {
		$.each(texts, function(i,text) {
			var $tab = $("<div class='tofChat-memo-tabledmemo-tab-tab'></div>");
			$tab.text(text.substring(0,4));
			$tab.val(i);
			self.$tabs.append($tab);
		});
		
		self.$text.text(texts[activeTab]);
		self.$text.html(self.$text.html().replace(/[\n\r]/gm, '<br/>'));
		
		self.$elem.append(self.$tabs);
		self.$elem.append(self.$text);
		
		

		//bindEvent($elem);
		return self.$elem;
	};

};

com.hiyoko.tofclient.Memo.SimpleMemo = function(data) {
	var id = data.imgId;
	var text = data.message;
	var self = this;
	this.$elem = $("<div class='tofChat-memo-simplememo tofChat-memo-text' contenteditable='true'></div>");
	this.updateTime;
	
	this.getId = function(){
		return id;
	};
	
	this.getText = function(){
		return text;
	};
	
	this.setText = function(text){
		this.$elem.text(text);
		this.$elem.html(this.$elem.html().replace(/[\n\r]/gm, '<br/>'));
	};
	
	this.rend = function(){
		this.$elem.text(text);
		this.$elem.html(this.$elem.html().replace(/[\n\r]/gm, '<br/>'));
		bindEvent(this.$elem);
		return this.$elem;
	};
	
	function bindEvent($tag){
		$tag.on('focusout', function(e){
			text = $tag.html().replace(/<\/?div\/?>/gm, '').replace(/<br\/?>/gm, '\n').replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
			var event = new $.Event("updateMemo", {memo:self});
			$tag.trigger(event);
			$tag.css('opacity', '0').animate({opacity:'1'}, 800);
		});
	}
	
};