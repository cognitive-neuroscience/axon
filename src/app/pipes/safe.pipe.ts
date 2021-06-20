import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Pipe({
    name: "safe_resource",
})
export class SafeResoucePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
