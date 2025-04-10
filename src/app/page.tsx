'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Paper, CssBaseline, ThemeProvider, createTheme, CircularProgress, Alert } from '@mui/material';
import Navbar from '../components/Navbar';
import StockHeader from '../components/StockHeader';
import StockTable from '../components/StockTable';
import { getStockNameMap, getMonthlyRevenue, processMonthlyRevenueData } from '../services/stockApi';

// 动态导入ECharts组件，禁用SSR
const StockChart = dynamic(() => import('../components/StockChart'), {
  ssr: false,
});

// 默认股票代码
const DEFAULT_STOCK_ID = '2330';
const DEFAULT_STOCK_NAME = '台积电';

// 获取近一年的数据
const getDefaultStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2); // 获取两年的数据，以便计算同比增长率
  return date.toISOString().split('T')[0];
};

// 获取今天的日期
const getDefaultEndDate = () => {
  return new Date().toISOString().split('T')[0];
};

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'rgb(247, 247, 247)',
        },
      },
    },
  },
});

export default function Home() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockNameMap, setStockNameMap] = useState<Record<string, string>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string>('12');
  const [currentStockId, setCurrentStockId] = useState<string>(DEFAULT_STOCK_ID); // 默认股票ID

  // 加载股票名称映射表
  useEffect(() => {
    const loadStockNameMap = async () => {
      try {
        const nameMap = await getStockNameMap();
        setStockNameMap(nameMap);
      } catch (err) {
        console.error('获取股票名称映射失败:', err);
      }
    };

    loadStockNameMap();
  }, []);

  // 加载股票数据
  const loadStockData = async (stockId: string) => {
    if (!stockId) return;

    setLoading(true);
    setError(null);

    try {
      const endDate = getDefaultEndDate();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 6);
      const formattedStartDate = startDate.toISOString().split('T')[0];

      const revenueData = await getMonthlyRevenue(stockId, formattedStartDate, endDate);

      if (revenueData && revenueData.length > 0) {
        const processedRevenue = processMonthlyRevenueData(revenueData);
        const stockName = stockNameMap[stockId] || stockId;

        const processedData = {
          code: stockId,
          name: stockName,
          price: 0,
          change: 0,
          changePercent: 0,
          monthlyRevenue: processedRevenue
        };

        setStockData(processedData);
      } else {
        setError('没有找到股票数据');
        setStockData(null); // 清空数据
      }
    } catch (err) {
      console.error('加载股票数据失败:', err);
      setError('获取股票数据时出错');
      setStockData(null); // 清空数据
    } finally {
      setLoading(false);
    }
  };

  // 首次加载默认股票
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stockId = urlParams.get('stock') || currentStockId; // 从URL获取股票代码

    // 只在currentStockId变化时加载数据
    if (currentStockId !== stockId) {
      setCurrentStockId(stockId);
      loadStockData(stockId);
    } else {
      loadStockData(currentStockId);
    }
  }, [currentStockId]);

  const handleSearch = (query: string) => {
    if (!query) return;
    setCurrentStockId(query.trim()); // 更新当前股票ID
    loadStockData(query.trim());
  };

  // 处理时间范围变更
  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar onSearch={handleSearch} stockNameMap={stockNameMap} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
        ) : null}

        {stockData && (
          <>
            <StockHeader stockData={stockData} />
            <Box sx={{ mt: 3 }}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <StockChart
                  stockData={stockData}
                  timeRange={timeRange}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </Paper>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <StockTable
                  stockData={stockData}
                  timeRange={timeRange}
                />
              </Paper>
            </Box>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}
