import React, { useEffect, useState } from 'react';
import MaterialReactTable from 'material-react-table';
import type { MRT_ColumnDef } from 'material-react-table'; 
import { Data } from '../../../../types/types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

export default function RiskTable() {
    const [yearlyData, setYearlyData] = useState<Data[]>([]);
    const [factors, setFactors] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [columns, setColumns] = useState<MRT_ColumnDef<Data>[]>([]);
    const data = useSelector((state: RootState) => state.data.data);
    const year = useSelector((state: RootState) => state.data.selectedYear);

    useEffect(() => {
        if (data && data.length > 0) {
            setYearlyData(data);
            var factorSet = new Set();
            var categorySet = new Set();
            data.map(row => {
                categorySet.add(row["Business Category"]);
                var riskFactors = JSON.parse(row["Risk Factors"].toString());
                if (Object.keys(riskFactors).length > 0) {
                    Object.keys(riskFactors).map(key => { 
                        factorSet.add(key);
                    });
                }
            });
            setFactors([...factorSet] as string[]);
            setCategories([...categorySet] as string[]);
        }
    }, [data]);

    useEffect(() => {
        setColumns([
            {
                accessorKey: 'Asset Name',
                header: 'Asset Name',
            },
            {
                accessorKey: 'Lat', 
                header: 'Latitude',
                enableColumnFilter: false
            },
            {
                accessorKey: 'Long', 
                header: 'Longitude',
                enableColumnFilter: false
            },
            {
                accessorKey: 'Business Category', 
                header: 'Business Category',
                filterVariant: 'select',
                filterSelectOptions: categories
            },
            {
                accessorKey: 'Risk Rating', 
                header: 'Risk Rating',
                filterVariant: 'range',
                filterFn: 'betweenInclusive'
            },
            {
                accessorKey: 'Risk Factors', 
                header: 'Risk Factors',
                filterVariant: 'multi-select',
                filterSelectOptions: factors,
                filterFn: (row: any, id: string, filterValue: string[]) => { 
                    var factorObj = JSON.parse(row.getValue(id).toString());
                    var factorArr = Object.keys(factorObj);
                    return filterValue.every(val => factorArr.includes(val) && factorObj[val] > 0);
                }
            },
            {
                accessorKey: 'Year', 
                header: 'Year',
                enableColumnFilter: false,
                enableSorting: false
            },
            ]);
    }, [factors]);

    useEffect(() => {
        if (data && data.length > 0) {
            const filteredData = data.filter(row => row["Year"] === parseInt(year));
            setYearlyData(filteredData);
        }
    }, [year]);

  return (
        <div style={{backgroundColor: "white"}}>
            <MaterialReactTable
                columns={columns}
                data={yearlyData}
                enableRowSelection={false}
                enableGlobalFilter={false}
            />
        </div>
  );
}