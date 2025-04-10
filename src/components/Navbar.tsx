import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Autocomplete,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getStockNameMap } from '../services/stockApi';

// 定义接口
interface NavbarProps {
  onSearch: (query: string) => void;
}

interface StockOption {
  code: string;
  name: string;
  label: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [selectedStock, setSelectedStock] = useState<StockOption | undefined>(undefined);
  const [inputValue, setInputValue] = useState('');
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);

  // 加载股票列表
  useEffect(() => {
    const loadStockOptions = async () => {
      try {
        const nameMap = await getStockNameMap();
        const options: StockOption[] = Object.entries(nameMap).map(([code, name]) => ({
          code,
          name,
          label: `${code} - ${name}`
        }));
        setStockOptions(options);
      } catch (error) {
        console.error('加载股票列表失败:', error);
      }
    };

    loadStockOptions();
  }, []);

  // 修复类型问题
  const handleStockChange = (_event: React.SyntheticEvent, newValue: StockOption | string | null) => {
    if (newValue && typeof newValue !== 'string') {
      setSelectedStock(newValue);
      onSearch(newValue.code);
    } else if (typeof newValue === 'string') {
      // 如果是字符串，可能是freeSolo模式下用户输入的值
      onSearch(newValue);
    }
  };

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      // 如果是纯数字或字母数字组合，认为是股票代码，直接搜索
      if (/^[0-9a-zA-Z]+$/.test(inputValue.trim())) {
        onSearch(inputValue.trim());
      }
    }
  };

  const handleSearchClick = () => {
    if (inputValue.trim() && /^[0-9a-zA-Z]+$/.test(inputValue.trim())) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <AppBar position="static" color="default" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 1 }}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1
              }}
            >
              <Autocomplete
                fullWidth
                options={stockOptions}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option.label
                }
                isOptionEqualToValue={(option, value) =>
                  value ? option.code === value.code : false
                }
                value={selectedStock}
                onChange={handleStockChange}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                autoHighlight
                freeSolo
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="输入台/美股票代码，查看公司价值"
                    variant="standard"
                    onKeyDown={handleKeyDown}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={handleSearchClick}
                            color="primary"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
                    <Box sx={{ fontWeight: 'bold', minWidth: '60px' }}>{option.code}</Box>
                    <Box sx={{ ml: 2 }}>{option.name}</Box>
                  </Box>
                )}
                filterOptions={(options, { inputValue }) => {
                  const filterValue = inputValue.toLowerCase();
                  return options.filter(
                    option =>
                      option.code.toLowerCase().includes(filterValue) ||
                      option.name.toLowerCase().includes(filterValue)
                  );
                }}
              />
            </Paper>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
