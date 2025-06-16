"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getCustomerLinks = () => {
        return [
      { href: '/', label: 'Home', icon: '🏠' },
      { href: '/dashboard/customer', label: 'Dashboard', icon: '📊' },
      { href: '/dashboard/customer/consultations', label: 'Consultations', icon: '👨‍⚕️' },
      { href: '/dashboard/customer/orders', label: 'My Orders', icon: '📦' },
      { href: '/dashboard/customer/profile', label: 'Profile', icon: '👤' },
    ];
  };

  const getStaffLinks = () => {
    const links = [
      { href: `/dashboard/${role}`, label: 'Dashboard', icon: '📊' },
    ];

    if (role === 'admin') {
      links.push(
        { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
        { href: '/dashboard/admin/orders', label: 'Orders', icon: '👨‍💼' },
        { href: '/dashboard/admin/inventory', label: 'Inventory', icon: '📦' },
        { href: '/dashboard/admin/delivery', label: 'Delivery', icon: '📦' },
        { href: '/dashboard/admin/reports', label: 'Reports', icon: '📦' },
        { href: '/dashboard/admin/doctors', label: 'Doctor', icon: '👨‍💼' }
      );
    }

    if (role === 'pharmacist') {
      links.push(
        { href: '/dashboard/pharmacist/prescriptions', label: 'Prescriptions', icon: '📝' },
        { href: '/dashboard/pharmacist/pos', label: 'Point of Sale', icon: '💳' },
        { href: '/dashboard/pharmacist/orders', label: 'Orders', icon: '🛒' },

      );
    }

    if (role === 'doctor') {
      links.push(
        { href: '/dashboard/doctor/appointments', label: 'Appointment', icon: '👨‍⚕️' },
        { href: '/dashboard/doctor/availability', label: 'Availabilty', icon: '👨‍⚕️' }

      );
    }

    if (role === 'delivery') {
      links.push(
        { href: '/dashboard/delivery/assignedorders', label: 'Orders', icon: '📦' },
        { href: '/dashboard/delivery/history', label: 'History', icon: '📦' },
        { href: '/dashboard/delivery/profile', label: 'Profile', icon: '📦' },
      );
    }

    return links;
  };

  const links = role === 'customer' ? getCustomerLinks() : getStaffLinks();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 flex flex-col">
      <div className="p-4 flex-1">
        <h2 className="text-xl font-bold text-blue-700 mb-8">SK Medicals</h2>
        <nav>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.href) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 