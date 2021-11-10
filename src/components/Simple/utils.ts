import { SvelteComponentTyped } from 'svelte';
import Simple from './Simple.svelte';

export const parse = (el: Element) => ({
  component: Simple as unknown as SvelteComponentTyped,
  props: {
    contentEl: el
  }
});
