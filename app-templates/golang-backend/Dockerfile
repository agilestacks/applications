FROM golang:1.11-alpine as builder

ENV GOCACHE=/tmp/.cache
WORKDIR /golang-backend
COPY . /golang-backend
RUN CGO_ENABLED=0 go build -v -mod=vendor -o golang-backend-app


FROM alpine:3.8

COPY --from=builder /golang-backend/golang-backend-app /bin/golang-backend-app
EXPOSE 8000
CMD "golang-backend-app"
