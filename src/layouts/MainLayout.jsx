import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="mt-24 px-xl pb-xl flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
