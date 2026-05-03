import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';


import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ========== SERVICES ==========
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ThemeService } from './services/theme.service';
import { AuthInterceptor } from './services/http-interceptor.service';

// ========== GUARDS ==========
import { AuthGuard } from './guards/auth.guard';

// ========== COMPONENTS - SITE PUBLIC ==========
import { HomeComponent } from './components/home/home.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { AboutComponent } from './components/about/about.component';
import { WhyUsComponent } from './components/why-us/why-us.component';
import { ProcessComponent } from './components/process/process.component';
import { FeaturesComponent } from './components/features/features.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { VisionMissionComponent } from './components/vision-mission/vision-mission.component';
import { AdvantagesComponent } from './components/advantages/advantages.component';
import { CtaComponent } from './components/cta/cta.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';

// ========== COMPONENTS - AUTH ==========
import { AuthComponent } from './components/auth/auth.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';

// ========== COMPONENTS - INTERFACE ÉTUDIANTE ==========
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { SidebarComponent } from './components/student/layout/sidebar/sidebar.component';
import { TopbarComponent } from './components/student/layout/topbar/topbar.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';
import { ProfileModalComponent } from './components/student/profile-modal/profile-modal.component';
import { SettingsModalComponent } from './components/student/settings-modal/settings-modal.component';
import { HelpModalComponent } from './components/student/help-modal/help-modal.component';
import { MyFavoritesComponent as EcommerceMyFavoritesComponent } from './components/student/ecommerce/my-favorites/my-favorites.component';


// ========== COMPONENTS - INTERFACE ADMIN ==========
import { AdminLayoutComponent } from './components/admin/layout/admin-layout/admin-layout.component';
import { AdminSidebarComponent } from './components/admin/layout/sidebar/sidebar.component';
import { AdminTopbarComponent } from './components/admin/layout/topbar/topbar.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { UsersManagementComponent } from './components/admin/users-management/users-management.component';
import { SettingsComponent } from './components/admin/settings/settings.component';
import { HelpComponent } from './components/admin/help/help.component';
import { ProfileComponent } from './components/admin/pages/profile/profile.component';
import { MarketplaceListComponent } from './components/student/marketplace/marketplace-list/marketplace-list.component';
import { MarketplaceDetailComponent } from './components/student/marketplace/marketplace-detail/marketplace-detail.component';
import { MarketplacePublishComponent } from './components/student/marketplace/marketplace-publish/marketplace-publish.component';
import { MyListingsComponent } from './components/student/marketplace/my-listings/my-listings.component';
import { MyFavoritesComponent } from './components/student/marketplace/my-favorites/my-favorites.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { AdminMarketplaceComponent } from './components/admin/marketplace/admin-marketplace/admin-marketplace.component';
import { AdminReportsComponent } from './components/admin/marketplace/admin-reports/admin-reports.component';
import { PromoteAdminComponent } from './components/setup/promote-admin/promote-admin.component';
import { CatalogComponent } from './components/student/ecommerce/catalog/catalog.component';
import { ProductDetailComponent } from './components/student/ecommerce/product-detail/product-detail.component';
import { CartComponent } from './components/student/ecommerce/cart/cart.component';
import { CheckoutComponent } from './components/student/ecommerce/checkout/checkout.component';
import { MyOrdersComponent } from './components/student/ecommerce/my-orders/my-orders.component';
import { OrderDetailComponent } from './components/student/ecommerce/order-detail/order-detail.component';
import { MyReviewsComponent } from './components/student/ecommerce/my-reviews/my-reviews.component';
import { AiAssistantComponent } from './components/student/ecommerce/ai-assistant/ai-assistant.component';
import { AdminProductsComponent } from './components/admin/ecommerce/admin-products/admin-products.component';
import { AdminOrdersComponent } from './components/admin/ecommerce/admin-orders/admin-orders.component';
import { AdminPromotionsComponent } from './components/admin/ecommerce/admin-promotions/admin-promotions.component';
import { AdminReviewsComponent } from './components/admin/ecommerce/admin-reviews/admin-reviews.component';
import { AdminInventoryComponent } from './components/admin/ecommerce/admin-inventory/admin-inventory.component';
import { AssistantComponent } from './components/student/assistant/assistant.component';
import { AgendaLayoutComponent } from './components/student/agenda/agenda-layout/agenda-layout.component';
import { AgendaPageComponent } from './components/student/agenda/agenda-page/agenda-page.component';
import { TodosPageComponent } from './components/student/agenda/todos-page/todos-page.component';
import { NotificationsPageComponent } from './components/student/agenda/notifications-page/notifications-page.component';
import { EventService } from './services/agenda/event.service';
import { TodoService } from './services/agenda/todo.service';
import { AgendaNotificationService } from './services/agenda/agenda-notification.service';

registerLocaleData(localeFr);


@NgModule({
  declarations: [
    AppComponent,
    
    // Site Public
    HomeComponent,
    PreloaderComponent,
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    AboutComponent,
    WhyUsComponent,
    ProcessComponent,
    FeaturesComponent,
    TestimonialsComponent,
    VisionMissionComponent,
    AdvantagesComponent,
    CtaComponent,
    FaqComponent,
    ContactComponent,
    FooterComponent,
    
    // Auth
    AuthComponent,
    ResetPasswordComponent,
    CompleteProfileComponent,
    
    // Interface Étudiante
    StudentLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    StudentDashboardComponent,
    ProfileModalComponent,
    SettingsModalComponent,
    HelpModalComponent,
    
    // Interface Admin ✅ MODIFIER
    AdminLayoutComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    AdminDashboardComponent,
    UsersManagementComponent,
    SettingsComponent,
    HelpComponent,
    ProfileComponent,
    MarketplaceListComponent,
    MarketplaceDetailComponent,
    MarketplacePublishComponent,
    MyListingsComponent,
    MyFavoritesComponent,
    ToastComponent,
    AdminMarketplaceComponent,
    AdminReportsComponent,
    PromoteAdminComponent,
    CatalogComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    MyOrdersComponent,
    OrderDetailComponent,
    MyReviewsComponent,
    AiAssistantComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminPromotionsComponent,
    AdminReviewsComponent,
    AdminInventoryComponent,
    EcommerceMyFavoritesComponent,
    AssistantComponent,
    AssistantComponent,
    AgendaLayoutComponent,
    AgendaPageComponent,
    TodosPageComponent,
    NotificationsPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    UserService,
    ThemeService,
    AuthGuard,
    { provide: LOCALE_ID, useValue: 'fr' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    
    EventService,
    TodoService,
    AgendaNotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }