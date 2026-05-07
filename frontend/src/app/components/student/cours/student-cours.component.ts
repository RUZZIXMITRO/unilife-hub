import { Component, OnInit } from '@angular/core';
import { CoursService } from '../../../services/cours.service';

@Component({
  selector: 'app-student-cours',
  templateUrl: './student-cours.component.html',
  styleUrls: ['./student-cours.component.css']
})
export class StudentCoursComponent implements OnInit {

  cours: any[] = [];
  formations: any[] = [];
  categories: any[] = [];
  activeTab: 'cours' | 'formations' | 'mes-cours' | 'favoris' = 'cours';
  isLoading = false;
  searchKeyword = '';
  selectedCategory: number | null = null;
  selectedLevel = '';
  selectedLanguage = '';
  mesCours: any[] = [];
  mesFavoris: any[] = [];
  selectedCours: any = null;


  constructor(public coursService: CoursService) {}

  showUploadModal = false;
  selectedFile: File | null = null;
  uploadData = { title: '', description: '', categoryId: null };
  isUploading = false;
  uploadSuccess = false;
  uploadError = '';

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  openDetail(c: any): void {
  this.selectedCours = c;
  this.coursService.getCoursDetail(c.id).subscribe((res: any) => {
    this.selectedCours = res.data || c;
  });
}

closeDetail(): void {
  this.selectedCours = null;
}

  uploadCours() {
    if (!this.uploadData.title || !this.uploadData.categoryId || !this.selectedFile) {
      this.uploadError = 'Titre, catégorie et fichier sont obligatoires';
      return;
    }
    this.isUploading = true;
    this.uploadError = '';
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('data', new Blob([JSON.stringify(this.uploadData)], { type: 'application/json' }));
    this.coursService.uploadCours(formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadData = { title: '', description: '', categoryId: null };
        this.selectedFile = null;
        setTimeout(() => { this.showUploadModal = false; this.uploadSuccess = false; }, 2000);
      },
      error: () => { this.isUploading = false; this.uploadError = 'Erreur lors de l\'upload'; }
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadCours();
    this.loadFormations();
  }

  loadCategories() {
    this.coursService.getAllCategories().subscribe((res: any) => {
      this.categories = res.data || [];
    });
  }

  loadMesCours() {
    this.coursService.getMesCours().subscribe((res: any) => {
      this.mesCours = res.data || [];
    });
  }

  loadMesFavoris() {
    this.coursService.getMesFavoris().subscribe((res: any) => {
      this.mesFavoris = res.data || [];
    });
  }

 retirerFavori(favoriteId: number) {
  this.coursService.retirerFavori(favoriteId).subscribe({
    next: () => {
      this.mesFavoris = this.mesFavoris.filter(f => f.id !== favoriteId);
    },
    error: (err) => console.error('Erreur:', err)
  });
}

  loadCours() {
    this.isLoading = true;
    this.coursService.getAllCours().subscribe((res: any) => {
      this.cours = res.data || [];
      this.isLoading = false;
    });
  }

  loadFormations() {
    this.coursService.getAllFormations().subscribe((res: any) => {
      this.formations = res.data || [];
    });
  }

  rechercher() {
    if (this.activeTab === 'cours') {
      if (!this.searchKeyword && !this.selectedCategory) {
        this.loadCours();
      } else {
        this.coursService.searchCours(this.searchKeyword, this.selectedCategory || undefined)
          .subscribe((res: any) => { this.cours = res.data || []; });
      }
    } else {
      if (!this.searchKeyword && !this.selectedCategory && !this.selectedLevel && !this.selectedLanguage) {
        this.loadFormations();
      } else {
        this.coursService.searchFormations(this.searchKeyword, this.selectedLevel, this.selectedLanguage, this.selectedCategory || undefined)
          .subscribe((res: any) => { this.formations = res.data || []; });
      }
    }
  }

  telecharger(id: number) {
    this.coursService.downloadCours(id).subscribe((res: any) => {
      if (res.data) {
        const path = res.data.replace('uploads//', 'uploads/');
        const url = `http://localhost:8081/${encodeURI(path)}`;
        window.open(url, '_blank');
      }
    });
  }

  toggleFavori(item: any, type: string) {
    if (item.isFavorite) {
      this.coursService.retirerFavori(item.id).subscribe(() => item.isFavorite = false);
    } else {
      this.coursService.ajouterFavori(item.id, type).subscribe(() => item.isFavorite = true);
    }
  }

 accederFormation(f: any) {
  this.coursService.incrementerClics(f.id).subscribe();
  f.clicksCount = (f.clicksCount || 0) + 1;
  window.open(f.linkUrl, '_blank');
}

  getFileIcon(type: string): string {
    if (!type) return 'fa-file';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fa-file-word';
    if (type.includes('ppt')) return 'fa-file-powerpoint';
    return 'fa-file';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}