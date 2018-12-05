import { Component, ElementRef, HostListener, OnInit, Renderer, ViewChild, ApplicationRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'dash-component',
  styleUrls: ['./dash.component.css'],
  templateUrl: './dash.component.html',
})

export class DashComponent implements OnInit {
  title = 'LA Cell Towers';
  lat = 33.7964477;
  lng = -118.0028257;
  height = 643;
  zoom = 11;
  hash = null;
  Math = Math;

  /*private defaultCar = {
    id: 'Jonny D.',
    label: 'Cat 785D',
    image: 'assets/car1.jpeg',
  };*/
  dangerZone = null;
  cellTowers: Marker[] = [];
  smallCellTowers: Marker[] = [];
  zones: any[] = [];
  cellTowerHash = {};
  smallCellTowerHash = {};

  toastHash = {};
  forceOpenedMarkerId = null;
  polygonInfoShown = false;
  // errors = {};

  constructor(private renderer: Renderer, private ref: ApplicationRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.onResize();

    const source = new EventSource('https://nd2.ccdevlabs.net/events/');
    source.onmessage = (e) => {
      this.hash = Math.round(Math.random() * 1e5);
      const data = JSON.parse(e.data);
      data.forEach(d => {
        if (d.type === 'cell tower power cut' || d.type === 'cell tower overload') {
          // this.errors[d.towerId] = d;
          if (d.level === 'ERROR') {
            const toast = this.toastr
              .error(`(#${d.towerId}): ${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 2e3,
                closeButton: true,
                tapToDismiss: false,
              });
            toast.onHidden.subscribe(() => {
              delete this.toastHash[d.towerId];
            });

            if (!this.toastHash[d.towerId]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                this.forceOpenedMarkerId = d.towerId;
              });
              this.toastHash[d.towerId] = subscription;
            }
          }

          if (d.level === 'WARNING') {
            const toast = this.toastr
              .warning(`(#${d.towerId}): ${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 2e3,
                closeButton: true,
                tapToDismiss: false,
              });
            toast.onHidden.subscribe(() => {
              delete this.toastHash[d.towerId];
            });

            if (!this.toastHash[d.towerId]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                this.forceOpenedMarkerId = d.towerId;
              });
              this.toastHash[d.towerId] = subscription;
            }
          }

          return;
        }

        if (d.type === 'cellTower') {
          const marker = this.cellTowerHash[d.id];
          const _marker = marker && this.cellTowers[marker.index];

          if (marker) {
            // console.log('[INFO] Marker position upd', marker);
            Object.assign(marker, d);
            Object.assign(_marker, d);
          } else {
            const length = this.cellTowers.push({
              ...d,
              affects: d.affects || [],
            });
            this.cellTowerHash[d.id] = {...d, index: length - 1};
          }
          return;
        }

        if (d.type === 'poleCell') {
          const marker = this.smallCellTowerHash[d.id];
          const _marker = marker && this.smallCellTowers[marker.index];

          if (marker) {
            // console.log('[INFO] Marker position upd', marker);
            Object.assign(marker, d);
            Object.assign(_marker, d);
          } else {
            const length = this.smallCellTowers.push({
              ...d,
              affects: d.affects || [],
            });
            this.smallCellTowerHash[d.id] = {...d, index: length - 1};
          }
          return;
        }

        if (d.type === 'Danger Zone' && !this.dangerZone) {
          this.dangerZone = d;
          return;
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
    return this.forceOpenedMarkerId === m.id;
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
interface Marker {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label?: string;
  type: string;
  image: string;
  draggable: boolean;
  affects: any[];
  driver: {
    fullName: string,
    photo: string,
  };
  iconUrl: string;
  driverStatus: string;
  carStatus: string;
  powerOutput: number;
  coolantTemp: number;
  fuelAmount: number;
  fuelTankCapacity: number;
  driverTemperature: number;
  driverHeartRate: number;
  driverBloodPressure1: number;
  driverBloodPressure2: number;
  driverShiftLength: number;
  status: string;
}

interface Coordinate {
  lat: number;
  lng: number;
  time: number;
}
