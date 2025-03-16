import { ResponsiveLine } from "@nivo/line";
import { Box, Typography } from "@mui/material";

interface DataPoint {
  x: string; // Data no formato YYYY-MM-DD
  y: number; // Saldo
}

interface LineChartData {
  id: string; // Nome da conta
  color: string;
  data: DataPoint[];
}

interface NivoLineChartProps {
  data: LineChartData[];
}

const NivoLineChart: React.FC<NivoLineChartProps> = ({ data }) => {
  return (
    <Box sx={{ height: "400px", width: "100%" }}>
      {data.length > 0 ? (
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Data",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Saldo",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          colors={{ datum: "color" }} // Usa a cor definida em cada série de dados
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "top-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 2,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      ) : (
        <Typography>Nenhum dado encontrado para o período selecionado.</Typography>
      )}
    </Box>
  );
};

export default NivoLineChart;
