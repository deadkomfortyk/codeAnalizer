import React, {useEffect, useRef, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup, useMap} from "react-leaflet";
import 'leaflet-control-geocoder';
import '../styles/CustomGeocoder.scss';
import L from 'leaflet';

L.Icon.Default.imagePath = "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/";
function MapComponentMark({ onMapClick, onSearchCriteriaChange, searchCriteria }) {
    const [markerPosition, setMarkerPosition] = useState([50.450001, 30.523333]);
    const zoomControlRef = useRef(null);
    const geocoderControlRef = useRef(null);
    const markerRef = useRef(null); // useRef для контролю маркера


    const MapEvents = () => {
        const map = useMap();

        useEffect(() => {
            map.zoomControl.remove();
            if (!zoomControlRef.current) {
                zoomControlRef.current = L.control.zoom({ position: 'bottomright' }).addTo(map);
            }

            if (searchCriteria.lat && searchCriteria.long && map) {
                const lat = parseFloat(searchCriteria.lat);
                const long = parseFloat(searchCriteria.long);

                if (!isNaN(lat) && !isNaN(long)) {
                    const newMarkerPosition = [lat, long];
                    map.setView(newMarkerPosition);
                    if (markerRef.current) {
                        markerRef.current.setLatLng(newMarkerPosition);
                    }
                }
            }
            if (!geocoderControlRef.current) {
                const geocoder = L.Control.geocoder({
                    placeholder: 'Пошук...',
                    position: 'topright',
                    defaultMarkGeocode: false
                }).on('markgeocode', function(e) {
                    const latlng = e.geocode.center;
                    setMarkerPosition(latlng);
                    if (markerRef.current) {
                        markerRef.current.setLatLng(latlng);
                        map.setView(latlng, map.getZoom());
                    }
                    onSearchCriteriaChange({
                        lat: latlng.lat.toFixed(6),
                        long: latlng.lng.toFixed(6)
                    });
                }).addTo(map);
                geocoderControlRef.current = geocoder;
            }
            const handleClick = (e) => {
                const newMarkerPosition = e.latlng;
                setMarkerPosition(newMarkerPosition);
                if (onMapClick) {
                    onMapClick(newMarkerPosition);
                }
                if (markerRef.current) {
                    markerRef.current.setLatLng(newMarkerPosition);
                }
            };

            map.on('click', handleClick);

            return () => {
                map.off('click', handleClick);
                if (zoomControlRef.current) {
                    map.removeControl(zoomControlRef.current);
                    zoomControlRef.current = null;
                }
                if (geocoderControlRef.current) {
                    map.removeControl(geocoderControlRef.current);
                    geocoderControlRef.current = null;
                }
            };
        }, [map]);

        return null;
    };

    return (
        <MapContainer center={markerPosition} zoom={10} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={markerPosition} ref={markerRef}>
                <Popup>Coordinates: {markerPosition.toString()}</Popup>
            </Marker>
            <MapEvents />
        </MapContainer>
    );
}

export default MapComponentMark;