/** Every demo mounts into an element and can be started and stopped. */
export interface Demo {
  start(): void;
  stop(): void;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
