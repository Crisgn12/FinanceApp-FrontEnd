import { ArrowDown } from "lucide-react"

export default function CardGastos() {
    return (
      <div className="bg-white rounded-3xl shadow-md py-4 px-6 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
              <h1 className="text-gray-500">Gastos (Mes)</h1>
              <p className="text-2xl font-bold">₡54,000.00</p>
              <p className="text-red-600">+8% vs. mes anterior</p>
          </div>
  
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <ArrowDown size={25} color="red"/>
          </div>
      </div>
    )
}