import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  favoris: any[] = [];
  activeTab: 'cours' | 'formations' | 'favoris' = 'cours';
  isLoading = false;
  isLoadingFavoris = false;
  searchKeyword = '';
  selectedCategory: number | null = null;
  selectedLevel = '';
  selectedLanguage = '';
  currentUserId = '';
  showUploadModal = false;
  selectedFile: File | null = null;
  uploadData = { title: '', description: '', categoryId: null };
  isUploading = false;
  uploadSuccess = false;
  uploadError = '';
  showEditModal = false;
  coursAModifier: any = null;
  editData: { title: string; description: string; categoryId: any } = { title: '', description: '', categoryId: null };
  isEditing = false;
  editSuccess = false;
  editError = '';

  constructor(private coursService: CoursService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id || localStorage.getItem('user_id') || '';
    this.loadCategories();
    this.loadCours();
    this.loadFormations();
  }

  loadCategories() { this.coursService.getAllCategories().subscribe((res: any) => { this.categories = res.data || []; }); }
  loadCours() { this.isLoading = true; this.coursService.getAllCours().subscribe((res: any) => { this.cours = res.data || []; this.isLoading = false; }); }
  loadFormations() { this.coursService.getAllFormations().subscribe((res: any) => { this.formations = res.data || []; }); }
  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }

  loadFavoris() {
    this.isLoadingFavoris = true;
    this.coursService.getMesFavoris().subscribe({
      next: (res: any) => { this.favoris = res.data || []; this.isLoadingFavoris = false; },
      error: () => { this.isLoadingFavoris = false; }
    });
  }

  getFavorisCours() { return this.favoris.filter(f => (f.resourceType || '').toLowerCase() === 'course'); }
  getFavorisFormations() { return this.favoris.filter(f => (f.resourceType || '').toLowerCase() === 'formation'); }

  retirerFavori(fav: any) {
    const resourceId = fav.resource?.id || fav.resourceId;
    this.coursService.retirerFavori(resourceId).subscribe({ next: () => { this.loadFavoris(); } });
  }

  telechargerFavori(fav: any) {
    const resourceId = fav.resourceId || fav.resource?.id;
    if (resourceId) {
      this.coursService.getAllCours().subscribe((res: any) => {
        const cours = (res.data || []).find((c: any) => c.resourceId === resourceId);
        if (cours) this.telecharger(cours.id);
      });
    }
  }

  accederFavoriFormation(fav: any) {
    const resourceId = fav.resourceId || fav.resource?.id;
    if (resourceId) {
      this.coursService.getAllFormations().subscribe((res: any) => {
        const formation = (res.data || []).find((f: any) => f.resourceId === resourceId);
        if (formation) this.accederFormation(formation);
      });
    }
  }

  uploadCours() {
    if (!this.uploadData.title || !this.uploadData.categoryId || !this.selectedFile) { this.uploadError = 'Titre, categorie et fichier sont obligatoires'; return; }
    this.isUploading = true; this.uploadError = '';
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('data', new Blob([JSON.stringify(this.uploadData)], { type: 'application/json' }));
    this.coursService.uploadCours(formData).subscribe({
      next: () => { this.isUploading = false; this.uploadSuccess = true; this.uploadData = { title: '', description: '', categoryId: null }; this.selectedFile = null; setTimeout(() => { this.showUploadModal = false; this.uploadSuccess = false; }, 2000); },
      error: () => { this.isUploading = false; this.uploadError = 'Erreur upload'; }
    });
  }

  onCategoryChange() { if (!this.selectedCategory) { if (this.activeTab === 'cours') this.loadCours(); else this.loadFormations(); } }

  rechercher() {
    const keyword = this.searchKeyword?.trim() || '';
    const categoryId = this.selectedCategory ? Number(this.selectedCategory) : undefined;
    if (keyword === '' && !categoryId && !this.selectedLevel && !this.selectedLanguage) { if (this.activeTab === 'cours') this.loadCours(); else this.loadFormations(); return; }
    if (this.activeTab === 'cours') { this.coursService.searchCours(keyword, categoryId).subscribe((res: any) => { this.cours = res.data || []; }); }
    else { this.coursService.searchFormations(keyword, this.selectedLevel, this.selectedLanguage, categoryId).subscribe((res: any) => { this.formations = res.data || []; }); }
  }

  telecharger(id: number) {
    this.coursService.downloadCours(id).subscribe((res: any) => {
      if (res.data) { let url = res.data; if (!url.startsWith('http')) url = 'http://localhost:8081' + url; window.open(url, '_blank'); }
    });
  }

  toggleFavori(item: any, type: string) {
    console.log(item);
    const resourceId = item.resourceId;
    if (!resourceId) {
      console.error('resourceId manquant pour les favoris', item);
      return;
    }
    if (item.isFavorite) {
      this.coursService.retirerFavori(resourceId).subscribe({
        next: () => {
          item.isFavorite = false;
          this.loadFavoris();
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.coursService.ajouterFavori(resourceId, type).subscribe({
        next: () => {
          item.isFavorite = true;
          this.loadFavoris();
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  ouvrirEditModal(cours: any) { this.coursAModifier = cours; this.editData = { title: cours.title, description: cours.description, categoryId: cours.categoryId }; this.editSuccess = false; this.editError = ''; this.showEditModal = true; }

  modifierCours() {
    if (!this.editData.title || !this.editData.categoryId) { this.editError = 'Titre et categorie sont obligatoires'; return; }
    this.isEditing = true; this.editError = '';
    this.coursService.modifierCours(this.coursAModifier.id, this.editData).subscribe({
      next: () => { this.isEditing = false; this.editSuccess = true; setTimeout(() => { this.showEditModal = false; this.editSuccess = false; this.loadCours(); }, 1500); },
      error: () => { this.isEditing = false; this.editError = 'Erreur modification'; }
    });
  }

  supprimerMonCours(id: number) {
    if (confirm('Supprimer ce cours ?')) {
      this.coursService.supprimerMonCours(id).subscribe({ next: () => this.loadCours(), error: (err) => alert('Erreur: ' + (err.error?.message || err.status)) });
    }
  }

  accederFormation(f: any) { this.coursService.incrementerClics(f.id).subscribe(); window.open(f.linkUrl, '_blank'); }
  getFileIcon(type: string): string { if (!type) return 'fa-file'; if (type.includes('pdf')) return 'fa-file-pdf'; if (type.includes('word') || type.includes('doc')) return 'fa-file-word'; if (type.includes('ppt')) return 'fa-file-powerpoint'; return 'fa-file'; }
  formatSize(bytes: number): string { if (!bytes) return ''; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'; return (bytes / (1024 * 1024)).toFixed(1) + ' MB'; }
}
