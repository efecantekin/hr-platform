# 🚀 Enterprise HR Management Platform (Microservices & Next.js)

Kurumsal seviyede, tam donanımlı, mikroservis mimarisine sahip İnsan Kaynakları Yönetim Platformu.



## 📖 Proje Hakkında

Bu proje, modern bir şirketin tüm İK süreçlerini dijitalleştirmek amacıyla geliştirilmiştir. Monolitik yapı yerine, ölçeklenebilir ve bağımsız **Spring Boot Mikroservisleri** üzerine inşa edilmiştir. Ön yüzde ise hızlı ve modern bir kullanıcı deneyimi için **Next.js (App Router)** kullanılmıştır. Tüm sistem **Docker** üzerinde konteynerize edilmiştir.

### 🌟 Temel Özellikler

* **🔐 Güvenli Kimlik Doğrulama (Auth Service):**
    * JWT (JSON Web Token) tabanlı güvenli giriş.
    * Rol Bazlı Erişim Kontrolü (RBAC - Admin/User/Manager).
    * Personel kaydı sırasında **otomatik kullanıcı hesabı oluşturma** (Feign Client ile Servisler arası iletişim).
* **🏢 API Gateway (Spring Cloud Gateway):**
    * Tüm mikroservislere tek noktadan erişim.
    * Merkezi güvenlik ve CORS filtresi.
* **👥 Personel & Hiyerarşi Yönetimi (Employee Service):**
    * Sınırsız derinlikte, ağaç yapısında **Organizasyon Şeması (Tree View)**.
    * Ekip oluşturma ve yönetici atama iş akışları.
* **📅 İzin Yönetimi İş Akışı (Leave Service):**
    * Personel izin talebi oluşturur (Statü: PENDING).
    * Yönetici, onay panelinde talebi görür ve **Onaylar/Reddeder**.
* **📄 Belge Talep Operasyonu (Document Service):**
    * Personel belge talep eder, talep İK havuzuna düşer.
    * İK uzmanı işi üzerine alır (Claim) ve tamamlar.
* **🐳 Tam Docker Desteği:**
    * Frontend, 4 Backend servisi ve 4 Veritabanı tek komutla ayağa kalkar.

---

## 🏗️ Mimari ve Teknoloji Yığını

Proje, her biri kendi veritabanına sahip izole mikroservislerden oluşur.

| Katman | Teknoloji | Detaylar |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | TypeScript, Tailwind CSS, Axios |
| **API Gateway** | Spring Cloud Gateway | Merkezi yönlendirme ve güvenlik |
| **Backend Servisler**| Java 21, Spring Boot 3.3 | Auth, Employee, Leave, Document |
| **Veritabanı** | PostgreSQL | Her servis için izole 4 ayrı DB |
| **DevOps** | Docker & Docker Compose | Tam konteynerizasyon |

### 📱 Arayüzden Görüntüler

![Arayüz](https://i.imgur.com/h3LIHPW.png)

---

## 🚀 Kurulum ve Çalıştırma (Docker)

Projeyi yerel makinenizde çalıştırmak için sadece Docker'ın yüklü olması yeterlidir.

### 1. Projeyi Klonlayın
```bash
git clone [https://github.com/KULLANICI_ADINIZ/hr-platform.git](https://github.com/KULLANICI_ADINIZ/hr-platform.git)
cd hr-platform