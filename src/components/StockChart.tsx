import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import * as echarts from 'echarts';

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
    growthRate: number;
  }>;
}

interface StockChartProps {
  stockData: StockData;
}

const StockChart: React.FC<StockChartProps> = ({ stockData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化ECharts实例
    const chartInstance = echarts.init(chartRef.current);

    // 提取数据
    const months = stockData.monthlyRevenue.map(item => item.month);
    const revenue = stockData.monthlyRevenue.map(item => item.revenue);
    const growthRate = stockData.monthlyRevenue.map(item => item.growthRate);

    // 设置图表选项
    const option = {
      title: {
        text: '月度营收与增长率',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: ['月度营收(百万元)', '同比增长率(%)'],
        bottom: 10
      },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '营收',
          min: 0,
          axisLabel: {
            formatter: '{value} M'
          }
        },
        {
          type: 'value',
          name: '增长率',
          axisLabel: {
            formatter: '{value} %'
          }
        }
      ],
      series: [
        {
          name: '月度营收(百万元)',
          type: 'bar',
          data: revenue
        },
        {
          name: '同比增长率(%)',
          type: 'line',
          yAxisIndex: 1,
          data: growthRate
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
  }, [stockData]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>股票走势图表</Typography>
      <Box ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </Box>
  );
};

export default StockChart;
