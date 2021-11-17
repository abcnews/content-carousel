import { TIERS, getTier } from '@abcnews/env-utils';
import { Client } from '@abcnews/poll-counters-client';

const clients = {};

export type TrackFn = (name: string, value: string) => void;

export const getTrackFn = (id: string): TrackFn => (name, value) => {
  const isPreview = getTier() === TIERS.PREVIEW;

  clients[name] = clients[name] || new Client(`content-carousel_behaviour__${name}`);
  clients[name].increment({ question: `${id}${isPreview ? '__PREVIEW' : ''}`, answer: value });
};
