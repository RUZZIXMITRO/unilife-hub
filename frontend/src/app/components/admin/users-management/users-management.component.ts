import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;

  // Filtres
  searchQuery = '';
  filterStatus = 'all';
  filterRole = 'all';

  // Stats
  stats = { total: 0, active: 0, blocked: 0, students: 0, admins: 0 };

  // Modals
  showBlockModal = false;
  showUnblockModal = false;
  showDeleteModal = false;
  showProfileModal = false;
  showPromoteModal = false;
  selectedUser: any = null;
  blockReason = '';
  blockDuration = 30;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;

    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        console.log('✅ Réponse:', response);

        let data: any[] = [];

        if (response.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (response.Data && Array.isArray(response.Data)) {
          data = response.Data;
        } else if (Array.isArray(response)) {
          data = response;
        }

        console.log('👥 Users trouvés:', data.length);

        this.users = data.map((u: any) => ({
  id: u.id,
  credentialId: u.credentialId,
  name: u.name || 'N/A',
  email: u.email,
  phone: u.phone,
  university: u.university,
  studentId: u.studentId,
  academicYear: u.academicYear,
  bio: u.bio,
  avatarUrl: u.avatarUrl,
  role: u.role || 'STUDENT',
  isActive: u.isActive ?? true,
  isBlocked: u.isBlocked ?? false,
  blockedReason: u.blockedReason,
  blockedUntil: u.blockedUntil,
  isVerified: u.isVerified ?? false,
  createdAt: u.createdAt,
  lastLogin: u.lastLogin,
  profile: u.profile,
  preferences: u.preferences
}));

        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur:', error.status, error.error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.users.length;
    this.stats.active = this.users.filter(u => !u.isBlocked && u.isActive).length;
    this.stats.blocked = this.users.filter(u => u.isBlocked).length;
    this.stats.students = this.users.filter(u => u.role === 'STUDENT' || u.role === 0).length;
    this.stats.admins = this.users.filter(u => u.role === 'ADMIN' || u.role === 1).length;
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.university?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(u =>
        this.filterStatus === 'active' ? (!u.isBlocked && u.isActive) : u.isBlocked
      );
    }

    if (this.filterRole !== 'all') {
      filtered = filtered.filter(u => {
        const role = u.role?.toString();
        return this.filterRole === 'STUDENT'
          ? (role === 'STUDENT' || role === '0')
          : (role === 'ADMIN' || role === '1');
      });
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  // ========== MODALS ==========
  openBlockModal(user: any): void {
    this.selectedUser = user;
    this.blockReason = '';
    this.blockDuration = 30;
    this.showBlockModal = true;
  }

  openUnblockModal(user: any): void {
    this.selectedUser = user;
    this.showUnblockModal = true;
  }

  openDeleteModal(user: any): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  openProfileModal(user: any): void {
    this.selectedUser = user;
    this.showProfileModal = true;
  }

  openPromoteModal(user: any): void {
    this.selectedUser = user;
    this.showPromoteModal = true;
  }

  closeModals(): void {
    this.showBlockModal = false;
    this.showUnblockModal = false;
    this.showDeleteModal = false;
    this.showProfileModal = false;
    this.showPromoteModal = false;
    this.selectedUser = null;
    this.blockReason = '';
    this.showDemoteModal = false;
  }

  // ========== ACTIONS ==========
  confirmBlock(): void {
    if (!this.blockReason.trim()) return;

    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + this.blockDuration);

    this.adminService.blockUser(
      this.selectedUser.id,
      this.blockReason,
      blockedUntil
    ).subscribe({
      next: () => {
        this.showBlockModal = false;
        this.loadUsers();
      },
      error: (err) => console.error('❌ Erreur blocage:', err)
    });
  }

  confirmUnblock(): void {
    this.adminService.unblockUser(this.selectedUser.id).subscribe({
      next: () => {
        this.showUnblockModal = false;
        this.loadUsers();
      },
      error: (err) => console.error('❌ Erreur déblocage:', err)
    });
  }

  confirmDelete(): void {
    console.log('🗑️ Suppression:', this.selectedUser);

    this.adminService.deleteUserComplete(
      this.selectedUser.id,
      this.selectedUser.credentialId
    ).subscribe({
      next: (response) => {
        console.log('✅ Supprimé:', response);
        this.showDeleteModal = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
      }
    });
  }

  confirmPromote(): void {
  console.log('👑 selectedUser complet:', this.selectedUser);
  console.log('👑 id:', this.selectedUser.id);
  console.log('👑 credentialId:', this.selectedUser.credentialId);

  this.adminService.promoteToAdmin(
    this.selectedUser.id,
    this.selectedUser.credentialId
  ).subscribe({
    next: (response) => {
      console.log('✅ Promu Admin:', response);
      this.showPromoteModal = false;
      this.loadUsers();
    },
    error: (err) => {
      console.error('❌ Erreur promotion:', err);
    }
  });
}

  // ========== HELPERS ==========
  getInitials(user: any): string {
    if (!user) return 'U';
    const name = user.name || user.email || '';
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(user: any): string {
    const colors = [
      '#1e3a5f',
      '#2e5f9e',
      '#1a4a7a',
      '#0f2d5c',
      '#245a8a',
    ];
    const name = user?.name || user?.email || '';
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getRole(user: any): string {
    const role = user.role?.toString();
    return (role === 'ADMIN' || role === '1') ? 'ADMIN' : 'STUDENT';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearch(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  showDemoteModal = false;

openDemoteModal(user: any): void {
  this.selectedUser = user;
  this.showDemoteModal = true;
}

confirmDemote(): void {
  console.log('👤 Rétrogradation:', this.selectedUser);

  this.adminService.demoteFromAdmin(
    this.selectedUser.id,
    this.selectedUser.credentialId
  ).subscribe({
    next: (response) => {
      console.log('✅ Rétrogradé Student:', response);
      this.showDemoteModal = false;
      this.loadUsers();
    },
    error: (err) => {
      console.error('❌ Erreur rétrogradation:', err);
    }
  });
}
}