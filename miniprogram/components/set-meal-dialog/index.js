// components/set-meal-dialog/index.js
Component({
    properties: {
      menuList: {
        type: Array,
        value: []
      }
    },
  
    data: {
      show: false,
      selectedDate: '',
      lunchIndex: 0,
      dinnerIndex: 0,
      note: ''
    },
  
    methods: {
      open(date) {
        this.setData({ 
          show: true,
          selectedDate: date,
          lunchIndex: 0,
          dinnerIndex: 0,
          note: '' 
        })
      },
  
      onClose() {
        this.setData({ show: false })
      },
  
      bindLunchChange(e) {
        this.setData({ lunchIndex: e.detail.value })
      },
  
      bindDinnerChange(e) {
        this.setData({ dinnerIndex: e.detail.value })
      },
  
      onNoteInput(e) {
        this.setData({ note: e.detail.value })
      },
  
      onConfirm() {
        const selectedLunch = this.data.menuList[this.data.lunchIndex]
        const selectedDinner = this.data.menuList[this.data.dinnerIndex]
  
        this.triggerEvent('confirm', {
          date: this.data.selectedDate,
          lunchId: selectedLunch?._id,
          dinnerId: selectedDinner?._id,
          note: this.data.note
        })
  
        this.onClose()
      }
    }
  })