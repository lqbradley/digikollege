import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PotentialSponsor, Company, Event, ApiService } from './api.service';
import {CalendarComponent} from './components/event-calendar/event-calendar.component';
import {
  CalendarA11y,
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  CalendarUtils,
  DateAdapter
} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {InteractiveMapComponent} from './components/interactive-map/interactive-map.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CalendarComponent,
    CalendarComponent, InteractiveMapComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarDateFormatter,
    CalendarUtils,
    CalendarA11y,
    CalendarEventTitleFormatter
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'frontend';

  events: Event[] = []
  companies: Company[] = []

  constructor(private apiService: ApiService) {}

  @ViewChild('pagesContainer', { static: true }) pagesContainer!: ElementRef;

  currentPage = 0;
  isCalendarExpanded = false;
  selectedEvent: any = null;
  filterDropdownOpen = false;
  selectedFilter = 'All';

  // Form data
  sponsorData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    sponsorshipArea: '',
    message: '',
  };

  sponsorshipAreas = [
    { id: 1, name: "Food" },
    { id: 2, name: "Beverage" },
    { id: 3, name: "Energy" },
    { id: 4, name: "Entertainment" },
    { id: 5, name: "Region" },
    { id: 6, name: "Hospitality" },
    { id: 7, name: "Automotive" },
    { id: 8, name: "Inspection" },
    { id: 9, name: "Media" },
    { id: 10, name: "Other" },
  ]

  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: data => this.events = data,
      error: err => console.error('Error loading events', err)
    });
  }

  loadCompanies() {
    this.apiService.getCompanies().subscribe({
      next: data => this.companies = data,
      error: err => console.error('Error loading companies', err)
    });
  }
  // Sample sponsors data
  sponsors = [
      {
        name: 'ADAC',
        logo: 'assets/ADAC Logo(1).png',
        website: 'https://www.adac.de/der-adac/regionalclubs/suedbayern/',
        category: 'Organizer'
      },
      {
        name: 'Autoklub České republiky (AČR)',
        logo: 'assets/Autoklub Logo.png',
        website: 'https://www.autoklub.cz',
        category: 'Organizer'
      },
      {
        name: 'Österreichischer Automobil-, Motorrad- und Touring Club (ÖAMTC)',
        logo: 'assets/OAMTC Logo.png',
        website: 'https://www.oeamtc.at',
        category: 'Organizer'
      },
      {
        name: 'DEKRA',
        logo: 'assets/Dekra Logo.png',
        website: 'https://www.dekra.com',
        category: 'Inspection'
      },
      {
        name: 'Národní sportovní agentura',
        logo: 'assets/Narodni Sportovni Agentura.png',
        website: 'https://agenturasport.cz/',
        category: 'Media'
      },
      {
        name: 'Emotive',
        logo: 'assets/Optimal Logo.png',
        website: 'https://emotive.group/products/optimal/drive-train',
        category: 'Automotive'
      },
      {
        name: 'Scavi and Ray',
        logo: 'assets/SCAVI & RAY - Logo.png',
        website: 'https://www.scavi-ray.com/en/',
        category: 'Beverage'
      },
      {
        name: 'SafeNow',
        logo: 'assets/image0.png',
        website: 'https://en.safenow.app/',
        category: 'Other'
      },
      {
        name: 'Eibach',
        logo: 'assets/Eibach.png',
        website: 'https://eibach24.cz/',
        category: 'Automotive'
      },
      {
        name: 'MaierKorduletsch',
        logo: 'assets/Maier.png',
        website: 'https://www.maierkorduletsch.de',
        category: 'Energy'
      },
      {
        name: 'ADAC Fahrzeugwelt',
        logo: 'assets/ADAC Fehr Logo.png',
        website: 'https://www.adac.de/fahrzeugwelt/auto/?redirectId=quer.auto.deals',
        category: 'Automotive'
      },
      {
        name: 'Bas Griesbach',
        logo: 'assets/Bad Griesbach Logo.png',
        website: 'https://www.bad-griesbach.de/',
        category: 'Region'
      },
      {
        name: 'Landkreis Passau',
        logo: 'assets/Landkreis Passau Logo.png',
        website: 'https://www.landkreis-passau.de/',
        category: 'Region'
      },
      {
        name: 'Jihocesky kraj',
        logo: 'assets/Jihocesky Kraj Logo.png',
        website: 'https://kraj-jihocesky.cz/',
        category: 'Region'
      },
      {
        name: 'Prague',
        logo: 'assets/Praha Logo.png',
        website: 'https://www.praha.eu/jnp/',
        category: 'Region'
      }, {
        name: 'FRG',
        logo: 'assets/made-in-frg Logo.png',
        website: 'https://www.mehralsduerwartest.de/',
        category: 'Region'
      }, {
        name: 'Passau',
        logo: 'assets/Passau.png',
        website: 'https://tourism.passau.de/',
        category: 'Region'
      }, {
        name: 'Plzensky Kraj',
        logo: 'assets/Plzensky Kraj.png',
        website: 'https://www.plzensky-kraj.cz/',
        category: 'Region'
      },
      {
        name: 'Klatovy',
        logo: 'assets/Klatovy Logo NEW.png',
        website: 'https://www.klatovy.cz/klatovy/',
        category: 'Region'
      },
      {
        name: 'Muehlviertel',
        logo: 'assets/Muhlviertel Logo.png',
        website: 'https://www.muehlviertel.at/en/',
        category: 'Region'
      },
      {
        name: 'Donau',
        logo: 'assets/Donau Logo.png',
        website: 'https://www.donauregion.at/',
        category: 'Region'
      },
      {
        name: 'Kaplice',
        logo: 'assets/Kaplice.png',
        website: 'https://www.mestokaplice.cz/',
        category: 'Region'
      },
      {
        name: 'Kronen Zeitung',
        logo: 'assets/Kronen Zeitung Logo Web.png',
        website: 'http://www.krone.at/ooe',
        category: 'Media'
      },
      {
        name: 'wWRC',
        logo: 'assets/wWRC logo.png',
        website: 'https://www.ewrc.cz/',
        category: 'Media'
      },
      {
        name: 'denik.cz',
        logo: 'assets/Dennik Logo.png',
        website: 'https://www.denik.cz/',
        category: 'Media'
      },
      {
        name: 'NiederbayernTV',
        logo: 'assets/NiederbayernTV Logo.png',
        website: 'https://www.niederbayerntv.de/',
        category: 'Media'
      },
      {
        name: 'JCDecaux',
        logo: 'assets/JCDecaux Logo.png',
        website: 'https://www.jcdecaux.cz/',
        category: 'Media'
      },
      {
        name: 'IMPULS',
        logo: 'assets/Impuls Radio Logo.png',
        website: 'https://www.impuls.cz/',
        category: 'Media'
      },
      {
        name: 'Passauer Neue Presse',
        logo: 'assets/Passauer Presse Logo.png',
        website: 'https://www.pnp.de/',
        category: 'Media'
      },
      {
        name: 'Unser Radio',
        logo: 'assets/Unser Radio Logo.png',
        website: 'https://www.unserradio.de/',
        category: 'Media'
      },
      {
        name: 'LT1',
        logo: 'assets/LT1 Logo Web.png',
        website: 'http://www.lt1.at/',
        category: 'Media'
      },
      {
        name: 'Vollgas',
        logo: 'assets/VollGas_Web Logo.png',
        website: 'http://www.rally-more.at/',
        category: 'Media'
      },
      {
        name: 'Life Radio',
        logo: 'assets/Logo_Life_Radio_.png',
        website: 'https://www.liferadio.at/',
        category: 'Media'
      },
      {
        name: 'Nova Action',
        logo: 'assets/Nova Action.png',
        website: 'https://tv.nova.cz/action',
        category: 'Media'
      },
      {
        name: 'Hankook',
        logo: 'assets/hankook-tires-seeklogo.png',
        website: 'https://www.hankooktire.com/',
        category: 'Automotive'
      },
      {
        name: 'Wolf Lubricants',
        logo: 'assets/wolf-lubricants-seeklogo.png',
        website: 'https://www.wolflubes.com/',
        category: 'Automotive'
      },
      {
        name: 'Asahi Kasei',
        logo: 'assets/asahi-kasei-corporation-seeklogo.png',
        website: 'https://www.asahi-kasei.com/',
        category: 'Automotive'
      },
      {
        name: 'EA Sports',
        logo: 'assets/ea-sports-seeklogo.png',
        website: 'https://www.ea.com/sports',
        category: 'Media'
      },
      {
        name: 'FORUM8',
        logo: 'assets/forum-seeklogo.png',
        website: 'https://www.forum8.com/',
        category: 'Media'
      },
      {
        name: 'Castore',
        logo: 'assets/Castore_vector_logo.png',
        website: 'https://castore.com/',
        category: 'Other'
      },
      {
        name: 'ProGrade Digital',
        logo: 'assets/ProGrade Digital_logo_black.jpg',
        website: 'https://progradedigital.com/',
        category: 'Other'
      },
      {
        name: 'SafetyCulture',
        logo: 'assets/safetyculture-seeklogo.png',
        website: 'https://safetyculture.com/',
        category: 'Other'
      },
      {
        name: 'Tata Communications',
        logo: 'assets/tata-seeklogo.png',
        website: 'https://www.tatacommunications.com/',
        category: 'Media'
      }
  ]



  filteredSponsors: any[] = [];

  ngOnInit() {
    this.applyFilters();
    // Add scroll listener for painted transitions (only in browser)
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    this.loadEvents();
    this.loadCompanies();
  }

  scrollToPage(pageIndex: number) {
    const pageElement = document.getElementById(`page-${pageIndex}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth' });
      this.currentPage = pageIndex;
    }
  }

  handleScroll() {
    // Handle painted transition effects
    if (typeof window !== 'undefined') {
      const scrollY = window.scrollY;
      const pageHeight = window.innerHeight;
      this.currentPage = Math.round(scrollY / pageHeight);
    }
  }

  toggleCalendar() {
    this.isCalendarExpanded = !this.isCalendarExpanded;
    this.selectedEvent = null;
  }

  selectEvent(event: any) {
    this.selectedEvent = event;
  }

  filters: string[] = [
    'All',
    'Food',
    'Beverage',
    'Energy',
    'Entertainment',
    'Region',
    'Hospitality',
    'Automotive',
    'Inspection',
    'Media',
    'Other'
  ];

  selectedFilters: string[] = ['All'];  // start with 'All' selected

  toggleFilter(filter: string) {
    if (filter === 'All') {
      // Selecting 'All' clears other selections
      this.selectedFilters = ['All'];
    } else {
      // Remove 'All' if any other filter is selected
      this.selectedFilters = this.selectedFilters.filter(f => f !== 'All');

      const index = this.selectedFilters.indexOf(filter);
      if (index === -1) {
        this.selectedFilters.push(filter);
      } else {
        this.selectedFilters.splice(index, 1);
      }

      // If none selected, revert to 'All'
      if (this.selectedFilters.length === 0) {
        this.selectedFilters = ['All'];
      }
    }

    this.applyFilters();
  }

  applyFilters() {
    if (this.selectedFilters.includes('All')) {
      this.filteredSponsors = this.sponsors;
    } else {
      this.filteredSponsors = this.sponsors.filter(sponsor =>
        this.selectedFilters.includes(sponsor.category)
      );
    }
  }


  submitForm() {
    const formData = new FormData();
    formData.append('name', this.sponsorData.company);
    formData.append('contactPerson', this.sponsorData.firstName + this.sponsorData.lastName);
    formData.append('email', this.sponsorData.email);
    formData.append('phone', this.sponsorData.phone); // Keep as string (FormData stores strings)
    formData.append('sponsorshipArea', this.sponsorData.sponsorshipArea);

    this.apiService.createPotentialSponsorFormData(formData).subscribe({
      next: (res) => {
        console.log('Potential sponsor created:', res);
        // After successful POST, send email
        this.sendEmail(res.email, res.name);
      },
      error: (err) => console.error('Error creating potential sponsor', err)
    });

    //reset
    this.sponsorData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      sponsorshipArea: '',
      message: '',
    };
  }

  sendEmail(email: string, name: string) {
    // Use your backend to send email
    // You may have a dedicated email endpoint to POST like:
    // { to: email, subject: '', body: '' }
    const emailPayload = {
      to: email,
      subject: `Thank you for your interest, ${name}`,
      body: `Dear ${name},\n\nThank you for your interest in sponsoring us. We will contact you shortly.\n\nBest regards,\nTeam`
    };

    this.apiService.sendEmail(emailPayload).subscribe({
      next: () => console.log('Email sent successfully'),
      error: (err) => console.error('Error sending email', err)
    });
  }
}
