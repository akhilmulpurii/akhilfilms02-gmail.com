import React, { useState } from "react";
import ReactGlobe from "react-globe";
import { useEffect } from "react";
import _ from "lodash";
import { coordinatesByCountry } from "./coordinates_data";
import styled from "styled-components";
import "./App.css";
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

const countryApi =
  "https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php";

const worldAPI =
  "https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php";

function App() {
  const [markers, setMarkers] = useState([]);
  const [worldData, setWorldData] = useState(null);
  const [event, setEvent] = useState(null);
  const [details, setDetails] = useState(null);
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    async function fetchMarkerData(params) {
      try {
        const response = await fetch(countryApi, fetchParams).then(res =>
          res.json()
        );
        const worldDataRes = await fetch(worldAPI, fetchParams).then(res =>
          res.json()
        );
        if (!_.worldDataRes) {
          setWorldData(worldDataRes);
        }
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
    setDetails(marker);
  }
  function onDefocus(previousCoordinates, event) {
    setEvent({
      type: "DEFOCUS",
      previousCoordinates,
      pointerEventPosition: { x: event.clientX, y: event.clientY }
    });
    setDetails(null);
  }

  useEffect(() => {
    if (timer < 5) {
      setTimeout(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
  }, [timer]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {(!worldData || !markers.length) && (
        <div style={{ width: "100vw", height: "100vh" }}>
          <div class="loading">Loading&#8230;</div>
        </div>
      )}
      <header id="main-header" className="add-padding border-top-color2">
        {worldData && (
          <div className="container">
            <p className="text-center bold">COVID-19 COUNTRY BREAKDOWN</p>
            <div
              className="small"
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                width: "100vw"
              }}
            >
              <ListItem style={{ flexDirection: "column" }} marginBottom={0}>
                <ListKey white>Total Cases:</ListKey>
                <ListValue style={{ textAlign: "center" }} white>
                  {worldData.total_cases}
                </ListValue>
              </ListItem>
              <ListItem style={{ flexDirection: "column" }} marginBottom={0}>
                <ListKey white>Total Deaths:</ListKey>
                <ListValue style={{ textAlign: "center" }} white>
                  {worldData.total_deaths}
                </ListValue>
              </ListItem>
              <ListItem style={{ flexDirection: "column" }} marginBottom={0}>
                <ListKey white>Total Recovered:</ListKey>
                <ListValue style={{ textAlign: "center" }} white>
                  {worldData.total_recovered}
                </ListValue>
              </ListItem>
              <ListItem style={{ flexDirection: "column" }} marginBottom={0}>
                <ListKey white>New Cases:</ListKey>
                <ListValue style={{ textAlign: "center" }} white>
                  {worldData.new_cases}
                </ListValue>
              </ListItem>
              <ListItem style={{ flexDirection: "column" }} marginBottom={0}>
                <ListKey white>New Deaths:</ListKey>
                <ListValue style={{ textAlign: "center" }} white>
                  {worldData.new_deaths}
                </ListValue>
              </ListItem>
            </div>
          </div>
        )}
      </header>
      <div style={{ width: "100vw", height: "80vh" }}>
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
            getTooltipContent,
            enterEasingFunction: ["Bounce", "InOut"],
            exitAnimationDuration: 3000,
            exitEasingFunction: ["Cubic", "Out"]
          }}
          onClickMarker={onClickMarker}
          onDefocus={onDefocus}
        />
        {details ? (
          <CardContainer>
            <Card>
              <CardHeading>{details.country_name}</CardHeading>
              <List>
                <ListItem>
                  <ListKey>Total Cases:</ListKey>
                  <ListValue>{details.cases}</ListValue>
                </ListItem>
                <ListItem>
                  <ListKey>New Cases:</ListKey>
                  <ListValue>{details.new_cases}</ListValue>
                </ListItem>
                <ListItem>
                  <ListKey>Active Cases:</ListKey>
                  <ListValue>{details.active_cases}</ListValue>
                </ListItem>
                <ListItem>
                  <ListKey>Total Recovered:</ListKey>
                  <ListValue>{details.total_recovered}</ListValue>
                </ListItem>
                <ListItem>
                  <ListKey>Total Deaths:</ListKey>
                  <ListValue>{details.deaths}</ListValue>
                </ListItem>
                <ListItem marginBottom={0}>
                  <ListKey>New Deaths:</ListKey>
                  <ListValue>{details.new_deaths}</ListValue>
                </ListItem>
              </List>
            </Card>
          </CardContainer>
        ) : null}
        <footer id="main-footer" className="add-padding border-top-color2">
          <div className="container">
            <p className="text-center last">Built By Akhil Mulpuri.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const List = styled.ul`
  list-style: none;
  padding: 0px;
`;
const ListKey = styled.span`
  font-family: Montserrat, sans-serif;
  font-weight: 600;
  color: ${({ white }) => (white ? "white" : "black")};
`;
const ListValue = styled.span`
  font-family: Montserrat, sans-serif;
  color: ${({ white }) => (white ? "white" : "black")};
`;
const ListItem = styled.li`
  display: flex;
  margin-bottom: ${({ marginBottom }) => (marginBottom ? marginBottom : 10)};
  justify-content: space-between;
`;
const CardHeading = styled.h1`
  font-family: Montserrat, sans-serif;
  margin: 0;
`;

const CardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(-50%, -50%);
`;

const Card = styled.div`
  background-color: white;
  width: 30vw;
  max-height: 50vh;
  border-radius: 10px;
  padding: 25px;
`;

export default App;
