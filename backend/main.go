package main

import (
	"database/sql"
	"encoding/json"
	"github.com/gorilla/mux"
	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"log"
	"net/http"
)

type PotentialSponsor struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	ContactPerson string `json:"contactPerson"`
	Email         string `json:"email"`
	Phone         int32  `json:"phone"`
	SponsorArea   string `json:"sponsorshipArea"`
}

type Company struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Website string `json:"website"`
}

type Event struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Start       string `json:"start"`
	End         string `json:"end"`
	SponsorType string `json:"sponsorType"` // "potential" or "company"
	SponsorID   int    `json:"sponsorId"`
	Description string `json:"description"`
}

var db *sql.DB

func main() {
	initDB()
	defer db.Close()

	router := mux.NewRouter()

	// Endpoints
	router.HandleFunc("/api/potential_sponsors", getPotentialSponsors).Methods("GET")
	router.HandleFunc("/api/potential_sponsors", createPotentialSponsor).Methods("POST")

	router.HandleFunc("/api/companies", getCompanies).Methods("GET")
	router.HandleFunc("/api/companies", createCompany).Methods("POST")

	router.HandleFunc("/api/events", getEvents).Methods("GET")
	router.HandleFunc("/api/events", createEvent).Methods("POST")

	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "sponsors_events.db")
	if err != nil {
		log.Fatal(err)
	}

	sqlStmt := `CREATE TABLE IF NOT EXISTS PotentialSponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contactPerson TEXT NOT NULL,
    email TEXT NOT NULL,
    phone INTEGER,
    sponsorshipArea TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    website TEXT
);

CREATE TABLE IF NOT EXISTS Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    sponsorType TEXT NOT NULL,
    sponsorId INTEGER NOT NULL,
    description TEXT
);
`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatalf("Error creating tables: %v", err)
	}
}

// Handlers...

func getPotentialSponsors(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, contactPerson, email, phone, sponsorshipArea FROM PotentialSponsors")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var sponsors []PotentialSponsor
	for rows.Next() {
		var s PotentialSponsor
		var phoneInt sql.NullInt64
		if err := rows.Scan(&s.ID, &s.Name, &s.ContactPerson, &s.Email, &phoneInt, &s.SponsorArea); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Convert sql.NullInt64 to int32 (handle NULL)
		if phoneInt.Valid {
			s.Phone = int32(phoneInt.Int64)
		}
		sponsors = append(sponsors, s)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sponsors)
}

func createPotentialSponsor(w http.ResponseWriter, r *http.Request) {
	var s PotentialSponsor
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.Exec(
		"INSERT INTO PotentialSponsors (name, contactPerson, email, phone, sponsorshipArea) VALUES (?, ?, ?, ?, ?)",
		s.Name, s.ContactPerson, s.Email, s.Phone, s.SponsorArea,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	lastID, _ := res.LastInsertId()
	s.ID = int(lastID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func getCompanies(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, website FROM Companies")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var companies []Company
	for rows.Next() {
		var c Company
		if err := rows.Scan(&c.ID, &c.Name, &c.Website); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		companies = append(companies, c)
	}
	json.NewEncoder(w).Encode(companies)
}

func createCompany(w http.ResponseWriter, r *http.Request) {
	var c Company
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	res, err := db.Exec("INSERT INTO Companies (name, website) VALUES (?, ?)", c.Name, c.Website)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	lastID, _ := res.LastInsertId()
	c.ID = int(lastID)
	json.NewEncoder(w).Encode(c)
}

func getEvents(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, title, start, end, sponsorType, sponsorId, description FROM Events")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var e Event
		if err := rows.Scan(&e.ID, &e.Title, &e.Start, &e.End, &e.SponsorType, &e.SponsorID, &e.Description); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		events = append(events, e)
	}
	json.NewEncoder(w).Encode(events)
}

func createEvent(w http.ResponseWriter, r *http.Request) {
	var e Event
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if e.SponsorType != "potential" && e.SponsorType != "company" {
		http.Error(w, "SponsorType must be 'potential' or 'company'", http.StatusBadRequest)
		return
	}

	res, err := db.Exec("INSERT INTO Events (title, start, end, sponsorType, sponsorId, description) VALUES (?, ?, ?, ?, ?, ?)",
		e.Title, e.Start, e.End, e.SponsorType, e.SponsorID, e.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	lastID, _ := res.LastInsertId()
	e.ID = int(lastID)
	json.NewEncoder(w).Encode(e)
}
