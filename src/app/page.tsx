'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Paper, CssBaseline, ThemeProvider, createTheme, CircularProgress, Alert } from '@mui/material';
import Navbar from '../components/Navbar';
import StockHeader from '../components/StockHeader';
import StockTable from '../components/StockTable';
import { getStockPriceData, processStockData, getStockNameMap } from '../services/stockApi';

// 动态导入ECharts组件，禁用SSR
const StockChart = dynamic(() => import('../components/StockChart'), {
  ssr: false,
});

// 默认股票代码
const DEFAULT_STOCK_ID = '2330';

// 获取近一年的数据
const getDefaultStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
};

// 获取今天的日期
const getDefaultEndDate = () => {
  return new Date().toISOString().split('T')[0];
};

// 模拟数据 - 当API无法获取数据时使用
const mockStockData = {
  code: '2330',
  name: '台积电',
  price: 593.0,
  change: 3.0,
  changePercent: 0.51,
  monthlyRevenue: [
    { month: '2023-01', revenue: 1200, growthRate: 8.5 },
    { month: '2023-02', revenue: 980, growthRate: 5.2 },
    { month: '2023-03', revenue: 1350, growthRate: 12.3 },
    { month: '2023-04', revenue: 1450, growthRate: 15.8 },
    { month: '2023-05', revenue: 1380, growthRate: 10.1 },
    { month: '2023-06', revenue: 1520, growthRate: 18.5 },
    { month: '2023-07', revenue: 1620, growthRate: 22.7 },
    { month: '2023-08', revenue: 1550, growthRate: 16.9 },
    { month: '2023-09', revenue: 1480, growthRate: 14.2 },
    { month: '2023-10', revenue: 1600, growthRate: 19.8 },
    { month: '2023-11', revenue: 1750, growthRate: 25.3 },
    { month: '2023-12', revenue: 1900, growthRate: 30.1 },
  ],
  stockPriceData: []
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

    // 保存到搜索历史
    if (!searchHistory.includes(stockId)) {
      setSearchHistory(prev => [...prev, stockId].slice(-5)); // 只保留最近5个
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = getDefaultStartDate();
      const endDate = getDefaultEndDate();

      const stockPriceData = await getStockPriceData(stockId, startDate, endDate);

      if (stockPriceData && stockPriceData.length > 0) {
        const processedData = processStockData(stockPriceData, stockNameMap[stockId] || stockId);
        setStockData(processedData);
      } else {
        setError('没有找到股票数据');
        setStockData(mockStockData); // 使用模拟数据作为备用
      }
    } catch (err) {
      console.error('加载股票数据失败:', err);
      setError('获取股票数据时出错，使用模拟数据代替');
      setStockData(mockStockData); // 使用模拟数据作为备用
    } finally {
      setLoading(false);
    }
  };

  // 首次加载默认股票
  useEffect(() => {
    loadStockData(DEFAULT_STOCK_ID);
  }, []);

  const handleSearch = (query: string) => {
    if (!query) return;
    loadStockData(query.trim());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Navbar onSearch={handleSearch} />
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
                  <StockChart stockData={stockData} />
                </Paper>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <StockTable stockData={stockData} />
                </Paper>
              </Box>
            </>
          )}
        </Container>
    </ThemeProvider>
  );
}
