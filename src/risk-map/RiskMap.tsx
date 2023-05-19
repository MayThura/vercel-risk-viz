'use client';
import React, {useState, useEffect} from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip
} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L, {LatLngExpression} from 'leaflet';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Data } from '../../types/types';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setData, setSelectedYear, setSelectedMarker } from '../../redux/reducers/dataReducer';

interface Cluster {
    "key": string,
    "member": Data[];
}

function generateColors(ratings: number[]): {[key: number]: string} {
    const colors: string[] = [];
  
    const uniqueColors: { [key: string]: string } = {};
    for (const rating of ratings) {
      let color;
      do {
        color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      } while (uniqueColors[color]);
      uniqueColors[color] = color;
      colors.push(color);
    }
  
    const ratingColorMap: {[key: number]: string} = {};
    ratings.forEach((rating, index) => {
      ratingColorMap[rating] = colors[index];
    });
  
    return ratingColorMap;
}

const RiskMap = () => {
    const [dataset, setDataset] = useState<Data[]>([]);
    const [years, setYears] = useState<string[]>([]);
    const [year, setYear] = useState("");
    const [selectedMarkers, setSelectedMarkers] = useState<JSX.Element[]>([]);
    const [uniqueColors, setUniqueColors] = useState<{[key: number]: string}>({});
    const [dataWithMoreProperties, setDataWithMoreProperties] = useState<Data[]>([]);
    const [updateMarkerFlag, setUpdateMarkerFlag] = useState(false);
    const [currMarker, setCurrMarker] = useState<Data>({"Asset Name": "", "Lat": 0, "Long": 0, "Business Category": "","Risk Rating": 0, "Risk Factors": {},
    "Year": 0, "color": "", "clicked": false});
    const [added, setAdded] = useState(false);
    const data = useSelector((state: RootState) => state.data.data);
    const dispatch = useDispatch();

    useEffect(() => {
        const storedData = localStorage.getItem('data');
        if (storedData === null) {
            fetch('/api/data')
            .then((response) => response.json())
            .then((data) => {
                dispatch(setData(data))
                localStorage.setItem('data', JSON.stringify(data));
            })
            .catch((error) => console.log(error));
        }
        else {
            setDataset(JSON.parse(storedData));
            dispatch(setData(JSON.parse(storedData)));
        }
        const storedMarker = localStorage.getItem('marker');
        if (storedMarker) {
            dispatch(setSelectedMarker(JSON.parse(storedMarker)));
        }
      }, []);

    useEffect(() => {
        if (data && data.length > 0) {
            setDataset(data);
        }
    }, [data]);

    useEffect(() => {
        if (dataset && dataset.length > 0) {
            var yearSet = new Set();
            var ratingSet = new Set();
            dataset.map(row => {
                yearSet.add(row["Year"].toString());
                ratingSet.add(row["Risk Rating"]);
            });
            var ratingArr: number[] = [...ratingSet] as number[];
            var colorArray: {[key: number]: string} = {};
            if (ratingArr.length > 0) {
                colorArray = generateColors(ratingArr);
            }
            setUniqueColors(colorArray);
            setYears([...yearSet] as string[]);
        }
    }, [dataset]);

    const addMorePropertiesToData = (data: Data[], uniqueColors: {[key: number]: string}) => {
        return data.map((item) => {
          const color = uniqueColors[item["Risk Rating"]];
          return {
            ...item,
            color: color,
            clicked: false
          };
        });
    };

    useEffect(() => {
        if (Object.keys(uniqueColors).length > 0) {
            const coloredData = addMorePropertiesToData(dataset, uniqueColors);
            const storedData = localStorage.getItem('data');
            if (storedData) {
                var parsedData = JSON.parse(storedData);
                if (parsedData[0] && Object.keys(parsedData[0]).findIndex(e => e === "color") === -1) {
                    if (coloredData.length > 0) {
                        setDataWithMoreProperties(coloredData);
                        localStorage.setItem('data', JSON.stringify(coloredData));
                    }
                }
                else {
                    setDataWithMoreProperties(parsedData);
                }
            }
            setAdded(!added);
        }
    }, [uniqueColors]);

    const createMarkers = (markerData: Data[]) => {
        var clusteredMarkers = markerData.map((row, id) => {
            var position = [row["Lat"], row["Long"]] as LatLngExpression;;

            var iconSettings = {
                mapIconUrl: '<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178"><path fill="{mapIconColor}" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/><circle fill="{mapIconColorInnerCircle}" cx="74" cy="75" r="61"/><circle fill="#FFF" cx="74" cy="75" r="{pinInnerCircleRadius}"/></svg>',
                mapIconColor: row["color"],
                mapIconColorInnerCircle: row["color"],
                pinInnerCircleRadius: 48
            };
            
            var markerIcon = L.divIcon({
                className: "leaflet-data-marker",
                html: L.Util.template(iconSettings.mapIconUrl, iconSettings),
                iconAnchor  : [12, 32],
                iconSize    : row["clicked"]? [33, 33]: [25,25],
                popupAnchor : [0, -28]
            });

            return (
                <Marker
                key={id}
                position={position}
                icon={markerIcon}
                eventHandlers={{click: (e) => { 
                    setCurrMarker(row);
                    setUpdateMarkerFlag(!updateMarkerFlag);
                }}}
                >
                <Tooltip sticky><b>{row["Asset Name"]}</b>, {row["Business Category"]}</Tooltip>
                </Marker>
            )
        });
        return clusteredMarkers;
    }

    useEffect(() => {
        dispatch(setSelectedYear(year));
        const yearlyData = dataWithMoreProperties.filter((row) => row["Year"] === parseInt(year));
        var dataSet = new Set();
        var clusterArr: Cluster[] = [];
        yearlyData.map((d, id) => {
            var key = d["Lat"] + "," + d["Long"];
            if (!dataSet.has(key)) {
                dataSet.add(key);
                var cluster: Cluster = {"key": key, "member": [d]};
                clusterArr.push(cluster);
            }
            else {
                var cluster: Cluster = clusterArr.find(c => c.key === key) as Cluster;
                cluster["member"].push(d);
            }
        });
        const allClusters = clusterArr.map((cluster, id) => {
            var clusteredMarkers = createMarkers(cluster["member"]);
            return (
                <MarkerClusterGroup key={id} spiderfyDistanceMultiplier={3}
                    showCoverageOnHover={true} spiderfyOnMaxZoom={true}> 
                    { clusteredMarkers }
                </MarkerClusterGroup>
            )
        });
        setSelectedMarkers(allClusters);
    }, [year, added]); 

    const updateData = () => {
        return dataWithMoreProperties.map((item) => {
            if (Object.entries(item).toString() === Object.entries(currMarker).toString()) {
                if (item.clicked) {
                    var intialValue = {"Asset Name": "", "Lat": 0, "Long": 0, "Business Category": "","Risk Rating": 0, "Risk Factors": {},
                    "Year": 0, "color": "", "clicked": false};
                    dispatch(setSelectedMarker(intialValue));
                    localStorage.setItem('marker', "");
                }
                else {
                    dispatch(setSelectedMarker(currMarker));
                    localStorage.setItem('marker', JSON.stringify(currMarker));
                }
                return {
                    ...item,
                    clicked: !item.clicked
                };
            }
            else {
                return {
                    ...item,
                    clicked: false
                };
            }
        });
    };

    useEffect(() => {
        const newData = updateData();
        if (newData && newData.length > 0) {
            setAdded(!added);
            setDataWithMoreProperties(newData);
            localStorage.setItem('data', JSON.stringify(newData));
        }
    }, [updateMarkerFlag]);
      
    useEffect(() => {
        if (year === "" && years.length > 0) {
            setYear(years[0]);
        }
    }, [years]);

    const handleChange = (value: string) => {
        setYear(value);
    };

    return (
        <div style={{backgroundColor: "white"}}>
        <Autocomplete
            disablePortal
            aria-label="year-combo-box"
            options={years}
            sx={{ width: 300, padding: "20px" }}
            value={year}
            onChange={(event, newValue) => handleChange(newValue as string)}
            renderInput={(params) => <TextField {...params} label="Year" />}
        />
        <MapContainer center={[47.867646, -97.409820]} zoom={4} scrollWheelZoom={true} 
        style={{height: "80%", width: "100%", position: "absolute"}}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            { selectedMarkers }
        </MapContainer>
        </div>
    )
}

export default RiskMap;