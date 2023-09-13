import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';

const modules = [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    DragDropModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTableModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    ClipboardModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatStepperModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatGridListModule,
];

@NgModule({
    declarations: [],
    imports: [CommonModule, modules],
    exports: [modules],
})
export class MaterialModule {}
