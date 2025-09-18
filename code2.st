import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/Motor_leasing/auth.service';
import { SelectedCoverageComponent } from '../selected-coverage/selected-coverage.component';
import { CoverageFilterComponent } from '../coverage-filter/coverage-filter.component';
import { InsuranceCardComponent } from '../insurance-card/insurance-card.component';
import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';
import { IndividualVehicleDetailsComponent } from '../individual-vehicle-details/individual-vehicle-details.component';
import { OnlyNumbersDirective } from '../../../../core/directives/only-numbers.directive';
import { Router } from '@angular/router';

export interface Coverage {
  id: string;
  name: string;
  icon?: string;
  price?: number;
  color?: string;
}

@Component({
  selector: 'app-main-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectedCoverageComponent,
    CoverageFilterComponent,
    InsuranceCardComponent,
    PaymentConfirmationComponent,
    IndividualVehicleDetailsComponent,
    OnlyNumbersDirective
  ],
  templateUrl: './main-home.component.html',
  styleUrls: ['./main-home.component.css']
})
export class MainHomeComponent implements OnInit {
  isLoggedIn = false;
  showLoginModal = false;
  currentStep: number = 0;
  isAnimating = false;
  insuranceType: string = 'new';
  cardType: string = 'sequence';
  idNumber = '';
  birthDate = '';
  sequenceNumber = '';
  customNumber = '';
  modelYear: number | null = null;
  agreed = false;
  years: number[] = [];
  form: FormGroup;
  sortOrder: 'asc' | 'desc' | '' = '';
  selectedRegions: string[] = [];
  showAllRegions = false;
  selectedInsuranceType = 'Comprehensive';

  steps = [
    { id: 1, title: 'Basic Info', description: 'Personal details', icon: 'fas fa-user' },
    { id: 2, title: 'Vehicle', description: 'Car information', icon: 'fas fa-car' },
    { id: 3, title: 'Plans', description: 'Insurance options', icon: 'fas fa-shield-halved' },
    { id: 4, title: 'Add-ons', description: 'Extra coverage', icon: 'fas fa-plus-circle' },
    { id: 5, title: 'Payment', description: 'Complete purchase', icon: 'fas fa-credit-card' }
  ];

  geographicCoverages = [
    { country: 'Bahrain', flag: '🇧🇭', duration: '12 Months', price: 150 },
    { country: 'Jordan', flag: '🇯🇴', duration: '12 Months', price: 180 },
    { country: 'Qatar', flag: '🇶🇦', duration: '12 Months', price: 170 },
    { country: 'Oman', flag: '🇴🇲', duration: '12 Months', price: 160 }
  ];

  insuranceOffers = []; // populate your offers

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      purpose: [''],
      registrationType: [''],
      idNumber: [''],
      birthMonth: [''],
      birthYear: [''],
      customCard: [''],
      modelYear: [''],
      sequenceNumber: [''],
    });

    this.modelYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    const endYear = new Date().getFullYear() + 1;
    for (let y = 1990; y <= endYear; y++) this.years.push(y);
  }

  isCurrentStepValid(): boolean {
    if (!this.agreed) return false;

    const isValidLength = (value: string) => !!value && value.length === 10 && /^[0-9]+$/.test(value);
    const isValidYear = (year: number | null) => year !== null && year >= 1990 && year <= new Date().getFullYear();
    const isValidBirthDate = () => {
      if (!this.birthDate) return false;
      const birth = new Date(this.birthDate);
      return birth >= new Date('1945-01-01') && birth <= new Date('2010-12-31');
    };

    if (this.insuranceType === 'new' && this.cardType === 'sequence')
      return isValidLength(this.idNumber) && isValidLength(this.sequenceNumber);

    if (this.insuranceType === 'new' && this.cardType === 'custom')
      return isValidLength(this.idNumber) && isValidLength(this.customNumber) && isValidYear(this.modelYear) && isValidBirthDate();

    if (this.insuranceType === 'transfer' && this.cardType === 'sequence')
      return isValidLength(this.idNumber) && isValidLength(this.sequenceNumber) && isValidYear(this.modelYear) && isValidBirthDate();

    return false;
  }

  // 🔹 Prevent skipping steps forward
  handleStepClick(index: number) {
    const user = this.authService.getUser();
    if (!user) {
      this.showLoginModal = true;
      return;
    }

    // Block forward jump
    if (index > this.currentStep) return;

    this.isAnimating = true;
    this.currentStep = index;
    setTimeout(() => (this.isAnimating = false), 300);
  }

  goToPreviousStep() {
    this.handleStepClick(Math.max(0, this.currentStep - 1));
  }

  goToNextStep() {
    if (!this.isCurrentStepValid()) return;
    const user = this.authService.getUser();
    if (user) this.handleStepClick(Math.min(this.steps.length - 1, this.currentStep + 1));
    else this.showLoginModal = true;
  }

  onToggleRegion(country: string) {
    const idx = this.selectedRegions.indexOf(country);
    if (idx >= 0) this.selectedRegions.splice(idx, 1);
    else this.selectedRegions.push(country);
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  get filteredInsuranceOffers() {
    let filtered = this.insuranceOffers.filter(
      offer => offer.type === this.selectedInsuranceType
    );

    if (this.sortOrder === 'asc') filtered = filtered.sort((a, b) => a.price - b.price);
    else if (this.sortOrder === 'desc') filtered = filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }
}
