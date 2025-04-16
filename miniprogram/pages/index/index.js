const db = wx.cloud.database()
var dayjs = require('dayjs')
Page({
  data: {
    currentDate: '',
    lunchInfo: [],
    dinnerInfo: [],
    markedDates: [],
    menuList: []
  },

  onLoad() {
    this.setData({
      currentDate: dayjs().format('YYYY-MM-DD')
    })
    this.getTodayMenu()
  },

  getTodayMenu() {
    const date = this.data.currentDate
    db.collection('daily_plans')
      // .where({ date })
      .get().then(res => {
        if (res.data.length > 0) {
          console.log(res.data[0])
          const lunchInfo = res.data[0].lunch
          const dinnerInfo = res.data[0].dinner
          this.setData({
            lunchInfo,
            dinnerInfo
          })
        }
      })

  },

  onDateSelect(e) {
    const date = dayjs(e.detail).format('YYYY-MM-DD')
    this.setData({
      currentDate: date
    })
  },

  navToPurchase() {
    wx.navigateTo({ url: '/pages/purchase/index' })
  },

  navToMenuManage() {
    wx.navigateTo({ url: '/pages/menu-manage/index' })
  }
})