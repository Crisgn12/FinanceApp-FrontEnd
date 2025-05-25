import { ArrowUp } from "lucide-react"

export default function CardIngresos() {
    return (
      <div className="bg-white rounded-3xl shadow-md py-4 px-6 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
              <h1 className="text-gray-500">Ingresos (Mes)</h1>
              <p className="text-2xl font-bold">₡200,000.00</p>
              <p className="text-green-600">+12% vs. mes anterior</p>
          </div>
  
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <ArrowUp size={25} color="green"/>
          </div>
      </div>
    )
}