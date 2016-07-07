/**
 * 
 */

var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};

com.hiyoko.tofclient.ServerList = function() {
  this.list = this.loadListFromStorage();
  var defaultList = com.hiyoko.tofclient.ServerList.SERVER_LIST;
  for(var key in defaultList){
	  this.list[key] = defaultList[key];
  }
};

com.hiyoko.tofclient.ServerList.prototype.getList = function(){
	return this.list;
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

com.hiyoko.tofclient.ServerList.SERVER_LIST = {
		'https://www.taruki.com/DodontoF_srv1/DodontoF.swf':'公式第三世代第壱鯖',
		'https://www.taruki.com/DodontoF_srv2/DodontoF.swf':'公式第三世代第弐鯖',
		'https://www.taruki.com/DodontoF_srv3/DodontoF.swf':'公式第三世代第参鯖',
		'https://www.taruki.com/DodontoF_srv4/DodontoF.swf':'公式第三世代第四鯖',
		'http://onse01.wtrpg.com/DodontoF/DodontoF.swf':'クラウドゲート公式',
		'http://dodontof.incoglab.com/DodontoF.swf':'インコグ・ラボ',
		'http://d1.trpg.net/DodontoF.swf':'TRPG.NET 第1',
		'http://d2.trpg.net/DodontoF.swf':'TRPG.NET 第2',
		'http://d3.trpg.net/DodontoF.swf':'TRPG.NET 第3',
		'http://trpg.gigafreaks.com/dodontof/DodontoF.swf':'如月翔也さん',
		'http://egotex.net/DodontoF/DodontoF.swf':'EGOTEX',
		'https://dodontof.cokage.works/': 'こかげサーバ'
};
