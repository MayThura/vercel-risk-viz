import React, { useEffect, useState } from 'react';
import { Data } from '../../../../types/types';
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

Chart.register(CategoryScale);

interface DataSet {
    label: string; 
    data: number[];
}

interface ChartData {
    labels: number[]; 
    datasets: DataSet[];
}

interface AssetObjectType {
    [key: number]: string[]
}

interface FactorObjectType {
    [key: number]: {"factors": string[], "top": {[key: string]: number}}
}

export default function LineChart() {
    const [toggleValue, setToggleValue] = useState('location');
    const [graphText, setGraphText] = useState('Risk Rating Based on the Location');
    const [chartData, setChartData] = useState<ChartData>({labels: [], datasets: [{ label: 'Risk Rating Over Time', data: []}]});
    const [locations, setLocations] = useState<string[]>([]);
    const [assets, setAssets] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [location, setLocation] = useState("");
    const [asset, setAsset] = useState("");
    const [category, setCategory] = useState("");
    const [filteredData, setFilteredData] = useState<Data[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<AssetObjectType>({});
    const [selectedFactors, setSelectedFactors] = useState<FactorObjectType>({});
    const data = useSelector((state: RootState) => state.data.data);
    const marker = useSelector((state: RootState) => state.data.selectedMarker);

    useEffect(() => {
        if (data && data.length > 0) {
            var assetSet = new Set();
            var categorySet = new Set();
            var locationSet = new Set();
            data.map(row => {
                var loc = row["Lat"] + ", " + row["Long"];
                locationSet.add(loc);
                assetSet.add(row["Asset Name"]);
                categorySet.add(row["Business Category"]);
            });
            var locationArr: string[] = [];
            locationArr = [...locationSet] as string[];
            setLocation(locationArr[0]);
            setLocations(locationArr);
            var assetArr: string[] = []
            assetArr = [...assetSet] as string[];
            setAsset(assetArr[0]);
            setAssets(assetArr);
            var categoryArr: string[] = [];
            categoryArr = [...categorySet] as string[];
            setCategory(categoryArr[0]);
            setCategories(categoryArr);
        }
    }, [data]);

    useEffect(() => {
        if (marker && marker["Asset Name"] !== '') {
            setToggleValue("asset");
            setAsset(marker["Asset Name"]);
        }
    }, [marker]);

    useEffect(() => {
        if (toggleValue === "location") {
            setGraphText('Risk Rating Based on the Location');
            if (location) {
                var lat = parseFloat(location.split(',')[0].trim());
                var long = parseFloat(location.split(',')[1].trim());
                var assetObj: AssetObjectType = {};
                var factorObj: FactorObjectType = {};
                var dataArr = data.filter(row => { 
                    if (row["Lat"] === lat && row["Long"] == long) {
                        if (!assetObj[row["Year"]]) {
                            assetObj[row["Year"]] = [];
                        }
                        assetObj[row["Year"]].push(row["Asset Name"]);
                        var factors = JSON.parse(row["Risk Factors"].toString());
                        if (!factorObj[row["Year"]]) {
                            var temp = {"factors": [], "top": {"tempMax": 0}};
                            factorObj[row["Year"]] = temp;
                        }
                        Object.keys(factors).map(key => {
                            if (factors[key] > 0) {
                                factorObj[row["Year"]]["factors"].push(key);
                                var topKey = Object.keys(factorObj[row["Year"]]["top"])[0];
                                if (factors[key] > factorObj[row["Year"]]["top"][topKey]) {
                                    factorObj[row["Year"]]["top"] = {}
                                    factorObj[row["Year"]]["top"][key] = factors[key];
                                }
                            }
                        });
                    }
                    return row["Lat"] === lat && row["Long"] == long
                });
                setSelectedFactors(factorObj);
                setSelectedAssets(assetObj);
                setFilteredData(dataArr);
            }
        }
        else if (toggleValue === "asset") {
            setGraphText('Risk Rating Based on the Asset');
            if (asset) {
                var factorObj: FactorObjectType = {};
                var dataArr = data.filter(row => {
                    if (row["Asset Name"] === asset) {
                        var factors = JSON.parse(row["Risk Factors"].toString());
                        if (!factorObj[row["Year"]]) {
                            var temp = {"factors": [], "top": {"tempMax": 0}};
                            factorObj[row["Year"]] = temp;
                        }
                        Object.keys(factors).map(key => {
                            if (factors[key] > 0) {
                                factorObj[row["Year"]]["factors"].push(key);
                                var topKey = Object.keys(factorObj[row["Year"]]["top"])[0];
                                if (factors[key] > factorObj[row["Year"]]["top"][topKey]) {
                                    factorObj[row["Year"]]["top"] = {}
                                    factorObj[row["Year"]]["top"][key] = factors[key];
                                }
                            }
                        });
                    }
                    return row["Asset Name"] === asset
                });
                setSelectedFactors(factorObj);
                setFilteredData(dataArr);
            }
        }
        else if (toggleValue === "category") {
            setGraphText('Risk Rating Based on the Business Category');
            if (category) {
                var assetObj: AssetObjectType = {};
                var factorObj: FactorObjectType = {};
                var dataArr = data.filter(row => { 
                    if (row["Business Category"] === category) {
                        if (!assetObj[row["Year"]]) {
                            assetObj[row["Year"]] = [];
                        }
                        assetObj[row["Year"]].push(row["Asset Name"]);
                        var factors = JSON.parse(row["Risk Factors"].toString());
                        if (!factorObj[row["Year"]]) {
                            var temp = {"factors": [], "top": {"tempMax": 0}};
                            factorObj[row["Year"]] = temp;
                        }
                        Object.keys(factors).map(key => {
                            if (factors[key] > 0) {
                                factorObj[row["Year"]]["factors"].push(key);
                                var topKey = Object.keys(factorObj[row["Year"]]["top"])[0];
                                if (factors[key] > factorObj[row["Year"]]["top"][topKey]) {
                                    factorObj[row["Year"]]["top"] = {}
                                    factorObj[row["Year"]]["top"][key] = factors[key];
                                }
                            }
                        });
                    }
                    return row["Business Category"] === category 
                });
                setSelectedFactors(factorObj);
                setSelectedAssets(assetObj);
                setFilteredData(dataArr);
            }
        }
    }, [toggleValue, location, asset, category]);

    useEffect(() => {
        var rating: number[] = [];
        var ratingByYear: {[key: number]: number[]} = {2030: [0, 0], 2040: [0, 0], 2050: [0, 0], 2060: [0, 0], 2070: [0, 0]};
        filteredData.map(row => {
            const [yr, count] = ratingByYear[row["Year"]];
            ratingByYear[row["Year"]] = [yr + row["Risk Rating"], count + 1];
        });
        var years: number[] = [];
        Object.keys(ratingByYear).map(k => years.push(parseInt(k)));
        Object.values(ratingByYear).map(r => rating.push(r[0]/r[1]));
        const graphData: ChartData = {labels: years, datasets: [{ label: 'Risk Rating Over Time', data: rating}]};
        setChartData(graphData);
    }, [filteredData]);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
        setToggleValue(newValue);
    };

    const handleChangedLocation = (event: SelectChangeEvent) => {
        setLocation(event.target.value);
    };

    const handleChangedAsset = (event: SelectChangeEvent) => {
        setAsset(event.target.value);
    };

    const handleChangedCategory = (event: SelectChangeEvent) => {
        setCategory(event.target.value);
    };

    const CustomTooltip = (context: any) => {
        let tooltipEl = document.getElementById('chartjs-tooltip');
    
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
        }
    
        const tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
        }

        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }
    
        function getBody(bodyItem: any) {
            return bodyItem.lines;
        }
    
        if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map(getBody);
    
            let innerHtml = '<thead>';

            var title = titleLines[0];
            var assetValues: string[] = [];
            var factorValues: string[] = [];
            var topFactor = {};
            if (toggleValue === 'location' || toggleValue === 'category') {
                assetValues = [...new Set(selectedAssets[parseInt(title)])] as string[];
            }
            else if (toggleValue === 'asset') {
                assetValues = [asset];
            }
            factorValues = [...new Set(selectedFactors[parseInt(title)]["factors"])] as string[];
            topFactor = JSON.stringify(selectedFactors[parseInt(title)]["top"]);
    
            bodyLines.forEach(function(body: any) {
                let rating = body.toString().split(':')[1].trim();
                let style = 'background:' + "#ffffff";
                style += '; border-color:' + "#000000";
                style += '; border-width: 1px';
                style += '; border-radius: 10px';
                style += '; color:' + "#000000";
                style += '; font-size:' + "11px";
                style += '; padding: 5px';
                var div = '<div style="' + style + '"><span><b>Year: </b>' + title + '</span><br/><span><b>Average Risk Rating Over Time: </b>' + rating + 
                '</span><br/><span><b>Top Risk Factor: </b>' + topFactor + '</span><br/><span><b>Risk Factors: </b>' + factorValues + '</span><br/><span><b>Assets: </b>' + assetValues + '</span></div>';
                innerHtml += '<tr><td>' + div + '</td></tr>';
            });
            innerHtml += '</tbody>';
    
            let tableRoot = tooltipEl.querySelector('table');
            tableRoot!.innerHTML = innerHtml;
        }
    
        const position = context.chart.canvas.getBoundingClientRect();
    
        tooltipEl.style.opacity = '1';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
        tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
        tooltipEl.style.pointerEvents = 'none';
    }

    return (
        <div style={{backgroundColor: "white", height: "100%", padding: "40px"}}>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around", padding: "30px"}}>
                <ToggleButtonGroup
                    color="primary"
                    value={toggleValue}
                    exclusive
                    onChange={handleChange}
                    aria-label="selection"
                    >
                    <ToggleButton value="location">Location</ToggleButton>
                    <ToggleButton value="asset">Asset</ToggleButton>
                    <ToggleButton value="category">Business</ToggleButton>
                </ToggleButtonGroup>
                {toggleValue === "location" ? 
                    <Select
                        id="locations"
                        value={location}
                        onChange={handleChangedLocation}
                    >
                        {locations.map((item, id) => {
                            return <MenuItem key={id} value={item}>{item}</MenuItem>
                        })}
                    </Select> : toggleValue === "asset" ?
                    <Select
                        id="assets"
                        value={asset}
                        onChange={handleChangedAsset}
                    >
                        {assets.map((item, id) => {
                            return <MenuItem key={id} value={item}>{item}</MenuItem>
                        })}
                    </Select> : toggleValue === "category" ?
                    <Select
                        id="categories"
                        value={category}
                        onChange={handleChangedCategory}
                    >
                        {categories.map((item, id) => {
                            return <MenuItem key={id} value={item}>{item}</MenuItem>
                        })}
                    </Select> : null}
            </div>
            <Line
                data={chartData}
                options={{
                    plugins: {
                        title: {
                            display: true,
                            text: graphText,
                            font: {
                                size: 18
                            }
                        },
                        legend: {
                            display: true
                        },
                        tooltip: {
                            external: CustomTooltip,
                            enabled: false,
                            displayColors: false,
                        }
                    }
                }}
            />
        </div>
    );
}