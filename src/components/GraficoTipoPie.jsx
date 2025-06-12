import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
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
import { useMemo } from "react";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

const COLORES_CATEGORIA = [
  "var(--chart-1)",
  "var(--chart-2)", 
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1"
];

export function GraficoTipoPie({ gastosPorCategoria = [] }) {
  // Transformar y configurar los datos
  const { chartData, chartConfig, totalGastos } = useMemo(() => {
    if (!gastosPorCategoria || gastosPorCategoria.length === 0) {
      return { chartData: [], chartConfig: {}, totalGastos: 0 };
    }

    // Calcular total de gastos (los datos ya vienen sumados por categoría)
    const total = gastosPorCategoria.reduce((sum, item) => sum + item.total, 0);

    // Transformar datos para recharts (solo formato, no cálculos)
    const transformedData = gastosPorCategoria.map((item, index) => ({
      categoria: item.categoria,
      monto: item.total, // Ya viene como número desde la API
      fill: COLORES_CATEGORIA[index % COLORES_CATEGORIA.length]
    }));

    // Generar configuración dinámica
    const config = {
      monto: {
        label: "Monto",
      },
      ...gastosPorCategoria.reduce((acc, item, index) => {
        const key = item.categoria.toLowerCase().replace(/\s+/g, '-');
        acc[key] = {
          label: item.categoria,
          color: COLORES_CATEGORIA[index % COLORES_CATEGORIA.length],
        };
        return acc;
      }, {})
    };

    return {
      chartData: transformedData,
      chartConfig: config,
      totalGastos: total
    };
  }, [gastosPorCategoria]);

  // Componente personalizado para tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Categoría
              </span>
              <span className="font-bold text-muted-foreground">
                {data.payload.categoria}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Monto
              </span>
              <span className="font-bold">
                {formatCurrency(data.payload.monto)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Si no hay datos, mostrar mensaje
  if (!gastosPorCategoria || gastosPorCategoria.length === 0) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribución de Gastos</CardTitle>
          <CardDescription>Por Categoría</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No hay datos de gastos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Gastos</CardTitle>
        <CardDescription>
          Total: {formatCurrency(totalGastos)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie 
              data={chartData} 
              dataKey="monto" 
              nameKey="categoria"
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
          Distribución de gastos por categoría
        </div>
        <div className="text-muted-foreground leading-none text-center">
          Mostrando el total de gastos agrupados por categoría
        </div>
      </CardFooter>
    </Card>
  );
}