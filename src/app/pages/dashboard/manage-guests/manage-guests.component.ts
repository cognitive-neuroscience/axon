import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/Login';
import { GuestsService } from '../../../services/guests.service';

@Component({
  selector: 'app-manage-guests',
  templateUrl: './manage-guests.component.html',
  styleUrls: ['./manage-guests.component.scss']
})
export class ManageGuestsComponent implements OnInit {

  constructor(private guestsService: GuestsService) { }

  guests: Observable<User[]>;

  displayedColumnsForGuests = ['email', 'password', 'action'];

  ngOnInit(): void {
    this.guests = this.guestsService.guests;
    this.guestsService.updateGuests();
  }

}
