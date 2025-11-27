"use client"; // Client-side rendering için gerekli

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { authService } from "../../services/authService"; // Servis importu

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth')
  
  // Form verilerini tutacak değişkenler
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Giriş Butonuna Basılınca Çalışacak Fonksiyon
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setLoading(true);
    setError("");

    try {
      const data = await authService.login({ username, password });
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", username);
        
        // YENİ: Rolü ve ID'yi de kaydet!
        localStorage.setItem("role", data.role); 
        localStorage.setItem("employeeId", data.employeeId.toString());

        router.push("/dashboard");
      }

    } catch (err) {
      console.error("Login Hatası:", err);
      setError("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {t('title')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-black"
              placeholder="Örn: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Şifre
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-black"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-4">
          © 2025 HR Platform. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}