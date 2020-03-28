import React, { useState } from "react";
import ReactGlobe from "react-globe";
import { useEffect } from "react";
import _ from "lodash";
import { coordinatesByCountry } from "./coordinates_data";

function getTooltipContent(marker) {
  return `Country: ${marker.country_name}
  (Total Cases: ${marker.value})`;
}

const fetchParams = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
    "x-rapidapi-key": "08b72cc734msh07843a3c6edd834p13712djsn74aadec0cdb2"
  }
};

const apiURL =
  "https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php";

function App() {
  const [markers, setMarkers] = useState([]);
  const [event, setEvent] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    async function fetchMarkerData(params) {
      try {
        const response = await fetch(apiURL, fetchParams).then(res =>
          res.json()
        );
        if (response?.countries_stat?.length) {
          const country_list = _.map(response.countries_stat, "country_name");
          const finalArray = _.map(country_list, (country, index) => {
            if (coordinatesByCountry.hasOwnProperty(country)) {
              let new_country = {
                ...response.countries_stat[index],
                coordinates: coordinatesByCountry[country],
                id: index,
                value: parseInt(
                  response?.countries_stat[index]?.cases?.replace(",", "")
                ),
                color: "rgba(150,0,0,0.5)"
              };
              return new_country;
            }
          });
          setMarkers(_.compact(finalArray));
        }
      } catch (error) {}
    }
    fetchMarkerData();
  }, []);
  function onClickMarker(marker, markerObject, event) {
    setEvent({
      type: "CLICK",
      marker,
      markerObjectID: markerObject.uuid,
      pointerEventPosition: { x: event.clientX, y: event.clientY }
    });
    setDetails(getTooltipContent(marker));
  }
  function onDefocus(previousCoordinates, event) {
    setEvent({
      type: "DEFOCUS",
      previousCoordinates,
      pointerEventPosition: { x: event.clientX, y: event.clientY }
    });
    setDetails(null);
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactGlobe
        markers={markers}
        globeOptions={{
          glowCoefficient: 0.1,
          glowColor: "rgb(3,152,244)",
          glowPower: 7,
          glowRadiusScale: 0.5,
          enableGlow: true,
          cloudsOpacity: 0.8,
          enableClouds: true
        }}
        markerOptions={{
          getTooltipContent
        }}
        onClickMarker={onClickMarker}
        onDefocus={onDefocus}
      />
    </div>
  );
}

export default App;
