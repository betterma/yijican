const cloud = require('wx-server-sdk')
cloud.init({
    env: process.env.ENV_ID // 自动获取当前环境
  })
exports.main = async (event) => {
  const db = cloud.database()
  const { openid } = event

  // 获取下周日期范围
//   const startDate = moment().add(1, 'weeks').startOf('isoWeek')
  const dates = []
  for (let i = 0; i < 7; i++) {
    dates.push(startDate.clone().add(i, 'days').format('YYYY-MM-DD'))
  }

  // 查询计划
  const { data: plans } = await db.collection('daily_plans')
    .where({
      openid,
      date: db.command.in(dates)
    })
    .get()

  // 聚合食材
  const allIngredients = []
  for (const plan of plans) {
    const [lunch, dinner] = await Promise.all([
      db.collection('menus').doc(plan.lunch).get(),
      db.collection('menus').doc(plan.dinner).get()
    ])
    allIngredients.push(...lunch.data.ingredients, ...dinner.data.ingredients)
  }

  // 统计数量
  const purchaseMap = {}
  allIngredients.forEach(item => {
    purchaseMap[item] = (purchaseMap[item] || 0) + 1
  })

  return {
    purchaseList: Object.keys(purchaseMap).map(name => ({
      name,
      count: purchaseMap[name]
    }))
  }
}