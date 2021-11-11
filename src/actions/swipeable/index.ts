import {
  createDispatcher,
  addStartEventListener,
  removeStartEventListener,
  addMoveEventListener,
  removeMoveEventListener,
  addEndEventListener,
  removeEndEventListener,
  getEventPosition
} from './utils';
import type { MouseOrTouchEvent } from './utils';

type SwipeableActionProps = {
  minDistancePx?: number;
  thresholdDistancePx?: number;
};

const DEFAULT_MIN_DISTANCE_PX = 5;
const DEFAULT_THRESHOLD_DISTANCE_PX = 100;

export function swipeable(
  node: Element,
  { minDistancePx = DEFAULT_MIN_DISTANCE_PX, thresholdDistancePx = DEFAULT_THRESHOLD_DISTANCE_PX }: SwipeableActionProps
) {
  const dispatch = createDispatcher(node);
  let sx: number;
  let sy: number;
  let dx: number;
  let dy: number;
  let axis: 'x' | 'y' | null;
  let isDuring = false;

  const handleStart = (event: Event) => {
    const { x, y } = getEventPosition(event as MouseOrTouchEvent);

    sx = x;
    sy = y;
    dx = 0;
    dy = 0;
    axis = null;
    isDuring = true;

    dispatch('swipestart', { x, y });

    addMoveEventListener(window, handleMove);
    addEndEventListener(window, handleEnd);
  };

  const handleMove = (event: Event) => {
    if (!isDuring) {
      return;
    }

    const { x, y } = getEventPosition(event as MouseOrTouchEvent);

    dx = x - sx;
    dy = y - sy;

    if (!axis) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      if (Math.max(adx, ady) > minDistancePx) {
        axis = adx < ady ? 'y' : 'x';
      }
    }

    if (axis === 'x') {
      dispatch('swipemove', { x, y, dx, dy });

      if (Math.abs(dx) > thresholdDistancePx) {
        dispatch('swipethreshold', { direction: Math.sign(dx) });

        handleEnd(event);
      }
    }
  };

  const handleEnd = (event: Event) => {
    event.preventDefault();
    removeEndEventListener(window, handleEnd);
    removeMoveEventListener(window, handleMove);

    isDuring = false;

    dispatch('swipeend', getEventPosition(event as MouseOrTouchEvent));
  };

  addStartEventListener(node, handleStart);

  return {
    update(props: SwipeableActionProps) {
      minDistancePx = props.minDistancePx || DEFAULT_MIN_DISTANCE_PX;
      thresholdDistancePx = props.thresholdDistancePx || DEFAULT_THRESHOLD_DISTANCE_PX;
    },
    destroy() {
      removeStartEventListener(node, handleStart);
    }
  };
}
