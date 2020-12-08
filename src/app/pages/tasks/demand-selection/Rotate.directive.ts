import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[rotate]'
})
export class RotateDirective implements OnInit {
    @Input() rotation: number;

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    }
    
    ngOnInit() {
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `rotate(${this.rotation}deg)`)
        this.renderer.setStyle(this.elementRef.nativeElement, '-webkit-transform', `rotate(${this.rotation}deg)`)
        this.renderer.setStyle(this.elementRef.nativeElement, '-moz-transform', `rotate(${this.rotation}deg)`)
        this.renderer.setStyle(this.elementRef.nativeElement, '-ms-transform', `rotate(${this.rotation}deg)`)
        this.renderer.setStyle(this.elementRef.nativeElement, '-o-transform', `rotate(${this.rotation}deg)`)
    }
}
