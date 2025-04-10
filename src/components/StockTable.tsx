import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { useState } from 'react';
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

interface StockTableProps {
  stockData: StockData;
}

// 表格类型
type TableType = 'monthly' | 'daily';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StockTable: React.FC<StockTableProps> = ({ stockData }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="股票数据表格">
          <Tab label="月度营收数据" />
          <Tab label="每日交易数据" />
        </Tabs>
      </Box>

      {/* 月度营收表格 */}
      <TabPanel value={tabValue} index={0}>
        <MonthlyRevenueTable stockData={stockData} />
      </TabPanel>

      {/* 每日交易数据表格 */}
      <TabPanel value={tabValue} index={1}>
        <DailyTradeTable stockData={stockData} />
      </TabPanel>
    </Box>
  );
};

// 月度营收表格组件
const MonthlyRevenueTable: React.FC<{ stockData: StockData }> = ({ stockData }) => {
  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflow: 'auto' }}>
      <Table aria-label="月度营收表格">
        <TableHead>
          <TableRow>
            <TableCell>指标</TableCell>
            {stockData.monthlyRevenue.map((item) => (
              <TableCell key={item.month} align="right">
                {item.month}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* 每月营收行 */}
          <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
            <TableCell component="th" scope="row">每月营收 (百万元)</TableCell>
            {stockData.monthlyRevenue.map((item) => (
              <TableCell key={`revenue-${item.month}`} align="right">
                {item.revenue.toFixed(0)}
              </TableCell>
            ))}
          </TableRow>

          {/* 增长率行 */}
          <TableRow>
            <TableCell component="th" scope="row">同比增长率 (%)</TableCell>
            {stockData.monthlyRevenue.map((item) => (
              <TableCell
                key={`growth-${item.month}`}
                align="right"
                sx={{
                  color: item.growthRate >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {item.growthRate >= 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 每日交易数据表格组件
const DailyTradeTable: React.FC<{ stockData: StockData }> = ({ stockData }) => {
  // 只显示最近的20条数据
  const recentData = [...stockData.stockPriceData].reverse().slice(0, 20);

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflow: 'auto' }}>
      <Table aria-label="每日交易数据表格" size="small">
        <TableHead>
          <TableRow>
            <TableCell>日期</TableCell>
            <TableCell align="right">开盘价</TableCell>
            <TableCell align="right">最高价</TableCell>
            <TableCell align="right">最低价</TableCell>
            <TableCell align="right">收盘价</TableCell>
            <TableCell align="right">涨跌幅</TableCell>
            <TableCell align="right">交易量(股)</TableCell>
            <TableCell align="right">交易金额(元)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentData.map((item, index, arr) => {
            // 计算涨跌幅
            const prevClose = index < arr.length - 1 ? arr[index + 1].close : item.close;
            const changePercent = ((item.close - prevClose) / prevClose) * 100;

            return (
              <TableRow key={item.date}>
                <TableCell component="th" scope="row">{item.date}</TableCell>
                <TableCell align="right">{item.open.toFixed(2)}</TableCell>
                <TableCell align="right">{item.max.toFixed(2)}</TableCell>
                <TableCell align="right">{item.min.toFixed(2)}</TableCell>
                <TableCell align="right">{item.close.toFixed(2)}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: changePercent >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </TableCell>
                <TableCell align="right">{item.Trading_Volume.toLocaleString()}</TableCell>
                <TableCell align="right">{(item.Trading_money / 1000).toFixed(0)}K</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockTable;
