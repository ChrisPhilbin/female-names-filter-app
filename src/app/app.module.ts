import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ToastModule } from 'primeng/toast';
import { FooterComponent } from './footer/footer.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [AppComponent, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
