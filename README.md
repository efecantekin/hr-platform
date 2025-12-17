# 🚀 Enterprise HR Platform (Microservices & Next.js)

**HR Platform**, modern kurumsal ihtiyaçlar için tasarlanmış, ölçeklenebilir **Mikroservis Mimarisi** üzerine kurulu, uçtan uca bir İnsan Kaynakları ve İşe Alım Yönetim Sistemidir.

![Status](https://img.shields.io/badge/Status-MVP_Complete-success?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Java_21_%7C_Spring_Boot-orange?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_14_%7C_TypeScript-blue?style=for-the-badge)
![Infrastructure](https://img.shields.io/badge/DevOps-Docker_%7C_PostgreSQL-blueviolet?style=for-the-badge)

---

## 📖 Proje Hakkında

Bu proje, geleneksel monolitik İK yazılımlarının aksine, **bağımsız, dağıtık ve ölçeklenebilir** servisler bütünü olarak tasarlanmıştır. Ön yüzde **Next.js (App Router)** ile yüksek performanslı ve SEO dostu bir deneyim sunarken, arka planda **Spring Boot** ekosistemi ve **Docker** konteynerizasyonu ile kurumsal standartları karşılar.

---

### 🏗️ Mimari Tasarım

Sistem, **API Gateway** arkasında çalışan ve birbirleriyle **OpenFeign** üzerinden haberleşen izole servislerden oluşur.

---

```mermaid
graph TD
    Client[Next.js Frontend] -->|HTTP/REST| Gateway[API Gateway :8080]
    
    subgraph "Backend Services (Private Network)"
        Gateway --> Auth[Auth Service]
        Gateway --> Employee[Employee Service]
        Gateway --> Leave[Leave Service]
        Gateway --> Doc[Document Service]
        Gateway --> Admin[Admin Service]
        Gateway --> Recruit[Recruitment Service]
    end

    Auth --> DB1[(Auth DB)]
    Employee --> DB2[(Employee DB)]
    Leave --> DB3[(Leave DB)]
    Doc --> DB4[(Doc DB)]
    Admin --> DB5[(Admin DB)]
    Recruit --> DB6[(Recruit DB)]
```

---

✨ Temel Özellikler
1. 🔐 Güvenlik ve Kimlik Yönetimi
JWT (JSON Web Token): Stateless oturum yönetimi.

RBAC (Role-Based Access Control): Admin, Manager ve User rolleriyle sayfa ve veri bazlı yetkilendirme.

Auto-Provisioning: Yeni personel kartı oluşturulduğunda, otomatik olarak kullanıcı hesabı (Login) açılması.

2. 👥 Personel ve Organizasyon
Hiyerarşik Yönetim: Sınırsız derinlikte ast-üst ilişkisi kurabilme.

İnteraktif Org. Şeması: Şirket yapısını ağaç (Tree View) şeklinde görselleştirme.

Akıllı Atama: Sürükle-bırak veya seçim ile yönetici atamaları ve pozisyon zorunluluğu kontrolleri.

Master Data Yönetimi: Departman, Unvan ve Pozisyonların merkezi yönetimi.

3. ⚙️ Dinamik Yönetim Paneli (CMS)
Veritabanı Güdümlü Menü: Kod değişikliği yapmadan, veritabanından yönetilen Sidebar yapısı.

Sürükle & Bırak (Drag & Drop): Menü sıralamasını ve alt-üst ilişkilerini görsel olarak düzenleme.

Yetki Bazlı Görünüm: Hangi menünün hangi roller tarafından görülebileceğinin seçilmesi.

4. 🎯 İşe Alım (ATS - Recruitment Modülü)
Aday Havuzu: Adayların yetenek, tecrübe ve iletişim bilgilerinin takibi.

Gelişmiş Filtreleme: Teknoloji, tecrübe yılı, okul gibi kriterlere göre dinamik sorgulama (JPA Specifications).

Süreç Yönetimi: Adayın durumunun (Telefon, Teknik Mülakat, Teklif vb.) yönetilmesi.

5. 🧩 İş Akışları (Workflows)
İzin Yönetimi: Personel talep oluşturur -> Yönetici onayına düşer -> Onay/Red süreci.

Belge Operasyonları: Personel belge talep eder -> İK havuzuna düşer -> İK uzmanı işi üzerine alır -> Tamamlar.

6. 🌍 Globalizasyon
Çoklu Dil (i18n): next-intl altyapısı ile tam Türkçe/İngilizce desteği.

---

## 🛠️ Teknoloji Yığını

| Alan | Teknolojiler |
| :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white) |
| **Backend** | ![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring-boot&logoColor=white) ![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-6DB33F?style=flat&logo=spring&logoColor=white) ![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=flat&logo=hibernate&logoColor=white) |
| **Veritabanı** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) |
| **DevOps & Araçlar** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-C71A36?style=flat&logo=apache-maven&logoColor=white) |
| **Mimari** | ![Microservices](https://img.shields.io/badge/Microservices-Architecture-blueviolet) ![API Gateway](https://img.shields.io/badge/API_Gateway-Spring_Cloud-green) ![REST API](https://img.shields.io/badge/REST_API-JSON-orange) |

---

🚀 Kurulum ve Çalıştırma
Projenin tamamını (Frontend + 6 Backend Servisi + Veritabanları) ayağa kaldırmak için bilgisayarınızda sadece Docker yüklü olması yeterlidir.

1. Projeyi Klonlayın
```bash
git clone [https://github.com/efecantekin/hr-platform.git](https://github.com/efecantekin/hr-platform.git)
cd hr-platform
```

2. Sistemi Başlatın
Aşağıdaki komut, tüm servisleri derler, Docker imajlarını oluşturur ve konteynerleri başlatır.

```bash
docker-compose up --build -d
```

3. Erişim Bilgileri
* **Sistem açıldığında aşağıdaki adreslerden erişebilirsiniz:
   * Web Arayüzü: http://localhost:3000
   * API Gateway: http://localhost:8080

* **Varsayılan Yönetici Girişi:
   * Kullanıcı: admin (Veritabanı boşsa API üzerinden oluşturulmalıdır)
   * Şifre: 123

---

### 📱 Arayüzden Görüntüler

![Menu](https://i.imgur.com/Jxb7UYe.png)

---

### 🔮 Gelecek Planları (Roadmap)
* [ ] Bildirim Sistemi: RabbitMQ entegrasyonu ile asenkron e-posta bildirimleri.
* [ ] Raporlama: PDF ve Excel formatında personel/izin raporları.
* [ ] Swagger/OpenAPI: Tüm mikroservisler için merkezi API dokümantasyonu.
* [ ] CI/CD: GitHub Actions ile otomatik deploy süreçleri.
