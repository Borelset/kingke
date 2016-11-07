import { HTTP } from 'meteor/http';

var config = require("../config.js");
var collection = require("../../collection/collection.js");
var Userqr = collection.userqr;

exports.getqr = function(uid) {
    return Userqr.findOne({uid : uid});
}

exports.createqr = function(uid) {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.appID + "&secret=" + config.appsecret;
    var token_result = HTTP.get(url);
    var token_obj = JSON.parse(token_result.content);
    var acc_token = token_obj.access_token;
    var ticket_gen_url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + acc_token;
    var post_cont = {"expire_seconds": 2592000, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": uid }}};
    post_cont = JSON.stringify(post_cont);
    var post_result = HTTP.post(ticket_gen_url, {content : post_cont});
    var result_obj = JSON.parse(post_result.content);
    var qrcodeImg = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURIComponent(result_obj.ticket);
    var qru_rel = {};
    qru_rel.uid = uid.toString();
    qru_rel.url = qrcodeImg;
    Userqr.insert(qru_rel);
    return qrcodeImg;
}