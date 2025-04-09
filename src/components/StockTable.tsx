import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

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

interface StockTableProps {
  stockData: StockData;
}

const StockTable: React.FC<StockTableProps> = ({ stockData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>月度营收数据</Typography>
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
    </Box>
  );
};

export default StockTable;
