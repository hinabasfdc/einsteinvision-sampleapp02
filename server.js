//各種ライブラリの読み込み
var http = require('http');
var request = require('request');
var jwt = require('jsonwebtoken');
var static = require('node-static');
var file = new static.Server('./public');

//各種定数の取得・定義
var private_key = process.env.EINSTEIN_VISION_PRIVATE_KEY
var account_id = process.env.EINSTEIN_VISION_ACCOUNT_ID
var BASE_URL = process.env.EINSTEIN_VISION_URL + process.env.API_VERSION;
var OAUTH2_URL = BASE_URL + '/oauth2/token';
var IMAGECLASSIFICATION_URL = BASE_URL + '/vision/predict';

//HTTPサーバーの生成
var plainHttpServer = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 8081);

//Socket.ioによるメソッドコールを行う
var io = require('socket.io').listen(plainHttpServer);
io.sockets.on('connection', function (socket) {

    //予測・解析を実行するメソッド
    socket.on('getVisionPrediction', function (params, cb) {
        /*
        * OAUTH Token 取得プロセス
        */
        // JWT payload
        var rsa_payload = {
            "sub": account_id,
            "aud": OAUTH2_URL
        }

        var rsa_options = {
            header: {
                "alg": "RS256",
                "typ": "JWT"
            },
            expiresIn: '1m'
        }

        // Sign the JWT payload
        var assertion = jwt.sign(
            rsa_payload,
            private_key,
            rsa_options
        );

        //リクエストの組み立て
        var options = {
            url: OAUTH2_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
            },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}`
        }

        //組み立てたリクエスト文をPOSTで送信
        //レンスポンスが返ってきたらファンクション内を実行
        request.post(options, function (error, response, body) {

            /*
            * Vision API を呼び出すプロセス
            */
            //アクセストークンを含むJSONレスポンスをオブジェクトにパース
            var data = JSON.parse(body);

            //Multipart-Formで送るので渡されてきたモデルIDとbase64でエンコードされた画像データをFormデータ化準備
            var formData = {
                modelId: process.env.EINSTEIN_VISION_MODEL_ID,
                sampleBase64Content: params.base64img
            }

            //予測・解析を行うリクエスト文を組み立て
            var reqOptionsPrediction = {
                url: IMAGECLASSIFICATION_URL,
                headers: {
                    'Authorization': 'Bearer ' + data["access_token"],
                    'Content-Type': 'multipart/form-data'
                },
                formData: formData
            }

            //組み立てたリクエスト文を送信
            request.post(reqOptionsPrediction, function (error, response, body) {
                //引数として渡されてきたコールバック関数(クライアント側の関数)に、返り値のJSONを渡して呼び出し
                cb(body);
            });
        });
    });
});
