const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const { openid } = event;

  // 获取下周日期范围
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay())); // 下周一
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 下周日

  // 查询计划
  const plans = await db.collection('daily_plans')
    .where({
      _openid: openid,
      date: db.command.gte(startDate.toISOString()).and(db.command.lte(endDate.toISOString()))
    })
    .get();

  // 聚合食材
  const allIngredients = [];
  for (const plan of plans.data) {
    const [lunch, dinner] = await Promise.all([
      db.collection('menus').doc(plan.lunch).get(),
      db.collection('menus').doc(plan.dinner).get()
    ]);
    allIngredients.push(...lunch.data.ingredients, ...dinner.data.ingredients);
  }

  // 统计数量
  const purchaseMap = {};
  allIngredients.forEach(item => {
    purchaseMap[item] = (purchaseMap[item] || 0) + 1;
  });

  return {
    purchaseList: Object.keys(purchaseMap).map(name => ({
      name,
      count: purchaseMap[name]
    }))
  };
};