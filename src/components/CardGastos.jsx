import { ArrowDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function CardGastos({ totalGastosxMes }) {
    return (
      <div className="bg-white rounded-3xl shadow-md py-4 px-6 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
              <h1 className="text-gray-500">Gastos (Mes)</h1>
              <p className="text-2xl font-bold">{formatCurrency(totalGastosxMes)}</p>
          </div>
  
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <ArrowDown size={25} color="red"/>
          </div>
      </div>
    )
}