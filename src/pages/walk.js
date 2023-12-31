import React, { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import ThreejsOverlayView from "@ubilabs/threejs-overlay-view";
import { CatmullRomCurve3, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import fetchDirections from "../src/fetchDirections";
import Cookies from "js-cookie";

// Animating character
const clock = new THREE.Clock();
let mixer;
function animate() {
  requestAnimationFrame(animate);

  // Update the mixer on each frame
  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }

  // renderer.render(scene, camera);
}

const mapOptions = {
  mapId: Cookies.get("googleMapId"),
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 18,
  disableDefaultUI: true,
  heading: 25,
  tilt: 60,
};
/**
 * Set mid point between source and destaination lat and lng for camera
 */
const setMidPoint = ({ sourceCoords, destinationCoords }) => {
  mapOptions.center = {
    lat: (sourceCoords.lat + destinationCoords.lat) / 2,
    lng: (sourceCoords.lng + destinationCoords.lng) / 2,
  };
};

export default function App() {
  const [isSetup, setIsSetup] = useState(false); // Check if all details are filled from the form
  useEffect(() => {
    if (
      !Cookies.get("googleMapKey") ||
      !Cookies.get("googleMapId") ||
      !Cookies.get("originLocation") ||
      !Cookies.get("destinationLocation")
    ) {
      window.location.href = "/";
    } else {
      setIsSetup(true);
    }
  }, []);

  return (
    <Wrapper apiKey={Cookies.get("googleMapKey")}>
      {isSetup ? <MyMap /> : "Error: Setup is not done"}
    </Wrapper>
  );
}

function MyMap() {
  const [route, setRoute] = useState(null);
  const [map, setMap] = useState();
  const ref = useRef();

  useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
  }, []);

  return (
    <>
      <div ref={ref} id="map" />
      {map && <Directions setRoute={setRoute} />}
      {map && route && <Animate map={map} route={route} />}
    </>
  );
}

function Directions({ setRoute }) {
  const [origin] = useState(Cookies.get("originLocation"));
  const [destination] = useState(Cookies.get("destinationLocation"));

  useEffect(() => {
    fetchDirections(origin, destination, setRoute, setMidPoint);
  }, [origin, destination]);

  return (
    <div className="directions">
      <h2>Directions</h2>
      <h3>Origin</h3>
      <p>{origin}</p>
      <h3>Destination</h3>
      <p>{destination}</p>
    </div>
  );
}

let ANIMATION_MS = 10000;
const FRONT_VECTOR = new Vector3(0, -1, 0);

function Animate({ route, map }) {
  const overlayRef = useRef();
  const trackRef = useRef();
  const carRef = useRef();

  useEffect(() => {
    map.setCenter(route[Math.floor(route.length / 2)], 17);

    if (!overlayRef.current) {
      overlayRef.current = new ThreejsOverlayView(mapOptions.center);
      overlayRef.current.setMap(map);
    }

    const scene = overlayRef.current.getScene();
    const points = route.map((p) => overlayRef.current.latLngAltToVector3(p));
    const curve = new CatmullRomCurve3(points);
    calDistanceAndTime(curve)

    if (trackRef.current) {
      scene.remove(trackRef.current);
    }
    trackRef.current = createTrackFromCurve(curve);
    scene.add(trackRef.current);

    loadModel().then((model) => {
      if (carRef.current) {
        scene.remove(carRef.current);
      }
      carRef.current = model.group;
      scene.add(carRef.current);
      animate();
    });

    overlayRef.current.update = () => {
      trackRef.current.material.resolution.copy(
        overlayRef.current.getViewportSize()
      );

      if (carRef.current) {
        const progress = (performance.now() % ANIMATION_MS) / ANIMATION_MS;
        curve.getPointAt(progress, carRef.current.position);
        carRef.current.quaternion.setFromUnitVectors(
          FRONT_VECTOR,
          curve.getTangentAt(progress)
        );
        carRef.current.rotateX(Math.PI / 2);
      }

      overlayRef.current.requestRedraw();
    };

    return () => {
      scene.remove(trackRef.current);
      scene.remove(carRef.current);
    };
  }, [route]);
}

function createTrackFromCurve(curve) {
  const points = curve.getSpacedPoints(curve.points.length * 10);
  const positions = points.map((point) => point.toArray()).flat();

  return new Line2(
    new LineGeometry().setPositions(positions),
    new LineMaterial({
      color: 0xffb703,
      linewidth: 8,
    })
  );
}

async function loadModel() {
  const loader = new GLTFLoader();
  const object = await loader.loadAsync("/smurf/scene.gltf");
  const group = object.scene;
  group.scale.setScalar(25);

  if (object.animations && object.animations.length) {
    // Create an AnimationMixer for the group
    mixer = new THREE.AnimationMixer(group);

    // Play all the animations
    for (const animation of object.animations) {
      mixer.clipAction(animation).play();
    }
  }

  // Return the group and mixer
  return { group, mixer };
}

function calDistanceAndTime(curve) {
  // Assume 'curve' is your CatmullRomCurve3 object
  const points = curve.getPoints(); // Get an array of Vector3 points that make up the curve
  let totalDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += points[i].distanceTo(points[i + 1]);
  }

  // Calculate time to travel totalDistance at 1.4 m/s or 5km/h
  const timeInSeconds = totalDistance / 1.4;

  // Set ANIMATION_MS to time in milliseconds
  ANIMATION_MS = timeInSeconds * 1000;
}
