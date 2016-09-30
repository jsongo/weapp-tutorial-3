//index.js
var app = getApp()
Page({
  data: {
    news: [],
    refresh: false // 用来决定上方的loading区域是否显示
  },
  loading: false,
  onLoad: function () {
    // 请求第一屏数据
    this.reqData('5053833', this.renderData); // 5053833是从36Kr上随便取的一个id
  },
  scroll: function(event) {
  },

/**
 * 自定义函数...
 */

  // 请求数据 
  reqData: function(lastId, callback, appendOrRefresh) { // appendOrRefresh -> 2 for append,
                                                         // 1 for refresh
    var that = this;
    this.loading = true; // 在加载完时才会设置成false
    var now = new Date().getTime(),
      url = 'http://36kr.com/api/info-flow/main_site/posts?b_id=' + lastId + '&per_page=10&_=' + now;

    if(appendOrRefresh === 1) { 
      url = 'http://36kr.com/api/newsflash?b_id=' + lastId + '&per_page=10&_=' + now;
    }
    wx.request({
      url: url,
      data: {},
      header: {
          'Content-Type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
        callback && callback.call(null, res.data, appendOrRefresh);
      },
      // complete方法
      complete: function() {
        that.loading = false;
        if(appendOrRefresh == 1) {
          // 隐藏上方加载区域
          that.setData({
            refresh: false
          })
        }
      }
    })
  },
  formatData: function(items) {
    var list = [];
    for (var item of items) {
      var tags = JSON.parse(item.extraction_tags),
        cat = tags && tags[0] && tags[0][0] || '';
      var newItem = {
        id: item.id,
        title: item.title,
        author: item.user.name,
        time: item.published_at,
        img: item.cover || item.user.avatar_url,
        category: cat, // 只取一个来演示
        content: item.summary // 用来给详情页展示的数据
      };
      list.push(newItem);
    }
    return list;
  },
  // 拿到数据后，渲染到页面中
  renderData: function(rsp, appendOrRefresh) {
      // 返回的code不为0，则应该是36Kr后台接口返回的相关错误，没拿到数据
      if(rsp.code != 0) {
        console.error('request error');
        return;
      }
      // 返回的数据格式有问题
      if(!rsp.data || !rsp.data.items || rsp.data.items.length < 1) {
        console.log('Something wrong with the response data');
        return;
      }
      var list = this.formatData(rsp.data.items),
        curLen = this.data.news.length;
      // console.log(list, curLen);
      // load more
      if (appendOrRefresh === 2) { 
        for(var item of list) {
          this.setData({ // react中有Immutable可以局部更新array，MINA没有，不过微信提供了一个方法：
            ['news[' + (curLen++) + ']']: item // 通过数组的index设置新元素可以实现局部更新
          });
        }
      }
      // refresh
      else if (appendOrRefresh === 1) { 
        var newList = [].concat(list, this.data.news);
        this.setData({
          news: newList // 这里比较暴力，直接把整个列表重新赋值，数据多的时候可能会有问题
                        // 读者可以自己优化，比如这里只显示10个，多的存入本地存储中
        });
      }
      // when first open
      else { 
        this.setData({
          news: list
        });
      }
  },
  // 列表项点击事件
  bindItemTap: function(event) {
    var id = event.currentTarget.dataset.id, // 当前id
      article = null;
    // 找出当时点击的那一项的详细信息
    for(var d of this.data.news) {
      if(d.id == id) {
        article = d;
        break;
      }
    }
    console.log(article);
    if(!article) {
      console.log('系统出错');
      return;
    }
    // 设置到全局变量中去，让下个页面可以访问
    app.globalData.curArticle = article; 
    // 切换页面
    wx.navigateTo({
      url: '../article/content'
    });
  },
  // 底部上滑加载更多
  loadMore: function() {
    // 判断是否在加载中，为了防止重复加载
    if(this.loading) { // this.loading在开始请求的时候设为true，
                       // 加载完再设置为false
      console.info('loading is processing...');
      return;
    }
    console.log('loading more...');
    // 得到当前最后一个id
    var news = this.data.news,
      lastItem = news[news.length-1],
    	id = lastItem.id;
    this.reqData(id, this.renderData, 2);
  },
  // 顶部下拉时刷新
  refresh: function(event) {
    if(!this.data.refresh) {
      var that = this;
      console.log('prepare to refresh...');
      this.setData({
        refresh: true
      });
      setTimeout(function() {
        that.refresh();
      }, 400);
      return;
    }
    if(this.loading) {
      console.info('refresh is processing...');
      return;
    }
    console.log('refreshing...');
    // 拿到第一个项的的id
    var news = this.data.news,
      firstItem = news[0],
      id = firstItem.id;
    this.reqData(id, this.renderData, 1);
  }
})
