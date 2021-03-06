import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
var config = require("./config.js");
var collection = require("../collection/collection.js");
var getinfoJS = require("./methods/getinfo.js");
var courseJS = require("./methods/course.js");
var qrJS = require("./methods/qr.js");
var friendJS = require("./methods/friend.js");
var userqrJS = require("./methods/userqr.js");
var Info = collection.info;
var Course = collection.course;
var Student = collection.student;
var Friend = collection.friend;
var Userqr = collection.userqr;
var Messages = collection.message;
var Chatter = collection.chatter;

Meteor.startup(() => {

  if (Meteor.isServer) {
    // 修改iron:router,以满足xml请求
    Router.configureBodyParsers = function() {
      Router.onBeforeAction(Iron.Router.bodyParser.json());
      Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({extended: false}));
      // Enable incoming XML requests for creditReferral route
      Router.onBeforeAction(
        Iron.Router.bodyParser.raw({
          type: '*/*',
          verify: function(req, res, body) {
            req.rawBody = body.toString();
          }
        }),
        {
          only: ['/weixin'],
          where: 'server'
        }
      );
    };
    
  }
    
  Router.route('/', {where: 'server'})
    .get(function() {
        var req = this.request;
        var res = this.response;
        var signature = this.params.query.signature;
        var timestamp = this.params.query.timestamp;
        var nonce = this.params.query.nonce;
        var echostr = this.params.query.echostr;
        var l = new Array();
        l[0] = nonce;
        l[1] = timestamp;
        l[2] = config.token;
        l.sort();
        var original = l.join('');
        var sha = CryptoJS.SHA1(original).toString();
        if (signature == sha) {
          res.end(echostr);
        } 
        else {
          res.end("false");
        }
    }
  )
    .post(function() {
        var req = this.request;
        var res = this.response;
        res.end("test");
    });


  Router.route('/setmenu', function () {
    var res = this.response;
    try {
      var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.appID + "&secret=" + config.appsecret;
      var token_result = HTTP.get(token_url);
      var access_token = token_result.data.access_token;
      var menu_url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token;
      var menu_data = '{"button":[{"type":"view","name" : "查看个人信息","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{ "type":"view","name" : "群聊","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fchat&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect" },{ "name" : "课程","sub_button":[{"type":"view","name" : "所有课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fallcourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{ "type":"view","name" : "我的课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fmycourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"type":"view","name" : "创建课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fcreatecourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"}]}]}';
      var menu_result = HTTP.post(menu_url, {content: menu_data});
      res.end("set success" + menu_result.content);
    } catch (err) {
      res.end("network error " + err);
    }
  }, {where: 'server'});

  Router.route('/info', function () {
    var req = this.request;
    var code = this.params.query.code;
    var res = this.response;

      var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appID + '&secret=' + config.appsecret + '&code=' + code + '&grant_type=authorization_code';
      var oauth2_result = HTTP.get(oauth2_url);
      var oauth2_data = JSON.parse(oauth2_result.content);
      var openid = oauth2_data.openid;
      var access_token = oauth2_data.access_token;
      
      var userinfo_url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
      var userinfo_result = HTTP.get(userinfo_url);
      var userinfo_data = JSON.parse(userinfo_result.content);

      var mname = userinfo_data.nickname;
      var friendlist = Friend.find({mname : mname}).fetch();
      
      if(!Info.findOne({openid : openid}))
      {
        var uid = getinfoJS.num_user();
        var user_info = {};
        user_info.uid = uid;
        user_info.openid = openid;
        user_info.country = userinfo_data.country;
        user_info.province = userinfo_data.province;
        user_info.city = userinfo_data.city;
        user_info.nickname = userinfo_data.nickname;
        user_info.headimgurl = userinfo_data.headimgurl;
        user_info.qr = userqrJS.createqr(uid);
        Info.insert(user_info);
      };

      var t_info = getinfoJS.person_info(mname);
      console.log(t_info);
      var qr_url = t_info.qr;

      SSR.compileTemplate('info', Assets.getText('info.html'));
      Template.info.helpers({
        country: userinfo_data.country,
        province: userinfo_data.province,
        city: userinfo_data.city,
        nickname: userinfo_data.nickname,
        headimgurl: userinfo_data.headimgurl,
        qr_url: qr_url,
        friendlist: friendlist
      });
      var html = SSR.render("info");
      res.end(html);
      
  }, {where: 'server'});
  
  Router.route('/allcourse', function () {
    var req = this.request;
    var res = this.response;
    var code = this.params.query.code;

    var getinfo_result = getinfoJS.getinfo(code);
    var courselist = courseJS.allcourse();

    SSR.compileTemplate('allcourse', Assets.getText('allcourse.html'));
    Template.allcourse.helpers({
      courselist: courselist
    });
    var html = SSR.render('allcourse');
    res.end(html);
    
  }, {where: 'server'});
  
  Router.route('/mycourse', function () {
    var req = this.request;
    var res = this.response;
    var code = this.params.query.code;
    var openid = getinfoJS.getopenid(code);
    var name = getinfoJS.getname(openid);
    var s_courselist = courseJS.mycourse(name);

    SSR.compileTemplate('mycourse', Assets.getText('mycourse.html'));
    Template.mycourse.helpers({
      s_courselist: s_courselist
    });
    var html = SSR.render('mycourse');
    res.end(html);

  }, {where: 'server'});

  Router.route('/course/:_cname', function () {
    var req = this.request;
    var res = this.response;
    var cname = this.params._cname;
    var target_course = courseJS.search_course(cname);
    var addurl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx02ddd7bde50636da&redirect_uri=http%3A%2F%2Fwx.borelset.cn%2Faddcourse%2F" + cname + "&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect";
    var course_cid = target_course.cid;
    var qr_d = qrJS.getqr(course_cid);
    var qrurl = qr_d.url;
    var studentlist = Student.find({cname : cname}).fetch();
    SSR.compileTemplate('course', Assets.getText('course.html'));
    Template.course.helpers({
      name : target_course.name,
      teacher_name : target_course.teacher_name,
      addurl : addurl,
      studentlist : studentlist,
      qrurl : qrurl
    });
    var html = SSR.render('course');
    res.end(html);

  }, {where: 'server'});

    Router.route('/createcourse', function () {
    var req = this.request;
    var res = this.response;
    var code = this.params.query.code;
    //var getinfo_result = getinfoJS.getinfo(code);
    var openid = getinfoJS.getopenid(code);
    var tname = getinfoJS.getname(openid);

    SSR.compileTemplate('createcourse', Assets.getText('createcourse.html'));
    Template.createcourse.helpers({
      tname : tname,
      openid : openid
    });
    var html = SSR.render('createcourse');
    res.end(html);
  
  }, {where: 'server'});

    Router.route('/addcourse/:_cname', function () {
    var req = this.request;
    var res = this.response;
    var cname = this.params._cname;
    var code = this.params.query.code;
    var openid = getinfoJS.getopenid(code);
    var tname = getinfoJS.getname(openid);

    if(Student.findOne({cname : cname, sname : tname}))
    {
      res.end('你已经有这个课了');
    }
    else{
      var sc_rel = {};
      sc_rel.cname = cname;
      sc_rel.sname = tname;
      Student.insert(sc_rel);
      res.end('完成');
    }
  
  }, {where: 'server'});

    Router.route('/cc_submit', function () {
    var req = this.request;
    var res = this.response;

    var cname = req.body.cname;
    var tname = req.body.tname;
    var openid = openid;

    var cid = courseJS.num_course();

    if(courseJS.search_course(cname)) {
      res.end('already exist a course with a same name!');
    }
    else{
      courseJS.create_course(cid, cname, tname, openid);
      qrJS.createqr(cid);
      res.end('完成');
    }
  }, {where: 'server'});

    Router.route('/person_info/:_name', function () {
    var req = this.request;
    var res = this.response;
    var name = this.params._name;
    var pinfo = getinfoJS.person_info(name);

    var code = this.params.query.code;
    var openid = getinfoJS.getopenid(code);
    var mname = getinfoJS.getname(openid);
    var tname = name;

    if(friendJS.ensure_friend(mname, tname) == 0)
    {
      var str_mode = "加为好友";
      var mode_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx02ddd7bde50636da&redirect_uri=http%3A%2F%2Fwx.borelset.cn%2Faddfriend%2F" + tname + "&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect";
    }
    else
    {
      var str_mode = "删除好友";
      var mode_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx02ddd7bde50636da&redirect_uri=http%3A%2F%2Fwx.borelset.cn%2Fdelfriend%2F" + tname + "&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect";
    }

    SSR.compileTemplate('person_info', Assets.getText('person_info.html'));
    Template.person_info.helpers({
        country: pinfo.country,
        province: pinfo.province,
        city: pinfo.city,
        nickname: pinfo.nickname,
        headimgurl: pinfo.headimgurl,
        str_mode : str_mode,
        mode_url : mode_url
    });
    var html = SSR.render("person_info");
    res.end(html);

  }, {where: 'server'});

  Router.route('/addfriend/:_name', function () {
    var req = this.request;
    var res = this.response;
    var tname = this.params._name;

    var code = this.params.query.code;
    var openid = getinfoJS.getopenid(code);
    var mname = getinfoJS.getname(openid);

    var mt_rel = {};
    mt_rel.tname = tname;
    mt_rel.mname = mname;
    Friend.insert(mt_rel);
    res.end('成功加为好友');

  }, {where: 'server'});

    Router.route('/delfriend/:_name', function () {
    var req = this.request;
    var res = this.response;
    var tname = this.params._name;

    var code = this.params.query.code;
    var openid = getinfoJS.getopenid(code);
    var mname = getinfoJS.getname(openid);

    Friend.remove({mname : mname, tname : tname});
    res.end('成功删除好友');
    
  }, {where: 'server'});

});
