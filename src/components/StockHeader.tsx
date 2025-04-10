import { Box, Typography, Paper } from '@mui/material';
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

interface StockHeaderProps {
  stockData: StockData;
}

const StockHeader: React.FC<StockHeaderProps> = ({ stockData }) => {
  const { name, code } = stockData;

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" component="h1" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {code}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StockHeader;
