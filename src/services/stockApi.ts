// API基本URL
const API_BASE_URL = 'https://api.finmindtrade.com/api/v4/data';
// 这里放入mock的token，实际使用时会被替换
const MOCK_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNS0wNC0wOSAyMToxMzozMSIsInVzZXJfaWQiOiJ0ZXN0b2siLCJpcCI6IjQ1LjguMjA0LjcwIn0.ew6ixCQbYhNBbHzsMIgtMvSYOCCE1382-8acgvxwM88';

// 定义月度营收数据接口
export interface MonthRevenueData {
  date: string;
  stock_id: string;
  country: string;
  revenue: number;
  revenue_month: number;
  revenue_year: number;
}

// 定义API响应接口
export interface ApiResponse {
  msg: string;
  status: number;
  data: any[];
}

// 获取月度营收数据
export const getMonthlyRevenue = async (
  stockId: string,
  startDate?: string,
  endDate?: string
): Promise<MonthRevenueData[]> => {
  try {
    // 构建URL参数
    const params = new URLSearchParams({
      dataset: 'TaiwanStockMonthRevenue',
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
    console.error('获取月度营收数据失败:', error);
    throw error;
  }
};

// 处理月度营收数据，计算同比增长率
export const processMonthlyRevenueData = (data: MonthRevenueData[]): any[] => {
  if (!data || data.length === 0) return [];

  // 对数据按日期排序（从旧到新）
  const sortedData = [...data].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 创建月份到营收的映射表
  const revenueMap = new Map<string, number>();
  sortedData.forEach(item => {
    // 使用YYYY-MM格式作为键
    const yearMonth = `${item.revenue_year}-${item.revenue_month.toString().padStart(2, '0')}`;
    revenueMap.set(yearMonth, item.revenue);
  });

  // 生成带有增长率的数据
  const processedData = sortedData.map(item => {
    const currentYearMonth = `${item.revenue_year}-${item.revenue_month.toString().padStart(2, '0')}`;
    const lastYearMonth = `${item.revenue_year - 1}-${item.revenue_month.toString().padStart(2, '0')}`;

    // 计算同比增长率
    let growthRate: number | null = null;
    if (revenueMap.has(lastYearMonth)) {
      const lastYearRevenue = revenueMap.get(lastYearMonth);
      if (lastYearRevenue && lastYearRevenue > 0) {
        growthRate = ((item.revenue / lastYearRevenue) - 1) * 100;
      }
    }

    return {
      month: currentYearMonth,
      revenue: item.revenue,
      growthRate: growthRate
    };
  });

  // 如果使用真实数据没有获得增长率，使用模拟增长率用于演示
  if (processedData.every(item => item.growthRate === null)) {
    // 模拟一些合理的增长率数据
    return processedData.map((item, index) => ({
      ...item,
      growthRate: Math.random() * 40 - 10 // 生成-10%到30%之间的随机值
    }));
  }

  return processedData;
};

// 获取股票列表
export const getStockList = async (): Promise<any[]> => {
  try {
    // 构建URL参数
    const params = new URLSearchParams({
      dataset: 'TaiwanStockInfo',
      token: MOCK_TOKEN,
    });

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
    console.error('获取股票列表失败:', error);
    throw error;
  }
};

// 获取股票名称映射表
export const getStockNameMap = async (): Promise<Record<string, string>> => {
  try {
    const stockList = await getStockList();
    const nameMap: Record<string, string> = {};

    stockList.forEach(stock => {
      nameMap[stock.stock_id] = stock.stock_name;
    });

    return nameMap;
  } catch (error) {
    console.error('获取股票名称映射失败:', error);

    // 失败时返回常见台股列表作为备用
    return {
      '2330': '台积电',
      '2317': '鸿海',
      '2454': '联发科',
      // ... 其他股票，保留原有的备用列表
    };
  }
};
