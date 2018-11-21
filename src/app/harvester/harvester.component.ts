import { Component, ElementRef, HostListener, OnInit, Renderer, ViewChild } from '@angular/core';
import { MouseEvent } from '@agm/core';

@Component({
  selector: 'harvester',
  styleUrls: ['./harvester.component.css'],
  templateUrl: './harvester.component.html',
})
export class HarvesterComponent implements OnInit {
  title = 'Fortescue Metals Group Iron Ore Mine';

  lat = -22.3269188;
  lng = 119.4059056;
  height = 643;
  zoom = 18;

  garageLat = -22.326312;
  garageLng = 119.407413;
  startTime = 0;
  isRecording = false;

  @ViewChild('AgmMap')
  agmMap: any;

  @ViewChild('wrapper')
  wrapper: ElementRef;

  markers: Marker[] = [
    <Marker> {
      id: 'Jonny D.',
      label: 'Cat 785D',
      image: 'assets/car1.jpeg',
      draggable: true,
      lat: this.garageLat,
      lng: this.garageLng,
    },
  ];

  points: Coordinate[] = [];

  constructor(private renderer: Renderer) {}

  ngOnInit() {
    this.onResize();
  }

  mapClicked($event: MouseEvent) {
    return;
  }

  markerClicked(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`);
  }

  markerDragEnd(m: Marker, $event: MouseEvent) {
    console.log('dragEnd', m, $event, this.isRecording);

    if (!this.isRecording) {
      this.points = [];
      return;
    }
    const { coords: { lat, lng} } = $event;
    this.points.push({
      lat,
      lng,
      time: Date.now() - this.startTime,
    });
  }

  startStopClicked() {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      this.startTime = Date.now();
      this.points = [{
        lat: this.markers[0].lat,
        lng: this.markers[0].lng,
        time: this.startTime,
      }];
    }
  }

  saveClicked() {
    const element: HTMLElement = document.createElement('a');
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.points))}`)
    element.setAttribute('download', 'Route.json');
    const event = new MouseEvent('click');
    element.dispatchEvent(event);

    this.resetClicked();
  }

  resetClicked() {
    this.isRecording = false;
    this.points = [];
    this.markers = [
      <Marker> {
        id: 'Jonny D.',
        label: 'Cat 785D',
        image: 'assets/car1.jpeg',
        draggable: true,
        lat: this.garageLat,
        lng: this.garageLng,
      },
    ];
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.onResize();
  }

  onResize() {
    // resize the container for the google map
    this.renderer.setElementStyle(
      this.wrapper.nativeElement, 'height',
      (window.innerHeight ) + 'px'
    );

    // recenters the map to the resized area.
    this.agmMap.triggerResize().then(() =>
      this.agmMap._mapsWrapper.setCenter({lat: this.lat, lng: this.lng}));
  }
}

// just an interface for type safety.
interface Marker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  image: string;
  draggable: boolean;
}

interface Coordinate {
  lat: number;
  lng: number;
  time: number;
}
