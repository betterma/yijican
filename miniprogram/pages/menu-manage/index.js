import Dialog from '@vant/weapp/dialog/dialog'

Page({
  data: {
    menus: [],
    newMenu: {
      name: '',
      ingredients: [],
      image: ''
    }
  },

  onLoad() {
    this.loadMenus();
  },

  async loadMenus() {
    const res = await wx.cloud.database().collection('menus')
      .get();
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
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜单吗？',
      success: async res => {
        if (res.confirm) {
          await wx.cloud.database().collection('menus')
            .where({
              _id: menuId
            }).remove();
          this.loadMenus();
        }
      }
    });
  },

  addNewMenu() {
    Dialog.confirm({
      show: true,
      selector: '#menuDialog'
    });
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

  onIngredientQuantityInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const ingredients = this.data.newMenu.ingredients;
    ingredients[index] = { ...ingredients[index], quantity: value };
    this.setData({ 'newMenu.ingredients': ingredients });
  },

  addIngredient() {
    const ingredients = this.data.newMenu.ingredients;
    ingredients.push({ name: '', quantity: '', unit: '' });
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

  confirmAdd() {
    const db = wx.cloud.database();
    db.collection('menus').add({
      data: {
        ...this.data.newMenu,
        _openid: wx.getStorageSync('openid'),
        createTime: db.serverDate()
      }
    }).then(() => {
      this.loadMenus();
      this.setData({ newMenu: { name: '', ingredients: [], image: '' } });
    });
  }
});