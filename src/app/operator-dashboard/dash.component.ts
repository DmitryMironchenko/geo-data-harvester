import { Component, ElementRef, HostListener, OnInit, Renderer, ViewChild, ApplicationRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'dash-component',
  styleUrls: ['./dash.component.css'],
  templateUrl: './dash.component.html',
})

export class DashComponent implements OnInit {
  title = 'Fortescue Metals Group Iron Ore Mine';
  lat = 50.161785;
  lng = -120.136131;
  height = 643;
  zoom = 20;
  hash = null;
  Math = Math;

  /*private defaultCar = {
    id: 'Jonny D.',
    label: 'Cat 785D',
    image: 'assets/car1.jpeg',
  };*/
  dangerZone = null;
  markers: CowMarker[] = [];
  markerHash = {};
  toastHash = {};
  forceOpenedMarkerId = null;
  polygonInfoShown = false;
  // errors = {};

  constructor(private renderer: Renderer, private ref: ApplicationRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.onResize();

    const source = new EventSource('http://localhost:3001/events/');
    source.onmessage = (e) => {
      this.hash = Math.round(Math.random() * 1e5);
      const data = JSON.parse(e.data);
      data.forEach(d => {
        if (!d) return;
        if (d.showAlert) {
          if (d.status === 'CRITICAL') {
            const toast = this.toastr
              .error(`${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 5e3,
                closeButton: true,
                tapToDismiss: false,
              });
            /*toast.onHidden.subscribe(() => {
              delete this.toastHash[d.id];
            });*/

            if (!this.toastHash[d.id]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                // console.log('[Info] toast tapped', d);
                this.forceOpenedMarkerId = d.cowId;
              });
              this.toastHash[d.id] = subscription;
            }
          }
          else if (d.status === 'WARNING') {
            const toast = this.toastr
              .warning(`${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 5e3,
                closeButton: true,
                tapToDismiss: false,
              });

            /*toast.onHidden.subscribe(() => {
              delete this.toastHash[d.id];
            });*/

            if (!this.toastHash[d.id]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                // console.log('[Info] toast tapped', d);
                this.forceOpenedMarkerId = d.cowId;
              });
              this.toastHash[d.id] = subscription;
            }
          }
          return;
        }

        if (d.type === 'car'
          || d.type === 'excavator'
          || d.type === 'pedestrian'
          || d.type === 'waterpoint'
          || d.type === 'cow') {
          const marker = this.markerHash[d.id];
          const _marker = marker && this.markers[marker.index];

          if (marker) {
            // console.log('[INFO] Marker position upd', marker);
            Object.assign(_marker, d);
            Object.assign(marker, d);
          } else {
            const length = this.markers.push({
              // ...this.defaultCar,
              ...d,
              npcId: d.id,
              affects: d.affects || [],
            });
            this.markerHash[d.id] = {...d, index: length - 1};
          }
        }

        if (d.type === 'Danger Zone' && !this.dangerZone) {
          this.dangerZone = d;
        }
      });

      this.ref.tick();
    };
  }

  @ViewChild('AgmMap')
  agmMap: any;

  @ViewChild('wrapper')
  wrapper: ElementRef;

  @HostListener('window:resize')
  onWindowResize() {
    this.onResize();
  }

  isInfoWindowOpened(m) {
    return this.forceOpenedMarkerId === m.npcId;
  }

  onResize() {
    // resize the container for the google map
    this.renderer.setElementStyle(
      this.wrapper.nativeElement, 'height',
      (window.innerHeight ) + 'px'
    );

    // recenters the map to the resized area.
    this.agmMap.triggerResize().then(() =>
      this.agmMap._mapsWrapper.setCenter({ lat: this.lat, lng: this.lng }));
  }

  polyClicked() {
    console.log('[INFO] polyClicked');
    this.polygonInfoShown = !this.polygonInfoShown;
  }
}

// just an interface for type safety.
interface CowMarker {
  id: number;
  type: string;
  status: string;
  statusLevel: number;
  affects: any;
  showAlert: Boolean;
  fullName: string;
  photo: string;
  age: number;
  temperature: number;
  heartRate: number;
  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  lat: number;
  lng: number;
}

interface WaterPointMarker {
  id: number;
  type: string;
  status: string;
  statusLevel: number;
  affects: any;
  showAlert: Boolean;
  photo: string;
  lat: number;
  lng: number;
}

interface Coordinate {
  lat: number;
  lng: number;
  time: number;
}
