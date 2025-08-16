"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText, 
  CreditCard, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Stethoscope,
  Pill,
  Activity,
  Bell
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useCart();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getCustomerLinks = () => {
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/dashboard/customer', label: 'Dashboard', icon: BarChart3 },
      { href: '/dashboard/customer/consultations', label: 'Consultations', icon: Stethoscope },
      { href: '/dashboard/customer/prescriptions', label: 'My Prescriptions', icon: Pill },
      { href: '/dashboard/customer/orders', label: 'My Orders', icon: ShoppingCart },
      { href: '/dashboard/customer/reminders', label: 'Reminders', icon: Bell },
      { href: '/dashboard/customer/profile', label: 'Profile', icon: User },
    ];
  };

  const getStaffLinks = () => {
    const links = [
      { href: `/dashboard/${role}`, label: 'Dashboard', icon: BarChart3 },
    ];

    if (role === 'admin') {
      links.push(
        { href: '/dashboard/admin/users', label: 'Users Management', icon: Users },
        { href: '/dashboard/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/dashboard/admin/inventory', label: 'Inventory', icon: Package },
        // { href: '/dashboard/admin/delivery', label: 'Delivery', icon: Truck },
        { href: '/dashboard/admin/reports', label: 'Reports', icon: Activity },
        { href: '/dashboard/admin/doctors', label: 'Doctors', icon: Stethoscope },
        { href: '/dashboard/admin/message', label: 'Notification', icon: Bell }
      );
    }

    if (role === 'pharmacist') {
      links.push(
        // { href: '/dashboard/pharmacist', label: 'Dashboard', icon: BarChart3 },
        { href: '/dashboard/pharmacist/prescriptions', label: 'Prescriptions', icon: FileText },
        { href: '/dashboard/pharmacist/pos', label: 'Point of Sale', icon: CreditCard },
        { href: '/dashboard/pharmacist/inventory', label: 'Inventory', icon: Package },
      );
    }

    if (role === 'doctor') {
      links.push(
        { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: Calendar },
        { href: '/dashboard/doctor/availability', label: 'Availability', icon: Clock },
        { href: '/dashboard/doctor/profile', label: 'Profile', icon: User },
      );
    }

    if (role === 'delivery') {
      links.push(
        { href: '/dashboard/delivery/assignedorders', label: 'Assigned Orders', icon: Package },
        { href: '/dashboard/delivery/history', label: 'Delivery History', icon: Truck },
        { href: '/dashboard/delivery/profile', label: 'Profile', icon: User },
      );
    }

    return links;
  };

  const links = role === 'customer' ? getCustomerLinks() : getStaffLinks();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-screen shadow-2xl fixed left-0 top-0 flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">SK Medicals</h2>
            <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav>
          <ul className="space-y-2">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive(link.href) 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${
                      isActive(link.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`} />
                    <span className="font-medium">{link.label}</span>
                    {isActive(link.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Actions */}

            {/* <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
              <span className="font-medium">Notifications</span>
            </button> */}
            {/* <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 group">
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-white" />
              <span className="font-medium">Settings</span>
            </button> */}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
        
        {/* User Info */}
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {role === 'customer' ? 'Customer' : role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              <p className="text-xs text-slate-400">Active Session</p>
            </div>
          </div>
        </div>
      </div>
      <LogoutConfirmModal open={showLogoutModal} onConfirm={confirmLogout} onCancel={cancelLogout} />
    </div>
  );
} 