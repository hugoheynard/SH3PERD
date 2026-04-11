import type { TCompanyOrgChartViewModel, TOrgNodeHierarchyViewModel } from '@sh3pherd/shared-types';
import { NODE_PALETTE } from './orgchart-palette';

/**
 * Client-side, zero-network SVG exporter for the orgchart.
 *
 * ## Why this exists alongside the backend PDF export
 *
 * - **Instant** — no server round trip, no Chromium warm-up, no pool contention.
 * - **Vectorial** — infinitely zoomable, perfect for embedding in Keynote,
 *   Figma, or a printed poster.
 * - **Fallback** — if Puppeteer is unavailable (container without Chromium,
 *   worker down), the UI still has a working export path.
 *
 * ## Scope
 *
 * This exporter owns its own miniature layout engine: it walks the tree
 * once to compute subtree widths, then a second time to emit SVG `<rect>`,
 * `<text>`, and `<path>` elements. It does **not** reuse the runtime
 * CSS-based layout — duplicating the Angular render would blow the scope
 * of a sidecar. What you get is a faithful *structural* representation
 * of the chart (name, hierarchy, root colours, member counts), not a
 * pixel-perfect clone of the live UI. For pixel fidelity, use the PDF
 * export which runs the real frontend inside headless Chromium.
 *
 * ## Determinism
 *
 * Layout is purely functional over the input tree. Two calls with the
 * same chart produce byte-identical SVG output — useful for snapshot
 * diffs and for caching previews.
 */
export class OrgchartSvgExporter {
  // Layout constants — all in SVG user units. Tuned for readability
  // across tree sizes up to ~100 nodes.
  private static readonly NODE_WIDTH = 160;
  private static readonly NODE_HEIGHT = 54;
  private static readonly H_GAP = 24;
  private static readonly V_GAP = 64;
  private static readonly PADDING = 40;
  private static readonly ROOT_HEADER_HEIGHT = 56;

  /**
   * Renders the given orgchart as a self-contained SVG string.
   * The SVG carries its own font-stack and is safe to embed anywhere.
   */
  render(chart: TCompanyOrgChartViewModel): string {
    const nodes = this.normaliseTree(chart.rootNodes);

    // Step 1: compute subtree width for each node (depth-agnostic layout).
    const widths = new Map<string, number>();
    for (const root of nodes) this.computeWidths(root, widths);

    // Step 2: assign absolute (x, y) positions to each node.
    const positions = new Map<string, { x: number; y: number; depth: number }>();
    let cursorX = OrgchartSvgExporter.PADDING;
    const rootY = OrgchartSvgExporter.PADDING + OrgchartSvgExporter.ROOT_HEADER_HEIGHT + OrgchartSvgExporter.V_GAP;
    for (const root of nodes) {
      const width = widths.get(root.id) ?? OrgchartSvgExporter.NODE_WIDTH;
      this.assignPositions(root, cursorX, rootY, widths, positions, 0);
      cursorX += width + OrgchartSvgExporter.H_GAP;
    }

    const totalWidth = Math.max(
      cursorX + OrgchartSvgExporter.PADDING - OrgchartSvgExporter.H_GAP,
      OrgchartSvgExporter.PADDING * 2 + OrgchartSvgExporter.NODE_WIDTH,
    );
    const maxDepth = this.maxDepth(nodes);
    const totalHeight =
      rootY +
      (maxDepth + 1) * (OrgchartSvgExporter.NODE_HEIGHT + OrgchartSvgExporter.V_GAP) +
      OrgchartSvgExporter.PADDING;

    // Step 3: emit SVG body.
    const parts: string[] = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" font-family="-apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">`,
    );
    parts.push(this.renderDefs());
    parts.push(`<rect width="100%" height="100%" fill="#0f1218"/>`);

    // Company header.
    const centerX = totalWidth / 2;
    const headerY = OrgchartSvgExporter.PADDING + OrgchartSvgExporter.ROOT_HEADER_HEIGHT / 2;
    parts.push(this.renderCompanyHeader(chart.company_name, centerX, headerY));

    // Connectors: root header → each root node, then parent → children.
    for (const root of nodes) {
      const pos = positions.get(root.id);
      if (!pos) continue;
      parts.push(
        this.renderConnector(
          centerX,
          headerY + 18,
          pos.x + OrgchartSvgExporter.NODE_WIDTH / 2,
          pos.y,
          '#3a4150',
        ),
      );
      this.emitSubtreeConnectors(root, positions, parts);
    }

    // Node cards — children before parents so parent cards stack above.
    for (const root of nodes) this.emitSubtreeCards(root, positions, parts, root.color);

    parts.push('</svg>');
    return parts.join('');
  }

  /** Builds a `Blob` ready to be downloaded via `URL.createObjectURL`. */
  toBlob(chart: TCompanyOrgChartViewModel): Blob {
    return new Blob([this.render(chart)], { type: 'image/svg+xml;charset=utf-8' });
  }

  // ── Layout ─────────────────────────────────────────────────

  /** Ensures every node has a `children` array (safe for recursion). */
  private normaliseTree(nodes: TOrgNodeHierarchyViewModel[]): TOrgNodeHierarchyViewModel[] {
    return nodes.map((n) => ({ ...n, children: (n.children ?? []).map((c) => this.normaliseOne(c)) }));
  }

  private normaliseOne(node: TOrgNodeHierarchyViewModel): TOrgNodeHierarchyViewModel {
    return { ...node, children: (node.children ?? []).map((c) => this.normaliseOne(c)) };
  }

  private computeWidths(
    node: TOrgNodeHierarchyViewModel,
    widths: Map<string, number>,
  ): number {
    if (!node.children || node.children.length === 0) {
      widths.set(node.id, OrgchartSvgExporter.NODE_WIDTH);
      return OrgchartSvgExporter.NODE_WIDTH;
    }
    let total = 0;
    for (const child of node.children) {
      total += this.computeWidths(child, widths);
    }
    total += OrgchartSvgExporter.H_GAP * (node.children.length - 1);
    const width = Math.max(total, OrgchartSvgExporter.NODE_WIDTH);
    widths.set(node.id, width);
    return width;
  }

  private assignPositions(
    node: TOrgNodeHierarchyViewModel,
    startX: number,
    y: number,
    widths: Map<string, number>,
    out: Map<string, { x: number; y: number; depth: number }>,
    depth: number,
  ): void {
    const subtreeWidth = widths.get(node.id) ?? OrgchartSvgExporter.NODE_WIDTH;
    const nodeX = startX + (subtreeWidth - OrgchartSvgExporter.NODE_WIDTH) / 2;
    out.set(node.id, { x: nodeX, y, depth });

    if (!node.children || node.children.length === 0) return;

    const childY = y + OrgchartSvgExporter.NODE_HEIGHT + OrgchartSvgExporter.V_GAP;
    let cursor = startX;
    for (const child of node.children) {
      const childWidth = widths.get(child.id) ?? OrgchartSvgExporter.NODE_WIDTH;
      this.assignPositions(child, cursor, childY, widths, out, depth + 1);
      cursor += childWidth + OrgchartSvgExporter.H_GAP;
    }
  }

  private maxDepth(nodes: TOrgNodeHierarchyViewModel[], depth = 0): number {
    let max = depth;
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        max = Math.max(max, this.maxDepth(node.children, depth + 1));
      }
    }
    return max;
  }

  // ── Rendering primitives ──────────────────────────────────

  private renderDefs(): string {
    return `
<defs>
  <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
  </filter>
</defs>`.trim();
  }

  private renderCompanyHeader(name: string, cx: number, cy: number): string {
    const text = this.escapeXml(name);
    return `
<g>
  <rect x="${cx - 140}" y="${cy - 20}" width="280" height="40" rx="8" ry="8" fill="#1a1f29" stroke="#2a3140" stroke-width="1"/>
  <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="16" font-weight="600" fill="#e7eaf0">${text}</text>
</g>`.trim();
  }

  private renderConnector(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
  ): string {
    // Orthogonal L-shaped connector: down then horizontal then down.
    const midY = y1 + (y2 - y1) / 2;
    return `<path d="M${x1} ${y1} L${x1} ${midY} L${x2} ${midY} L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
  }

  private emitSubtreeConnectors(
    node: TOrgNodeHierarchyViewModel,
    positions: Map<string, { x: number; y: number; depth: number }>,
    out: string[],
  ): void {
    const parent = positions.get(node.id);
    if (!parent || !node.children) return;
    for (const child of node.children) {
      const childPos = positions.get(child.id);
      if (!childPos) continue;
      out.push(
        this.renderConnector(
          parent.x + OrgchartSvgExporter.NODE_WIDTH / 2,
          parent.y + OrgchartSvgExporter.NODE_HEIGHT,
          childPos.x + OrgchartSvgExporter.NODE_WIDTH / 2,
          childPos.y,
          '#3a4150',
        ),
      );
      this.emitSubtreeConnectors(child, positions, out);
    }
  }

  private emitSubtreeCards(
    node: TOrgNodeHierarchyViewModel,
    positions: Map<string, { x: number; y: number; depth: number }>,
    out: string[],
    inheritedColor: string | undefined,
  ): void {
    const pos = positions.get(node.id);
    if (!pos) return;
    const color = node.color || inheritedColor || NODE_PALETTE[0];
    out.push(this.renderCard(node, pos, color));
    for (const child of node.children ?? []) {
      this.emitSubtreeCards(child, positions, out, color);
    }
  }

  private renderCard(
    node: TOrgNodeHierarchyViewModel,
    pos: { x: number; y: number; depth: number },
    color: string,
  ): string {
    const w = OrgchartSvgExporter.NODE_WIDTH;
    const h = OrgchartSvgExporter.NODE_HEIGHT;
    const name = this.truncate(node.name, 22);
    const count = this.totalMembers(node);
    const labelColor = '#e7eaf0';
    const mutedColor = 'rgba(231, 234, 240, 0.55)';
    const backgroundColor = this.mixHex(color, '#1a1f29', 0.78);

    return `
<g filter="url(#card-shadow)">
  <rect x="${pos.x}" y="${pos.y}" width="${w}" height="${h}" rx="10" ry="10" fill="${backgroundColor}" stroke="${color}" stroke-width="1.5"/>
  <rect x="${pos.x}" y="${pos.y}" width="4" height="${h}" rx="2" ry="2" fill="${color}"/>
  <text x="${pos.x + 14}" y="${pos.y + 22}" font-size="13" font-weight="600" fill="${labelColor}">${this.escapeXml(name)}</text>
  <text x="${pos.x + 14}" y="${pos.y + 40}" font-size="10" fill="${mutedColor}">${count} member${count === 1 ? '' : 's'}</text>
</g>`.trim();
  }

  // ── Utilities ──────────────────────────────────────────────

  private totalMembers(node: TOrgNodeHierarchyViewModel): number {
    const fromSelf = (node.members?.length ?? 0) + (node.guest_members?.length ?? 0);
    const fromChildren = (node.children ?? []).reduce((acc, c) => acc + this.totalMembers(c), 0);
    return fromSelf + fromChildren;
  }

  private truncate(value: string, max: number): string {
    if (value.length <= max) return value;
    return value.slice(0, max - 1) + '…';
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Simple linear hex-color mix — avoids pulling in a color library for
   * a single call site. `ratio` is the weight of the first colour.
   */
  private mixHex(a: string, b: string, ratio: number): string {
    const pa = this.parseHex(a);
    const pb = this.parseHex(b);
    if (!pa || !pb) return a;
    const r = Math.round(pa.r * ratio + pb.r * (1 - ratio));
    const g = Math.round(pa.g * ratio + pb.g * (1 - ratio));
    const bl = Math.round(pa.b * ratio + pb.b * (1 - ratio));
    return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(bl)}`;
  }

  private parseHex(value: string): { r: number; g: number; b: number } | null {
    const match = /^#([0-9a-f]{6})$/i.exec(value);
    if (!match) return null;
    const int = parseInt(match[1], 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  private toHex(value: number): string {
    return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
  }
}
