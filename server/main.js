import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
var config = require("./config.js");
var collection = require("../collection/collection.js");
var getinfoJS = require("./methods/getinfo.js");
var courseJS = require("./methods/course.js");
var Info = collection.info;
var Course = collection.course;
var Student = collection.student;

Meteor.startup(() => {
  // code to run on server at startup

  
    
  Router.route('/', function () {
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
    } else {
      res.end("false");
    }
  }, {where: 'server'});

  Router.route('/setmenu', function () {
    var res = this.response;
    try {
      var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.appID + "&secret=" + config.appsecret;
      var token_result = HTTP.get(token_url);
      var access_token = token_result.data.access_token;
      var menu_url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token;
      var menu_data = '{"button":[{"type":"view","name" : "查看个人信息","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"type":"view","name" : "创建课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fcreatecourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{ "name" : "课程","sub_button" : [{"type":"view","name" : "所有课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fallcourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{ "type":"view","name" : "我的课程","url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fmycourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"}]}]}';
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
    try {
      var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appID + '&secret=' + config.appsecret + '&code=' + code + '&grant_type=authorization_code';
      var oauth2_result = HTTP.get(oauth2_url);
      var oauth2_data = JSON.parse(oauth2_result.content);
      var openid = oauth2_data.openid;
      var access_token = oauth2_data.access_token;
      
      var userinfo_url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
      var userinfo_result = HTTP.get(userinfo_url);
      var userinfo_data = JSON.parse(userinfo_result.content);
      
      if(!Info.findOne({openid : openid}))
      {
        var user_info = {};
        user_info.openid = openid;
        user_info.country = userinfo_data.country;
        user_info.province = userinfo_data.province;
        user_info.city = userinfo_data.city;
        user_info.nickname = userinfo_data.nickname;
        user_info.headimgurl = userinfo_data.headimgurl;
        Info.insert(user_info);
      };

      SSR.compileTemplate('info', Assets.getText('info.html'));
      Template.info.helpers({
        country: userinfo_data.country,
        province: userinfo_data.province,
        city: userinfo_data.city,
        nickname: userinfo_data.nickname,
        headimgurl: userinfo_data.headimgurl
      });
      var html = SSR.render("info");
      res.end(html);
    } catch (err) {
      console.log("network error " + err);
    }
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

    var getinfo_result = getinfoJS.getinfo(code);
    var openid = getinfoJS.getopenid(code);
    var courselist = courseJS.mycourse(openid);

    SSR.compileTemplate('mycourse', Assets.getText('mycourse.html'));
    Template.mycourse.helpers({
      courselist: courselist
    });
    var html = SSR.render('mycourse');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course/:_cname', function () {
    var req = this.request;
    var res = this.response;
    var cname = this.params._cname;
    var target_course = courseJS.search_course(cname);
    var addurl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx02ddd7bde50636da&redirect_uri=http%3A%2F%2Fwx.borelset.cn%2Faddcourse%2F" + cname + "&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"
    var qrurl = qrJS.getqr(cname);
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
    var code = this.params.query.code;
    console.log(code);
    var openid = getinfoJS.getopenid(code);
    console.log(openid);
    var this_tname = getinfoJS.getname(openid);

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

    SSR.compileTemplate('person_info', Assets.getText('person_info.html'));
    Template.person_info.helpers({
        country: pinfo.country,
        province: pinfo.province,
        city: pinfo.city,
        nickname: pinfo.nickname,
        headimgurl: pinfo.headimgurl
    });
    var html = SSR.render("person_info");
    res.end(html);

  }, {where: 'server'});


});
