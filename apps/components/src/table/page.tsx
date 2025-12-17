import { useState } from 'react';
import { Table, TableHeader, TableRow, TableCell, TableValue, TableIcon, Button, Checkbox, RadioButton, InputField, Slider } from '@indxsearch/systm';
import { Check, Compose, Delete, External_link } from '@indxsearch/pixl';
import styles from './page.module.css';

export default function TablePage() {
  const [selectedRow, setSelectedRow] = useState<string>('row2');
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(60);

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Table</h1>
        <p className={styles.desc}>Composable table component system for structured data display</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Component Overview</h2>
        <div className={styles.readme}>
          <p className={styles.readmeText}>
            The Table component is a flexible, composable system for displaying structured data.
            It consists of multiple sub-components that work together:
          </p>
          <ul className={styles.readmeList}>
            <li><strong>Table</strong> - Main container component</li>
            <li><strong>TableHeader</strong> - Header row wrapper with styled background</li>
            <li><strong>TableRow</strong> - Data row wrapper</li>
            <li><strong>TableCell</strong> - Cell with optional label/content layout</li>
            <li><strong>TableValue</strong> - Styled text for displaying values</li>
            <li><strong>TableIcon</strong> - Icon wrapper with consistent sizing</li>
          </ul>
          <p className={styles.readmeText}>
            <strong>Compatible Components:</strong> Table cells can host any indx-systm component including
            Button, Checkbox, RadioButton, InputField, Slider, ToggleSwitch, and Select. They also work well with
            icons from @indxsearch/pixl when wrapped in TableIcon.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic Table</h2>
        <Table>
          <TableHeader>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Modified</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td>project-files</td>
              <td>Folder</td>
              <td>—</td>
              <td>2024-11-15</td>
            </TableRow>
            <TableRow>
              <td>readme.md</td>
              <td>Markdown</td>
              <td>4.2 KB</td>
              <td>2024-11-20</td>
            </TableRow>
            <TableRow>
              <td>package.json</td>
              <td>JSON</td>
              <td>1.8 KB</td>
              <td>2024-12-01</td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With TableCell Components</h2>
        <p className={styles.subtext}>TableCell supports label/content layout for structured data pairs</p>
        <Table>
          <TableHeader>
            <th>Property</th>
            <th>Details</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <TableCell label="Project Name">indx-interface</TableCell>
              <TableCell label="Status">
                <TableValue>Active</TableValue>
                <TableIcon><Check /></TableIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell label="Version">2.1.0</TableCell>
              <TableCell label="License">
                <TableValue>MIT</TableValue>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell label="Dependencies">24</TableCell>
              <TableCell label="Size">
                <TableValue>142 KB</TableValue>
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Action Buttons</h2>
        <p className={styles.subtext}>Buttons work seamlessly within table cells for row actions</p>
        <Table>
          <TableHeader>
            <th>File Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Actions</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td>App.tsx</td>
              <td>TypeScript</td>
              <td>3.4 KB</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="micro" variant="ghost" iconLeft={<Compose />}>Edit</Button>
                  <Button size="micro" variant="ghost" iconLeft={<External_link />}>Open</Button>
                  <Button size="micro" variant="ghost" iconLeft={<Delete />}>Delete</Button>
                </div>
              </td>
            </TableRow>
            <TableRow>
              <td>index.tsx</td>
              <td>TypeScript</td>
              <td>1.2 KB</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="micro" variant="ghost" iconLeft={<Compose />}>Edit</Button>
                  <Button size="micro" variant="ghost" iconLeft={<External_link />}>Open</Button>
                  <Button size="micro" variant="ghost" iconLeft={<Delete />}>Delete</Button>
                </div>
              </td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Checkboxes</h2>
        <p className={styles.subtext}>Checkboxes for multi-select functionality</p>
        <Table>
          <TableHeader>
            <th style={{ width: '40px' }}>Select</th>
            <th>Task</th>
            <th>Priority</th>
            <th>Status</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td><Checkbox aria-label="Select update documentation task" /></td>
              <td>Update documentation</td>
              <td>High</td>
              <td>In Progress</td>
            </TableRow>
            <TableRow>
              <td><Checkbox aria-label="Select fix navigation bug task" defaultChecked /></td>
              <td>Fix navigation bug</td>
              <td>Critical</td>
              <td>Completed</td>
            </TableRow>
            <TableRow>
              <td><Checkbox aria-label="Select add dark mode task" /></td>
              <td>Add dark mode</td>
              <td>Medium</td>
              <td>Planned</td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Radio Buttons</h2>
        <p className={styles.subtext}>Radio buttons for single-select options</p>
        <Table>
          <TableHeader>
            <th style={{ width: '40px' }}>Select</th>
            <th>Option</th>
            <th>Description</th>
            <th>Price</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td>
                <RadioButton
                  id="plan-starter"
                  name="plan"
                  value="row1"
                  label=""
                  aria-label="Select Starter Plan"
                  checked={selectedRow === 'row1'}
                  onChange={() => setSelectedRow('row1')}
                />
              </td>
              <td>Starter Plan</td>
              <td>Basic features for individuals</td>
              <td>$9/month</td>
            </TableRow>
            <TableRow>
              <td>
                <RadioButton
                  id="plan-pro"
                  name="plan"
                  value="row2"
                  label=""
                  aria-label="Select Pro Plan"
                  checked={selectedRow === 'row2'}
                  onChange={() => setSelectedRow('row2')}
                />
              </td>
              <td>Pro Plan</td>
              <td>Advanced features for teams</td>
              <td>$29/month</td>
            </TableRow>
            <TableRow>
              <td>
                <RadioButton
                  id="plan-enterprise"
                  name="plan"
                  value="row3"
                  label=""
                  aria-label="Select Enterprise Plan"
                  checked={selectedRow === 'row3'}
                  onChange={() => setSelectedRow('row3')}
                />
              </td>
              <td>Enterprise Plan</td>
              <td>Full features with support</td>
              <td>$99/month</td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Input Fields</h2>
        <p className={styles.subtext}>Editable table with input fields for inline editing</p>
        <Table>
          <TableHeader>
            <th>Setting</th>
            <th>Value</th>
            <th>Unit</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td>Max Width</td>
              <td>
                <InputField aria-label="Max Width" type="text" defaultValue="1200" />
              </td>
              <td>px</td>
            </TableRow>
            <TableRow>
              <td>Line Height</td>
              <td>
                <InputField aria-label="Line Height" type="text" defaultValue="1.5" />
              </td>
              <td>em</td>
            </TableRow>
            <TableRow>
              <td>Font Size</td>
              <td>
                <InputField aria-label="Font Size" type="text" defaultValue="16" />
              </td>
              <td>px</td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Sliders</h2>
        <p className={styles.subtext}>Interactive range controls for adjustable settings</p>
        <Table>
          <TableHeader>
            <th>Setting</th>
            <th>Control</th>
            <th>Value</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td>Volume</td>
              <td style={{ width: '300px' }}>
                <Slider
                  aria-label="Volume"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(val) => setVolume(val as number)}
                />
              </td>
              <td>{volume}%</td>
            </TableRow>
            <TableRow>
              <td>Brightness</td>
              <td style={{ width: '300px' }}>
                <Slider
                  aria-label="Brightness"
                  min={0}
                  max={100}
                  step={5}
                  value={brightness}
                  onChange={(val) => setBrightness(val as number)}
                />
              </td>
              <td>{brightness}%</td>
            </TableRow>
            <TableRow>
              <td>Contrast</td>
              <td style={{ width: '300px' }}>
                <Slider
                  aria-label="Contrast"
                  min={0}
                  max={100}
                  step={10}
                  value={contrast}
                  onChange={(val) => setContrast(val as number)}
                />
              </td>
              <td>{contrast}%</td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Complex Example</h2>
        <p className={styles.subtext}>Combining multiple component types in one table</p>
        <Table>
          <TableHeader>
            <th style={{ width: '40px' }}></th>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </TableHeader>
          <tbody>
            <TableRow>
              <td><Checkbox aria-label="Select Alice Johnson" defaultChecked /></td>
              <TableCell label="Name">
                <TableValue>Alice Johnson</TableValue>
              </TableCell>
              <td>
                <InputField aria-label="Role for Alice Johnson" type="text" defaultValue="Admin" />
              </td>
              <TableCell>
                <TableValue>Active</TableValue>
                <TableIcon><Check /></TableIcon>
              </TableCell>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="micro" variant="secondary">Edit</Button>
                  <Button size="micro" variant="ghost">Remove</Button>
                </div>
              </td>
            </TableRow>
            <TableRow>
              <td><Checkbox aria-label="Select Bob Smith" /></td>
              <TableCell label="Name">
                <TableValue>Bob Smith</TableValue>
              </TableCell>
              <td>
                <InputField aria-label="Role for Bob Smith" type="text" defaultValue="Editor" />
              </td>
              <TableCell>
                <TableValue>Pending</TableValue>
              </TableCell>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="micro" variant="secondary">Edit</Button>
                  <Button size="micro" variant="ghost">Remove</Button>
                </div>
              </td>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Usage Guidelines</h2>
        <div className={styles.readme}>
          <h3 className={styles.readmeHeading}>Best Practices</h3>
          <ul className={styles.readmeList}>
            <li>Use <code>TableHeader</code> for column headers - it provides consistent styling and semantic HTML</li>
            <li>Wrap data rows in <code>TableRow</code> for proper styling</li>
            <li>Use <code>TableCell</code> when you need label/content pairs within a cell</li>
            <li>Wrap icons with <code>TableIcon</code> to ensure consistent sizing (14px)</li>
            <li>Use <code>TableValue</code> for secondary text that needs subtle styling</li>
            <li>For interactive elements, use <code>size="micro"</code> on Buttons to maintain compact layout</li>
          </ul>

          <h3 className={styles.readmeHeading}>Allowed Components in Cells</h3>
          <ul className={styles.readmeList}>
            <li><strong>Button</strong> - Use micro or default size for actions</li>
            <li><strong>Checkbox</strong> - For multi-select functionality</li>
            <li><strong>RadioButton</strong> - For single-select options (must share same name prop)</li>
            <li><strong>InputField</strong> - For inline editing</li>
            <li><strong>Slider</strong> - For range controls and adjustable values</li>
            <li><strong>ToggleSwitch</strong> - For boolean settings</li>
            <li><strong>Select</strong> - For dropdown options</li>
            <li><strong>Icons (via TableIcon)</strong> - For visual indicators</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
