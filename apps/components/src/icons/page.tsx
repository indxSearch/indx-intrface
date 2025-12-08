
import { useState } from 'react';
import * as Pixl from '@indxsearch/pixl';
import { Slider } from '@indxsearch/systm';
import styles from './page.module.css';

const ICON_NAMES = [
  "Align_center", "Align_justify", "Align_left", "Align_right", "Alt", "Analytics", "Api", "Array", "ArrowDown", "ArrowLeft",
  "ArrowRight", "ArrowUp", "Arrow_down_left", "Arrow_down_right", "Arrow_left_down", "Arrow_left_up", "Arrow_right_down",
  "Arrow_right_up", "Azure", "Bar_code", "Battery", "Bell", "Big_eyes_oops", "Big_smile", "Big_smile_wink", "Book", "Bool", "Boost",
  "Card", "Check", "Chevron_down", "Chevron_left", "Chevron_right", "Chevron_up", "Circle", "Clock", "Cloud", "Cmd", "Code",
  "Coffee", "Coins", "Comment_chat_message", "Component", "Compose", "Control", "Copy", "Core", "Coverage", "Coverage_index", "Cpu",
  "Crop", "Crystal_ball", "Csharp", "Cursor", "Database", "Delete", "Discord", "Discovery", "Diving_mask", "Document_fields",
  "Document_or_file", "Download", "Drop_empty", "Drop_full", "Drop_half", "Dropdown", "Duplicate", "Dynamic_json_field", "ECommerce",
  "Empty", "Equal", "External_link", "Eye", "Fast_backward", "Fast_forward", "Feather", "Field", "Fields", "Filter", "Flag",
  "Flower", "Folder", "Four_leaf_clover", "Frost", "Git_branch", "Git_commit", "Git_merge", "Git_pull_request", "Github", "Glass",
  "Glasses", "Gps_my_location", "Gps_pin", "Graph", "Greater", "Greater_or_equal", "Headphones", "Heart", "Hibernate", "Home",
  "Hour_glass", "Hufsa", "Indent_left", "Indent_right", "Indx", "Instance", "Internet_browser", "Json", "Json_query", "Json_result",
  "Key", "Lab_experiment", "Layout_align_bottom", "Layout_align_left", "Layout_align_right", "Layout_align_top", "Light_bulb",
  "Linear", "Link", "List", "Lock", "Login", "Logout", "Loop", "Mail", "Maximize", "Meh", "Menu", "Microphone", "Minimize", "Minus",
  "Money", "Nested_object", "Next", "Nodes", "Npm", "Nuget", "Number", "Object", "Open_smile", "Options_menu", "Panel_add",
  "Panel_delete", "Pattern_recognition", "Pause", "Pc", "Percent", "Personalise", "Play", "Plus", "Point_left", "Point_right",
  "Point_up", "Power", "Presentation", "Prev", "Puzzle_piece", "Rag_search", "Ram", "Recorder", "Refresh", "Rss_feed", "Sad", "Save",
  "Search", "Search_as_you_type", "Search_query", "Shield", "Shift", "Slack", "Sliders_horizontal", "Sliders_vertical", "Smaller",
  "Smaller_or_equal", "Smile", "Sort_ascending", "Sort_descending", "Spark", "Special_characters", "Spectrum", "Spectrum_flat",
  "Speedometer", "Status", "Stop", "String", "Sunrise", "Support", "Tag", "Terminal", "Text_cursor", "Thumbs_up", "Tool_box",
  "Typing", "Typo_or_bug", "Update", "User", "User_alias", "User_bookmark", "User_check", "User_group", "User_id", "User_minus",
  "User_plus", "User_privacy", "User_text", "User_x", "Users", "Vehicle_4x4", "Vehicle_caravan_trailer", "Vehicle_cargo_van",
  "Vehicle_coupe", "Vehicle_dat_boi", "Vehicle_expedition_trailer", "Vehicle_motorcycle", "Vehicle_pickup_truck", "Vehicle_postal_van",
  "Vehicle_semi_trailer", "Vehicle_sports_car", "Vehicle_station_wagon", "Vehicle_trailer", "Vehicle_trailer_long", "Vehicle_truck",
  "Vehicle_van", "Virtual_reality_vr_headset", "Volume_high", "Volume_low", "Volume_medium", "Volume_mute", "Warning", "Weight",
  "Weight_high", "Weight_low", "Weight_medium", "WiFi", "X_or_error", "Zap",
];

export default function IconsPage() {
  const [iconSize, setIconSize] = useState(35);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pixl Icons</h1>
          <p className={styles.subtitle}>
            {ICON_NAMES.length} icons from @indxsearch/pixl
          </p>
        </div>

        <div className={styles.controls}>
          <label className={styles.controlLabel}>
            Icon Size: {iconSize}px
          </label>
          <div className={styles.slider}>
            <Slider
              min={14}
              max={56}
              step={7}
              value={iconSize}
              onChange={(val) => setIconSize(val as number)}
            />
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {ICON_NAMES.map((iconName) => {
          const IconComponent = (Pixl as any)[iconName];

          if (!IconComponent) return null;

          return (
            <div key={iconName} className={styles.iconCard}>
              <div className={styles.iconPreview}>
                <IconComponent size={iconSize} color="var(--lv8)" />
              </div>
              <div className={styles.iconName}>{iconName}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
