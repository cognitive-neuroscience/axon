import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "replace",
})
export class ReplacePipe implements PipeTransform {
    private readonly REPLACEMENT_STR = "???";

    transform(textContent: string, replacementWith: string, shouldReplace: boolean): string {
        return shouldReplace ? textContent.replace(this.REPLACEMENT_STR, replacementWith) : textContent;
    }
}
