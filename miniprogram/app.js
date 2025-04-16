// app.js
App({
    onLaunch() {
      wx.cloud.init({ env: 'cloud1-2gy5f1no65ac3ce1' })
      this.checkLogin() // 确保方法已定义
    },
  
    // 正确定义方法（避免使用箭头函数）
    checkLogin() {
      wx.login({
        success: res => {
          wx.cloud.callFunction({
            name: 'getUserOpenId',
            success: res => {
              this.globalData.openid = res.result.openid
              this.initDataSync()
            }
          })
        }
      })
    },
  
    globalData: {}
  })