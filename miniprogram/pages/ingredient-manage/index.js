const db = wx.cloud.database()
var dayjs = require('dayjs')
Page({
  data: {
    currentDate: '',
    lunchInfo: [],
    dinnerInfo: [],
    markedDates: [],
    menuList: [],
    ingredients: [],
    newIngredient: { name: '', price: '' },
    drawerVisible: false
  },

  onLoad() {
    this.setData({
      currentDate: dayjs().format('YYYY-MM-DD')
    })
    this.getTodayMenu()
    this.loadIngredients();
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
    const date = dayjs(e.detail).format('YYYY-MM-DD');
    this.setData({ currentDate: date });

    // 调用 set-meal-dialog 组件的 open 方法
    const mealDialog = this.selectComponent('#mealDialog');
    mealDialog.open(date);
  },

  navToPurchase() {
    wx.navigateTo({ url: '/pages/purchase/index' }); // 确保路径正确
  },

  navToMenuManage() {
    wx.navigateTo({ url: '/pages/menu-manage/index' })
  },

  saveDailyPlan(e) {
    const { date, lunchId, dinnerId, note } = e.detail;
    wx.cloud.database().collection('daily_plans').add({
      data: { date, lunch: lunchId, dinner: dinnerId, note }
    }).then(() => {
      wx.showToast({ title: '保存成功' });
      this.getTodayMenu();
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  async loadIngredients() {
    const res = await wx.cloud.database().collection('ingredients').get();
    this.setData({ ingredients: res.data });
  },

  addIngredient() {
    this.setData({
      drawerVisible: true,
      newIngredient: { name: '', price: '' }
    });
  },

  closeDrawer() {
    this.setData({ drawerVisible: false });
  },

  onNameInput(e) {
    this.setData({ 'newIngredient.name': e.detail.value });
  },

  onPriceInput(e) {
    this.setData({ 'newIngredient.price': e.detail.value });
  },

  submitIngredient() {
    const db = wx.cloud.database();
    const newIngredient = this.data.newIngredient;

    if (!newIngredient.name || !newIngredient.price) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    db.collection('ingredients').add({
      data: newIngredient
    }).then(() => {
      wx.showToast({ title: '保存成功' });
      this.loadIngredients();
      this.setData({ drawerVisible: false });
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  }
})