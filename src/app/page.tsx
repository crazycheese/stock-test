'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Paper, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from '../components/Navbar';
import StockHeader from '../components/StockHeader';
import StockTable from '../components/StockTable';

// 动态导入ECharts组件，禁用SSR
const StockChart = dynamic(() => import('../components/StockChart'), {
  ssr: false,
});

// 模拟数据
const mockStockData = {
  code: '600519',
  name: '贵州茅台',
  price: 1850.23,
  change: 15.6,
  changePercent: 0.85,
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
  ]
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
    background: {
      default: '#f5f5f5',
    },
  },
});

export default function Home() {
  const [stockData, setStockData] = useState(mockStockData);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 在实际应用中，这里应该发起API请求获取股票数据
    console.log('搜索股票代码:', query);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onSearch={handleSearch} />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
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
        </Container>
      </Box>
    </ThemeProvider>
  );
}
