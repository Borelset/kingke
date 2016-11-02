#快速搭建基于meteor的微信公众号开发环境

## QuickStart

* 下载、安装、运行
```
//安装meteor,如果已经安装过了请忽略
curl https://install.meteor.com/ | sh
//下载kingke代码
git clone -b v0.0.1 https://git.coding.net/mengning/kingke.git
//运行kingke
cd kingke
sudo meteor --port 80
```
* 申请[微信公众平台测试号](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
  * 接口配置url类似http://your.domain.name/weixin
  * 接口配置token自己定义,与项目配置文件server/config.js填写一致即可
  * 体验接口权限表-网页服务-网页帐号-网页授权获取用户基本信息-修改，只填写域名，比如your.domain.name
* 修改配置文件server/config.js
```
//Warning!!!
//Do Not Commit this file!!!
exports.token = "YOUR_TOKEN"; //自己定义,与申请测试号时填写一致即可
exports.appID = "YOUR_APPID"; 
exports.appsecret = "YOUR_APPSECRET";
exports.url = "YOUR_DOMAIN_NAME" //只填写域名，比如your.domain.name
```
* 通过访问http://your.domain.name/setmenu 设置菜单后，即可通过测试号demo项目功能
* 更多安装部署指南参考[INSTALL.md](https://coding.net/u/mengning/p/kingke/git/blob/master/INSTALL.md)


