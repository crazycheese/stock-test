'use client';

import React, { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';

interface EChartsClientProps {
  children?: ReactNode;
}

const EChartsClient: React.FC<EChartsClientProps> = ({ children }) => {
  const option = {
    title: {
      text: 'ECharts 入门示例',
    },
    tooltip: {},
    xAxis: {
      data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子'],
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  };

  return <>{children}</>;
};

export default EChartsClient;
