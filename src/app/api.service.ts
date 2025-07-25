import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import { map } from 'rxjs/operators';


export interface PotentialSponsor {
  id?: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: number;
  sponsorshipArea: string;
}

export interface Company {
  id?: number;
  name: string;
  website: string;
}

export interface Event {
  id?: number;
  title: string;
  start: string;
  end: string;
  sponsorType: 'potential' | 'company';
  company: string;
  sponsorId: number;
  description: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080/api';  // Adjust depending on your backend URL

  constructor(private http: HttpClient) { }

  // Potential Sponsors
  getPotentialSponsors(): Observable<PotentialSponsor[]> {
    return this.http.get<PotentialSponsor[]>(`${this.baseUrl}/potential_sponsors`);
  }

  createPotentialSponsor(potentialSponsor: PotentialSponsor): Observable<PotentialSponsor> {
    return this.http.post<PotentialSponsor>(`${this.baseUrl}/potential_sponsors`, potentialSponsor);
  }

  createPotentialSponsorFormData(formData: FormData): Observable<PotentialSponsor> {
    return this.http.post<PotentialSponsor>(`${this.baseUrl}/potential_sponsors`, formData);
  }

  // Send Email
  sendEmail(emailPayload: EmailPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/send-email`, emailPayload);
  }

  // Companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, company);
  }

  // Events
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.baseUrl}/events`, event);
  }

  getCalendarEvents(): Observable<CalendarEvent[]> {
    return this.getEvents()
      .pipe(
        map(events => events.map(e => this.mapEventToCalendarEvent(e)))
      );
  }

  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/events/${eventId}`);
  }

  mapEventToCalendarEvent(event: Event): CalendarEvent {
    return {
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : undefined,
      title: event.title,
      color: this.getColorForSponsorType(event.sponsorType),
      allDay: false,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      meta: {
        sponsorType: event.sponsorType,
        sponsorId: event.sponsorId,
        description: event.description,
        eventId: event.id,
        company: event.company,
      },
    };
  }

  getColorForSponsorType(sponsorType: 'potential' | 'company') {
    if (sponsorType === 'potential') {
      return { primary: '#f39c12', secondary: '#f9e79f' }; // orange-ish
    } else {
      return { primary: '#27ae60', secondary: '#abebc6' }; // green-ish
    }
  }


}
