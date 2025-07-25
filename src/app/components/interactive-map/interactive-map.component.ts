import { AfterViewInit, Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import {DatePipe, isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import { Event } from '../../api.service';
import {LeafletService} from '../../leaflet.service';

interface AgendaEvent {
  id: number | undefined;
  title: string;
  start: Date;
  end: Date;
  sponsorType: 'potential' | 'company';
  sponsorId: number;
  description: string;
  company: string;
}

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./interactive-map.component.css'] // corrected property name
})
export class InteractiveMapComponent implements OnInit, AfterViewInit {
  @Input() backendEvents: Event[] = [];

  // Leaflet reference and map instance
  private L: any = null;
  private map: any = null;

  private colorsByDay: { [key: string]: string } = {
    'Thursday': '#FF5733',  // red-orange
    'Friday': '#33FF57',    // green
    'Saturday': '#3357FF',  // blue
    'Sunday': '#FF33A8',    // pink
  };

  private routesByDay: { [day: string]: [number, number][] } = {
    "Thursday": [
      [48.4950, 13.2220],    // Bad Griesbach Therme
      [48.4950, 13.2200],    // Golf und Therme 1 & 2 (near Bad Griesbach)
      [48.5664, 13.4319],    // Servicepark Passau
    ],
    "Friday": [
      [48.5664, 13.4319],    // Servicepark Passau
      [48.6000, 13.5000],    // Stage 3 - Granit und Wald 1 (GER)
      [48.8000, 13.2500],    // Stage 4 - Böhmerwald 1 (AUT)
      [48.8122, 14.3149],    // Stage 5 - Col de Jan 1 (CZE)
      [48.8100, 14.3150],    // Passage and regrouping, Český Krumlov
      [48.8100, 14.3150],    // Remote Service near Český Krumlov
      [48.8150, 14.3200],    // Stage 6 - Col de Jan 2 (CZE)
      [48.7900, 13.2700],    // Stage 7 - Böhmerwald 2 (AUT)
      [48.6100, 13.5100],    // Stage 8 - Granit und Wald 2 (GER)
      [48.5664, 13.4319],    // Servicepark Passau (again)
    ],
    "Saturday": [
      [48.5664, 13.4319],    // Servicepark Passau
      [48.5700, 13.4600],    // Stage 9 – Made in FRG 1 (GER)
      [49.4000, 13.2950],    // Stage 10 – Keply 1 (CZE)
      [49.3958, 13.2958],    // Stage 11 – Klatovy 1 (CZE)
      [49.3958, 13.2958],    // Regrouping and Tyre Fitting Zone Klatovy
      [49.4050, 13.3000],    // Stage 12 – Keply 2 (CZE)
      [49.4000, 13.2950],    // Stage 13 – Klatovy 2 (CZE)
      [48.6335, 13.4918],    // Passage Control Freyung town square (GER)
      [48.5700, 13.4600],    // Stage 14 – Made in FRG 2 (GER)
      [48.5664, 13.4319],    // Servicepark Passau (again)
    ],
    "Sunday": [
      [48.5664, 13.4319],    // Servicepark Passau
      [48.6160, 13.7000],    // Stage 15 – Beyond Borders 1 (GER/AUT)
      [48.6100, 13.6900],    // Regrouping Rohrbach (AUT)
      [48.6050, 13.7000],    // Stage 16 – Mühltal 1 (AUT)
      [48.6150, 13.6950],    // Stage 17 – Beyond Borders 2 (GER/AUT)
      [48.6100, 13.6900],    // Regrouping Rohrbach (AUT)
      [48.6050, 13.7000],    // Stage 18 – Wolf Power Stage Mühltal 2 + Flower Ceremony
      [48.5664, 13.4319],    // Final Podium, Servicepark Passau
    ],
  };
  poi = [
    { lat: 48.4950, lng: 13.2220, label: "Start: Bad Griesbach Therme" },
    { lat: 48.5664, lng: 13.4319, label: "Servicepark Passau" },
    { lat: 48.8100, lng: 14.3150, label: "Český Krumlov (UNESCO)" },
    { lat: 49.3958, lng: 13.2958, label: "Klatovy Town Centre" },
    { lat: 48.6100, lng: 13.6900, label: "Regrouping Rohrbach" },
    { lat: 48.6050, lng: 13.7000, label: "Mühltal Stage/Finish" },
  ];

  markers: any[] = [];
  agendaEvents: AgendaEvent[] = [];

  agendaDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'];


  private currentRoutePolyline: any = null;
  selectedDay: string | null = null;

  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { this.isBrowser = isPlatformBrowser(this.platformId);}

  ngOnInit() {
    this.mapBackendEventsToAgenda(this.backendEvents);
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) {
      // Do not run Leaflet code on the server
      return;
    }
    const leafletModule = await import('leaflet');
    this.L = leafletModule;

    const customIcon = this.L.icon({
      iconUrl: 'assets/icon.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -2]
    })

    // Fix default icon paths for Angular build
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = this.L.map('map').setView([48.566, 13.411], 7);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    for (const [day, latlngs] of Object.entries(this.routesByDay)) {
      const color = this.colorsByDay[day]// fallback black
      const polyline = this.L.polyline(latlngs, { color, weight: 5, opacity: 0.7 });
      polyline.addTo(this.map);

      // Optionally fit map bounds to all routes
      this.map.fitBounds(polyline.getBounds());
    }

    this.poi.forEach(point => {
      this.L.marker([point.lat, point.lng], {icon: customIcon})
        .addTo(this.map)
        .bindPopup(point.label);
    });

    this.agendaEvents.forEach(event => {
      if (event.start && event.end) {
        if ((event as any).lat && (event as any).lng) {
          const marker = this.L.marker([(event as any).lat, (event as any).lng]).addTo(this.map);
          marker.bindPopup(event.title);
          this.markers.push(marker);
        }
      }
    });
  }

  ngOnChanges() {
    this.mapBackendEventsToAgenda(this.backendEvents);
  }

  stagesByDay: { [day: string]: { name: string; location: string; lat: number; lng: number }[] } = {
    Thursday: [
      { name: 'Shakedown Bad Griesbach', location: 'Bad Griesbach', lat: 48.4950, lng: 13.2220 },
      { name: 'Start – Bad Griesbach Therme', location: 'Bad Griesbach', lat: 48.4950, lng: 13.2200 },
      { name: 'Stage 1 – Golf und Therme 1', location: 'GER', lat: 48.5664, lng: 13.4319 },
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },             // from your existing route
      { name: 'Stage 2 – Golf und Therme 2', location: 'GER', lat: 48.4950, lng: 13.2190 },       // very close to Golf und Therme 1
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319}
    ],
    Friday: [
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },
      { name: 'Stage 3 – Granit und Wald 1', location: 'GER', lat: 48.6000, lng: 13.5000 },
      { name: 'Stage 4 – Böhmerwald 1', location: 'AUT', lat: 48.8000, lng: 13.2500 },
      { name: 'Stage 5 – Col de Jan 1', location: 'CZE', lat: 48.8122, lng: 14.3149 },
      { name: 'Passage and regrouping – Český Krumlov (UNESCO)', location: 'CZE', lat: 48.8100, lng: 14.3150 },
      { name: 'Remote Service near Český Krumlov', location: 'CZE', lat: 48.8100, lng: 14.3150 },
      { name: 'Stage 6 – Col de Jan 2', location: 'CZE', lat: 48.8150, lng: 14.3200 },
      { name: 'Stage 7 – Böhmerwald 2', location: 'AUT', lat: 48.7900, lng: 13.2700 },
      { name: 'Stage 8 – Granit und Wald 2', location: 'GER', lat: 48.6100, lng: 13.5100 },
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },
    ],
    Saturday: [
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },
      { name: 'Stage 9 – Made in FRG 1', location: 'GER', lat: 48.5700, lng: 13.4600 },
      { name: 'Stage 10 – Keply 1', location: 'CZE', lat: 49.4000, lng: 13.2950 },
      { name: 'Stage 11 – Klatovy 1', location: 'CZE', lat: 49.3958, lng: 13.2958 },
      { name: 'Regrouping and Tyre Fitting Zone', location: 'Klatovy', lat: 49.3958, lng: 13.2958 },
      { name: 'Stage 12 – Keply 2', location: 'CZE', lat: 49.4050, lng: 13.3000 },
      { name: 'Stage 13 – Klatovy 2', location: 'CZE', lat: 49.4000, lng: 13.2950 },
      { name: 'Passage Control Freyung Town Square', location: 'GER', lat: 48.6335, lng: 13.4918 },
      { name: 'Stage 14 – Made in FRG 2', location: 'GER', lat: 48.5700, lng: 13.4600 },
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },
    ],
    Sunday: [
      { name: 'Servicepark Passau', location: 'Passau', lat: 48.5664, lng: 13.4319 },
      { name: 'Stage 15 – Beyond Borders 1', location: 'GER/AUT', lat: 48.6160, lng: 13.7000 },
      { name: 'Regrouping Rohrbach', location: 'AUT', lat: 48.6100, lng: 13.6900 },
      { name: 'Stage 16 – Mühltal 1', location: 'AUT', lat: 48.6050, lng: 13.7000 },
      { name: 'Stage 17 – Beyond Borders 2', location: 'GER/AUT', lat: 48.6150, lng: 13.6950 },
      { name: 'Regrouping Rohrbach and Tyre Fitting Zone', location: 'AUT', lat: 48.6100, lng: 13.6900 },
      { name: 'Stage 18 – Wolf Power Stage Mühltal 2 with Flower Ceremony', location: 'AUT', lat: 48.6050, lng: 13.7000 },
      { name: 'Final Podium', location: 'Servicepark Passau', lat: 48.5664, lng: 13.4319 },
    ],
  };


  private mapBackendEventsToAgenda(events: Event[]) {
    this.agendaEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      start: new Date(e.start),
      end: new Date(e.end),
      sponsorType: e.sponsorType,
      sponsorId: e.sponsorId,
      description: e.description,
      company: e.company
    }));
  }
  public panToStage(stage: { lat: number; lng: number }) {
    console.log('panToStage called with:', stage);

    if (!this.map || !stage.lat || !stage.lng) {
      return;
    }

    // Use Leaflet's setView with animation to pan and zoom
    this.map.setView([stage.lat, stage.lng], 13, { animate: true });
  }

  selectDay(day: string) {
    if (this.selectedDay === day) {
      this.selectedDay = null;  // close/hide stages for that day
    } else {
      this.selectedDay = day;   // show stages for this day
    }

    // Remove previous route polyline from the map if any
    if (this.currentRoutePolyline) {
      this.map.removeLayer(this.currentRoutePolyline);
      this.currentRoutePolyline = null;
    }

    // Draw the new day's route
    const latlngs = this.routesByDay[day];
    if (latlngs && latlngs.length > 0) {
      const color = this.colorsByDay[day] || '#000000';
      this.currentRoutePolyline = this.L.polyline(latlngs, { color, weight: 5, opacity: 0.7 }).addTo(this.map);
      this.map.fitBounds(this.currentRoutePolyline.getBounds());
    }
  }
}
