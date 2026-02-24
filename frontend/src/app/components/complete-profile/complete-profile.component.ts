import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.css']
})
export class CompleteProfileComponent implements OnInit {
  profileData = {
    name: '',
    phone: '',
    university: '',
    studentId: '',
    academicYear: '',
    bio: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: ''
  };

  isSubmitting = false;
  errorMessage = '';
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔵 Complete-profile ngOnInit');
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Non connecté, redirection auth');
      this.router.navigate(['/auth']);
      return;
    }

    console.log('✅ Utilisateur connecté, formulaire prêt');
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      console.log('➡️ Étape suivante:', this.currentStep);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      console.log('⬅️ Étape précédente:', this.currentStep);
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.profileData.name && !!this.profileData.phone;
      case 2:
        return !!this.profileData.university && !!this.profileData.studentId;
      case 3:
        return true;
      default:
        return false;
    }
  }

  onSubmit(): void {
    console.log('🔵 onSubmit() appelé');
    console.log('📝 Données actuelles:', this.profileData);
    
    if (!this.isStepValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      console.log('❌ Validation échouée');
      return;
    }

    if (this.isSubmitting) {
      console.log('⚠️ Soumission déjà en cours, ignoré');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail();

    console.log('👤 userId:', userId);
    console.log('📧 userEmail:', userEmail);

    if (!userId || !userEmail) {
      this.errorMessage = 'Erreur: Utilisateur non trouvé';
      this.isSubmitting = false;
      console.error('❌ userId ou userEmail manquant');
      return;
    }

    const userProfile = {
      credentialId: userId,
      name: this.profileData.name.trim(),
      email: userEmail,
      phone: this.profileData.phone.trim(),
      university: this.profileData.university.trim(),
      studentId: this.profileData.studentId.trim(),
      academicYear: this.profileData.academicYear.trim() || undefined,
      bio: this.profileData.bio.trim() || undefined,
      dateOfBirth: this.profileData.dateOfBirth || undefined,
      address: this.profileData.address.trim() || undefined,
      city: this.profileData.city.trim() || undefined,
      country: this.profileData.country.trim() || undefined
    };

    console.log('📤 Envoi du profil:', userProfile);

    this.userService.createUserProfile(userProfile).subscribe({
      next: (response) => {
        console.log('✅ Réponse reçue:', response);
        
        if (response && response.success && response.data) {
          console.log('✅ Profil créé avec succès, ID:', response.data.id);
          
          localStorage.setItem('user_profile_id', response.data.id);
          this.authService.markProfileAsCompleted();
          console.log('✅ Profile marqué comme complété');
          
          console.log('🔄 Redirection vers /student/dashboard');
          
          setTimeout(() => {
            this.isSubmitting = false;
            
            this.router.navigate(['/student/dashboard']).then(  
              (navigated) => {
                if (navigated) {
                  console.log('✅ Navigation réussie vers /student/dashboard');
                } else {
                  console.error('❌ Navigation échouée');
                  window.location.href = '/student/dashboard';
                }
              },
              (error) => {
                console.error('❌ Erreur navigation:', error);
                window.location.href = '/student/dashboard';
              }
            );
          }, 500);
          
        } else {
          console.error('❌ Réponse invalide:', response);
          this.errorMessage = 'Erreur lors de la création du profil';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('❌ Erreur HTTP:', error);
        
        if (error.status === 400 || error.status === 409) {
          console.log('⚠️ Le profil existe peut-être déjà');
          
          if (error.error?.message && error.error.message.includes('already exists')) {
            console.log('✅ Profil existe déjà, redirection /student/dashboard');
            this.authService.markProfileAsCompleted();
            
            setTimeout(() => {
              this.router.navigate(['/student/dashboard']);  
            }, 500);
            return;
          }
        }
        
        this.errorMessage = error.error?.message || 'Erreur lors de la création du profil';
        this.isSubmitting = false;
      }
    });
  }

  skipForNow(): void {
    console.log('⏭️ Skip for now appelé');
    
    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail();

    if (!userId || !userEmail) {
      console.error('❌ userId ou userEmail manquant');
      return;
    }

    const minimalProfile = {
      credentialId: userId,
      name: 'Utilisateur',
      email: userEmail,
      phone: '',
      university: '',
      studentId: '',
      academicYear: '',
      bio: ''
    };

    console.log('📤 Création profil minimal:', minimalProfile);

    this.userService.createUserProfile(minimalProfile).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Profil minimal créé');
          this.authService.markProfileAsCompleted();
          this.router.navigate(['/student/dashboard']);  
        }
      },
      error: (error) => {
        console.error('❌ Erreur création profil minimal:', error);
        
        if (error.status === 409 || error.status === 400) {
          console.log('⚠️ Profil existe déjà, redirection');
          this.authService.markProfileAsCompleted();
          this.router.navigate(['/student/dashboard']);  
        } else {
          this.errorMessage = 'Erreur lors de la création du profil';
        }
      }
    });
  }
}