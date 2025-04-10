import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import * as echarts from 'echarts';
import {
  StockPriceData,
  MonthRevenueData,
  getStockPriceData,
  processStockData,
  getMonthlyRevenue
} from '../services/stockApi';

// 定义props接口
interface StockData {
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    growthRate: number | null;
  }>;
  stockPriceData: StockPriceData[];
}

interface StockChartProps {
  stockData: StockData;
}

const StockChart: React.FC<StockChartProps> = ({ stockData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<string>('12');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);

  // 获取指定时间范围内的数据
  const fetchRangeData = async (years: number) => {
    try {
      setLoading(true);

      // 计算开始日期和结束日期
      const endDate = new Date();
      // 增加额外的1年数据，用于计算同比增长率
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - years - 1);

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // 分别获取股票价格数据和月度营收数据
      const [priceData, revenueData] = await Promise.all([
        getStockPriceData(stockData.code, formattedStartDate, formattedEndDate),
        getMonthlyRevenue(stockData.code, formattedStartDate, formattedEndDate)
      ]);

      // 处理数据
      if (priceData && priceData.length > 0) {
        const processedData = processStockData(priceData, stockData.name, revenueData);
        setChartData(processedData);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理时间范围变更
  const handleTimeRangeChange = async (event: any) => {
    const newRange = event.target.value;
    setTimeRange(newRange);

    // 根据选择的时间范围获取数据
    const years = parseInt(newRange) / 12;
    await fetchRangeData(years);
  };

  // 初始加载数据
  useEffect(() => {
    const years = parseInt(timeRange) / 12;
    fetchRangeData(years);
  }, [stockData.code]);

  // 绘制图表
  useEffect(() => {
    if (!chartRef.current || loading || !chartData) return;

    // 初始化ECharts实例
    const chartInstance = echarts.init(chartRef.current);

    // 根据选择的时间范围过滤数据
    const rangeValue = parseInt(timeRange);
    const revenueData = chartData.monthlyRevenue || [];
    const filteredData = revenueData.slice(-rangeValue);

    // 提取数据
    const months = filteredData.map((item: any) => item.month);
    const revenue = filteredData.map((item: any) => item.revenue);
    const growthRate = filteredData.map((item: any) => item.growthRate);

    const option = {
      title: {
        text: '月度营收与年增率',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params: any) {
          const monthData = params[0];
          const growthData = params[1];
          return `${monthData.axisValue}<br/>${monthData.seriesName}: ${(monthData.data / 1000000).toFixed(2)} 百万元<br/>${growthData.seriesName}: ${growthData.data !== null ? growthData.data.toFixed(2) : 'N/A'}%`;
        }
      },
      legend: {
        data: ['月度营收(百万元)', '年增率(%)'],
        bottom: 10
      },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '营收(百万元)',
          min: 0,
          axisLabel: {
            formatter: '{value} M'
          }
        },
        {
          type: 'value',
          name: '年增率(%)',
          axisLabel: {
            formatter: '{value} %'
          }
        }
      ],
      series: [
        {
          name: '月度营收(百万元)',
          type: 'bar',
          data: revenue.map((v: number) => v / 1000000), // 转换为百万元
          itemStyle: {
            color: '#eba431'
          }
        },
        {
          name: '年增率(%)',
          type: 'line',
          yAxisIndex: 1,
          data: growthRate,
          lineStyle: {
            color: '#cb3e46'
          },
          itemStyle: {
            color: '#cb3e46'
          }
        }
      ]
    };

    // 使用配置项设置图表
    chartInstance.setOption(option);

    // 响应窗口大小变化，调整图表大小
    const handleResize = () => {
      chartInstance.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      chartInstance.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, timeRange, loading]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">月度营收分析</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>时间范围</InputLabel>
          <Select
            value={timeRange}
            label="时间范围"
            onChange={handleTimeRangeChange}
            disabled={loading}
          >
            <MenuItem value="6">近6个月</MenuItem>
            <MenuItem value="12">近1年</MenuItem>
            <MenuItem value="24">近2年</MenuItem>
            <MenuItem value="36">近3年</MenuItem>
            <MenuItem value="48">近4年</MenuItem>
            <MenuItem value="60">近5年</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box ref={chartRef} style={{ width: '100%', height: '400px' }} />
      )}
    </Box>
  );
};

export default StockChart;
