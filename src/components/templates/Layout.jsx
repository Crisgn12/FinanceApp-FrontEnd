import { useState } from "react";
import Sidebar from "../sidebar";
import NavigationBar from "../NavigationBar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div
        className="bg-background grid h-screen"
        style={{
          gridTemplateColumns: isSidebarOpen ? "292px 1fr" : "80px 1fr",
          gridTemplateRows: "64px 1fr",
          transition: "grid-template-columns 0.3s ease-in-out",
        }}
      >
        <section className="row-span-2 col-start-1">
          <Sidebar 
            isOpen={isSidebarOpen} 
          />
        </section>

        <section className="col-start-2">
          <NavigationBar 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
        </section>

        <section
          className="bg-background h-full overflow-y-auto col-start-2"
          style={{
            gridRow: "2 / 3",
            gridColumn: "2 / 3",
          }}
        >
          <Outlet />
        </section>
      </div>
    </>
  );
}