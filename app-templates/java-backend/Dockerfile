FROM java:jre

ARG APP_NAME=java-application
ARG APP_VERSION="1.0-SNAPSHOT"

COPY build/libs/$APP_NAME-$APP_VERSION.jar /app.jar


EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]