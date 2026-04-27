import { Component, OnInit } from '@angular/core';
import { SocialService, Friendship, BlockList } from '../../../../services/social.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends: Friendship[] = [];
  pendingRequests: Friendship[] = [];
  blockedUsers: BlockList[] = [];
  filteredFriends: Friendship[] = [];
  activeTab = 'friends';
  isLoading = false;

  // Recherche d'amis
  searchKeyword = '';
  searchResults: any[] = [];
  isSearching = false;
  searchDone = false;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingRequests();
    this.loadBlockedUsers();
  }

  loadFriends(): void {
    this.socialService.getFriends().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.friends = res.data;
          this.filteredFriends = res.data;
        }
      }
    });
  }

  loadPendingRequests(): void {
    this.socialService.getPendingRequests().subscribe({
      next: (res: any) => { if (res.success) this.pendingRequests = res.data; }
    });
  }

  loadBlockedUsers(): void {
    this.socialService.getBlockedUsers().subscribe({
      next: (res: any) => { if (res.success) this.blockedUsers = res.data; }
    });
  }

  acceptRequest(friendshipId: number): void {
    this.socialService.acceptFriendRequest(friendshipId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingRequests = this.pendingRequests
            .filter(r => r.id !== friendshipId);
          this.loadFriends();
        }
      }
    });
  }

  rejectRequest(friendshipId: number): void {
    this.socialService.rejectFriendRequest(friendshipId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingRequests = this.pendingRequests
            .filter(r => r.id !== friendshipId);
        }
      }
    });
  }

  // ===== RECHERCHE (côté frontend sur la liste d'amis) =====
  searchUsers(): void {
    this.searchDone = true;
    if (!this.searchKeyword.trim()) {
      this.filteredFriends = this.friends;
      this.searchResults = [];
      return;
    }
    const keyword = this.searchKeyword.toLowerCase();
    this.filteredFriends = this.friends.filter(f =>
      f.requesterId.toString().includes(keyword) ||
      f.addresseeId.toString().includes(keyword)
    );
    this.searchResults = this.filteredFriends;
  }

  sendFriendRequest(userId: number): void {
    this.socialService.sendFriendRequest(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Demande d\'ami envoyée !');
          const user = this.searchResults.find((u: any) => u.id === userId);
          if (user) user.requestSent = true;
        }
      },
      error: () => {
        alert('Demande déjà envoyée ou erreur.');
      }
    });
  }

  // ===== BLOQUER =====
  blockUser(userId: number): void {
    if (!confirm('Bloquer cet utilisateur ?')) return;
    this.socialService.blockUser(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Utilisateur bloqué.');
          this.loadBlockedUsers();
          this.loadFriends();
        }
      },
      error: () => alert('Erreur lors du blocage.')
    });
  }

  unblockUser(userId: number): void {
    this.socialService.unblockUser(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blockedUsers = this.blockedUsers
            .filter(b => b.blockedId !== userId);
        }
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'search') {
      this.searchResults = [];
      this.filteredFriends = this.friends;
      this.searchKeyword = '';
      this.searchDone = false;
    }
  }
}