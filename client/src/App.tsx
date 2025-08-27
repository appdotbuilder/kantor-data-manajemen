import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Mail, SendHorizontal, ArrowLeft, Building2, LogOut, User } from 'lucide-react';
import InventoryManagement from '@/components/InventoryManagement';
import IncomingMailManagement from '@/components/IncomingMailManagement';
import OutgoingMailManagement from '@/components/OutgoingMailManagement';
import { LoginForm } from '@/components/LoginForm';

type AppView = 'dashboard' | 'inventory' | 'incoming-mail' | 'outgoing-mail';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check login status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn');
      const storedEmail = localStorage.getItem('userEmail');
      
      if (loginStatus === 'true' && storedEmail) {
        setIsLoggedIn(true);
        setUserEmail(storedEmail);
      }
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
    setCurrentView('dashboard');
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
  };

  const goBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login form if not logged in
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'inventory') {
    return <InventoryManagement onBackToDashboard={goBackToDashboard} userEmail={userEmail} onLogout={handleLogout} />;
  }

  if (currentView === 'incoming-mail') {
    return <IncomingMailManagement onBackToDashboard={goBackToDashboard} userEmail={userEmail} onLogout={handleLogout} />;
  }

  if (currentView === 'outgoing-mail') {
    return <OutgoingMailManagement onBackToDashboard={goBackToDashboard} userEmail={userEmail} onLogout={handleLogout} />;
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-6">
        {/* User Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selamat datang,</p>
              <p className="font-semibold text-gray-900">{userEmail}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Sistem Manajemen Kwarran Pagerbarang
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Platform terpadu untuk mengelola inventaris dan surat-menyurat Kwarran Pagerbarang dengan efisien
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Inventory Management Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Manajemen Inventaris
              </CardTitle>
              <CardDescription className="text-gray-600">
                Kelola data barang dan aset Kwarran Pagerbarang
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Nama Barang & Kode Inventaris</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Jumlah & Harga</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Lokasi & Deskripsi</span>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('inventory')} 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-300"
              >
                Kelola Inventaris
              </Button>
            </CardContent>
          </Card>

          {/* Incoming Mail Management Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Surat Masuk
              </CardTitle>
              <CardDescription className="text-gray-600">
                Kelola arsip surat yang diterima
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Pengirim & Tanggal Surat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Nomor Surat & Perihal</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Lampiran Dokumen</span>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('incoming-mail')} 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-300"
              >
                Kelola Surat Masuk
              </Button>
            </CardContent>
          </Card>

          {/* Outgoing Mail Management Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <SendHorizontal className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Surat Keluar
              </CardTitle>
              <CardDescription className="text-gray-600">
                Kelola arsip surat yang dikirim
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Penerima & Tanggal Surat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Nomor Surat & Perihal</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Lampiran Dokumen</span>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('outgoing-mail')} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-300"
              >
                Kelola Surat Keluar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <Badge variant="secondary" className="px-4 py-2">
            💼 Sistem Manajemen Kwarran Pagerbarang v1.0
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default App;