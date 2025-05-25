import { AlignLeft, CircleUserRound } from "lucide-react"

export default function NavigationBar() {
  return (
    <section className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        <div>
            <AlignLeft size={30} strokeWidth={2.75} />
        </div>

        <div>
            <CircleUserRound size={30} strokeWidth={2} />
        </div>
    </section>
  )
}
