package controllers

import (
	"encoding/json"
	"net/http"
)

type status struct {
	Name    string `json:"name,omitempty"`
	Version string `json:"version,omitempty"`
}

func Status(w http.ResponseWriter, r *http.Request) {
	status := &status{
		"golang-backend",
		"1.0",
	}
	obj, err := json.Marshal(status)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("{\"error\": 500}\n"))
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write(obj)
	}
}
