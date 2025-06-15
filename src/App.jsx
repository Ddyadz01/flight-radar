import React, { useEffect, useState } from 'react';
import {MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";

import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./App.scss"


const createRotatedIcon = (heading) =>
    L.divIcon({
        className: '',
        html: `<img src="/plane-icon.png" style="transform: rotate(${heading}deg); width: 32px; height: 32px;" />`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });




const App = () => {
    const [planes, setPlanes] = useState([]);


    const plane = {
        icao24: 'f1e2a9',
        callsign: 'SU1856',
        origin_country: 'Russia',
        longitude: 40.8286,
        latitude: 47.8694,
        altitude: 10600,           // Высота в метрах
        velocity: 240,             // м/с ~ 864 км/ч
        heading: 170,              // Примерно южное направление
        vertical_rate: 0,          // Не набирает и не теряет высоту
        baro_altitude: 10600,
        geo_altitude: 10700,
        on_ground: false,
        time_position: 1718137500,
        last_contact: 1718137525,
        departure_airport: {
            code: 'UUWW',
            name: 'Vnukovo International Airport',
            city: 'Moscow',
            lat: 55.5915,
            lon: 37.2615,
        },
        arrival_airport: {
            code: 'UDYZ',
            name: 'Zvartnots International Airport',
            city: 'Yerevan',
            lat: 40.1473,
            lon: 44.3958,
        }
    };


    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const res = await axios.get('https://opensky-network.org/api/states/all');
                const states = res.data.states || [];
                const formattedPlanes = states
                    .filter((p) => p[5] !== null && p[6] !== null)
                    .map((p) => ({
                        icao24: p[0],
                        callsign: p[1]?.trim() || 'N/A',
                        origin_country: p[2],
                        longitude: p[5],
                        latitude: p[6],
                        altitude: p[7],
                        velocity: p[9],
                        heading: p[10],
                    }));

                setPlanes(formattedPlanes);
            } catch (err) {
                console.error('Ошибка получения данных самолётов', err);
            }
        };
        

        fetchPlanes();
        const interval = setInterval(fetchPlanes, 30000); // обновление каждые 10 сек
        return () => clearInterval(interval);
    }, []);
        const route = [
            [plane.departure_airport.lat, plane.departure_airport.lon],
            [plane.arrival_airport.lat, plane.arrival_airport.lon],
        ];
    return (
        <MapContainer  center={[50, 10]} zoom={5} style={{ height: '100vh', width: '100%', background: 'black' }}>


            {/*<Polyline positions={route} color="gray" weight={2} dashArray="1" />*/}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

            />


            <MarkerClusterGroup>
                {planes.map((plane) => (
                    <Marker
                        key={plane.icao24}
                        position={[plane.latitude, plane.longitude]}
                        icon={createRotatedIcon(plane.heading)}
                    >
                        <Popup>
                            <strong>{plane.callsign}</strong><br />
                            Страна: {plane.origin_country}<br />
                            Высота: {plane.altitude?.toFixed(0)} м<br />
                            Скорость: {plane.velocity?.toFixed(0)} м/с
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>


        </MapContainer>
    );
};

export default App;