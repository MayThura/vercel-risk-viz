'use client'
import TabComponent from "./components/TabComponent";
import { Provider } from 'react-redux';
import store from "../../redux/store";

export default function Home() {
  
  return (
    <Provider store={store}>
      <TabComponent />
    </Provider>
  )
}