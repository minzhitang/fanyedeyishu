// 自定义菜单暂存处，在http://mp.weixin.qq.com/debug这里可以用

{
  "button": [{
    "type": "click",
    "name": "查找绘本",
    "key": "cz"
  }, {
    "name": "记录",
    "sub_button": [{
      "type": "click",
      "name": "创建书单",
      "key": "create"
    }, {
      "type": "click",
      "name": "已读绘本",
      "key": "yd"
    }, {
      "type": "click",
      "name": "想读绘本",
      "key": "xd"
    }, {
      "type": "click",
      "name": "评论",
      "key": "pl"
    }]
  }, {
    "name": "我的",
    "sub_button": [{
      "type": "click",
      "name": "已读书单",
      "key": "ydsd"
    }, {
      "type": "click",
      "name": "想读书单",
      "key": "xdsd"
    }, {
      "type": "click",
      "name": "我的评论",
      "key": "pllb"
    }, {
      "type": "click",
      "name": "为我推荐",
      "key": "tj"
    }]
  }]
}