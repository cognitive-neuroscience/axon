import { Component, OnInit } from "@angular/core";
import { take } from "rxjs/operators";
import { ImageService } from "../image.service";
import { LoaderService } from "./loader.service";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
    shouldShowLoader: boolean = false;

    loadingBlob: any;

    showLoader() {
        this.shouldShowLoader = true;
    }

    hideLoader() {
        this.shouldShowLoader = false;
    }

    private setImage(blob: Blob) {
        const fr = new FileReader();
        fr.addEventListener("load", () => {
            this.loadingBlob = fr.result;
        });
        fr.readAsDataURL(blob);
    }

    constructor(private loaderService: LoaderService, private imageService: ImageService) {
        this.imageService
            .loadImagesAsBlobs(["/assets/logo/lablogo.png"])
            .pipe(take(1))
            .subscribe((res) => {
                this.subscribeToLoader();
                this.setImage(res[0]);
            });
    }

    private subscribeToLoader() {
        this.loaderService.loader.subscribe((shouldLoad) => {
            if (shouldLoad) {
                this.showLoader();
            } else {
                this.hideLoader();
            }
        });
    }

    ngOnInit(): void {}
}
