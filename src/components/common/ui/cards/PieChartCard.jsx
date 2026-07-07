import { Card, CardContent } from "@/components/common/ui/cards/card";

export default function PieChartCard({ title, value, data }) {
  const Chart = data.chart?.Component;

  return (
    <div className="w-96">
      <div className="flex flex-col items-start">
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-semibold">{value}</span>
          <span className="text-sm font-medium text-secondary-foreground">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {Chart && <Chart {...data.chart.props} />}

          <div className="flex flex-col gap-2 text-sm font-medium text-gray-600 flex-1">
            {data.items?.map((item, index) => (
              <div className="flex items-center gap-2" key={index}>
                <span
                  className="w-7 h-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
