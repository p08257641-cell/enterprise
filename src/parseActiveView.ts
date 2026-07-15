export interface ParsedView {
  module: string;
  sub: string;
}

/**
 * Splits an `activeView` token into its module and sub-view parts.
 * e.g. 'hd-sla' -> { module: 'hd', sub: 'sla' }, 'hr' -> { module: 'hr', sub: '' }.
 * Use the `sub` token to pick which inner tab a module view should render.
 */
export function parseActiveView(activeView: string): ParsedView {
  const idx = activeView.indexOf('-');
  if (idx === -1) return { module: activeView, sub: '' };
  return { module: activeView.slice(0, idx), sub: activeView.slice(idx + 1) };
}
