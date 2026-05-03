import { Component, OnInit } from '@angular/core';
import { SocialService, Group, GroupMember, GroupPost } from '../../../../services/social.service';
import { AuthService } from '../../../../services/auth.service'; 
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups: Group[] = [];
  searchKeyword = '';
  showCreateForm = false;
  isLoading = false;

  // Groupe sélectionné pour voir détails
  selectedGroup: Group | null = null;
  groupMembers: GroupMember[] = [];
  pendingMembers: GroupMember[] = [];
  groupPosts: GroupPost[] = [];
  activeTab: 'posts' | 'members' | 'pending' = 'posts';
  joiningGroupIds = new Set<number>();

  currentUserId: string = '';

  newGroup = {
    name: '',
    description: '',
    subject: '',
    type: 'PUBLIC'
  };

  constructor(private socialService: SocialService , private authService: AuthService) {}

  ngOnInit(): void {
  this.currentUserId =
  this.authService.getCurrentUser()?.id || this.authService.getUserId() || '';
  this.loadGroups();
}

  loadGroups(): void {
    this.isLoading = true;
    this.socialService.getPublicGroups().subscribe({
      next: (res) => {
        if (res.success) this.groups = res.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  searchGroups(): void {
    if (!this.searchKeyword.trim()) { this.loadGroups(); return; }
    this.socialService.searchGroups(this.searchKeyword).subscribe({
      next: (res) => { if (res.success) this.groups = res.data; }
    });
  }

  createGroup(): void {
    if (!this.newGroup.name.trim()) return;
    this.socialService.createGroup(
      this.newGroup.name, this.newGroup.description,
      this.newGroup.subject, this.newGroup.type
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.groups.unshift(res.data);
          this.showCreateForm = false;
          this.newGroup = { name: '', description: '', subject: '', type: 'PUBLIC' };
        }
      }
    });
  }

  joinGroup(groupId: number): void {
    if (this.joiningGroupIds.has(groupId)) return;
    this.joiningGroupIds.add(groupId);

    this.socialService.joinGroup(groupId).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.groups.findIndex(g => g.id === groupId);
          if (index !== -1) this.groups[index] = res.data;
        }
        this.joiningGroupIds.delete(groupId);
      },
      error: (error: HttpErrorResponse) => {
        this.joiningGroupIds.delete(groupId);
        const apiMessage = error?.error?.message || error?.error?.data?.message || '';
        const normalized = String(apiMessage).toLowerCase();

        // Si le backend renvoie "déjà membre", on synchronise l'UI au lieu d'afficher un faux échec bloquant.
        if (normalized.includes('déjà')) {
          const index = this.groups.findIndex(g => g.id === groupId);
          if (index !== -1) {
            this.groups[index] = {
              ...this.groups[index],
              isMember: true
            };
          }
          alert(apiMessage || 'Vous êtes déjà membre de ce groupe.');
          return;
        }

        alert(apiMessage || 'Erreur lors de la demande');
      }
    });
  }

  leaveGroup(groupId: number): void {
    this.socialService.leaveGroup(groupId).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.groups.findIndex(g => g.id === groupId);
          if (index !== -1) this.groups[index].isMember = false;
          if (this.selectedGroup?.id === groupId) this.selectedGroup = null;
        }
      }
    });
  }

  // ===== DÉTAILS GROUPE =====
  openGroup(group: Group): void {
    this.selectedGroup = group;
    this.activeTab = 'posts';
    this.loadGroupPosts(group.id);
    this.loadGroupMembers(group.id);
  }

  closeGroup(): void {
    this.selectedGroup = null;
  }

  setTab(tab: 'posts' | 'members' | 'pending'): void {
    this.activeTab = tab;
    if (tab === 'pending' && this.selectedGroup) {
      this.loadPendingMembers(this.selectedGroup.id);
    }
  }

  // ===== POSTS DU GROUPE =====
  loadGroupPosts(groupId: number): void {
    this.socialService.getGroupPosts(groupId).subscribe({
      next: (res) => { if (res.success) this.groupPosts = res.data; }
    });
  }

  // ===== MEMBRES =====
  loadGroupMembers(groupId: number): void {
    this.socialService.getGroupMembers(groupId).subscribe({
      next: (res) => { if (res.success) this.groupMembers = res.data; }
    });
  }

  loadPendingMembers(groupId: number): void {
    this.socialService.getPendingMembers(groupId).subscribe({
      next: (res) => { if (res.success) this.pendingMembers = res.data; }
    });
  }

  approveMember(userId: string): void {
    if (!this.selectedGroup) return;
    this.socialService.approveMember(this.selectedGroup.id, userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingMembers = this.pendingMembers.filter(m => m.userId !== userId);
          this.loadGroupMembers(this.selectedGroup!.id);
          alert('Membre approuvé !');
        }
      }
    });
  }

  rejectMember(userId: string): void {
    if (!this.selectedGroup) return;
    this.socialService.rejectMember(this.selectedGroup.id, userId).subscribe({
      next: () => {
        this.pendingMembers = this.pendingMembers.filter(m => m.userId !== userId);
      }
    });
  }

  removeMember(userId: string): void {
    if (!this.selectedGroup || !confirm('Retirer ce membre ?')) return;
    this.socialService.removeMember(this.selectedGroup.id, userId).subscribe({
      next: () => {
        this.groupMembers = this.groupMembers.filter(m => m.userId !== userId);
      }
    });
  }

  isGroupAdmin(): boolean {
  return this.groupMembers.some(
    m => m.userId === this.currentUserId && m.role === 'ADMIN'
  );
}

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  }
}