import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

export function GraficoLinear({ gastosUltimos6Dias = [] }) {
  
  // Transformar los datos de la API para el gráfico
  const chartData = gastosUltimos6Dias.map((item) => {
    // Crear fecha directamente desde el string sin problemas de zona horaria
    const [year, month, day] = item.day.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return {
      day: fecha.toLocaleDateString("es-ES", { 
        weekday: "short", 
        day: "numeric" 
      }), // Ej: "Vie 7", "Sáb 8"
      total: parseFloat(item.total), // Asegurar que sea número
      fullDate: item.day // Mantener la fecha completa para el tooltip
    };
  });

  return (
    <Card className={"border-0 shadow-none bg-transparent"}>
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription>Últimos 6 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value) => [
                    'Total: ',
                  `${formatCurrency(value)}`,
                ]}
              />} 
            />
            <Line
              dataKey="total"
              type="monotone"
              stroke="#1961bf"
              strokeWidth={2}
              dot={{
                fill: "#1961bf",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Mostrando el rendimiento de las transacciones en los últimos 6 días.
        </div>
      </CardFooter>
    </Card>
  );
}