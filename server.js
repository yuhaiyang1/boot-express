      /*           以下代码等下会有详细的解释              */
    // author: 老余
    //中间件用use,请求就是get和post
      var express = require('express');  // 用来引入express模块
      var app     = express();  // express 实例对象
      var path = require('path');
      var fs = require("fs");
      var multer  = require('multer');//上传文件模块
      var upload = multer({ dest: 'upload/' }); //指定上传过来的文件目录，如果没有自己创建
      var bodyParser = require('body-parser'); //解析post提交方式参数问题
      var MongoClient = require('mongodb').MongoClient;//连接远程数据库
      var DB_CONN_STR = 'mongodb://localhost:27017/first';
      var urlencodedParser = bodyParser.urlencoded({ extended: false });
      //seession
      var cookieParser = require('cookie-parser');
      var session = require('express-session');
      app.use(cookieParser('wilson'));
      //使用就靠这个中间件
      app.use(session({ secret: 'wilson'}));
      app.set('port',process.env.PORT || 3000);  // 设置端口为3000
      //根路由
      app.get('/',function  (req,res) {          //  设置首页的路由 用 '/' 表示
          if(req.session.user){
            res.send('欢迎'+req.session.user+'登录')
            }else{
                 res.redirect('/index.html'); //如果用户没有登录重定向到登录页
            }
      })
      //路由匹配
      app.get('/bootsrap/html/index.html',function(req,res,next){
        if(req.session.user){
            next();
          }else{
               res.redirect('/index.html'); //如果用户没有登录重定向到登录页
          }
      });
      //返回静态资源
      app.use(express.static(path.join(__dirname, 'public'),{'index':false}));//设置public为静态资源
      //登录
      app.post('/login', urlencodedParser, function (req, res) {
        // 输出 JSON 格式
         response = {
             userName:req.body.userName,
             passWord:req.body.passWord
         };
         var dbData =response;
         //查询数据库
         var p1 = new Promise(function (resolve, reject) {
            db(dbData,resolve);
          });
          p1.then( ret => {
              console.log(ret,'xxxx');
              if(ret.length != 0){
                req.session.user = ret[0].name;
                res.redirect('/bootsrap/html/index.html?user='+ret[0].name);
              }else {
                res.json({message:'用户不存在'});
              }
          })
         //res.end(JSON.stringify(response));
      })
      //退出
      app.post('/exit', urlencodedParser,function(req,res){
        console.log(res.status);
        req.session.user = null;
        //let data = JSON.stringify({'a':1});
        res.json({success:true})
      })
      //上传普通文件
      app.post('/upload', upload.single('logo'), function(req, res, next){
        res.send('上传成功');
      });
      //下载
      app.get('/download',function(req,res){
        res.download('./upload/test')
      })
      //404
      app.use(function  (req,res,next) {         // 设置404页面
      res.status(404);
       res.send('404 - Not Found')
      })
      //监听端口
      app.listen(app.get('port'),function  () {      // 监听端口如果有用户进入页面发送请求我们输出以下语句
        console.log('express started on port 3000')
      })
      //查询数据库函数
      function db(data,resolve){
        var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('test');
        var whereStr = {'name': data.userName}
        //查询数据
        collection.find(whereStr).toArray(function(err, result) {
            if(err)
            {
              console.log('Error:'+ err);
              return;
            }else {
              if(result){
                console.log(result);
                resolve(result)
              }else {
                resolve(false)
              }
            }

          });
        }
        MongoClient.connect(DB_CONN_STR, function(err, db) {
          console.log("连接成功！");
          selectData(db, function(result) {
            console.log(result);
            db.close();
    });
  });
}
