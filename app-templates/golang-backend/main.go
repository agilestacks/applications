package main

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"

	"golang-backend/controllers"
)

func main() {
	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/", controllers.Status)
	r.HandleFunc("/status", controllers.Status)

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":3000", r))
}
