export type MouseOrTouchEvent = MouseEvent | TouchEvent;

export const createDispatcher = (target: EventTarget) => (type: string, detail?: unknown) => {
  target.dispatchEvent(
    new CustomEvent(type, {
      detail
    })
  );
};

export const addStartEventListener = (target: EventTarget, listener: EventListener) => {
  target.addEventListener('mousedown', listener);
  target.addEventListener('touchstart', listener, { passive: true });
};

export const removeStartEventListener = (target: EventTarget, listener: EventListener) => {
  target.removeEventListener('mousedown', listener);
  target.removeEventListener('touchstart', listener);
};

export const addMoveEventListener = (target: EventTarget, listener: EventListener) => {
  target.addEventListener('mousemove', listener);
  target.addEventListener('touchmove', listener, { passive: false });
};

export const removeMoveEventListener = (target: EventTarget, listener: EventListener) => {
  target.removeEventListener('mousemove', listener);
  target.removeEventListener('touchmove', listener);
};

export const addEndEventListener = (target: EventTarget, listener: EventListener) => {
  target.addEventListener('mouseup', listener);
  target.addEventListener('mouseleave', listener);
  target.addEventListener('touchend', listener);
  target.addEventListener('touchcancel', listener);
};

export const removeEndEventListener = (target: EventTarget, listener: EventListener) => {
  target.removeEventListener('mouseup', listener);
  target.removeEventListener('mouseleave', listener);
  target.removeEventListener('touchend', listener);
  target.removeEventListener('touchcancel', listener);
};

const isTouchEvent = (event: MouseOrTouchEvent): event is TouchEvent => 'touches' in event;

export const getEventPosition = (event: MouseOrTouchEvent) => {
  if (isTouchEvent(event)) {
    const touch = event.touches[0];

    return {
      x: touch ? touch.clientX : 0,
      y: touch ? touch.clientY : 0
    };
  }

  return {
    x: event.clientX,
    y: event.clientY
  };
};
