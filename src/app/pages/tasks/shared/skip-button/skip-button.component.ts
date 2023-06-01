import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { mergeMap, take } from 'rxjs/operators';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
    selector: 'app-skip-button',
    templateUrl: './skip-button.component.html',
    styleUrls: ['./skip-button.component.scss'],
})
export class SkipButtonComponent implements OnInit {
    @Input()
    isVisible: boolean;

    @Output()
    shouldSkip: EventEmitter<boolean> = new EventEmitter();

    constructor(private confirmationService: ConfirmationService, private loaderService: LoaderService) {}

    ngOnInit(): void {}

    handleSkip(): void {
        this.confirmationService
            .openConfirmationDialog(
                'Are you sure you want to skip this task?',
                'Once you skip, you will be unable to do this task again.'
            )
            .pipe(take(1))
            .subscribe((ok) => {
                if (ok) this.shouldSkip.emit(true);
            });
    }
}
