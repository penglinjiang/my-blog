
/*
 * GET home page.
 */
var request = require('request');
var async = require('async');
var db = require('./db.js');
//post公共方法
function pushByPost(url, postParams, callback) {
    var postBody = {
        headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
        form    : postParams,
    };
    request.post(url, postBody, function(err, resp, body){
        if(err) {
            callback (err, null);
        }else {
            console.log('返回参数：',body);
            var res = typeof body === 'string' ? JSON.parse(body) : body;
            callback (null, res);
         }
    });
}


exports.index = function(req, res){
  res.render('index', { sign: '注册', login: '登陆' })
};

exports.addUser = function (req, res){
  var username = req.body.userName;
  var password = req.body.password;
  if(!username || !password){
    return res.send("用户信息不能为空");
  }
  var sql = 'insert into user(username,password) values(?,?)';
  db.query(sql, [username,password],function(err,results){
    console.log('数据库操作为',err,results);
    if(err){
      return res.send('添加失败');
    }else{
      return res.send('添加成功');
    }
  });
}

exports.login = function (req, res){
  var username = req.body.userName;
  var password = req.body.password;
  if(!username || !password){
    return res.send("用户名或密码不能为空");
  }
  var sql = "SELECT * FROM user WHERE username = ?";
  db.query(sql,[username],function(err,results){
    console.log('数据库操作为：',err,results);
    if(err){
      return res.send("登陆失败");
    }else{
      if(results.length === 0){
        return res.send("用户不存在");
      }else{
        var pass = results[0].password;
        if(pass !== password){
          return res.send("密码错误");
        }
        return res.send('登陆成功！');
      }
    }
  })
}



//推送获取token
exports.getAccessToken = function (req, res){
    var url = ' https://login.vmall.com/oauth2/token';
    var postParams = {
        grant_type    : 'client_credentials',
        client_id     : 10743830,
        client_secret : 'feb93b27aef654b3f902a234eea2683c'
    };
    pushByPost(url, postParams, function(err,body){
        if(err){
            res.send({code : 0, message : '获取token失败'});
        }else{
            res.send({code : 1, message : body});
        }
    });
}
//通知栏消息推送
exports.noticeSend = function (req, res) {
  var url = 'https://api.vmall.com/rest.php';
  var postParams = {};
  postParams.push_type = parseInt(req.body.push_type) || 2;//1：指定用户，必须指定tokens字段 2：所有人，无需指定tokens，tags，exclude_tags 3：一群人，必须指定tags或者exclude_tags字段
  postParams.tokens = req.body.tokens ;//用户标识样例： xxx, ddd 多个token用","分隔
  postParams.tags = req.body.tags || null;
  postParams.excludes_tags = req.body.excludes_tags || null;
  postParams.android = req.body.android || null;//样例：{"notification_title":"the good news!","notification_content":"Price reduction!","doings":3,"url":"vmall.com"}
  postParams.send_time = req.body.send_time || null;
  postParams.expire_time = req.body.expire_time || null;
  postParams.device_type = req.body.device_type || 1;
  postParams.allow_periods = req.body.allow_periods || null;
  postParams.nsp_svc = 'openpush.openapi.notification_send';
  postParams.nsp_ts = new Date().getTime();
  postParams.access_token = req.body.access_token;
  var arr = [];
  for(var i = 0; i < 100; i++){
    arr.push(i);
  }
  var count = 0 ;

  async.whilst(function(){
    return count < arr.length;
  }, function(cb){
     var number = arr[count];
     console.log('第'+number+'次推送，推送前');
     postParams.android = JSON.parse(postParams.android);
     postParams.android.notification_title = number;
     postParams.android = JSON.stringify(postParams.android);
     //console.log(1111111,postParams);
     setTimeout(function(){
     pushByPost(url, postParams, function(err, body){
       console.log('第'+number+'次推送收到返回成功');
       count++;
       if(err){
          res.send({code : 0, message : '通知栏消息推送失败'});
          cb(err);
       }else{
        cb();
       }
     });
     },1000);

  },function(err){
    console.log(err);
    res.send({code : 1, message : 'chenggong'});
  })
  // async.eachSeries(arr,function(number,cb){
  //    console.log('第'+number+'次推送，推送前');
    //  postParams.android = JSON.parse(postParams.android);
    //  postParams.android.notification_title = number;
    //  postParams.android = JSON.stringify(postParams.android);
    //  pushByPost(url, postParams, function(err, body){
    //    console.log('第'+number+'次推送收到返回成功');
    //    if(err){
    //       res.send({code : 0, message : '通知栏消息推送失败'});
    //       cb(err);
    //    }else{
    //     cb();
    //    }
    //  });
  //  },function(err){
  //    if(err){
  //      res.send({code : 0, message : '通知栏消息推送失败'});
  //    }else{
  //      res.send({code : 1, message : '成功'});
  //    }
  // });
};

//群发消息推送(透传)
exports.batchSend = function (req, res) {
  var url = 'https://api.vmall.com/rest.php';
  var postParams = {};
  postParams.nsp_svc = 'openpush.message.batch_send';
  postParams.nsp_ts = new Date().getTime();
  postParams.access_token = req.body.access_token;
  postParams.deviceTokenList = req.body.deviceTokenList.split(',');
  postParams.message = req.body.message;
  postParams.cacheMode = parseInt(req.body.cacheMode) || 0;
  postParams.msgType = parseInt(req.body.msgType);
 // postParams.expire_time = req.body.expire_time || null;
  console.log('batchSend',postParams);
  pushByPost(url, postParams, function(err,body){
    if(err){
      res.send({code : 0, message : '群发消息推送(透传)失败'});
      console.log(err,body);
    }else{
      res.send({code : 1, message : body});
    }
  })
};

//单发消息推送（透传）
exports.singleSend = function (req, res) {
  var url = 'https://api.vmall.com/rest.php';
  var postParams = {};
  postParams.access_token = req.body.access_token;
  postParams.nsp_ts = new Date().getTime();
  postParams.nsp_svc = 'openpush.message.single_send';
  postParams.deviceToken = req.body.deviceToken;
  postParams.message = req.body.message;
  postParams.priority = parseInt(req.body.priority) || 1;
  postParams.cacheMode = parseInt(req.body.cacheMode) || 0;
  postParams.msgType = parseInt(req.body.msgType);
  postParams.requestID = req.body.requestID || null;
  //postParams.expire_time = req.body.expire_time || null;
  console.log('singleSend',postParams);
    pushByPost(url, postParams, function(err,body){
    if(err){
      res.send({code : 0, message : '单发消息推送(透传)失败'});
      console.log(err,body);
    }else{
      res.send({code : 1, message : body});
    }
  })
}