import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectedCoverageComponent, CoverageFilterComponent, InsuranceCardComponent, PaymentConfirmationComponent, IndividualVehicleDetailsComponent,OnlyNumbersDirective],
  templateUrl: './main-home.component.html',
  styleUrl: './main-home.component.css'
})
export class MainHomeComponent implements OnInit {
  isLoggedIn = false;
  showLoginModal = true;
  currentStep: number = 0;
  isAnimating = false;
  IsLogin = false
  insuranceType: string = 'new';
  cardType: string = 'sequence';
  idNumber = '';
  birthDate = '';
  sequenceNumber = '';
  customNumber = '';
  modelYear: number | null = null;
  agreed = false;
  maxAllowedBirthDate = '';
  years: number[] = [];
  form: FormGroup;
  sortOrder: 'asc' | 'desc' | '' = '';
  selectedRegions: string[] = [];
  showAllRegions = false;
  isHidden = true;
  insuranceTypes = ['Comprehensive', 'TPL', 'Economy'];
  selectedInsuranceType = 'Comprehensive';
  isNextClick = false;
  checkValue = false;

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router) {
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

    const currentYear = new Date().getFullYear();
    this.modelYear = currentYear;
  }

  ngOnInit(): void {
    this.authService.lesseLoginStatus$.subscribe(isLoggedIn => {
      if (isLoggedIn && this.isNextClick) {
        this.goToNextStep();
      }
    });
    const endYear = new Date().getFullYear() + 1;
    for (let y = 1990; y <= endYear; y++) {
      this.years.push(y);
    }
    this.saveCurrentRoute()
  }


checkInvalidCombination(): void {
  if (this.insuranceType === 'transfer' && this.cardType === 'custom' && this.checkValue) {
    this.insuranceType = 'new'; 
    this.cardType = 'custom'; 
    this.checkValue =true 
  }else if (this.insuranceType === 'transfer' &&  this.checkValue) {   
    this.cardType = 'sequence';  
        this.checkValue =false     
  }
}


  onModelYearChange(event: any) {
    const year = new Date(event.target.value).getFullYear();
    if (year >= 1990 && year >= 2025) {
      this.modelYear = year;
    } else {
      this.modelYear = null;
    }
  }

  isCurrentStepValid(): boolean {
    if (!this.agreed) return false;

    const isValidLength = (value: string): boolean => !!value && value.length === 10 && /^[0-9]+$/.test(value); 

    const isValidYear = (year: number | null): boolean => {
      return year !== null && year >= 1990 && year <= new Date().getFullYear();
    };

    const isValidBirthDate = (): boolean => {
      if (!this.birthDate) return false;

      const birth = new Date(this.birthDate);
      const minDate = new Date('1945-01-01');
      const maxDate = new Date('2010-12-31');

      return birth >= minDate && birth <= maxDate;
    }

    if (this.insuranceType === 'new' && this.cardType === 'sequence') {
      return isValidLength(this.idNumber) && isValidLength(this.sequenceNumber);
    }

    if (this.insuranceType === 'new' && this.cardType === 'custom') {
      return (
        isValidLength(this.idNumber) &&
        isValidBirthDate() &&
        isValidLength(this.customNumber) &&
        isValidYear(this.modelYear)
      );
    }

    if (this.insuranceType === 'transfer' && this.cardType === 'sequence') {
      return (
        isValidLength(this.idNumber) &&
        isValidBirthDate() &&
        isValidLength(this.sequenceNumber) &&
        isValidYear(this.modelYear)
      );
    }

    return false;
  }




  steps = [
    { id: 1, title: 'Basic Info', description: 'Personal details', icon: 'fas fa-user' },
    { id: 2, title: 'Vehicle', description: 'Car information', icon: 'fas fa-car' },
    { id: 3, title: 'Plans', description: 'Insurance options', icon: 'fas fa-shield-halved' },
    { id: 4, title: 'Add-ons', description: 'Extra coverage', icon: 'fas fa-plus-circle' },
    { id: 5, title: 'Payment', description: 'Complete purchase', icon: 'fas fa-credit-card' }
  ];


  formData = {
    purposeOfInsurance: 'new',
    registrationType: 'sequence',
    nationalId: '',
    sequenceNumber: '',
    customCard: '',
    modelYear: '',
    newOwnerId: '',
    birthMonth: '',
    birthYear: '',
    dataInquiry: false
  };



  onSubmit(): void{
  }


  handleStepClick(index: number): void {
    if (index > this.currentStep) {
      return;
    }
    const user = this.authService.getUser();

    if (user) {
      this.isAnimating = true;
      this.currentStep = index;
      setTimeout(() => this.isAnimating = false, 300);
    } else {
      this.openLoginModal();
    }

  }

  goToPreviousStep(): void {

    this.handleStepClick(Math.max(0, this.currentStep - 1));
  }

  goToNextStep(): void {
    const user = this.authService.getUser();

    if (user) {
      this.handleStepClick(Math.min(this.steps.length - 1, this.currentStep + 1));
    } else {
      this.openLoginModal();
    }

  }

  geographicCoverages = [
    { country: 'Bahrain', flag: '🇧🇭', duration: '12 Months', price: 150, originalPrice: 200 },
    { country: 'Jordan', flag: '🇯🇴', duration: '12 Months', price: 180, originalPrice: 230 },
    { country: 'Qatar', flag: '🇶🇦', duration: '12 Months', price: 170, originalPrice: 210 },
    { country: 'Oman', flag: '🇴🇲', duration: '12 Months', price: 160, originalPrice: 200 }
  ];


  insuranceOffers = [
    {
      id: 1,
      type: 'Comprehensive',
      provider: 'Arabian Shield',
      logo: 'assets/images/axa-color.jpg',
      price: 4183,
      currency: 'SAR',
      discounts: [
        { type: 'NCD Discount', amount: 297, percentage: 8 },
        { type: 'Loyalty Discount', amount: 240, percentage: 6 }
      ],
      coverages: ['Theft Protection', 'Fire Damage', 'Natural Disasters', 'Flood Coverage'],
      additionalCoverages: ['Water Damage', 'Accidental Damage'],
      deviceTypes: ['mobile', 'tablet', 'laptop'],
      rating: 4.5,
      features: ['24/7 Support', 'Fast Claims', 'Global Service']
    },
    {
      id: 2,
      type: 'Comprehensive',
      provider: 'Tawuniya',
      logo: 'assets/images/tawuniya.png',
      price: 3890,
      currency: 'SAR',
      discounts: [
        { type: 'Online Discount', amount: 200, percentage: 5 },
        { type: 'Bundle Discount', amount: 150, percentage: 4 }
      ],
      coverages: ['Theft Protection', 'Water Damage', 'Accidental Damage'],
      additionalCoverages: ['Power Surge'],
      deviceTypes: ['mobile', 'tablet'],
      rating: 4.2,
      features: ['Mobile App', 'Cashless Repairs', 'Arabic Support']
    },
    {
      id: 3,
      type: 'Comprehensive',
      provider: 'GIG Insurance',
      logo: 'assets/images/gig.png',
      price: 4350,
      currency: 'SAR',
      discounts: [
        { type: 'Seasonal Offer', amount: 350, percentage: 7 },
        { type: 'Referral Discount', amount: 100, percentage: 2 }
      ],
      coverages: ['Fire Damage', 'Power Surge', 'Mechanical Breakdown'],
      additionalCoverages: ['Water Damage'],
      deviceTypes: ['laptop', 'tablet'],
      rating: 4.7,
      features: ['Quick Replacement', 'Extended Warranty', 'Online Claim Portal']
    },
    {
      id: 4,
      type: 'TPL',
      provider: 'Allianz Saudi Fransi',
      logo: 'assets/images/allainz.png',
      price: 4050,
      currency: 'SAR',
      discounts: [
        { type: 'Early Bird Discount', amount: 250, percentage: 6 },
        { type: 'Returning Customer Discount', amount: 180, percentage: 4.5 }
      ],
      coverages: ['Natural Disasters', 'Flood Coverage', 'Theft Protection'],
      additionalCoverages: ['Accidental Damage'],
      deviceTypes: ['mobile', 'laptop'],
      rating: 4.3,
      features: ['Multilingual Support', 'Authorized Service Centers', '24-Hour Claim Tracking']
    },
    {
      id: 5,
      type: 'TPL',
      provider: 'Bupa Arabia',
      logo: 'assets/images/bupa.png',
      price: 3975,
      currency: 'SAR',
      discounts: [
        { type: 'Family Plan Discount', amount: 300, percentage: 7 },
        { type: 'Long-Term Discount', amount: 220, percentage: 5.5 }
      ],
      coverages: ['Theft Protection', 'Fire Damage', 'Liquid Damage'],
      additionalCoverages: ['Mechanical Breakdown'],
      deviceTypes: ['tablet', 'laptop'],
      rating: 4.6,
      features: ['Annual Device Checkup', 'Priority Claim Approval', 'Free Tech Support']
    },
    {
      id: 6,
      type: 'Economy',
      provider: 'Malath Insurance',
      logo: 'assets/images/malath.png',
      price: 4120,
      currency: 'SAR',
      discounts: [
        { type: 'NCD Discount', amount: 310, percentage: 7.5 },
        { type: 'Promo Discount', amount: 180, percentage: 4.5 }
      ],
      coverages: ['Accidental Damage', 'Fire Damage', 'Theft Protection'],
      additionalCoverages: ['Water Damage', 'Power Surge'],
      deviceTypes: ['mobile', 'tablet', 'laptop'],
      rating: 4.4,
      features: ['Roadside Device Pickup', 'Replacement Within 48 Hours', 'Online Chat Support']
    }
  ];

  onToggleRegion(country: string): void {
    const index = this.selectedRegions.indexOf(country);
    if (index >= 0) {
      this.selectedRegions.splice(index, 1);
    } else {
      this.selectedRegions.push(country);
    }
  }

  onToggleShowAllRegions(): void {
    this.showAllRegions = !this.showAllRegions;
  }


  get filteredInsuranceOffers() {
    let filtered = this.insuranceOffers.filter(
      offer => offer.type === this.selectedInsuranceType
    );

    if (this.sortOrder === 'asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }


  selectInsuranceType(type: string): void {
    this.selectedInsuranceType = type;
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortOrder = select.value as 'asc' | 'desc' | '';
  }

  openLoginModal() {
    this.authService.lesseLoginShow('motor-Insurance');
  }
  validateAndNext(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; 
    }
    this.isNextClick = true;
  this.goToNextStep();
  }
   saveCurrentRoute() {
    const currentRoute = this.router.url;
    localStorage.setItem('lastRoute', currentRoute);
  }
}
