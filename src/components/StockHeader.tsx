import { Box, Typography, Chip, Stack, Grid as MuiGrid, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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

// 为了解决MUI v7中的Grid类型问题，创建一个Grid包装组件
const Grid = (props: any) => <MuiGrid {...props} />;

const StockHeader: React.FC<StockHeaderProps> = ({ stockData }) => {
  const { name, code, price, change, changePercent } = stockData;
  const isPositive = change >= 0;

  // 获取最近的交易数据
  const latestTradeData = stockData.stockPriceData.length > 0
    ? stockData.stockPriceData[stockData.stockPriceData.length - 1]
    : null;

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            最后更新: {latestTradeData?.date || '未知'}
          </Typography>
        </Grid>

        {latestTradeData && (
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">开盘价</Typography>
                  <Typography variant="body1">{latestTradeData.open.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">收盘价</Typography>
                  <Typography variant="body1">{latestTradeData.close.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">最高价</Typography>
                  <Typography variant="body1">{latestTradeData.max.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">最低价</Typography>
                  <Typography variant="body1">{latestTradeData.min.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">交易量</Typography>
                  <Typography variant="body1">{latestTradeData.Trading_Volume.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">交易金额</Typography>
                  <Typography variant="body1">{(latestTradeData.Trading_money / 1000000).toFixed(2)}M</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StockHeader;
