import { Component, OnInit } from '@angular/core';
import { CoursService } from '../../../services/cours.service';

@Component({
  selector: 'app-admin-cours-formations',
  templateUrl: './cours-formations.component.html',
  styleUrls: ['./cours-formations.component.css']
})
export class AdminCoursFormationsComponent implements OnInit {

  activeTab: 'cours' | 'formations' | 'categories' = 'cours';
  cours: any[] = [];
  formations: any[] = [];
  categories: any[] = [];
  coursEnAttente: any[] = [];
  isLoading = false;

  // Modals
  showAddFormationModal = false;
  showAddCategorieModal = false;

  // Nouvelle formation
  nouvelleFormation: any = {
    title: '', description: '', categoryId: null,
    provider: '', linkUrl: '', duration: '',
    level: '', language: '', isExternal: true
  };

  // Nouvelle catégorie
  nouvelleCategorie: any = {
    name: '', description: '', icon: '', color: '#1e3a5f', parentCategoryId: null
  };

  stats = { totalCours: 0, totalFormations: 0, coursEnAttente: 0, totalCategories: 0 };

  constructor(private coursService: CoursService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.coursService.getAllCours().subscribe((res: any) => {
      this.cours = res.data || [];
      this.stats.totalCours = this.cours.length;
    });
    this.coursService.getAllFormations().subscribe((res: any) => {
      this.formations = res.data || [];
      this.stats.totalFormations = this.formations.length;
    });
    this.coursService.getAllCategories().subscribe((res: any) => {
      this.categories = res.data || [];
      this.stats.totalCategories = this.categories.length;
    });
    this.coursService.getCoursEnAttente().subscribe((res: any) => {
      this.coursEnAttente = res.data || [];
      this.stats.coursEnAttente = this.coursEnAttente.length;
      this.isLoading = false;
    });
  }

  approuverCours(id: number) {
    this.coursService.approuverCours(id).subscribe(() => this.loadAll());
  }

  supprimerCours(id: number) {
    if (confirm('Supprimer ce cours ?')) {
      this.coursService.supprimerCours(id).subscribe(() => this.loadAll());
    }
  }

  ajouterFormation() {
    this.coursService.ajouterFormation(this.nouvelleFormation).subscribe(() => {
      this.showAddFormationModal = false;
      this.loadAll();
    });
  }

  supprimerFormation(id: number) {
    if (confirm('Supprimer cette formation ?')) {
      this.coursService.supprimerFormation(id).subscribe(() => this.loadAll());
    }
  }

  ajouterCategorie() {
    this.coursService.ajouterCategorie(this.nouvelleCategorie).subscribe(() => {
      this.showAddCategorieModal = false;
      this.loadAll();
    });
  }

  supprimerCategorie(id: number) {
    if (confirm('Supprimer cette catégorie ?')) {
      this.coursService.supprimerCategorie(id).subscribe(() => this.loadAll());
    }
  }

  getFileIcon(type: string): string {
    if (!type) return 'fa-file';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fa-file-word';
    if (type.includes('ppt') || type.includes('presentation')) return 'fa-file-powerpoint';
    return 'fa-file';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}