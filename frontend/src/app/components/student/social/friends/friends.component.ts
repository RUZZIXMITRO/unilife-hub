import { Component, OnInit } from '@angular/core';
import { SocialService, Friendship, BlockList } from '../../../../services/social.service';
import { UserService } from '../../../../services/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
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

  // Recherche
  searchKeyword = '';
  searchResults: any[] = [];
  isSearching = false;
  searchDone = false;

  // ✅ Cache noms
  private userNameCache: { [credentialId: string]: string } = {};

  // ✅ URL directe UserService (pas via Gateway car 401)
  private userApiUrl = 'https://localhost:7212/api/Users';

  constructor(
    private socialService: SocialService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ) {}

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
          this.enrichFriendsWithNames(res.data);
        }
      }
    });
  }

  startConversation(credentialId: string): void {
  this.socialService.sendMessage(credentialId, '👋').subscribe({
    next: (res: any) => {
      if (res.success) {
        this.router.navigate(['/student/social/messages']);
      }
    },
    error: () => {
      // Naviguer quand même vers Messages
      this.router.navigate(['/student/social/messages']);
    }
  });
}

  // ✅ Enrichir les amis avec leurs vrais noms
  private enrichFriendsWithNames(friendships: Friendship[]): void {
    // Collecter tous les credentialIds uniques
    const uniqueIds = [...new Set(
      friendships.flatMap(f => [f.requesterId, f.addresseeId])
        .filter(id => id && !this.userNameCache[id])
    )];

    uniqueIds.forEach(credentialId => {
      this.userService.getUserByCredentialId(credentialId).subscribe({
        next: (res) => {
          if (res.success && res.data?.name) {
            this.userNameCache[credentialId] = res.data.name;
          }
        }
      });
    });
  }

  // ✅ Recherche via UserService direct (port 7212)
  searchUsers(): void {
    this.searchDone = true;
    if (!this.searchKeyword.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(
  `${this.userApiUrl}/search?query=${encodeURIComponent(this.searchKeyword)}`,
  { headers }
  ).subscribe({
      next: (res) => {
        if (res.success) {
          // ✅ Exclure l'utilisateur connecté des résultats
          const currentCredentialId = localStorage.getItem('user_id');
          this.searchResults = res.data
            .filter((u: any) => u.credentialId !== currentCredentialId)
            .map((u: any) => ({
              ...u,
              requestSent: false
            }));

          // ✅ Mettre en cache les noms trouvés
          res.data.forEach((u: any) => {
            if (u.credentialId && u.name) {
              this.userNameCache[u.credentialId] = u.name;
            }
          });
        }
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  // ✅ Retourne le nom depuis le cache
  getUserName(credentialId: string): string {
    return this.userNameCache[credentialId] || 'Étudiant';
  }

  loadPendingRequests(): void {
    this.socialService.getPendingRequests().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingRequests = res.data;
          this.enrichFriendsWithNames(res.data);
        }
      }
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
          this.pendingRequests = this.pendingRequests.filter(r => r.id !== friendshipId);
          this.loadFriends();
        }
      }
    });
  }

  rejectRequest(friendshipId: number): void {
    this.socialService.rejectFriendRequest(friendshipId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingRequests = this.pendingRequests.filter(r => r.id !== friendshipId);
        }
      }
    });
  }

  sendFriendRequest(credentialId: string): void {
    this.socialService.sendFriendRequest(credentialId).subscribe({
      next: (res: any) => {
        if (res.success) {
          const user = this.searchResults.find((u: any) => u.credentialId === credentialId);
          if (user) user.requestSent = true;
        }
      },
      error: () => alert('Demande déjà envoyée ou erreur.')
    });
  }

  blockUser(userId: string): void {
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

  unblockUser(userId: string): void {
    this.socialService.unblockUser(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blockedUsers = this.blockedUsers.filter(b => b.blockedId !== userId);
        }
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'search') {
      this.searchResults = [];
      this.searchKeyword = '';
      this.searchDone = false;
    }
  }

  getInitial(name: string): string {
    return name ? name[0].toUpperCase() : 'É';
  }
}