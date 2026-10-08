import { Component, OnInit } from '@angular/core';
import { SocialService, Group, GroupMember, GroupPost } from '../../../../services/social.service';
import { UserService } from '../../../../services/user.service';
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

  // Groupe sélectionné
  selectedGroup: Group | null = null;
  groupMembers: GroupMember[] = [];
  pendingMembers: GroupMember[] = [];
  groupPosts: GroupPost[] = [];
  activeTab: 'posts' | 'members' | 'pending' = 'posts';
  joiningGroupIds = new Set<number>();

  currentUserId: string = '';

  // Nouveau message dans le groupe
  newPostContent = '';
  isPostingMessage = false;

  // ✅ Cache noms userId → nom affiché
  userNameCache: { [userId: string]: string } = {};

  // ✅ Cache contenu posts postId → contenu texte
  postContentCache: { [postId: number]: string } = {};

  // ✅ Confirmation suppression message
  pendingDeletePost: GroupPost | null = null;

  // ✅ Toast notification (remplace alert)
  toastMessage = '';
  toastVisible = false;

  newGroup = {
    name: '',
    description: '',
    subject: '',
    type: 'PUBLIC'
  };

  constructor(
    private socialService: SocialService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId =
      this.authService.getCurrentUser()?.id || this.authService.getUserId() || '';
    this.loadGroups();
  }

  // ✅ Afficher un toast au lieu de alert()
  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

 
loadGroups(): void {
  this.isLoading = true;
  this.socialService.getPublicGroups().subscribe({
    next: (res) => {
      if (res.success) {
        this.groups = res.data;

        // ✅ Synchroniser membersCount + isMember + isPending pour chaque groupe
        this.groups.forEach(group => {
          this.socialService.getGroupMembers(group.id).subscribe({
            next: (membersRes) => {
              if (membersRes.success) {
                const allMembers = membersRes.data;

                group.membersCount = allMembers.filter(
                  (m: GroupMember) => m.status === 'ACCEPTED'
                ).length;

                // ✅ Créateur toujours considéré comme membre
                group.isMember = allMembers.some(
                  (m: GroupMember) => m.userId === this.currentUserId
                                   && m.status === 'ACCEPTED'
                ) || group.creatorId === this.currentUserId;

                // ✅ isPending uniquement si pas déjà membre
                group.isPending = !group.isMember && allMembers.some(
                  (m: GroupMember) => m.userId === this.currentUserId
                                   && m.status === 'PENDING'
                );
              }
            }
          });
        });
      }
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
        if (index !== -1) {
          const isCreator = this.groups[index].creatorId === this.currentUserId;
          const isPrivate = this.groups[index].type === 'PRIVATE';

          if (isPrivate && !isCreator) {
            // ✅ Autre user sur groupe privé → PENDING
            this.groups[index] = {
              ...this.groups[index],
              isMember: false,
              isPending: true
            };
            this.showToast('Demande envoyée. En attente d\'approbation.');
          } else {
            // ✅ Créateur ou groupe public → accès direct
            this.groups[index] = {
              ...res.data,
              isMember: true,
              isPending: false
            };
          }
        }
      }
      this.joiningGroupIds.delete(groupId);
    },
    error: (error: HttpErrorResponse) => {
      this.joiningGroupIds.delete(groupId);
      const apiMessage = error?.error?.message || error?.error?.data?.message || '';
      const normalized = String(apiMessage).toLowerCase();
      if (normalized.includes('déjà')) {
        const index = this.groups.findIndex(g => g.id === groupId);
        if (index !== -1) this.groups[index] = { ...this.groups[index], isMember: true };
        this.showToast(apiMessage || 'Vous êtes déjà membre de ce groupe.');
        return;
      }
      this.showToast(apiMessage || 'Erreur lors de la demande.');
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
  // ✅ Bloquer accès si demande en attente
  if (group.isPending) {
    this.showToast('Votre demande est en attente d\'approbation par l\'admin.');
    return;
  }

  // ✅ Bloquer accès si groupe privé et pas membre
  if (group.type === 'PRIVATE' && !group.isMember) {
    this.showToast('Ce groupe est privé. Envoyez une demande pour rejoindre.');
    return;
  }

  this.selectedGroup = group;
  this.activeTab = 'posts';
  this.newPostContent = '';
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

  // ===== POSTS / CHAT DU GROUPE =====
 loadGroupPosts(groupId: number): void {
  this.socialService.getGroupPosts(groupId).subscribe({
    next: (res) => {
      if (res.success) {
        // ✅ Trier par ID croissant (ordre d'insertion fiable)
        this.groupPosts = res.data.sort((a: GroupPost, b: GroupPost) => a.id - b.id);

        this.enrichMemberNames(this.groupPosts.map((p: GroupPost) => p.postedBy));

        // ✅ Charger le contenu de chaque post
        this.groupPosts.forEach((gp: GroupPost) => {
          if (!this.postContentCache[gp.postId]) {
            this.socialService.getPostById(gp.postId).subscribe({
              next: (postRes) => {
                if (postRes.success) {
                  this.postContentCache[gp.postId] = postRes.data.content;
                }
              }
            });
          }
        });
      }
    }
  });
}

  // ✅ Envoyer un message dans le groupe
  sendGroupMessage(): void {
  if (!this.newPostContent.trim() || !this.selectedGroup || this.isPostingMessage) return;

  this.isPostingMessage = true;
  const messageContent = this.newPostContent.trim();
  const userName = this.userNameCache[this.currentUserId] || 'Étudiant';

  this.socialService.createPost(messageContent, 'GROUP', userName).subscribe({
    next: (postRes) => {
      if (postRes.success) {
        const postId = postRes.data.id;

        // ✅ Mettre en cache le contenu immédiatement
        this.postContentCache[postId] = messageContent;

        this.socialService.addPostToGroup(this.selectedGroup!.id, postId).subscribe({
          next: (gpRes) => {
            if (gpRes.success) {
              this.groupPosts.push(gpRes.data);
              // ✅ Retrier par ID après ajout
              this.groupPosts.sort((a: GroupPost, b: GroupPost) => a.id - b.id);
            }
            this.newPostContent = '';
            this.isPostingMessage = false;
          },
          error: () => { this.isPostingMessage = false; }
        });
      } else {
        this.isPostingMessage = false;
      }
    },
    error: () => { this.isPostingMessage = false; }
  });
}
  // ✅ Supprimer un message — ouvre la modal de confirmation
  deleteGroupMessage(gp: GroupPost): void {
    this.pendingDeletePost = gp;
  }

  // ✅ Confirmer la suppression
  confirmDeleteMessage(): void {
    if (!this.pendingDeletePost) return;
    const gp = this.pendingDeletePost;
    this.pendingDeletePost = null;

    this.socialService.removePostFromGroup(gp.id).subscribe({
      next: () => {
        this.socialService.deletePost(gp.postId).subscribe();
        this.groupPosts = this.groupPosts.filter(p => p.id !== gp.id);
        delete this.postContentCache[gp.postId];
        this.showToast('Message supprimé.');
      }
    });
  }

  // ✅ Annuler la suppression
  cancelDeleteMessage(): void {
    this.pendingDeletePost = null;
  }

  // ===== MEMBRES =====
 loadGroupMembers(groupId: number): void {
  this.socialService.getGroupMembers(groupId).subscribe({
    next: (res) => {
      if (res.success) {
        // ✅ Afficher seulement les membres ACCEPTED dans la liste
        this.groupMembers = res.data.filter(
          (m: GroupMember) => m.status === 'ACCEPTED'
        );
        this.enrichMemberNames(this.groupMembers.map((m: GroupMember) => m.userId));

        const isMember = res.data.some(
          (m: GroupMember) => m.userId === this.currentUserId
                           && m.status === 'ACCEPTED'
        );

        if (this.selectedGroup) {
          this.selectedGroup = {
            ...this.selectedGroup,
            isMember: isMember || this.selectedGroup.creatorId === this.currentUserId,
            // ✅ Compter seulement les ACCEPTED
            membersCount: res.data.filter(
              (m: GroupMember) => m.status === 'ACCEPTED'
            ).length
          };
        }
      }
    }
  });
}

  loadPendingMembers(groupId: number): void {
    this.socialService.getPendingMembers(groupId).subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingMembers = res.data;
          this.enrichMemberNames(res.data.map((m: GroupMember) => m.userId));
        }
      }
    });
  }

  // ✅ Enrichir le cache de noms depuis UserService
  private enrichMemberNames(userIds: string[]): void {
    const uniqueIds = [...new Set(userIds.filter(id => id && !this.userNameCache[id]))];
    uniqueIds.forEach(userId => {
      this.userService.getUserByCredentialId(userId).subscribe({
        next: (res) => {
          if (res.success && res.data?.name) {
            this.userNameCache[userId] = res.data.name;
          }
        }
      });
    });
  }

  getUserName(userId: string): string {
    return this.userNameCache[userId] || 'Étudiant';
  }

  getInitial(userId: string): string {
    const name = this.userNameCache[userId];
    return name ? name[0].toUpperCase() : 'É';
  }

  approveMember(userId: string): void {
    if (!this.selectedGroup) return;
    this.socialService.approveMember(this.selectedGroup.id, userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingMembers = this.pendingMembers.filter(m => m.userId !== userId);
          this.loadGroupMembers(this.selectedGroup!.id);
          this.showToast('Membre approuvé !');
        }
      }
    });
  }

  rejectMember(userId: string): void {
    if (!this.selectedGroup) return;
    this.socialService.rejectMember(this.selectedGroup.id, userId).subscribe({
      next: () => {
        this.pendingMembers = this.pendingMembers.filter(m => m.userId !== userId);
        this.showToast('Membre refusé.');
      }
    });
  }

  removeMember(userId: string): void {
    if (!this.selectedGroup) return;
    this.socialService.removeMember(this.selectedGroup.id, userId).subscribe({
      next: () => {
        this.groupMembers = this.groupMembers.filter(m => m.userId !== userId);
        this.showToast('Membre retiré.');
      }
    });
  }

  isGroupAdmin(): boolean {
  // ✅ Admin si dans groupMembers OU si créateur du groupe
  return this.groupMembers.some(
    m => m.userId === this.currentUserId && m.role === 'ADMIN'
  ) || this.selectedGroup?.creatorId === this.currentUserId;
}

  getTimeAgo(dateString: string): string {
  if (!dateString) return '';

  // ✅ Tronquer les nanosecondes à 3 chiffres (millisecondes) + ajouter Z
  const normalized = dateString
    .replace(/(\.\d{3})\d+/, '$1')  // garder seulement 3 décimales
    .replace(/Z?$/, 'Z');           // ajouter Z si absent

  const date = new Date(normalized);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 5) return 'À l\'instant';
  if (diff < 60) return `Il y a ${diff} sec`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}
  // ✅ Confirmation suppression groupe
pendingDeleteGroup = false;

deleteGroup(): void {
  this.pendingDeleteGroup = true;
}

confirmDeleteGroup(): void {
  if (!this.selectedGroup) return;
  this.pendingDeleteGroup = false;

  this.socialService.deleteGroup(this.selectedGroup.id).subscribe({
    next: () => {
      this.groups = this.groups.filter(g => g.id !== this.selectedGroup!.id);
      this.selectedGroup = null;
      this.showToast('Groupe supprimé.');
    },
    error: () => this.showToast('Erreur lors de la suppression.')
  });
}

cancelDeleteGroup(): void {
  this.pendingDeleteGroup = false;
}

cancelJoinRequest(groupId: number): void {
  this.socialService.leaveGroup(groupId).subscribe({
    next: (res) => {
      if (res.success) {
        const index = this.groups.findIndex(g => g.id === groupId);
        if (index !== -1) {
          this.groups[index].isPending = false;
          this.groups[index].isMember = false;
        }
      }
    }
  });
}
}