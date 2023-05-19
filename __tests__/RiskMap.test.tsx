import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskMap from '@/risk-map/RiskMap';

let wrapper: RenderResult;
describe('Tabs', () => {
    test('renders map', () => {
        wrapper = render(
            <RiskMap />
        )
        expect(wrapper.getByLabelText("year-combo-box")).toBeInTheDocument();
    });
})