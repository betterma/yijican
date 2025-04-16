const db = wx.cloud.database();

Page({
  data: {
    purchaseList: [], // 购买清单
    loading: true // 加载状态
  },

  onLoad() {
    this.loadPurchaseList();
  },

  async loadPurchaseList() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'generatePurchaseList',
        data: { openid: wx.getStorageSync('openid') }
      });
      this.setData({ purchaseList: res.result.purchaseList, loading: false });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});