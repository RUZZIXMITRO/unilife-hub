import { Component, OnInit } from '@angular/core';
import { SocialService, Group } from '../../../../services/social.service';

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

  newGroup = {
    name: '',
    description: '',
    subject: '',
    type: 'PUBLIC'
  };

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
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
    if (!this.searchKeyword.trim()) {
      this.loadGroups();
      return;
    }
    this.socialService.searchGroups(this.searchKeyword).subscribe({
      next: (res) => { if (res.success) this.groups = res.data; }
    });
  }

  createGroup(): void {
    if (!this.newGroup.name.trim()) return;
    this.socialService.createGroup(
      this.newGroup.name,
      this.newGroup.description,
      this.newGroup.subject,
      this.newGroup.type
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
    this.socialService.joinGroup(groupId).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.groups.findIndex(g => g.id === groupId);
          if (index !== -1) this.groups[index] = res.data;
        }
      }
    });
  }

  leaveGroup(groupId: number): void {
    this.socialService.leaveGroup(groupId).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.groups.findIndex(g => g.id === groupId);
          if (index !== -1) this.groups[index].isMember = false;
        }
      }
    });
  }
}