import { Component, OnInit } from '@angular/core';
import { OverlayData } from '../../../../models/overlayData';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {AppSettings} from '../../../../app.settings';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  public overlayData : Observable<OverlayData>;
  public getOverlayDataUrl = AppSettings.BASE_URL + "/eegPortalApp/getOverlayData";

  constructor(private  httpClient:HttpClient) { }

  ngOnInit() {
    this.overlayData = this.httpClient.get<OverlayData>(this.getOverlayDataUrl);
  }

}
