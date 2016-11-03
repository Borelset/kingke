import { HTTP } from 'meteor/http';

var config = require("../config.js");
var collection = require("../../collection/collection.js");
var QR = collection.qr;
var Course = collection.course;

var getqr = function(cname) {
    var cid = Course.findOne({cname : cname}).cid;
    return QR.findOne({cid : cid});
}

var createqr = function(cid) {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.appID + "&secret=" + config.appsecret;
    var token_result = HTTP.get(url);
    var token_obj = JSON.parse(token_result.content);
    var acc_token = token_obj.access_token;
    var ticket_gen_url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + acc_token;
    var post_cont = {"expire_seconds": 2592000, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": cid }}};
    post_cont = JSON.stringify(post_cont);
    var post_result = HTTP.post(ticket_gen_url, {content : post_cont});
    var result_obj = JSON.parse(post_result);
    var qrcodeImg = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURIComponent(qrcodeJson.ticket);
    var qrc_rel = {};
    qrc_rel.cid = cid;
    qrc_rel.url = qrcodeImg;
    QR.insert(qrc_rel);
    return 0;
}