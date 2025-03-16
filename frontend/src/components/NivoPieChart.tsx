import { ResponsivePie } from '@nivo/pie';

interface PieChartProps {
  data: { id: string; label: string; value: number }[];
}

const NivoPieChart: React.FC<PieChartProps> = ({ data }) => {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      colors={{ scheme: 'category10' }} // Define um esquema de cores
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLabelsSkipAngle={10} // Substitui radialLabelsSkipAngle
      arcLabelsTextColor="#ffffff"
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          translateY: 56,
          itemWidth: 100,
          itemHeight: 14,
          itemTextColor: '#999',
          symbolSize: 14,
          symbolShape: 'circle',
        },
      ]}
    />
  );
};

export default NivoPieChart;
