import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'frontend';

  @ViewChild('pagesContainer', { static: true }) pagesContainer!: ElementRef;

  currentPage = 0;
  isCalendarExpanded = false;
  selectedEvent: any = null;
  filterDropdownOpen = false;
  selectedFilter = 'All';

  // Form data
  formData = {
    name: '',
    email: '',
    company: '',
    message: '',
  };

  // Sample events for calendar
  events = [
    {
      id: 1,
      date: '2025-07-25',
      title: 'Opening Ceremony',
      description: 'Welcome to Digikollege 2025',
      time: '09:00',
    },
    {
      id: 2,
      date: '2025-07-26',
      title: 'Tech Workshop',
      description: 'Advanced automotive technologies',
      time: '14:00',
    },
    {
      id: 3,
      date: '2025-07-27',
      title: 'Networking Event',
      description: 'Connect with industry leaders',
      time: '18:00',
    },
  ];

  // Sample sponsors data
  sponsors = {
    food: [
      { name: 'Restaurant A', logo: '', website: 'https://example.com' },
      { name: 'Catering B', logo: '', website: 'https://example.com' },
    ],
    drinks: [
      { name: 'Brewery C', logo: '', website: 'https://example.com' },
      { name: 'Beverage D', logo: '', website: 'https://example.com' },
    ],
    entertainment: [
      { name: 'Event Company E', logo: '', website: 'https://example.com' },
      { name: 'Music Group F', logo: '', website: 'https://example.com' },
    ],
  };

  filteredSponsors: any[] = [];

  ngOnInit() {
    this.updateFilteredSponsors();
    // Add scroll listener for painted transitions (only in browser)
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
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

  toggleFilterDropdown() {
    this.filterDropdownOpen = !this.filterDropdownOpen;
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.filterDropdownOpen = false;
    this.updateFilteredSponsors();
  }

  updateFilteredSponsors() {
    if (this.selectedFilter === 'All') {
      this.filteredSponsors = [
        ...this.sponsors.food,
        ...this.sponsors.drinks,
        ...this.sponsors.entertainment,
      ];
    } else {
      const category = this.selectedFilter.toLowerCase();
      this.filteredSponsors = (this.sponsors as any)[category] || [];
    }
  }

  submitForm() {
    console.log('Form submitted:', this.formData);
    // Add form submission logic here
    alert('Thank you for your submission!');
  }
}
