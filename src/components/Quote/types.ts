export type QuoteContent = {
  kind: 'blockquote' | 'pullquote';
  contentEls: Element[];
  attributionNodes?: Node[] | undefined;
};
