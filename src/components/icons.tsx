import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { colors } from "../theme/tokens";

type IconProps = { color?: string; size?: number; filled?: boolean };

export function HomeIcon({ color = colors.tabInactive, size = 22, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-3v6H6A1.5 1.5 0 0 1 4.5 19V10.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? color : "none"}
      />
    </Svg>
  );
}

export function TimesIcon({ color = colors.tabInactive, size = 22, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="5.5" width="16" height="14" rx="2.2" stroke={color} strokeWidth={1.7} fill={filled ? color : "none"} />
      <Path d="M8 4.5v3M16 4.5v3M4 10h16" stroke={filled ? colors.tabBar : color} strokeWidth={1.7} strokeLinecap="round" />
      {!filled && <Path d="M8 4.5v3M16 4.5v3M4 10h16" stroke={color} strokeWidth={1.7} strokeLinecap="round" />}
      {filled ? (
        <Path d="M8 4.5v3M16 4.5v3M4 10h16" stroke={colors.tabBar} strokeWidth={1.6} strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}

export function QuranIcon({ color = colors.tabInactive, size = 22, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6.5c-2-1.4-4.6-2-7.2-2V18c2.6 0 5.2.6 7.2 2 2-1.4 4.6-2 7.2-2V4.5c-2.6 0-5.2.6-7.2 2Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
      <Path d="M12 6.5V20" stroke={filled ? colors.tabBar : color} strokeWidth={1.6} />
    </Svg>
  );
}

export function LibraryIcon({ color = colors.tabInactive, size = 22, filled }: IconProps) {
  const w = 1.7;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 5.5v13M10 5.5v13M14 5.5v13M18 5.5v13" stroke={color} strokeWidth={filled ? 2.4 : w} strokeLinecap="round" />
    </Svg>
  );
}

export function SettingsIcon({ color = colors.tabInactive, size = 22, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.7} fill={filled ? color : "none"} />
      <Path
        d="M12 4.2v1.6M12 18.2v1.6M4.2 12h1.6M18.2 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M17.6 6.4l-1.1 1.1M7.5 16.5l-1.1 1.1"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BackChevron({ color = colors.ink, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5 8 12l7 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ color = colors.inkMuted, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={1.8} />
      <Path d="M16 16.5 20 20.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ color = colors.sage, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path d="M7.5 12.5 10.5 15.5 16.5 8.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SignalIcons({ color = colors.ink, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={66} height={size} viewBox="0 0 72 18" fill="none">
      <G fill={color}>
        <Rect x="0" y="11" width="3.2" height="5" rx="0.6" />
        <Rect x="5" y="8.5" width="3.2" height="7.5" rx="0.6" />
        <Rect x="10" y="5.5" width="3.2" height="10.5" rx="0.6" />
        <Rect x="15" y="3" width="3.2" height="13" rx="0.6" />
      </G>
      <Path d="M28 13.5c2.4-2.6 6.2-2.6 8.6 0M30.4 11.2c1.4-1.5 3.6-1.5 5 0M32.6 8.8c.6-.6 1.6-.6 2.2 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M32.8 15.2 34 13.6l1.2 1.6" stroke={color} strokeWidth={1.3} strokeLinejoin="round" />
      <Rect x="50" y="4.5" width="18" height="10" rx="2.2" stroke={color} strokeWidth={1.5} />
      <Rect x="52.2" y="6.6" width="12.2" height="5.8" rx="1" fill={color} />
      <Rect x="68.2" y="7.6" width="1.6" height="3.8" rx="0.6" fill={color} />
    </Svg>
  );
}
