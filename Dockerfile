# Imagem única: site (React) + API (Spring) no MESMO endereço.
# Necessário para o cookie de login (HttpOnly, SameSite=Strict) e para os links
# de convite funcionarem em qualquer celular. Segredos entram como variáveis de
# ambiente na hospedagem — nunca dentro da imagem (ver .dockerignore).

# 1) Site
FROM node:22-alpine AS site
WORKDIR /site
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) API com o site embutido em /static
FROM eclipse-temurin:25-jdk AS api
WORKDIR /api
COPY backend/api/mvnw backend/api/pom.xml ./
COPY backend/api/.mvn .mvn
RUN ./mvnw -q -B dependency:go-offline
COPY backend/api/src ./src
COPY --from=site /site/dist ./src/main/resources/static
RUN ./mvnw -q -B -DskipTests package && cp target/api-*.jar /app.jar

# 3) Execução (só JRE, usuário sem privilégios)
FROM eclipse-temurin:25-jre
RUN useradd --system --uid 1001 boteco
COPY --from=api /app.jar /app/app.jar
USER boteco
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
