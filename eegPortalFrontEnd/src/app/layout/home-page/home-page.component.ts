import { Component, OnInit } from '@angular/core';
// import { routerTransition } from '../../router.animations';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

    ngOnInit() {console.log(" initiaing home page ");}

    constructor(private router: Router) {}

}
