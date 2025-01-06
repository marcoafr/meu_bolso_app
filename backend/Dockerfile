# Etapa 1: Construção do aplicativo
FROM maven:3.8.5-openjdk-17 AS builder

WORKDIR /app

# Copiar os arquivos do projeto
COPY pom.xml .
COPY src ./src

# Construir o aplicativo Spring Boot
RUN mvn clean package -DskipTests

# Etapa 2: Imagem final para execução
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copiar o arquivo JAR gerado da etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# Expor a porta que o aplicativo Spring Boot vai rodar
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]