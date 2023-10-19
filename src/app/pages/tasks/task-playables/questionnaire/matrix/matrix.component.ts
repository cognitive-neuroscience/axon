import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    UntypedFormControl,
    UntypedFormGroup,
    ValidationErrors,
    Validator,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { getTextForLang } from 'src/app/common/commonMethods';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { SupportedLangs } from 'src/app/models/enums';
import { IMatrix, TConditional, TOption } from '../models';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: MatrixComponent },
        { provide: NG_VALIDATORS, multi: true, useExisting: MatrixComponent },
    ],
})
export class MatrixComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
    subs: Subscription[] = [];
    matrixForm: UntypedFormGroup;
    matrixOptions: TOption[] = [];

    @Input() question: IMatrix;

    private _formControlState: {
        dependentControlsList: (Pick<TConditional, 'doConditional'> & { controlAffectedKey: string })[];
        originalValidators: ValidatorFn[];
        state: { options: TOption[] };
    };

    @Input() set formControlState(val: {
        dependentControlsList: (Pick<TConditional, 'doConditional'> & { controlAffectedKey: string })[];
        originalValidators: ValidatorFn[];
        state: { options: TOption[] };
    }) {
        if (!this.matrixForm || !this.question) return;
        this.matrixOptions = (this.question.options || []).length > 0 ? this.question.options : val.state.options || [];

        Object.keys(this.matrixForm.controls).forEach((control) => {
            if (!this.matrixOptions.some((x) => this.getControlName(this.question.key, x.label) === control)) {
                // remove the control if it does not exist in our options
                this.matrixForm.removeControl(control);
            }
        });

        const isRequired = this.question.validation?.required || false;
        const validators = isRequired ? [Validators.required] : [];
        this.matrixOptions.forEach((option) => {
            this.matrixForm.addControl(
                this.getControlName(this.question.key, option.label),
                new UntypedFormControl('', validators)
            );
        });
        this._formControlState = val;
    }

    get formControlState() {
        return this._formControlState;
    }

    get legend() {
        return this.question?.legend || [];
    }
    get legendTitle() {
        return this.question?.legendTitle || '';
    }

    getControlName(parentKey: string, controlName: string | ITranslationText) {
        let key = '';
        if (typeof controlName === 'string') {
            key = controlName.toLocaleLowerCase().replace(/ /g, '_');
        } else {
            key = controlName.en.toLocaleLowerCase().replace(/ /g, '_');
        }
        return `${parentKey}_${key}`;
    }

    onTouched: () => void = () => {};

    constructor(private translateService: TranslateService) {
        this.matrixForm = new UntypedFormGroup({});
        this.subs = [];
    }

    ngOnInit(): void {
        const isRequired = this.question.validation?.required || false;
        const validators = isRequired ? [Validators.required] : [];
        this.matrixOptions =
            (this.question.options || []).length > 0
                ? this.question.options
                : this.formControlState?.state?.options || [];
        this.matrixOptions.forEach((option) => {
            this.matrixForm.addControl(
                this.getControlName(this.question.key, option.label),
                new UntypedFormControl('', validators)
            );
        });
    }

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    validate(control: AbstractControl<any, any>): ValidationErrors {
        if (this.matrixForm.valid) {
            return null;
        } else {
            const errors = {};
            Object.keys(this.matrixForm.controls).forEach((controlName) => {
                const controlErrors = this.matrixForm.controls[controlName].errors;
                if (controlErrors) {
                    errors[controlName] = controlErrors;
                }
            });
            return errors;
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.matrixForm.setValue(obj);
        }
    }
    registerOnChange(fn: any): void {
        const sub = this.matrixForm.valueChanges.subscribe(fn);
        this.subs.push(sub);
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.matrixForm.disable();
        } else {
            this.matrixForm.enable();
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }
}
