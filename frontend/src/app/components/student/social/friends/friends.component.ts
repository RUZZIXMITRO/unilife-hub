import { Component, OnInit } from '@angular/core';
import { SocialService, Friendship } from '../../../../services/social.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends: Friendship[] = [];
  pendingRequests: Friendship[] = [];
  activeTab = 'friends';
  isLoading = false;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingRequests();
  }

  loadFriends(): void {
    this.socialService.getFriends().subscribe({
      next: (res) => { if (res.success) this.friends = res.data; }
    });
  }

  loadPendingRequests(): void {
    this.socialService.getPendingRequests().subscribe({
      next: (res) => { if (res.success) this.pendingRequests = res.data; }
    });
  }

  acceptRequest(friendshipId: number): void {
    this.socialService.acceptFriendRequest(friendshipId).subscribe({
      next: (res) => {
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
      next: (res) => {
        if (res.success) {
          this.pendingRequests = this.pendingRequests
            .filter(r => r.id !== friendshipId);
        }
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }
}