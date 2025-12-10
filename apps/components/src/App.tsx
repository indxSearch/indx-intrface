import { Routes, Route, Link } from 'react-router-dom';
import Home from './page';
import Nav from './Nav';
import styles from './page.module.css';

// Import all component pages
import ButtonPage from './button/page';
import CheckboxPage from './checkbox/page';
import InputFieldPage from './input-field/page';
import RadioButtonPage from './radio-button/page';
import SearchFieldPage from './search-field/page';
import SelectPage from './select/page';
import SliderPage from './slider/page';
import ToggleSwitchPage from './toggle-switch/page';
import PopoverPage from './popover/page';
import BasePage from './base/page';
import FilterPanelBasePage from './filter-panel-base/page';
import IconsPage from './icons/page';
import SearchInputPage from './search-input/page';
import ValueFilterPanelPage from './value-filter-panel/page';
import RangeFilterPanelPage from './range-filter-panel/page';
import SortByPanelPage from './sort-by-panel/page';
import ActiveFiltersPanelPage from './active-filters-panel/page';
import TablePage from './table/page';
import CursorsPage from './cursors/page';
import PatternsPage from './patterns/page';

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/button" element={<ButtonPage />} />
        <Route path="/checkbox" element={<CheckboxPage />} />
        <Route path="/input-field" element={<InputFieldPage />} />
        <Route path="/radio-button" element={<RadioButtonPage />} />
        <Route path="/search-field" element={<SearchFieldPage />} />
        <Route path="/select" element={<SelectPage />} />
        <Route path="/slider" element={<SliderPage />} />
        <Route path="/toggle-switch" element={<ToggleSwitchPage />} />
        <Route path="/popover" element={<PopoverPage />} />
        <Route path="/base" element={<BasePage />} />
        <Route path="/filter-panel-base" element={<FilterPanelBasePage />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/icons" element={<IconsPage />} />
        <Route path="/search-input" element={<SearchInputPage />} />
        <Route path="/value-filter-panel" element={<ValueFilterPanelPage />} />
        <Route path="/range-filter-panel" element={<RangeFilterPanelPage />} />
        <Route path="/sort-by-panel" element={<SortByPanelPage />} />
        <Route path="/active-filters-panel" element={<ActiveFiltersPanelPage />} />
        <Route path="/cursors" element={<CursorsPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
      </Routes>
    </>
  );
}
