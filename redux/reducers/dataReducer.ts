import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Data } from '../../types/types';
import { RootState } from './main';

interface DataState {
  data: Data[];
  selectedYear: string;
  selectedMarker: Data;
}

const initialState: DataState = {
  data: [],
  selectedYear: "",
  selectedMarker: {"Asset Name": "", "Lat": 0, "Long": 0, "Business Category": "","Risk Rating": 0, "Risk Factors": {},
  "Year": 0, "color": "", "clicked": false}
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<Data[]>) => {
      state.data = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload;
    },
    setSelectedMarker: (state, action: PayloadAction<Data>) => {
      state.selectedMarker = action.payload;
    }
  },
});

export const { setData, setSelectedYear, setSelectedMarker } = dataSlice.actions;

export const selectData = (state: RootState) => state.data;

export default dataSlice.reducer;
