var maximagesize = 960;

/****
 * ファイルがドロップされた時の処理
 ****/
function drop_handler(ev) {
    ev.preventDefault();

    var dt = ev.dataTransfer;
    var file;
    //itemsが存在する場合はitemsから、存在しない場合はfilesから実態を取得
    if (dt.items) {
        if (dt.items[0].kind == "file") {
            file = dt.items[0].getAsFile();
        }
    } else {
        file = dt.files[i].getAsFile();
    }

    //画像描画ロジックにまわす
    drawImage(file);
}

//ファイルがドラッグ中の処理
function dragover_handler(ev) {
    ev.preventDefault();
}

/****
 * カメラorファイルから画像を読み込み、サイズを縮小した上で表示
 ****/
function drawImage(file) {

    //fileがまだない場合(ドロップ処理から来た場合ではない)は本文のinputからファイルを取得
    if (!file){
      file = document.getElementById('file-upload-input-01').files[0];
    }

    //読み込むファイルを取得&画像ファイルでなければファンクション終了
    if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;

    //結果エリアの表示内容を空に
    document.getElementById('results').value = '';

    var image = new Image();
    var reader = new FileReader();

    //ファイル読み込み後のアクションを定義
    reader.onload = function(evt) {

        //画像読み込み後のアクションを定義
        image.onload = function() {

            //HTML5 CANVASオブジェクトを取得
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            var w = image.width;
            var h = image.height;

            //最大サイズより大きければリサイズする
            if (w > maximagesize || h > maximagesize) {
                var ratio = '';
                if (w > h) {
                    ratio = maximagesize / w;
                    w = maximagesize;
                    h = h * ratio;
                } else {
                    ratio = maximagesize / h;
                    h = maximagesize;
                    w = w * ratio;
                }
            }

            //CANVASのサイズをリサイズ後のサイズに合わせた後に描画実行
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(image, 0, 0, w, h);

            //表示用のイメージオブジェクトに、リサイズした画像データを転記
            document.getElementById('img_target').src = canvas.toDataURL('image/jpeg');
        }
        //画像ファイルをimgオブジェクトのソースに指定
        image.src = evt.target.result;
    }
    //ファイルを読み込み
    reader.readAsDataURL(file);
}

/****
 * 画像をクリック or タップしたら右に90度回転
 ****/
function rotateImage() {

    //CANVASオブジェクトを取得
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var image = new Image();

        image.onload = function() {
            canvas.width = image.height;
            canvas.height = image.width;
  
            //回転処理
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.translate(0, -image.height);
            ctx.drawImage(image, 0, 0);

            document.getElementById('img_target').src = canvas.toDataURL('image/jpeg');
      }
    image.src = document.getElementById('img_target').src;
}

/****
 * 画像をデータ化し、サーバー側のメソッドを呼び出す
 ****/
function getImageClassificationPrediction() {
    //通信中であることを示すアニメーションを表示
    document.getElementById('results').innerHTML = '通信中です…';

    socket.emit('getVisionPrediction', {
        predictiontype: 'IMAGECLASSIFICATION',
        base64img: document.getElementById('img_target').src.match(/,(.*)$/)[1]
    }, function(body) {
        document.getElementById('results').innerHTML = body;
    });
}

/****
 * ソケット接続を有効にする
 ****/
var socket = io.connect('/');