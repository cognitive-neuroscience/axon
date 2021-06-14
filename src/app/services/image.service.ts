import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable } from "rxjs";
import { take } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class ImageService {
    /**
     * The Image service programmatically takes in as an argument an array of paths to
     * local images. It then returns the images themselves in the form of blobs.
     *
     * This is done to preload images - in the past, we've had issues with image being
     * cached by the browser causing a noticable delay in the image popping up in on the screen.
     */

    constructor(private http: HttpClient) {}

    public loadImagesAsBlobs(imagePaths: string[]): Observable<Blob[]> {
        const getArray = imagePaths.map((path) => this.http.get(path, { responseType: "blob" }));
        // load up all of the get requests and sort them into the distinct ImageBlob objects, return true to oddball component when are done
        return forkJoin(getArray).pipe(take(1));
    }
}
