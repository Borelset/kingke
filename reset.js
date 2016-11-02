import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
 var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx02ddd7bde50636da&secret=2d05d20f575b3d4124b91f4cb6deed6c";
 var token_result = HTTP.get(token_url);
 console.log(token_result);
 var access_token = token_result.data.access_token;
 var delete_url = "https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=" + access_token ;
 var delete_result = HTTP.get(delete_url);
 console.log(delete_result);
});
