var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.App = {};
com.hiyoko.tofclient.Chat = {};
com.hiyoko.tofclient.Chat.Display = {};

com.hiyoko.tofclient.URL = './hiyontof.html';

com.hiyoko.tofclient.RoomList = function(serverListModule, opt_$html) {
	var self = this;
	
	var $html = opt_$html || $('#tofChat-RoomList');
	var id = '#' + $html.attr('id') + '-';
	
	
	var $serverList = $(id + 'Servers');
	var $roomList = $(id + 'Rooms');
	var roomClass = $roomList.attr('id')+'-Room';

	this.bindEvents = function() {
		$serverList.change(function(e){
			$roomList.empty();
			if($serverList.val()){
				(new com.hiyoko.tof($serverList.val())).getRoomList(self.rendRoomList);
			}
		});
		
		$roomList.click(function(e){
			if($(e.target).hasClass(roomClass + '-entry')){
				self.jumpToRoom($(e.target));
			}
		})
	};
	
	this.init = function() {
		var serverList = serverListModule.getList(startsWith(document.location.protocol, 'https') ? 'https' : '');
		var initServerCandidate = {count:0, url:''};
		
		for(var key in serverList) {
			$serverList.append("<option value=\""+key+"\">"+serverList[key]+"</option>");
			initServerCandidate.count++;
			initServerCandidate.url = key;
		}
		
		if(initServerCandidate.count === 1) {
			$serverList.val(initServerCandidate.url);
			$serverList.change();
			$serverList.remove();
		}
		
		
	};
	
	this.jumpToRoom = function($button) {
		var roomNumber = $button.attr('no') ? Number($button.attr('no')) : '';
		var tofUrl = $serverList.val();
		var pass = '';
		
		var name = window.prompt('名前を入力してください', (localStorage.getItem("name") || 'ななしのひよこ'));
		
		if($button.hasClass('password')) {
			var pass = window.prompt('パスワードを入力してください');
		}
		
		var hiyontof = com.hiyoko.tofclient.URL;
		
		hiyontof += '?url=' + tofUrl;
		hiyontof += '&room=' + roomNumber;
		hiyontof += '&name=' + (name || 'ななしのひよこ');
		if(pass){ hiyontof += '&pass=' + pass}
		hiyontof += '&reload=15000';
		document.location = hiyontof;
	};
	
	this.rendRoomList = function(rooms) {
		var $tof = $('<div class="' + roomClass + '"></div>');
		$tof.append('<span no="" class="' + roomClass + '-entry">番号を入力して入室</span>');
		$roomList.append($tof);
		var roomList = rooms.playRoomStates;
		$.each(roomList, function(roomNo){
			var room = roomList[roomNo];
			if(room.lastUpdateTime){
				$roomList.append(self.rendRoom(room));
			}
		});
	};
	
	this.rendRoom = function(room) {
		var $room = $('<div class="' + roomClass + '"></div>');
		$room.append('<span class="' + roomClass + '-no">No. ' + room.index + '</span> - ');
		$room.append('<span class="' + roomClass + '-name">' + room.playRoomName + '</span>');
		$room.append('<br/><span class="' + roomClass + '-bot">Dice: ' + room.gameType + '</span>');
		$room.append('<span class="' + roomClass + '-member">人数: ' + room.loginUsers.length + '人</span>');
		if(room.passwordLockState) {
			$room.append('<br/><span no="'+room.index+'" class="' + roomClass + '-entry password">🔑 パスワードを入れて入室</span>');
			if(room.canVisit) {
				$room.append('<span no="'+room.index+'" class="' + roomClass + '-entry visitor">🎦 見学者として入室</span>');
			}
		} else {
			$room.append('<br/><span no="'+room.index+'" class="' + roomClass + '-entry">入室</span>');
		}
		return $room;
	};
	
	this.bindEvents();
	this.init();
};
