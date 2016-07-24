/**
 * hiyontof config file
 * 
 * ひよんとふの設定用 JavaScript です。
 */

/**
 * 名前空間
 */
var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};


/** 
 * ログインできるサーバ一覧
 */

com.hiyoko.tofclient.ServerList = com.hiyoko.tofclient.ServerList || {};

/**
 * 最初から登録されているサーバ一覧。
 * ここに追加すれば別のサーバをデフォルトで表示させておくことができるし、
 * ここから削除すればそのサーバはデフォルトでは表示されなくなる。
 * 例えば、もしも自鯖にひよんとふを設置するならば、あなたのサーバをここに追加するといいかもしれない。
 */
com.hiyoko.tofclient.ServerList.SERVER_LIST = {
		'https://www.taruki.com/DodontoF_srv1/DodontoF.swf':'公式第三世代第壱鯖',
		'https://www.taruki.com/DodontoF_srv2/DodontoF.swf':'公式第三世代第弐鯖',
		'https://www.taruki.com/DodontoF_srv3/DodontoF.swf':'公式第三世代第参鯖',
		'https://www.taruki.com/DodontoF_srv4/DodontoF.swf':'公式第三世代第四鯖',
		'http://onse01.wtrpg.com/DodontoF/DodontoF.swf':'クラウドゲート公式',
		'http://dodontof.incoglab.com/DodontoF.swf':'インコグ・ラボ',
		'https://d1.trpg.net/DodontoF.swf':'TRPG.NET 第1',
		'https://d2.trpg.net/DodontoF.swf':'TRPG.NET 第2',
		'https://d3.trpg.net/DodontoF.swf':'TRPG.NET 第3',
		'http://trpg.gigafreaks.com/dodontof/DodontoF.swf':'如月翔也さん',
		'http://egotex.net/DodontoF/DodontoF.swf':'EGOTEX',
		'https://dodontof.cokage.works/': 'こかげサーバ'
};

/**
 * 最初から登録されているサーバ以外のどどんとふへのアクセスを不可とするか、否かを設定する。
 * false (初期値)。 webif でつなげるすべてのサーバへの接続を許可する。
 * true にすると com.hiyoko.tofclient.ServerList.SERVER_LIST に登録されているサーバにしかアクセスできないようになる。
 */
com.hiyoko.tofclient.ServerList.RESTRICTION = false;