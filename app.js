//app.js
App({
  init: function() {

    this.globalData.userInfo = {
      "nickName": "jason",
      "avatarUrl": "http://wx.qlogo.cn/mmopen/icSHGibMIMB82jDEHibGFA1s6dhwMibWrQAPeRvT2w2y2rpZVM5l3BftVEr3rTgX4fXDlznnMmZY0zYtgkfFw7L3o9r0tTblGTxB/0",
      "gender": 1,
      "province": "广东",
      "city": "深圳",
      "country": "中国",
    };
    
  },
  onLaunch: function () {
    this.init();
  },
  globalData:{
    curArticle: null
  }
})
