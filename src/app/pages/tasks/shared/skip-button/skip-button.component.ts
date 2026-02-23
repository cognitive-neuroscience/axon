import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

    constructor(private confirmationService: ConfirmationService, private translateService: TranslateService) {}

    ngOnInit(): void {}

    handleSkip(): void {
        this.confirmationService
            .openConfirmationDialog(
                this.translateService.instant('skip-button.confirmation-dialog-title'),
                this.translateService.instant('skip-button.confirmation-dialog-message')
            )
            .pipe(take(1))
            .subscribe((ok) => {
                if (ok) this.shouldSkip.emit(true);
            });
    }
}
