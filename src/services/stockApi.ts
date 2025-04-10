// API基本URL
const API_BASE_URL = 'https://api.finmindtrade.com/api/v4/data';
// 这里放入mock的token，实际使用时会被替换
const MOCK_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNS0wNC0wOSAyMToxMzozMSIsInVzZXJfaWQiOiJ0ZXN0b2siLCJpcCI6IjQ1LjguMjA0LjcwIn0.ew6ixCQbYhNBbHzsMIgtMvSYOCCE1382-8acgvxwM88';

// 定义股票数据接口
export interface StockPriceData {
  date: string;
  stock_id: string;
  Trading_Volume: number;
  Trading_money: number;
  open: number;
  max: number;
  min: number;
  close: number;
  spread: number;
  Trading_turnover: number;
}

// 定义API响应接口
export interface ApiResponse {
  msg: string;
  status: number;
  data: StockPriceData[];
}

// 获取股票价格数据
export const getStockPriceData = async (
  stockId: string,
  startDate?: string,
  endDate?: string
): Promise<StockPriceData[]> => {
  try {
    // 构建URL参数
    const params = new URLSearchParams({
      dataset: 'TaiwanStockPrice',
      data_id: stockId,
      token: MOCK_TOKEN,
    });

    if (startDate) {
      params.append('start_date', startDate);
    }

    if (endDate) {
      params.append('end_date', endDate);
    }

    // 构建完整URL
    const url = `${API_BASE_URL}?${params.toString()}`;

    // 使用fetch发起请求
    const response = await fetch(url);

    // 检查HTTP状态
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    // 解析JSON响应
    const responseData: ApiResponse = await response.json();

    if (responseData.status === 200 && responseData.msg === 'success') {
      return responseData.data;
    } else {
      throw new Error(`API错误: ${responseData.msg}`);
    }
  } catch (error) {
    console.error('获取股票数据失败:', error);
    throw error;
  }
};

// 处理股票数据，生成UI所需的格式
export const processStockData = (stockData: StockPriceData[], stockName: string = ''): any => {
  // 如果没有数据，返回空对象
  if (!stockData || stockData.length === 0) {
    return null;
  }

  // 对数据按日期排序（从旧到新）
  const sortedData = [...stockData].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 计算最后交易日的价格变化
  const latestData = sortedData[sortedData.length - 1];
  const previousData = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;

  const change = previousData ? latestData.close - previousData.close : 0;
  const changePercent = previousData ? (change / previousData.close) * 100 : 0;

  // 创建月度数据，这里是模拟的
  // 实际应用中，您可能需要从另一个API获取真实的月度营收数据
  const monthlyRevenue = generateMockMonthlyRevenue(sortedData);

  return {
    code: latestData.stock_id,
    name: stockName || latestData.stock_id, // 如果没有提供股票名称，使用股票代码作为名称
    price: latestData.close,
    change,
    changePercent,
    stockPriceData: sortedData, // 包含完整的历史价格数据
    monthlyRevenue,
  };
};

// 根据股票价格数据生成模拟的月度营收数据
// 在实际应用中，这应该被替换为真实的月度营收API数据
const generateMockMonthlyRevenue = (stockData: StockPriceData[]) => {
  if (!stockData || stockData.length === 0) return [];

  // 获取最近12个月的数据
  const monthlyData: Record<string, StockPriceData[]> = {};

  // 按月份分组数据
  stockData.forEach(data => {
    const month = data.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }
    monthlyData[month].push(data);
  });

  // 转换为UI所需的月度营收格式
  const revenue = Object.keys(monthlyData)
    .sort()
    .slice(-12) // 取最近12个月
    .map(month => {
      const monthData = monthlyData[month];
      const lastDayData = monthData[monthData.length - 1];

      // 使用月末收盘价和交易量模拟营收数据
      const revenue = Math.round(lastDayData.close * lastDayData.Trading_Volume / 1000000);

      // 模拟同比增长率（-10%到30%之间的随机值）
      const growthRate = Math.round((Math.random() * 40 - 10) * 10) / 10;

      return {
        month,
        revenue,
        growthRate
      };
    });

  return revenue;
};

// 获取股票名称映射表（模拟数据）
// 实际应用中，应该从API获取或使用更完整的映射表
export const getStockNameMap = async (): Promise<Record<string, string>> => {
  // 返回常见台股列表
  return {
    // 科技股
    '2330': '台积电',
    '2317': '鸿海',
    '2454': '联发科',
    '2308': '台达电',
    '2303': '联电',
    '3008': '大立光',
    '2379': '瑞昱',
    '2382': '广达',
    '2881': '富邦金',
    '2891': '中信金',
    '2412': '中华电',
    '2327': '国巨',
    '2474': '可成',
    '2353': '宏碁',
    '2357': '华硕',
    '2409': '友达',

    // 传统产业
    '1301': '台塑',
    '1303': '南亚',
    '1216': '统一',
    '2002': '中钢',
    '1326': '台化',
    '2207': '和纸',
    '2603': '长荣',
    '2609': '阳明',
    '2610': '华航',
    '9904': '寰宇',
    '1402': '远东新',

    // 金融股
    '2882': '国泰金',
    '2884': '玉山金',
    '2885': '元大金',
    '2886': '兆丰金',
    '2887': '台新金',
    '2890': '永丰金',
    '2892': '第一金',

    // 其他产业
    '9910': '豐泰',
    '1605': '华新',
    '2912': '统一超',
    '2923': '鼎元',
    '2371': '大同',
    '3045': '台湾大',
    '4904': '远传',
    '2801': '彰银',
    '2823': '中寿',
  };
};
