import React, { useState } from "react";
import styles from './SearchSettingsPanel.module.css';
import { useSearchContext } from '../context/SearchContext';
import { FilterPanelBase } from '@indxsearch/systm';
import { InputField, ToggleSwitch, Button, Slider } from '@indxsearch/systm';
import { ArrowRight, ArrowDown } from "@indxsearch/pixl";

export function SearchSettingsPanel() {
  const {
    state: { searchSettings },
    setSearchSettings
  } = useSearchContext();

  const [showCoverageSetup, setShowCoverageSetup] = useState(false);

  // Number field handler for top-level searchSettings fields
  const handleNumberChange = (field: keyof typeof searchSettings, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setSearchSettings({
        [field]: parsed
      });
    }
  };

  // Toggle handler for top-level boolean searchSettings fields
  const handleToggle = (field: keyof typeof searchSettings, value: boolean) => {
    setSearchSettings({
      [field]: value
    });
  };

  // Number field handler for coverageSetup fields
  const handleCoverageSetupNumberChange = (field: keyof typeof searchSettings.coverageSetup, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setSearchSettings({
        coverageSetup: {
          ...searchSettings.coverageSetup,
          [field]: parsed
        }
      });
    }
  };

  // Toggle handler for coverageSetup boolean fields
  const handleCoverageSetupToggle = (field: keyof typeof searchSettings.coverageSetup, value: boolean) => {
    setSearchSettings({
      coverageSetup: {
        ...searchSettings.coverageSetup,
        [field]: value
      }
    });
  };

  return (
    <FilterPanelBase collapsed={true} title="Settings">
      <ul className={styles.list}>
        <li>
          <InputField
            label="Max Results"
            type="number"
            value={searchSettings.maxNumberOfRecordsToReturn.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('maxNumberOfRecordsToReturn', e.target.value)}
          />
        </li>
        <li>
          <InputField
            label="Coverage Depth"
            type="number"
            value={searchSettings.coverageDepth.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('coverageDepth', e.target.value)}
          />
        </li>
        <li>
            <InputField
                label="Minimum Score"
                type="number"
                value={searchSettings.minimumScore.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const parsed = parseFloat(e.target.value);
                if (!isNaN(parsed)) {
                    setSearchSettings({ minimumScore: parsed });
                }
                }}
            />
            <div style={{ padding: '10px 10px 20px 10px' }}>
                <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={searchSettings.minimumScore}
                    onChange={(val: number | number[]) => {
                    // val is a SingleValue (number)
                    setSearchSettings({ minimumScore: val as number });
                    }}
                    aria-label="Minimum score"
                />
            </div>
        </li>
        <li>
        <InputField
            label="Placeholder text"
            type="text"
            value={searchSettings.placeholderText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchSettings({ placeholderText: e.target.value });
            }}
        />
        </li>
        <li>
          <ToggleSwitch
            label="Show score"
            checked={searchSettings.showScore}
            onChange={(value: boolean) => handleToggle('showScore', value)}
          />
        </li>
        <li>
          <ToggleSwitch
            label="Enable Coverage"
            checked={searchSettings.enableCoverage}
            onChange={(value: boolean) => handleToggle('enableCoverage', value)}
          />
        </li>
        <li>
          <ToggleSwitch
            label="Remove Duplicates"
            checked={searchSettings.removeDuplicates}
            onChange={(value: boolean) => handleToggle('removeDuplicates', value)}
          />
        </li>

        <li>
          <Button variant="ghost" size="micro" iconRight={ showCoverageSetup ? <ArrowDown/> : <ArrowRight/>} onClick={() => setShowCoverageSetup(prev => !prev)}>
            {showCoverageSetup ? 'Hide Coverage Setup' : 'Show Coverage Setup'}
          </Button>
        </li>

        {showCoverageSetup && (
          <>
            <li>
              <ToggleSwitch
                label="Cover Whole Query"
                checked={searchSettings.coverageSetup.coverWholeQuery}
                onChange={(value: boolean) => handleCoverageSetupToggle('coverWholeQuery', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Cover Whole Words"
                checked={searchSettings.coverageSetup.coverWholeWords}
                onChange={(value: boolean) => handleCoverageSetupToggle('coverWholeWords', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Cover Fuzzy Words"
                checked={searchSettings.coverageSetup.coverFuzzyWords}
                onChange={(value: boolean) => handleCoverageSetupToggle('coverFuzzyWords', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Cover Joined Words"
                checked={searchSettings.coverageSetup.coverJoinedWords}
                onChange={(value: boolean) => handleCoverageSetupToggle('coverJoinedWords', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Cover Prefix Suffix"
                checked={searchSettings.coverageSetup.coverPrefixSuffix}
                onChange={(value: boolean) => handleCoverageSetupToggle('coverPrefixSuffix', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Truncate"
                checked={searchSettings.coverageSetup.truncate}
                onChange={(value: boolean) => handleCoverageSetupToggle('truncate', value)}
              />
            </li>
            <li>
              <ToggleSwitch
                label="Include Pattern Matches"
                checked={searchSettings.coverageSetup.includePatternMatches}
                onChange={(value: boolean) => handleCoverageSetupToggle('includePatternMatches', value)}
              />
            </li>
            <li>
              <InputField
                label="Levenshtein Max Word Size"
                type="number"
                value={searchSettings.coverageSetup.levenshteinMaxWordSize.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoverageSetupNumberChange('levenshteinMaxWordSize', e.target.value)}
              />
            </li>
            <li>
              <InputField
                label="Min Word Size"
                type="number"
                value={searchSettings.coverageSetup.minWordSize.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoverageSetupNumberChange('minWordSize', e.target.value)}
              />
            </li>
            <li>
              <InputField
                label="Truncate Word Hit Limit"
                type="number"
                value={searchSettings.coverageSetup.truncateWordHitLimit.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoverageSetupNumberChange('truncateWordHitLimit', e.target.value)}
              />
            </li>
            <li>
              <InputField
                label="Truncate Word Hit Tolerance"
                type="number"
                value={searchSettings.coverageSetup.truncateWordHitTolerance.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoverageSetupNumberChange('truncateWordHitTolerance', e.target.value)}
              />
            </li>
          </>
        )}
      </ul>
    </FilterPanelBase>
  );
}
