import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SnackbarData } from 'src/app/models/InternalDTOs';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public snackbarData: SnackbarData) { }

  ngOnInit(): void {
  }

  closeSnackbar() {
    this.snackbarData.snackbarRef.dismiss();
  }

}
