'use client'

import React, { useState, useEffect } from 'react';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tabs from '@mui/material/Tabs';
import dynamic from "next/dynamic";

const RiskMap = dynamic(() => import("@/risk-map/RiskMap"), {
    ssr: false
});

const RiskTable = dynamic(() => import("@/app/components/risk-table/RiskTable"), {
  ssr: false
});

const RiskGraph = dynamic(() => import("@/app/components/risk-graph/RiskGraph"), {
  ssr: false
});

export default function TabComponent() {
  const [value, setValue] = useState('map');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <TabContext value={value}>
        <Tabs centered sx={{backgroundColor: "white"}}
            value={value}
            onChange={handleChange}
            aria-label="risk-tabs"
        >
            <Tab value="map" label="Map" />
            <Tab value="table" label="Data Table" />
            <Tab value="graph" label="Line Graph" />
        </Tabs>
        <TabPanel value="map" sx={{p: 0}}><RiskMap /></TabPanel>
        <TabPanel value="table" sx={{p: 0}}><RiskTable /></TabPanel>
        <TabPanel value="graph" sx={{p: 0}}><RiskGraph /></TabPanel>
    </TabContext>
  );
}