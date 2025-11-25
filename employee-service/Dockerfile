# 1. Aşama: Build (Maven ve Java 21 ile derleme)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Testleri atlayarak paketle
RUN mvn clean package -DskipTests

# 2. Aşama: Run (Çalıştırma için Eclipse Temurin JDK kullanıyoruz)
# BURAYI DEĞİŞTİRDİK: openjdk yerine eclipse-temurin
FROM eclipse-temurin:21-jdk 
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]