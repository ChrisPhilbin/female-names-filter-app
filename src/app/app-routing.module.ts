import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProspectNamesFilterComponent } from './components/prospect-names-filter/prospect-names-filter.component';
import { RecapsGeneratorComponent } from './components/recaps-generator/recaps-generator.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'names-filter',
    component: ProspectNamesFilterComponent,
  },
  {
    path: 'recap-generator',
    component: RecapsGeneratorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
