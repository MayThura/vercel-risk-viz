import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabComponent from '@/app/components/TabComponent';

let wrapper: RenderResult;
describe('Tabs', () => {
    test('renders map tab', () => {
        wrapper = render(
            <TabComponent />
        )
        expect(wrapper.getByText("Map")).toBeInTheDocument();
    });
    test('renders table tab', () => {
        wrapper = render(
            <TabComponent />
        )
        expect(wrapper.getByText("Data Table")).toBeInTheDocument();
    });
    test('renders graph tab', () => {
        wrapper = render(
            <TabComponent />
        )
        expect(wrapper.getByText("Line Graph")).toBeInTheDocument();
    });
  })