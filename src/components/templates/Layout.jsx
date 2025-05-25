import Sidebar from "../sidebar";
import NavigationBar from "../NavigationBar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <div
        className="bg-background grid h-screen"
        style={{
          gridTemplateColumns: "292px 1fr",
          gridTemplateRows: "64px 1fr",
        }}
      >
        <section className="row-span-2 col-start-1">
          <Sidebar />
        </section>

        <section className="col-start-2">
          <NavigationBar />
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
