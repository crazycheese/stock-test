import { useEffect, useRef, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import * as echarts from 'echarts';
import { StockPriceData } from '../services/stockApi';

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
  stockPriceData: StockPriceData[];
}

interface StockChartProps {
  stockData: StockData;
}

type ChartType = 'price' | 'volume' | 'revenue';

const StockChart: React.FC<StockChartProps> = ({ stockData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<ChartType>('price');

  // 处理图表类型变更
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: ChartType | null,
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化ECharts实例
    const chartInstance = echarts.init(chartRef.current);

    let option: any = {};

    if (chartType === 'price') {
      // 价格图表
      option = createPriceChartOption(stockData);
    } else if (chartType === 'volume') {
      // 交易量图表
      option = createVolumeChartOption(stockData);
    } else if (chartType === 'revenue') {
      // 营收图表
      option = createRevenueChartOption(stockData);
    }

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
  }, [stockData, chartType]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">股票数据图表</Typography>

        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="price">价格走势</ToggleButton>
          <ToggleButton value="volume">交易量</ToggleButton>
          <ToggleButton value="revenue">月度营收</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </Box>
  );
};

// 创建价格图表配置
const createPriceChartOption = (stockData: StockData) => {
  // 提取数据
  const dates = stockData.stockPriceData.map(item => item.date);
  const prices = stockData.stockPriceData.map(item => item.close);

  return {
    title: {
      text: `${stockData.name}(${stockData.code}) 价格走势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = params[0].data;
        return `日期: ${params[0].axisValue}<br/>收盘价: ${data}`;
      }
    },
    toolbox: {
      feature: {
        dataZoom: { show: true },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        formatter: function(value: string) {
          return value;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '价格',
      axisLabel: {
        formatter: '{value} 元'
      },
      scale: true
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: '收盘价',
        type: 'line',
        data: prices,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: '#1976d2'
        }
      }
    ]
  };
};

// 创建交易量图表配置
const createVolumeChartOption = (stockData: StockData) => {
  // 提取数据
  const dates = stockData.stockPriceData.map(item => item.date);
  const volumes = stockData.stockPriceData.map(item => item.Trading_Volume);

  // 计算交易量的MA5和MA10
  const ma5 = calculateMA(5, volumes);
  const ma10 = calculateMA(10, volumes);

  return {
    title: {
      text: `${stockData.name}(${stockData.code}) 交易量`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = `日期: ${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.data / 1000000} 百万<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['交易量', 'MA5', 'MA10'],
      bottom: 10
    },
    toolbox: {
      feature: {
        dataZoom: { show: true },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '交易量',
      axisLabel: {
        formatter: function(value: number) {
          return `${(value / 1000000).toFixed(1)}M`;
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: '交易量',
        type: 'bar',
        data: volumes,
        itemStyle: {
          color: '#2196f3'
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        lineStyle: {
          opacity: 0.7
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        lineStyle: {
          opacity: 0.7
        }
      }
    ]
  };
};

// 创建营收图表配置
const createRevenueChartOption = (stockData: StockData) => {
  // 提取数据
  const months = stockData.monthlyRevenue.map(item => item.month);
  const revenue = stockData.monthlyRevenue.map(item => item.revenue);
  const growthRate = stockData.monthlyRevenue.map(item => item.growthRate);

  return {
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
      },
      formatter: function(params: any) {
        const monthData = params[0];
        const growthData = params[1];
        return `${monthData.axisValue}<br/>${monthData.seriesName}: ${monthData.data} 百万元<br/>${growthData.seriesName}: ${growthData.data.toFixed(1)}%`;
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
        },
        axisLabel: {
          rotate: 45
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
        data: revenue,
        itemStyle: {
          color: '#1976d2'
        }
      },
      {
        name: '同比增长率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: growthRate,
        lineStyle: {
          color: '#f44336'
        },
        itemStyle: {
          color: function(params: any) {
            return params.data >= 0 ? '#4caf50' : '#f44336';
          }
        }
      }
    ]
  };
};

// 计算移动平均线
const calculateMA = (dayCount: number, data: number[]) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push('-');
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j];
    }
    result.push((sum / dayCount).toFixed(0));
  }
  return result;
};

export default StockChart;
