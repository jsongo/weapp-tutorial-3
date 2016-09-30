//logs.js
// var util = require('../../utils/util.js')
Page({
  data: {
    content: '正文内容',
    title: '',
    time: '',
    img: ''
  },
  onReady: function () { // 设置title
    var app = getApp(),
      article = app.globalData.curArticle;
    wx.setNavigationBarTitle({
      title: article.title
    });
    this.setData({
      content: article.content,
      title: article.title,
      time: article.time,
      img: article.img
    })
  }
})
