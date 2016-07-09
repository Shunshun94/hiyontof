# hiyontof

HTML/JS で動くスマートフォン向けどどんとふクライアントです。

ひよこどどんとふクライアント、略して **ひよんとふ** 、と呼んでます。
**ひよこんとふ** とか、 **ひよこクライアント** とか、そんな呼ばれ方をしていることもあります。

どどんとふについては [どどんとふ＠えくすとり～む](http://www.dodontof.com/) をお読みください。

## 設置手順

以下2つのコマンドをリポジトリ内で実行した後、
main ディレクトリの中身をまとめて任意のディレクトリにデプロイしてください。

``$ git submodule init``   
``$ git submodule update``

その後、ユーザを hiyontof.html にアクセスするように誘導してください。

### 何故 git submodule を実行しないといけないの?

jscolor というライブラリをダウンロードしてくるためのコマンドです。
``main/js/lib/jscolor`` 以下に ``jscolor.min.js`` を手動で設置していただいてもかまいません。

### 他のライブラリはどうするの?

各ライブラリがホストしている CDN 等からアクセスしています。
``git submodule`` で配置しているものは、その URL が公式に示されていないためにこのようにしています。

## 利用しているライブラリ類

### Template-Party のデザインテンプレート

見た目のために利用しています。
利用規約 http://template-party.com/read.html

### jQuery v.1.11.1

Copyright (c) 2005, 2014 jQuery Foundation, Inc.

MIT ライセンスです。ライセンス情報 https://jquery.org/license/

### jQuery Mobile v1.1.0

Copyright (c) 2010, 2012 jQuery Foundation, Inc.

MIT ライセンスです。ライセンス情報 https://jquery.org/license/

### jquery.pep.js

Copyright (c) 2014 Brian Gonzalez

マップのドラッグアンドドロップの制御に使っています。
MIT ライセンスです。ライセンス情報 https://github.com/briangonzalez/jquery.pep.js#license

### jscolor

Copyright (c) 2010, 2015 East Desire

チャットの文字色選択に使っています。
GNU GENERAL PUBLIC LICENSE Version 3 です。ライセンス情報 http://jscolor.com/download/

## ライセンス

hiyontof は GNU GENERAL PUBLIC LICENSE Version 3 でライセンスします。
詳細は LICENSE ファイルを参照してください。

