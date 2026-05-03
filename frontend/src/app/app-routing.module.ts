import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';

// ✅ IMPORTS ADMIN
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { SettingsComponent } from './components/admin/settings/settings.component';
import { HelpComponent } from './components/admin/help/help.component';
import { PromoteAdminComponent } from './components/setup/promote-admin/promote-admin.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout/admin-layout.component';
import { UsersManagementComponent } from './components/admin/users-management/users-management.component';
import { ProfileComponent } from './components/admin/pages/profile/profile.component';

// ✅ IMPORTS ADMIN MARKETPLACE
import { AdminMarketplaceComponent } from './components/admin/marketplace/admin-marketplace/admin-marketplace.component';
import { AdminReportsComponent } from './components/admin/marketplace/admin-reports/admin-reports.component';

// ✅ IMPORTS MARKETPLACE ÉTUDIANT
import { MarketplaceListComponent } from './components/student/marketplace/marketplace-list/marketplace-list.component';
import { MarketplaceDetailComponent } from './components/student/marketplace/marketplace-detail/marketplace-detail.component';
import { MarketplacePublishComponent } from './components/student/marketplace/marketplace-publish/marketplace-publish.component';
import { MyListingsComponent } from './components/student/marketplace/my-listings/my-listings.component';
import { MyFavoritesComponent } from './components/student/marketplace/my-favorites/my-favorites.component';


// ✅ E-COMMERCE STUDENT
import { CatalogComponent } from './components/student/ecommerce/catalog/catalog.component';
import { ProductDetailComponent } from './components/student/ecommerce/product-detail/product-detail.component';
import { CartComponent } from './components/student/ecommerce/cart/cart.component';
import { CheckoutComponent } from './components/student/ecommerce/checkout/checkout.component';
import { MyOrdersComponent } from './components/student/ecommerce/my-orders/my-orders.component';
import { OrderDetailComponent } from './components/student/ecommerce/order-detail/order-detail.component';
import { MyFavoritesComponent as EcommerceMyFavoritesComponent } from './components/student/ecommerce/my-favorites/my-favorites.component';
import { MyReviewsComponent } from './components/student/ecommerce/my-reviews/my-reviews.component';
import { AiAssistantComponent } from './components/student/ecommerce/ai-assistant/ai-assistant.component';
import { AssistantComponent } from './components/student/assistant/assistant.component';

// ✅ E-COMMERCE ADMIN
import { AdminProductsComponent } from './components/admin/ecommerce/admin-products/admin-products.component';
import { AdminOrdersComponent } from './components/admin/ecommerce/admin-orders/admin-orders.component';
import { AdminPromotionsComponent } from './components/admin/ecommerce/admin-promotions/admin-promotions.component';
import { AdminReviewsComponent } from './components/admin/ecommerce/admin-reviews/admin-reviews.component';
import { AdminInventoryComponent } from './components/admin/ecommerce/admin-inventory/admin-inventory.component';
// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // ========== ROUTES PUBLIQUES (Site vitrine) ==========
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'setup/promote', component: PromoteAdminComponent },

  // ========== COMPLETE PROFILE (Transition) ==========
  { 
    path: 'complete-profile', 
    component: CompleteProfileComponent,
    canActivate: [AuthGuard]
  },

 // ========== INTERFACE ÉTUDIANTE ==========
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      {
  path: 'social',
  loadChildren: () => import('./components/student/social/social.module')
    .then(m => m.SocialModule)
},
     
      // Marketplace Symfony
      { path: 'marketplace', component: MarketplaceListComponent },
      { path: 'marketplace/publish', component: MarketplacePublishComponent },
      { path: 'marketplace/my-listings', component: MyListingsComponent },
      { path: 'marketplace/my-favorites', component: MyFavoritesComponent },
      { path: 'marketplace/:id', component: MarketplaceDetailComponent },
      { path: 'assistant', component: AssistantComponent },


      // ✅ E-commerce
      { path: 'ecommerce', component: CatalogComponent },
      { path: 'ecommerce/product/:id', component: ProductDetailComponent },
      { path: 'ecommerce/cart', component: CartComponent },
      { path: 'ecommerce/checkout', component: CheckoutComponent },
      { path: 'ecommerce/orders', component: MyOrdersComponent },
      { path: 'ecommerce/orders/:id', component: OrderDetailComponent },
      { path: 'ecommerce/favorites', component: EcommerceMyFavoritesComponent },
      { path: 'ecommerce/reviews', component: MyReviewsComponent },
      { path: 'ecommerce/ai', component: AiAssistantComponent },
    ]
  },


  // ========== INTERFACE ADMIN (Protégée) ✅ NOUVEAU
 {
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [AuthGuard, AdminGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'help', component: HelpComponent },
    { path: 'marketplace', component: AdminMarketplaceComponent },
    { path: 'reports', component: AdminReportsComponent },
    { path: 'users', component: UsersManagementComponent } ,
    { path: 'profile', component: ProfileComponent },

    // ✅ E-commerce Admin
      { path: 'ecommerce/products', component: AdminProductsComponent },
      { path: 'ecommerce/orders', component: AdminOrdersComponent },
      { path: 'ecommerce/promotions', component: AdminPromotionsComponent },
      { path: 'ecommerce/reviews', component: AdminReviewsComponent },
      { path: 'ecommerce/inventory', component: AdminInventoryComponent },
  ]
},

  // ========== REDIRECTIONS ==========
  { path: 'dashboard', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: 'profile', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }