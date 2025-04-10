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
import { useEffect, useRef } from 'react';

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
}

interface StockTableProps {
  stockData: StockData;
}

const StockTable: React.FC<StockTableProps> = ({ stockData }) => {
  // 创建一个引用来获取表格容器
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 首次加载时滚动到最右侧
  useEffect(() => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      // 滚动到最右侧
      container.scrollLeft = container.scrollWidth;
    }
  }, [stockData]); // 当stockData变化时重新滚动

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        月度营收数据
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: '100%', overflow: 'auto' }}
        ref={tableContainerRef}
      >
        <Table aria-label="月度营收表格">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  minWidth: 140,
                  position: 'sticky',
                  left: 0,
                  top: 0,
                  background: 'white',
                  zIndex: 4,
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                }}
              >
                指标
              </TableCell>
              {stockData.monthlyRevenue.map((item) => (
                <TableCell
                  key={item.month}
                  align="right"
                  sx={{
                    minWidth: 100,
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    zIndex: 3,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {item.month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 每月营收行 */}
            <TableRow sx={{ backgroundColor: 'white' }}>
              <TableCell
                component="th"
                scope="row"
                sx={{
                  position: 'sticky',
                  left: 0,
                  background: 'white',
                  zIndex: 2,
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                }}
              >
                每月营收 (千元)
              </TableCell>
              {stockData.monthlyRevenue.map((item) => (
                <TableCell key={`revenue-${item.month}`} align="right">
                  {(item.revenue / 1000).toLocaleString('zh-CN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
              ))}
            </TableRow>

            {/* 增长率行 */}
            <TableRow sx={{ backgroundColor: 'white' }}>
              <TableCell
                component="th"
                scope="row"
                sx={{
                  position: 'sticky',
                  left: 0,
                  background: 'white',
                  zIndex: 2,
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                }}
              >
                年增率 (%)
              </TableCell>
              {stockData.monthlyRevenue.map((item) => (
                <TableCell
                  key={`growth-${item.month}`}
                  align="right"
                  sx={{
                    color: item.growthRate && item.growthRate >= 0 ? 'success.main' : 'error.main',
                    background: 'white',
                  }}
                >
                  {item.growthRate !== null
                    ? `${item.growthRate >= 0 ? '+' : ''}${item.growthRate.toFixed(2)}%`
                    : 'N/A'}
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
