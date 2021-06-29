import { Component, OnInit } from "@angular/core";
import { LoaderService } from "./loader.service";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
    shouldShowLoader: boolean = false;

    showLoader() {
        this.shouldShowLoader = true;
    }

    hideLoader() {
        this.shouldShowLoader = false;
    }

    constructor(private loaderService: LoaderService) {
        this.subscribeToLoader();
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
