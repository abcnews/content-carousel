import { SvelteComponentTyped } from 'svelte';

export type ComponentConfig = {
  component: SvelteComponentTyped | string;
  props: Record<string, any>;
};

export type Slide = ComponentConfig[];
