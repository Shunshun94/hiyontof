/**
 * 
 */

var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};

com.hiyoko.tofclient.ServerList = function() {
  this.list = com.hiyoko.tofclient.ServerList.RESTRICTION ? {} : this.loadListFromStorage();
  var defaultList = com.hiyoko.tofclient.ServerList.SERVER_LIST;
  for(var key in defaultList){
	  this.list[key] = defaultList[key];
  }
};

com.hiyoko.tofclient.ServerList.prototype.getList = function(opt_bind_protocol){
	if(opt_bind_protocol) {
		var filteredList = {};
		for(var key in this.list) {
			if(startsWith(key, opt_bind_protocol)) {
				filteredList[key] = this.list[key];
			}
		}
		return filteredList;
	} else {
		return this.list;
	}
};

com.hiyoko.tofclient.ServerList.prototype.loadListFromStorage = function(){
	var list = localStorage.getItem("com.hiyoko.tofclient.ServerList.list.store");
	if(list){
		return JSON.parse(list);
	} else {
		return {};
	}
};

com.hiyoko.tofclient.ServerList.prototype.saveListToStorage = function(list){
	localStorage.setItem("com.hiyoko.tofclient.ServerList.list.store",JSON.stringify(list));
};

com.hiyoko.tofclient.ServerList.prototype.appendListToStorage = function(url, opt_key){
	var list = this.loadListFromStorage();
	var key = opt_key || url;
	list[key] = url;
	this.saveListToStorage(list);
};

// See hiyontof.conf.js
com.hiyoko.tofclient.ServerList.SERVER_LIST = {};
com.hiyoko.tofclient.ServerList.RESTRICTION = false;
