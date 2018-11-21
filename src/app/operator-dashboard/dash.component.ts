import { Component, ElementRef, HostListener, OnInit, Renderer, ViewChild, ApplicationRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'dash-component',
  styleUrls: ['./dash.component.css'],
  templateUrl: './dash.component.html',
})

export class DashComponent implements OnInit {
  title = 'Fortescue Metals Group Iron Ore Mine';
  lat = -22.3269188;
  lng = 119.4059056;
  height = 643;
  zoom = 15;
  hash = null;
  Math = Math;

  /*private defaultCar = {
    id: 'Jonny D.',
    label: 'Cat 785D',
    image: 'assets/car1.jpeg',
  };*/
  dangerZone = null;
  markers: Marker[] = [];
  markerHash = {};
  toastHash = {};
  forceOpenedMarkerId = null;
  polygonInfoShown = false;
  // errors = {};

  constructor(private renderer: Renderer, private ref: ApplicationRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.onResize();

    const source = new EventSource('http://10.0.0.134:3001/events/');
    source.onmessage = (e) => {
      this.hash = Math.round(Math.random() * 1e5);
      const data = JSON.parse(e.data);
      data.forEach(d => {
        if (d.type === 'car breakdown'
          || d.type === 'driver blood pressure is not normal'
          || d.type === 'driver got tired'
          || d.type === 'unit violates zone restrictions') {
          // this.errors[d.id] = d;

          if (d.level === 'ERROR' || d.driverStatus === 'CRITICAL') {
            const toast = this.toastr
              .error(`(#${d.carId}): ${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 2e3,
                closeButton: true,
                tapToDismiss: false,
              });
            /*toast.onHidden.subscribe(() => {
              delete this.toastHash[d.id];
            });*/

            if (!this.toastHash[d.id]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                // console.log('[Info] toast tapped', d);
                this.forceOpenedMarkerId = d.carId;
              });
              this.toastHash[d.id] = subscription;
            }
          } else if (d.level === 'WARNING') {
            const toast = this.toastr
              .warning(`(#${d.carId}): ${d.description}`, d.title, {
                // progressBar: true,
                timeOut: 2e3,
                closeButton: true,
                tapToDismiss: false,
              });

            /*toast.onHidden.subscribe(() => {
              delete this.toastHash[d.id];
            });*/

            if (!this.toastHash[d.id]) {
              const subscription = toast.onTap.subscribe((foo: any) => {
                // console.log('[Info] toast tapped', d);
                this.forceOpenedMarkerId = d.carId;
              });
              this.toastHash[d.id] = subscription;
            }
          }
          return;
        }

        if (d.type === 'car' || d.type === 'excavator' || d.type === 'pedestrian') {
          const marker = this.markerHash[d.id];
          const _marker = marker && this.markers[marker.index];

          if (marker) {
            // console.log('[INFO] Marker position upd', marker);
            marker.lat = _marker.lat = d.lat;
            marker.lng = _marker.lng = d.lng;
            marker.fuelAmount = _marker.fuelAmount = d.fuelAmount;
            marker.coolantTemp = _marker.coolantTemp = d.coolantTemp;
            marker.powerOutput = _marker.powerOutput = d.powerOutput;
            marker.affects = _marker.affects = d.affects || [];
            marker.driverTemperature = _marker.driverTemperature = d.driverTemperature;
            marker.driverHeartRate = _marker.driverHeartRate = d.driverHeartRate;
            marker.driverBloodPressure1 = _marker.driverBloodPressure1 = d.driverBloodPressure1;
            marker.driverBloodPressure2 = _marker.driverBloodPressure2 = d.driverBloodPressure2;
            marker.driverShiftLength = _marker.driverShiftLength = d.driverShiftLength;
            marker.driverStatus = _marker.driverStatus = d.driverStatus;
            marker.carStatus = _marker.carStatus = d.carStatus;
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
interface Marker {
  id: string;
  lat: number;
  lng: number;
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
}

interface Coordinate {
  lat: number;
  lng: number;
  time: number;
}
