import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./page/Dashboard";
import Students from "./page/Students";
import Attendance from "./page/Attendance";
import Grades from "./page/Grades";
import StudentNotes from "./page/StudentNotes";
import Schedule from "./page/Schedule";
import Report from "./page/Report";
import Setting from "./page/Setting";
import Sistem from "./page/Sistem";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPageChange={setCurrentPage} />;
      case "students":
        return <Students />;
      case "attendance":
        return <Attendance />;
      case "grades":
        return <Grades />;
      case "notes":
        return <StudentNotes />;
      case "schedule":
        return <Schedule />;
      case "report":
        return <Report />;
      case "setting":
        return <Setting />;
      case "sistem":
        return <Sistem />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
