import { Box, Typography, Chip, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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

interface StockHeaderProps {
  stockData: StockData;
}

const StockHeader: React.FC<StockHeaderProps> = ({ stockData }) => {
  const { name, code, price, change, changePercent } = stockData;
  const isPositive = change >= 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {name}
        </Typography>
        <Chip
          label={code}
          color="primary"
          variant="outlined"
          sx={{ fontSize: '1rem', height: 32 }}
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" component="div">
          ¥{price.toFixed(2)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: isPositive ? 'success.main' : 'error.main'
          }}
        >
          {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <Typography variant="body1" component="span" sx={{ ml: 0.5 }}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default StockHeader;
