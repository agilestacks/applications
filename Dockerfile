FROM java:jre

ARG APP_NAME=java-application
ARG APP_VERSION=0.1.0

COPY build/libs/$APP_NAME-$APP_VERSION.jar /app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]