import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ReviewsComponent } from '../components/reviews/reviews.component';
import { QuoteBoxComponent } from '../components/quote-box/quote-box.component';
import { WhyChoseMeComponent } from '../components/why-chose-me/why-chose-me.component';
import { MaterialModule } from './material/material.module';
import { FooterComponent } from '../components/footer/footer.component';



@NgModule({
  declarations: [
    FooterComponent,
    NavbarComponent,
    ReviewsComponent,
    QuoteBoxComponent,
    WhyChoseMeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    ReviewsComponent,
    QuoteBoxComponent,
    WhyChoseMeComponent,
    MaterialModule,
    CommonModule
  ]
})
export class SharedModule { }
