import { AlignLeft, CircleUserRound } from "lucide-react";

export default function NavigationBar({ toggleSidebar, isSidebarOpen }) {
  return (
    <section className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <button className="cursor-pointer" onClick={toggleSidebar}>
          <AlignLeft
            size={30}
            strokeWidth={2.75}
            className={`transition-transform duration-300 ${
              isSidebarOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      <div>
        <CircleUserRound size={30} strokeWidth={2} />
      </div>
    </section>
  );
}