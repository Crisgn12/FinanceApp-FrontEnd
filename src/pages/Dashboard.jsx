import InfoCard from "../components/InfoCard"
import CardIngresos from "../components/CardIngresos"
import CardGastos from "../components/CardGastos"

export default function Dashboard() {
  return (
    <div className="bg-background size-full py-6 px-16">
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="col-span-1">
          <InfoCard />
        </div>

        <div className="col-span-1">
          <CardIngresos />
        </div>

        <div className="col-span-1">
          <CardGastos />
        </div>

      </div>

        <main className="rounded-3xl shadow-md bg-white p-6 max-w-full h-full">
            <h1 className="text-2xl font-bold">Aqui varios graficos y cosas</h1>
        </main>
    </div>
  )
}
