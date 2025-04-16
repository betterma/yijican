import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    menus: [],
    newMenu: {
      name: '',
      ingredients: [],
      image: ''
    },
    units: ['克', '千克', '毫升', '升', '个', '份'], // 单位列表
    drawerVisible: false // 控制抽屉显示，初始值为 false
  },

  onLoad() {
    this.loadMenus();
  },

  async loadMenus() {
    const res = await wx.cloud.database().collection('menus').get();
    const menus = res.data.map(menu => {
      return {
        ...menu,
        formattedIngredients: menu.ingredients
          .map(ingredient => `${ingredient.name}${ingredient.quantity}${ingredient.unit}`)
          .join('、')
      };
    });
    this.setData({ menus });
  },

  deleteMenu(e) {
    const menuId = e.currentTarget.dataset.id;
    wx.cloud.callFunction({
      name: 'checkMenuUsage',
      data: { menuId }
    }).then(res => {
      if (res.result.used) {
        wx.showToast({ title: '菜单已被使用，无法删除', icon: 'none' });
      } else {
        wx.cloud.database().collection('menus').doc(menuId).remove().then(() => {
          wx.showToast({ title: '删除成功' });
          this.loadMenus();
        }).catch(err => {
          console.error('删除失败:', err);
          wx.showToast({ title: '删除失败', icon: 'none' });
        });
      }
    }).catch(err => {
      console.error('云函数调用失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  addNewMenu() {
    this.setData({
      drawerVisible: true, // 显示抽屉
      newMenu: { name: '', ingredients: [], image: '' }
    });
  },

  closeDrawer() {
    this.setData({ drawerVisible: false }); // 隐藏抽屉
  },

  onNameInput(e) {
    this.setData({ 'newMenu.name': e.detail.value });
  },

  onIngredientNameInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const ingredients = this.data.newMenu.ingredients;
    ingredients[index] = { ...ingredients[index], name: value };
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  onQuantityInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const ingredients = this.data.newMenu.ingredients;
    ingredients[index] = { ...ingredients[index], quantity: value };
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  onUnitChange(e) {
    const index = e.currentTarget.dataset.index;
    const unitIndex = e.detail.value;
    const ingredients = this.data.newMenu.ingredients;
    ingredients[index] = { ...ingredients[index], unit: this.data.units[unitIndex], unitIndex };
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  addIngredient() {
    const ingredients = this.data.newMenu.ingredients;
    ingredients.push({ name: '', quantity: '', unit: '', unitIndex: 0 });
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  removeIngredient(e) {
    const index = e.currentTarget.dataset.index;
    const ingredients = this.data.newMenu.ingredients;
    ingredients.splice(index, 1);
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  uploadImage() {
    wx.chooseImage({
      success: async res => {
        const filePath = res.tempFilePaths[0];
        wx.showLoading({ title: '上传中' });
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `menus/${Date.now()}`,
          filePath
        });
        wx.hideLoading();
        this.setData({ 'newMenu.image': uploadRes.fileID });
      }
    });
  },

  submitMenu() {
    const db = wx.cloud.database();
    const newMenu = this.data.newMenu;

    if (!newMenu.name || newMenu.ingredients.length === 0 || !newMenu.image) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    db.collection('menus').add({
      data: {
        ...newMenu,
        _openid: wx.getStorageSync('openid'),
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.showToast({ title: '菜单保存成功' });
      this.loadMenus();
      this.setData({
        newMenu: { name: '', ingredients: [], image: '' },
        drawerVisible: false
      });
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  editMenu(e) {
    const menuId = e.currentTarget.dataset.id;
    const menu = this.data.menus.find(item => item._id === menuId);

    // 打开抽屉并填充菜单数据
    this.setData({
        drawerVisible: true,
        newMenu: { ...menu }
    });
  }
});