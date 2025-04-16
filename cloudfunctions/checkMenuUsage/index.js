const cloud = require('wx-server-sdk')
cloud.init({
    env: process.env.ENV_ID // 自动获取当前环境
  })
exports.main = async (event) => {
  const db = cloud.database()
  const { menuId } = event
  
  const res = await db.collection('daily_plans')
    .where({
      $or: [{ lunch: menuId }, { dinner: menuId }]
    })
    .count()

  return { 
    used: res.total > 0,
    count: res.total
  }
}