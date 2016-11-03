import { HTTP } from 'meteor/http';

var config = require("../config.js");
var collection = require("../../collection/collection.js");
var Info = collection.info;

exports.getinfo = function(code){
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
      
      return 0;
}

exports.getopenid = function(code) {
    var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appID + '&secret=' + config.appsecret + '&code=' + code + '&grant_type=authorization_code';
    var oauth2_result = HTTP.get(oauth2_url);
    var oauth2_data = JSON.parse(oauth2_result.content);
    return oauth2_data.openid;
}

exports.person_info = function(name) {
    return Info.findOne({name : name});
}

exports.getname = function(popenid) {
    var selper = Info.findOne({openid : popenid});
    return selper.nickname;
}