import { StockPriceData } from '../services/stockApi';

/**
 * 计算价格变动
 * @param current 当前价格
 * @param previous 前一个价格
 * @returns 价格变动和变动百分比
 */
export const calculatePriceChange = (current: number, previous: number) => {
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  return {
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2))
  };
};

/**
 * 从股票价格数据中计算K线图数据
 * @param stockPriceData 股票价格数据数组
 * @returns K线图数据
 */
export const calculateCandlestickData = (stockPriceData: StockPriceData[]) => {
  return stockPriceData.map(item => {
    return [
      item.date,             // 时间
      item.open,             // 开盘价
      item.close,            // 收盘价
      item.min,              // 最低价
      item.max,              // 最高价
      item.Trading_Volume    // 交易量
    ];
  });
};

/**
 * 格式化大数字，添加千位分隔符
 * @param num 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 将数字格式化为带单位的字符串
 * @param num 数字
 * @returns 格式化后的字符串，如: 1.2K, 3.4M, 5.6B
 */
export const formatNumberWithUnit = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

/**
 * 计算移动平均线
 * @param data 源数据数组
 * @param period 计算周期
 * @returns 移动平均线数据
 */
export const calculateMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(Number((sum / period).toFixed(2)));
  }
  return result;
};

/**
 * 按月份分组数据
 * @param data 日期数据数组
 * @param dateField 日期字段名
 * @returns 按月份分组的数据
 */
export const groupDataByMonth = <T extends { [key: string]: any }>(
  data: T[],
  dateField: string
): Record<string, T[]> => {
  const monthlyData: Record<string, T[]> = {};

  data.forEach(item => {
    if (!item[dateField]) return;

    const dateStr = item[dateField].toString();
    // 提取YYYY-MM格式的月份
    const month = dateStr.substring(0, 7);

    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }

    monthlyData[month].push(item);
  });

  return monthlyData;
};
