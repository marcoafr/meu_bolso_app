import { ResponsiveBar } from '@nivo/bar';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { formatCurrency } from '../util/Util';

interface Receivable {
  categoryName: string;
  totalAmount: number;
  totalExpected: number;
}

interface NivoBarChartProps {
  data: Receivable[];
}

const NivoBarChart = ({ data }: NivoBarChartProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
  const chartData = data.map((r) => ({
    category: r.categoryName,
    total: r.totalAmount,
    budget: r.totalExpected,
  }));

  return (
    <Box sx={{ height: '400px', marginTop: 2 }}>
      <ResponsiveBar
        data={chartData}
        keys={['budget', 'total']} // Mantém a ordem correta para orçamento e pago
        indexBy="category"
        layout="horizontal"
        margin={{
            top: 30,
            right: 30,
            bottom: 70,
            left: isMobile ? 100 : 150, // Reduz a margem esquerda no mobile para dar mais espaço às barras
        }}
        padding={isMobile ? 0.1 : 0.3} // Aumenta o espaçamento entre as barras no mobile
        groupMode="grouped" // Mantém barras lado a lado
        colors={({ id, data }) =>
          id === 'budget'
            ? '#d3d3d3' // Cinza para orçamento
            : data.budget == null || data.budget == 0 
            ? '#428af5' // Azul se não houver orçamento
            : data.total > data.budget
            ? '#ff4d4d' // Vermelho se ultrapassar o orçamento
            : '#82ca9d' // Verde se estiver dentro do orçamento
        }
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Valor (R$)',
          legendPosition: 'middle',
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -30, // Inclina os nomes para evitar corte
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        tooltip={({ id, value, color }: { id: string; value: number; color: string }) => {
            const labelMap: { [key: string]: string } = {
              total: 'Total Previsto + Pago',
              budget: 'Orçamento',
            };
            
            return (
              <Box
                sx={{
                  backgroundColor: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body2" sx={{ color }}>
                    <strong>{labelMap[id] || id}</strong>: {formatCurrency(value)}
                </Typography>
              </Box>
            );
        }}
      />
    </Box>
  );
};

export default NivoBarChart;
